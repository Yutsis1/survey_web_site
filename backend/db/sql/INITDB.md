# Instruction for local# Connect to PostgreSQL as admin

```bash
psql -U postgres -h localhost

# Create database and user
CREATE DATABASE survey_auth;
CREATE USER survey_user WITH PASSWORD 'Password1!';
GRANT ALL PRIVILEGES ON DATABASE survey_auth TO survey_user;

# Connect to the database
\c survey_auth;

# Grant schema privileges

GRANT USAGE ON SCHEMA public TO survey_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO survey_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO survey_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO survey_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO survey_user;
```

As far this is running as pet rpoject this is ok