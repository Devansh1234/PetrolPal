# Petrol Pal QR code format (firmware ↔ website)

After each test, a Petrol Pal Pro shows a QR code. It encodes a **web link**, so scanning it with any phone camera opens the upload page with the test already filled in:

```
https://petrolpal.in/test?c=<CODE>
```

(The in-page scanner on `/test` accepts either the full link or the bare `<CODE>`. Show `<CODE>` as text under the QR too, for manual entry.)

## `<CODE>`

Eight fields separated by `:`

```
PP1:<device_id>:<nonce>:<unix_seconds>:<ethanol_x10>:<temp_x10>:<grade>:<sig>
```

| Field | Meaning | Example |
|---|---|---|
| `PP1` | Format version | `PP1` |
| `device_id` | Tester serial — must exist in the `devices` table, status `active`. No `:` | `PPX-00042` |
| `nonce` | Unique per test on this device (counter or random). No `:` | `000317` |
| `unix_seconds` | When the test was taken (UTC) | `1793001234` |
| `ethanol_x10` | Ethanol % × 10, integer | `214` = 21.4 % |
| `temp_x10` | Sample temperature °C × 10, integer; empty if unknown | `285` |
| `grade` | `r` regular petrol, `p` premium | `r` |
| `sig` | First **32 hex characters** (lower case) of HMAC-SHA256 | |

`sig = hex(HMAC_SHA256(key = bytes(devices.secret_hex), message = "PP1:<device_id>:<nonce>:<unix_seconds>:<ethanol_x10>:<temp_x10>:<grade>"))[0:32]`

The secret is stored per device in `devices.secret_hex` (hex-encoded bytes; 16 or 32 random bytes recommended) and flashed into the tester at manufacture. It never leaves the server.

## Server checks (`public.submit_reading`)

- Signature must match → the reading can’t be edited.
- `(device_id, nonce)` must be new → a test can only be uploaded once.
- Test must be no older than 7 days and not in the future.
- Phone location must be within 300 m of the chosen pump, with accuracy ≤ 150 m, for the test to count (`gps_verified`). Tests that fail this are stored but excluded from public results.

## Example

Secret `00112233445566778899aabbccddeeff`, message `PP1:TEST-01:n0001:1793001234:214:285:r` → code
`PP1:TEST-01:n0001:1793001234:214:285:r:<first 32 hex of the HMAC>`

Python to generate one for testing:

```python
import hmac, hashlib, time
secret = bytes.fromhex('00112233445566778899aabbccddeeff')
msg = f"PP1:TEST-01:n0001:{int(time.time())}:214:285:r"
sig = hmac.new(secret, msg.encode(), hashlib.sha256).hexdigest()[:32]
print(f"https://petrolpal.in/test?c={msg}:{sig}")
```

## Registering a tester

```sql
insert into devices (id, secret_hex, label, status, owner_id)
values ('PPX-00042', encode(gen_random_bytes(32), 'hex'), 'Petrol Pal Pro', 'active', null);
```

Set `owner_id` to a user’s profile id to link the tester to their account (their tests then appear under My account → My tests).
