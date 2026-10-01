-- Pace-IT initial administrator repair
-- Run this ONCE in Supabase SQL Editor if admin/admin does not work.
-- It creates the admin account if missing, or resets the existing admin password to 'admin'.
-- Change the password immediately after logging in.

create extension if not exists pgcrypto;

do $$
declare
  admin_id uuid;
begin
  select id into admin_id from auth.users where email = 'admin@pace-it.internal' limit 1;

  if admin_id is null then
    admin_id := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data
    ) values (
      '00000000-0000-0000-0000-000000000000',
      admin_id, 'authenticated', 'authenticated',
      'admin@pace-it.internal',
      extensions.crypt('admin', extensions.gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"username":"admin","display_name":"Administrator"}'::jsonb
    );
  else
    update auth.users
      set encrypted_password = extensions.crypt('admin', extensions.gen_salt('bf')),
          email_confirmed_at = coalesce(email_confirmed_at, now()),
          updated_at = now(),
          raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
          raw_user_meta_data = '{"username":"admin","display_name":"Administrator"}'::jsonb
    where id = admin_id;
  end if;

  insert into public.profiles (id, username, display_name, role, disabled)
  values (admin_id, 'admin', 'Administrator', 'admin', false)
  on conflict (id) do update
    set username = 'admin', display_name = 'Administrator', role = 'admin', disabled = false;
end $$;

select id, email from auth.users where email = 'admin@pace-it.internal';
select id, username, display_name, role, disabled from public.profiles where username = 'admin';
