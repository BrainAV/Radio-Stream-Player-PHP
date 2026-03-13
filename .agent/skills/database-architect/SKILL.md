---
name: database-architect
description: Expertise in designing relational database schemas, managing SQL migrations, and ensuring the project's source-of-truth `schema.sql` remains synchronized with migration files.
---

# Database Architect Skill

Use this skill whenever you are adding columns to tables, creating new tables, or seeding default data. This skill ensures that the project's database structure is documented, portable, and easily updated for both new and existing users.

## 🏗️ The "Schema Sync" Rule
This is the most critical instruction of this skill:
**Whenever you create or modify a "migration" file (e.g., `database/update_vX.X.X.sql`), you MUST immediately update `database/schema.sql` to match.**

-   **`schema.sql`**: Is the absolute source of truth for **new installations**. It should always represent the latest version of the player.
-   **`update_...sql`**: Are "migrations" for **existing users**. They allow users to upgrade their database without losing their data.

Failure to keep these in sync leads to current users having features that new users don't (or vice versa).

## 📋 Best Practices

### 1. Table Creation
Always use `CREATE TABLE IF NOT EXISTS` and explicit `ENGINE=InnoDB` with `utf8mb4` collation to ensure cross-hosting compatibility (especially for cPanel/LAMP environments).

### 2. Migration Safety
When writing update scripts:
-   Use `ALTER TABLE ... ADD COLUMN ...` with careful consideration of `AFTER` clauses to keep columns logically grouped.
-   Include comments specifying which version the update belongs to.

### 3. Seed Data
-   Use `INSERT IGNORE` for default stations and site configurations. This prevents the script from crashing if the data already exists.
-   When adding new columns that require data (like `bitrate`), ensure you also provide `UPDATE` statements to fill in the data for existing default records.

### 4. Integrity
Always define foreign keys for relationship tables (like `user_favorites`) with `ON DELETE CASCADE` to prevent "orphaned" data in the database.

## 🗄️ Standard Table Layout
-   `stations`: Core metadata (name, url, genre, country, bitrate).
-   `users`: Authentication and profile (includes `role` and `is_premium`).
-   `user_favorites`: Pivot table linking users to stations.
-   `site_config`: Key-Value store for webmaster settings (Analytics, Ads).
-   `password_resets`: Temporary storage for secure reset tokens.
