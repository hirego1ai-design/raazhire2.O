# Database Migration Instructions

To enable the new **AI Fraud Detection**, **Autonomous Screening**, and **Candidate Scoring** features, you must update your database schema using the provided SQL migration file.

## Step 1: Locate the Migration File
 The migration file is located at:
 `server/migrations/002_full_spec_upgrade.sql`

## Step 2: Run the Migration in Supabase
1.  Go to your **Supabase Dashboard**.
2.  Navigate to the **SQL Editor** (icon on the left sidebar).
3.  Click **New Query**.
4.  Copy the **entire content** of `server/migrations/002_full_spec_upgrade.sql`.
5.  Paste it into the SQL Editor.
6.  Click **Run** (bottom right).

## Step 3: Verify Success
After running the script, check the `Table Editor` to confirm:
-   `candidates` table has new columns: `ai_overall_score`, `fraud_detection_flag`, `video_resume_url`, etc.
-   New tables exist: `ai_evaluations`, `workflow_events`, `audit_logs`.

## Troubleshooting
-   If you see "relation already exists" errors, it means some parts were already created. The script is designed to only add *missing* columns, but if a table creation fails, ignore it if the table already exists.
-   If `candidates` table is missing, run `001_missing_tables.sql` first.

## Restart Server
After updating the database, restart your backend server to ensure the new schema is recognized by the application cache (if any).
```bash
cd server
npm start
```
