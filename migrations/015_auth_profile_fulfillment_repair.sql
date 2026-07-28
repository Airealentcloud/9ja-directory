-- Keep every Supabase Auth account linked to a public customer profile.
-- Safe to run more than once.

CREATE OR REPLACE FUNCTION private.handle_new_auth_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, auth, private
AS $$
DECLARE
  customer_name TEXT;
BEGIN
  customer_name := NULLIF(TRIM(COALESCE(
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'name',
    ''
  )), '');

  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, LOWER(TRIM(NEW.email)), customer_name)
  ON CONFLICT (id) DO UPDATE
  SET
    email = CASE
      WHEN NULLIF(TRIM(public.profiles.email), '') IS NULL
        THEN EXCLUDED.email
      ELSE public.profiles.email
    END,
    full_name = COALESCE(
      NULLIF(TRIM(public.profiles.full_name), ''),
      EXCLUDED.full_name
    );

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.handle_new_auth_user_profile() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.handle_new_auth_user_profile() FROM anon;
REVOKE ALL ON FUNCTION private.handle_new_auth_user_profile() FROM authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION private.handle_new_auth_user_profile();

-- Repair confirmed and unconfirmed accounts created while the trigger was absent.
INSERT INTO public.profiles (id, email, full_name)
SELECT
  auth_user.id,
  LOWER(TRIM(auth_user.email)),
  NULLIF(TRIM(COALESCE(
    auth_user.raw_user_meta_data ->> 'full_name',
    auth_user.raw_user_meta_data ->> 'name',
    ''
  )), '')
FROM auth.users AS auth_user
LEFT JOIN public.profiles AS profile ON profile.id = auth_user.id
WHERE profile.id IS NULL
ON CONFLICT (id) DO NOTHING;
