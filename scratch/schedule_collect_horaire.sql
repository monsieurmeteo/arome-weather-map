SELECT cron.schedule(
  'collect-meteo-horaire',
  '5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://ubdevaemtwbzxksjlhjg.supabase.co/functions/v1/collect-horaire',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);
