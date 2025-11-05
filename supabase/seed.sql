-- Seed data for local development
-- Creates 2 test users with profiles
-- Password for both: password123
-- Insert test users into auth.users with properly hashed passwords
-- Using crypt() function from pgcrypto extension which is already loaded by Supabase
INSERT INTO
  auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token,
    email_change_token_current,
    is_sso_user,
    is_anonymous
  )
VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'authenticated',
    'authenticated',
    'alice@test.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"username":"alice","display_name":"Alice"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    '',
    '',
    false,
    false
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'b1ffcd99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'authenticated',
    'authenticated',
    'bob@test.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"username":"bob","display_name":"Bob"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    '',
    '',
    false,
    false
  );

-- Insert identities for the users
INSERT INTO
  auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  )
VALUES
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    '{"sub":"a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11","email":"alice@test.com"}',
    'email',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    NOW(),
    NOW(),
    NOW()
  ),
  (
    'b1ffcd99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'b1ffcd99-9c0b-4ef8-bb6d-6bb9bd380a22',
    '{"sub":"b1ffcd99-9c0b-4ef8-bb6d-6bb9bd380a22","email":"bob@test.com"}',
    'email',
    'b1ffcd99-9c0b-4ef8-bb6d-6bb9bd380a22',
    NOW(),
    NOW(),
    NOW()
  );

-- The profiles will be auto-created by the trigger we set up
-- But let's also manually insert them to ensure they exist with custom data
INSERT INTO
  public.profiles (
    id,
    username,
    display_name,
    elo_rating,
    games_played,
    games_won,
    games_lost,
    games_drawn
  )
VALUES
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'alice',
    'Alice',
    1200,
    0,
    0,
    0,
    0
  ),
  (
    'b1ffcd99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'bob',
    'Bob',
    1200,
    0,
    0,
    0,
    0
  ) ON CONFLICT (id) DO
UPDATE
SET
  username = EXCLUDED.username,
  display_name = EXCLUDED.display_name;