# Database Configuration - Important Notes

## ✅ YES - Everything is Configured Correctly!

### Database Settings:
- **Database Name:** `laundry_db` ✅ (NOT washnet)
- **Username:** `root` ✅
- **Password:** (blank - no password) ✅
- **Host:** `127.0.0.1` (localhost) ✅

### Your .env file should have:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=laundry_db
DB_USERNAME=root
DB_PASSWORD=
```

**⚠️ IMPORTANT:** Leave `DB_PASSWORD=` blank (empty), not even spaces.

---

## ✅ YES - Migrations Will Create All Tables Automatically!

When you run `php artisan migrate --force`, Laravel will:

1. ✅ Connect to the `laundry_db` database
2. ✅ Read all migration files from `laundry-backend/database/migrations/`
3. ✅ Create ALL tables automatically:
   - `users` table
   - `orders` table  
   - `cache` table
   - `jobs` table
   - `personal_access_tokens` table
   - And all other tables defined in migrations

**You DON'T need to manually create any tables!**

---

## 📋 Step-by-Step: Database Setup

### On EC2 Server:

1. **Install MySQL** (if not installed):
   ```bash
   sudo apt install -y mysql-server
   sudo systemctl start mysql
   ```

2. **Create the database** (if not created by deploy script):
   ```bash
   sudo mysql -u root
   ```
   
   Then in MySQL:
   ```sql
   CREATE DATABASE IF NOT EXISTS laundry_db;
   ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';
   FLUSH PRIVILEGES;
   EXIT;
   ```

3. **Configure .env file** in `laundry-backend/.env`:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=laundry_db
   DB_USERNAME=root
   DB_PASSWORD=
   ```

4. **Run migrations** (this creates all tables):
   ```bash
   cd /var/www/laundry/laundry-backend
   php artisan migrate --force
   ```

5. **Verify tables were created**:
   ```bash
   sudo mysql -u root -e "USE laundry_db; SHOW TABLES;"
   ```

You should see output like:
```
+----------------------------+
| Tables_in_laundry_db       |
+----------------------------+
| cache                      |
| cache_locks                |
| jobs                       |
| job_batches                |
| migrations                 |
| orders                     |
| personal_access_tokens     |
| users                      |
+----------------------------+
```

---

## ❓ FAQ

### Q: Do I need to create tables manually?
**A:** NO! Running `php artisan migrate` will create all tables automatically.

### Q: What if the database doesn't exist?
**A:** The deploy scripts (`deploy.sh` or `deploy-amazon-linux.sh`) will create `laundry_db` automatically. Or you can create it manually using the MySQL commands above.

### Q: What if migrations fail?
**A:** Check:
1. Database exists: `sudo mysql -u root -e "SHOW DATABASES LIKE 'laundry_db';"`
2. `.env` file has correct database name: `cat .env | grep DB_DATABASE`
3. MySQL is running: `sudo systemctl status mysql`
4. Check Laravel logs: `tail -f storage/logs/laravel.log`

### Q: Can I use a different database name?
**A:** Yes, but you MUST update `.env` file and create that database manually. The deploy scripts are configured for `laundry_db`.

### Q: What about the root password?
**A:** For development/testing on EC2, blank password is OK. For production, consider creating a dedicated database user with a password.

---

## 🔍 Verification Commands

```bash
# Check if database exists
sudo mysql -u root -e "SHOW DATABASES LIKE 'laundry_db';"

# Check if tables exist
sudo mysql -u root -e "USE laundry_db; SHOW TABLES;"

# Check .env configuration
cd /var/www/laundry/laundry-backend
cat .env | grep DB_

# Test database connection
cd /var/www/laundry/laundry-backend
php artisan tinker
# Then in tinker: DB::connection()->getPdo();
```

---

## ✅ Summary

- ✅ Database name: `laundry_db` (correct!)
- ✅ Username: `root` (correct!)
- ✅ Password: blank (correct!)
- ✅ Migrations will create all tables automatically (YES!)
- ✅ No manual table creation needed (YES!)

**Everything is configured correctly!** Just follow the deployment steps in `EC2-DEPLOYMENT-STEPS.md`.

