# Database Migrations

Run these **once** if you have an existing database that was created before certain features were added.

## How to run

From the project root (or from `database/`), run the migration with MySQL:

```bash
mysql -u jmfitness_user -p jmfitnesspal < database/migrations/001_add_nickname_and_activity.sql
```

Or with Docker if MySQL runs in a container:

```bash
docker exec -i <mysql_container_name> mysql -u jmfitness_user -p jmfitnesspal < database/migrations/001_add_nickname_and_activity.sql
```

**Note:** If you get "Duplicate column name 'nickname'" then the column already exists; you can skip that statement or run the rest of the file. The `user_activity_log` table uses `CREATE TABLE IF NOT EXISTS` so it is safe to run multiple times.

## Migrations

| File | Purpose |
|------|--------|
| `001_add_nickname_and_activity.sql` | Adds `nickname` to `users` and creates `user_activity_log` for admin Recent Activity (login/logout/signup). |
| `002_extend_activity_log.sql` | Adds `description`, `target_user_id` to `user_activity_log` and new action types: deactivate, delete_user, save_food. Run after 001. |