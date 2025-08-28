-- Create pgcrypto extension for cryptographic functions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Update the refresh_secret_hash for the specified device
UPDATE public.devices
SET refresh_secret_hash = encode(digest('FJjL8Q7U1D2mhnf9C74z8lKnQ9bH+qyaD7PXq98nQmE=', 'sha256'),'base64')
WHERE device_code = 'GG-04EA-7EE4';