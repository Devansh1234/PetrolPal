-- Petrol Pal — public site functions
-- Applied to the BlendCheck Supabase project. Safe to re-run (create or replace).

-- Nearby pumps for the upload flow (safe: no test data) ---------------------------
create or replace function public.pumps_nearby(p_lat double precision, p_lng double precision,
                                               p_radius_m double precision default 2000, p_limit int default 6)
returns table (id uuid, name text, brand text, brand_short text, brand_color text,
               city text, district text, state text, lat double precision, lng double precision, distance_m double precision)
language sql stable security invoker set search_path = '' as $$
  with box as (
    select p_radius_m / 111320.0 as dlat,
           p_radius_m / (111320.0 * greatest(cos(radians(p_lat)), 0.01)) as dlng
  )
  select p.id, p.name, b.slug, b.short_name, b.color, p.city, p.district, p.state, p.lat, p.lng,
         2 * 6371000 * asin(sqrt(power(sin(radians(p.lat - p_lat) / 2), 2)
           + cos(radians(p_lat)) * cos(radians(p.lat)) * power(sin(radians(p.lng - p_lng) / 2), 2))) as distance_m
  from public.pumps p join public.brands b on b.id = p.brand_id, box
  where p.status = 'approved'
    and p.lat between p_lat - box.dlat and p_lat + box.dlat
    and p.lng between p_lng - box.dlng and p_lng + box.dlng
  order by distance_m
  limit least(greatest(p_limit, 1), 20);
$$;
grant execute on function public.pumps_nearby(double precision, double precision, double precision, int) to anon, authenticated;

-- Submit a test from a signed QR code ------------------------------------------------
-- QR format (see docs/QR_FORMAT.md):
--   PP1:<device_id>:<nonce>:<unix_seconds>:<ethanol_x10>:<temp_x10 or empty>:<grade r|p>:<sig>
--   sig = first 32 hex chars of HMAC-SHA256(key = devices.secret_hex decoded as hex,
--                                         message = everything before ":<sig>")
create or replace function public.submit_reading(p_code text, p_pump_id uuid,
                                                 p_lat double precision, p_lng double precision,
                                                 p_accuracy_m double precision default null)
returns json
language plpgsql volatile security definer set search_path = '' as $$
declare
  parts text[];
  v_msg text; v_sig text; v_expected text;
  v_dev public.devices%rowtype;
  v_pump public.pumps%rowtype;
  v_measured timestamptz; v_pct numeric; v_temp numeric; v_grade public.fuel_grade;
  v_dist double precision; v_verified boolean;
begin
  p_code := trim(p_code);
  parts := string_to_array(p_code, ':');
  if array_length(parts, 1) <> 8 or parts[1] <> 'PP1' then
    return json_build_object('ok', false, 'error', 'This doesn’t look like a Petrol Pal code.');
  end if;

  select * into v_dev from public.devices where id = parts[2];
  if not found or v_dev.status <> 'active' then
    return json_build_object('ok', false, 'error', 'This tester isn’t registered or has been switched off.');
  end if;

  v_msg := left(p_code, length(p_code) - length(parts[8]) - 1);
  v_sig := lower(parts[8]);
  v_expected := left(encode(extensions.hmac(convert_to(v_msg, 'UTF8'), decode(v_dev.secret_hex, 'hex'), 'sha256'), 'hex'), 32);
  if v_sig <> v_expected then
    return json_build_object('ok', false, 'error', 'This code couldn’t be verified. Try scanning again.');
  end if;

  begin
    v_measured := to_timestamp(parts[4]::bigint);
    v_pct := parts[5]::numeric / 10;
    v_temp := nullif(parts[6], '')::numeric / 10;
    v_grade := case parts[7] when 'p' then 'premium' else 'regular' end;
  exception when others then
    return json_build_object('ok', false, 'error', 'This code is damaged. Try scanning again.');
  end;

  if v_measured > now() + interval '10 minutes' or v_measured < now() - interval '7 days' then
    return json_build_object('ok', false, 'error', 'Tests must be uploaded within 7 days.');
  end if;
  if v_pct < 0 or v_pct > 100 then
    return json_build_object('ok', false, 'error', 'This reading is out of range.');
  end if;

  select * into v_pump from public.pumps where id = p_pump_id and status = 'approved';
  if not found then
    return json_build_object('ok', false, 'error', 'Please choose a pump.');
  end if;

  v_dist := case when p_lat is null or p_lng is null then null else
    2 * 6371000 * asin(sqrt(power(sin(radians(v_pump.lat - p_lat) / 2), 2)
      + cos(radians(p_lat)) * cos(radians(v_pump.lat)) * power(sin(radians(v_pump.lng - p_lng) / 2), 2))) end;
  v_verified := v_dist is not null and v_dist <= 300 and coalesce(p_accuracy_m, 9999) <= 150;

  begin
    insert into public.readings (pump_id, device_id, nonce, ethanol_pct, fuel_grade, sample_temp_c, measured_at,
                                 submitted_by, lat, lng, accuracy_m, distance_m, gps_verified)
    values (p_pump_id, v_dev.id, parts[3], v_pct, v_grade, v_temp, v_measured,
            auth.uid(), p_lat, p_lng, p_accuracy_m, round(v_dist::numeric, 1), v_verified);
  exception when unique_violation then
    return json_build_object('ok', false, 'error', 'This test has already been uploaded.');
  end;

  update public.devices set last_seen_at = now() where id = v_dev.id;

  return json_build_object('ok', true, 'ethanol_pct', v_pct, 'measured_at', v_measured,
                           'gps_verified', v_verified, 'distance_m', round(v_dist::numeric));
end $$;
revoke execute on function public.submit_reading(text, uuid, double precision, double precision, double precision) from public;
grant execute on function public.submit_reading(text, uuid, double precision, double precision, double precision) to anon, authenticated;

-- Public counters ------------------------------------------------------------------------
create or replace function public.site_stats()
returns json language sql stable security definer set search_path = '' as $$
  select json_build_object(
    'mode', (select map_color_mode from public.site_settings limit 1),
    'pumps', (select count(*) from public.pumps where status = 'approved'),
    'tests', (select count(*) from public.readings where status = 'visible'),
    'pumps_with_result', (select count(*) from internal.pump_quality() where status <> 'insufficient'),
    'min_readings', (select quality_min_readings from public.site_settings limit 1),
    'min_devices', (select quality_min_devices from public.site_settings limit 1),
    'window_days', (select quality_window_days from public.site_settings limit 1)
  );
$$;
grant execute on function public.site_stats() to anon, authenticated;

-- Top pumps: only "consistent" pumps, only when the site is in quality mode -----------------
create or replace function public.top_pumps(p_state text default null, p_district text default null, p_limit int default 50)
returns table (id uuid, name text, brand_short text, brand_color text, city text, district text, state text,
               tests int, last_tested timestamptz)
language sql stable security definer set search_path = '' as $$
  select p.id, p.name, b.short_name, b.color, p.city, p.district, p.state, q.n, q.last_tested
  from internal.pump_quality() q
  join public.pumps p on p.id = q.pump_id and p.status = 'approved'
  join public.brands b on b.id = p.brand_id
  where (select map_color_mode from public.site_settings limit 1) = 'quality'
    and q.status = 'consistent'
    and (p_state is null or p.state = p_state)
    and (p_district is null or p.district = p_district)
  order by q.n desc, q.last_tested desc
  limit least(greatest(p_limit, 1), 200);
$$;
grant execute on function public.top_pumps(text, text, int) to anon, authenticated;

-- Signed-in user's own data ----------------------------------------------------------------
create or replace function public.my_readings()
returns table (id uuid, pump_id uuid, pump_name text, city text, ethanol_pct numeric, measured_at timestamptz,
               gps_verified boolean, status text)
language sql stable security definer set search_path = '' as $$
  select r.id, r.pump_id, p.name, p.city, r.ethanol_pct, r.measured_at, r.gps_verified, r.status::text
  from public.readings r join public.pumps p on p.id = r.pump_id
  where auth.uid() is not null
    and (r.submitted_by = auth.uid() or r.device_id in (select d.id from public.devices d where d.owner_id = auth.uid()))
  order by r.measured_at desc
  limit 200;
$$;
revoke execute on function public.my_readings() from public, anon;
grant execute on function public.my_readings() to authenticated;

create or replace function public.my_devices()
returns table (id text, label text, status text, last_seen_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select d.id, d.label, d.status::text, d.last_seen_at from public.devices d
  where auth.uid() is not null and d.owner_id = auth.uid() order by d.created_at;
$$;
revoke execute on function public.my_devices() from public, anon;
grant execute on function public.my_devices() to authenticated;

-- Admin: approve user-submitted pumps -------------------------------------------------------
drop policy if exists pumps_admin_update on public.pumps;
create policy pumps_admin_update on public.pumps for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Admin: list pending pumps (pumps_public already lets admins read all rows)
-- Admin: readable profiles for moderation context
drop policy if exists profiles_admin on public.profiles;
create policy profiles_admin on public.profiles for select to authenticated using (public.is_admin());
