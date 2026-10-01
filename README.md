# Pace-IT — Shared Supabase version

## First setup

1. Create a Supabase project.
2. Run `supabase_schema.sql` once in **SQL Editor**.
3. If `admin / admin` does not work, run `supabase_admin_repair.sql` once. It creates or repairs the initial administrator.
4. In Supabase **Project Settings → API**, copy the Project URL and the **Publishable** key.
5. Create `.env.local` in the project root:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_KEY
```

Do **not** put the Supabase Secret/service-role key in the browser app.

## Login flow

The normal login page is shown immediately. You do **not** need to create a normal user first.

To open the hidden administrator gate:

1. Press **Esc**.
2. Release it.
3. Press **T** within about 1.2 seconds.
4. Enter the administrator password.

Initial administrator:

```text
Username: admin
Password: admin
```

The shortcut works from the login page as well as after an administrator is logged in. From the admin panel you can create colleague accounts.

After creating an account, the colleague logs in with the username/ID and unique password you assigned. Users can change their own password from the top bar.

## Shared behavior

Logs, log history, activity, and suggestions are stored in Supabase and are shared between all users. Realtime subscriptions update open browsers when another user changes the shared data.

## Local development

```powershell
npm install
npm run dev
```

Open the Vite URL shown in the terminal.

For a production build:

```powershell
npm run build
```
