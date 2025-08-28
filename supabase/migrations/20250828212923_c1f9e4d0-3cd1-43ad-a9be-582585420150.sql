update public.device_jobs
set status = 'canceled',
    result = coalesce(result, '') || ' skipped on Linux VM',
    attempts = coalesce(attempts, 0) + 1
where device_id = 'e9c03bc0-1584-4a97-ac3a-4b7d87b507a3'
  and type = 'POST_INSTALL'
  and status = 'queued';