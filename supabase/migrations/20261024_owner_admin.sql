-- Make the site owner an admin automatically when they first sign in.
create or replace function public.profiles_owner_admin() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if lower(new.email) = 'devanshbarman6@gmail.com' then
    new.is_admin := true;
  end if;
  return new;
end $$;
revoke execute on function public.profiles_owner_admin() from public, anon, authenticated;

drop trigger if exists profiles_owner_admin on public.profiles;
create trigger profiles_owner_admin before insert on public.profiles
  for each row execute function public.profiles_owner_admin();

-- If the profile already exists.
update public.profiles set is_admin = true where lower(email) = 'devanshbarman6@gmail.com';
