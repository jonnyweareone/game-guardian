insert into public.device_jobs (device_id, type, status, payload)
values (
  'e9c03bc0-1584-4a97-ac3a-4b7d87b507a3',
  'INSTALL_APP',
  'queued',
  jsonb_build_object('app_id','steam')
);