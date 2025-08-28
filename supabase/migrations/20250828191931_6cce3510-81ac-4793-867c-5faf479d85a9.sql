CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Compute URL-safe base64 (no padding) of SHA-256(secret)
WITH h AS (
  SELECT rtrim(
           translate(
             encode(digest('FJjL8Q7U1D2mhnf9C74z8lKnQ9bH+qyaD7PXq98nQmE=', 'sha256'),'base64'),
             '+/', '-_'
           ),
           '='
         ) AS urlsafe
)
UPDATE public.devices d
SET refresh_secret_hash = h.urlsafe
FROM h
WHERE d.device_code = 'GG-04EA-7EE4';