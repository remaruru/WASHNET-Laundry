# Step-by-Step EC2 Deployment Guide - WASHNET Laundry

This is a **complete step-by-step guide** to deploy your WASHNET Laundry application to AWS EC2 with MySQL database `laundry_db`.

## ✅ Important: Database Configuration
- **Database Name:** `laundry_db` (NOT washnet)
- **Username:** `root`
- **Password:** (blank - no password)
- **Migrations:** Will automatically create all tables when you run `php artisan migrate`

---

## 📋 Prerequisites

1. AWS EC2 instance running (Ubuntu 22.04 recommended)
2. Your EC2 key pair (.pem file)
3. Public IP address of your EC2 instance
4. GitHub account (or any Git hosting)

---

## 🚀 STEP-BY-STEP INSTRUCTIONS

### **STEP 1: Push Your Code to GitHub** (Do this on your Windows computer)

Open PowerShell or Command Prompt in your project folder:

```powershell
cd C:\xampp\htdocs\laundrys

# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - WASHNET Laundry System"

# Create a repository on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

**✅ After this step:** Your code is on GitHub and ready to be pulled on EC2.

---

### **STEP 2: Launch and Connect to EC2 Instance**

1. **Launch EC2 Instance:**
   - Go to AWS Console → EC2 → Launch Instance
   - Choose: **Ubuntu 22.04 LTS**
   - Instance Type: **t2.micro** (free tier) or larger
   - Configure security group:
     - Allow **SSH (port 22)** from your IP
     - Allow **HTTP (port 80)** from anywhere (0.0.0.0/0)
     - Allow **HTTPS (port 443)** from anywhere (optional)
   - Launch and download your key pair (.pem file)

2. **Connect to EC2:**
   ```bash
   # On Windows PowerShell or Git Bash
   ssh -i "your-key.pem" ubuntu@YOUR_EC2_PUBLIC_IP
   ```
   Replace `your-key.pem` with your actual key file name and `YOUR_EC2_PUBLIC_IP` with your EC2's public IP.

**✅ After this step:** You're connected to your EC2 server.

---

### **STEP 3: Install Required Software on EC2**

Run these commands **one by one** on your EC2 instance:

```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install PHP 8.2 and all required extensions
sudo apt install -y software-properties-common
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update
sudo apt install -y php8.2 php8.2-cli php8.2-common php8.2-mysql php8.2-zip \
    php8.2-gd php8.2-mbstring php8.2-curl php8.2-xml php8.2-bcmath php8.2-sqlite3

# 3. Install Composer (PHP dependency manager)
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
sudo chmod +x /usr/local/bin/composer

# 4. Install Node.js and npm (for React frontend)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 5. Install Git (if not already installed)
sudo apt install -y git

# 6. Install Apache web server
sudo apt install -y apache2
sudo a2enmod rewrite
sudo a2enmod headers
sudo systemctl enable apache2
sudo systemctl start apache2

# 7. Install MySQL Server
sudo apt install -y mysql-server
sudo systemctl enable mysql
sudo systemctl start mysql
```

**✅ After this step:** All required software is installed.

---

### **STEP 4: Setup MySQL Database**

Create the `laundry_db` database with root user (no password):

```bash
# Log into MySQL as root (no password needed)
sudo mysql -u root

# In MySQL prompt, run these commands:
CREATE DATABASE IF NOT EXISTS laundry_db;
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';
FLUSH PRIVILEGES;
EXIT;
```

**✅ After this step:** Database `laundry_db` is created and ready.

---

### **STEP 5: Clone Your Repository**

```bash
# Create project directory
sudo mkdir -p /var/www
cd /var/www

# Clone your repository (replace with YOUR GitHub URL)
sudo git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git laundry

# Set ownership
sudo chown -R $USER:$USER /var/www/laundry
cd laundry
```

**✅ After this step:** Your code is on the server.

---

### **STEP 6: Setup Laravel Backend**

```bash
cd /var/www/laundry/laundry-backend

# Install PHP dependencies
composer install --no-dev --optimize-autoloader

# Create .env file (if .env.example exists, copy it; otherwise create new)
if [ -f ".env.example" ]; then
    cp .env.example .env
else
    cat > .env << EOF
APP_NAME=WASHNET
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=http://YOUR_EC2_IP

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=laundry_db
DB_USERNAME=root
DB_PASSWORD=

LOG_CHANNEL=stack
LOG_LEVEL=error
EOF
fi

# Generate application key
php artisan key:generate

# Verify .env file has correct database settings
cat .env | grep DB_
```

**⚠️ IMPORTANT:** Make sure `.env` shows:
- `DB_CONNECTION=mysql`
- `DB_DATABASE=laundry_db`
- `DB_USERNAME=root`
- `DB_PASSWORD=` (blank)

**✅ After this step:** Backend environment is configured.

---

### **STEP 7: Run Database Migrations**

This will **automatically create all tables** in `laundry_db`:

```bash
cd /var/www/laundry/laundry-backend

# Run migrations (this creates all tables)
php artisan migrate --force

# Create storage link
php artisan storage:link

# Optimize Laravel
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Set proper permissions
sudo chmod -R 775 storage bootstrap/cache
sudo chown -R www-data:www-data storage bootstrap/cache
```

**✅ After this step:** Database tables are created via migrations.

---

### **STEP 8: Setup React Frontend**

```bash
cd /var/www/laundry/laundry-frontend

# Install Node.js dependencies
npm install

# Create .env file for frontend
cat > .env << EOF
REACT_APP_API_URL=http://YOUR_EC2_IP/api
REACT_APP_WEATHER_API_KEY=67c3afe347b2430fa8022239250311
EOF

# Replace YOUR_EC2_IP with your actual EC2 public IP address
# You can edit it with: nano .env

# Build for production
npm run build
```

**⚠️ IMPORTANT:** Replace `YOUR_EC2_IP` with your actual EC2 public IP address.

**✅ After this step:** Frontend is built and ready.

---

### **STEP 9: Configure Apache Web Server**

```bash
# Create Apache virtual host configuration
sudo nano /etc/apache2/sites-available/washnet.conf
```

Paste this configuration (replace `YOUR_EC2_IP` with your actual IP):

```apache
<VirtualHost *:80>
    ServerName YOUR_EC2_IP
    ServerAlias www.YOUR_EC2_IP
    
    # Frontend (React) - Serves the build folder
    DocumentRoot /var/www/laundry/laundry-frontend/build
    
    <Directory /var/www/laundry/laundry-frontend/build>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        # React Router support - handle client-side routing
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
    
    # Backend API (Laravel) - Serves API at /api
    Alias /api /var/www/laundry/laundry-backend/public
    
    <Directory /var/www/laundry/laundry-backend/public>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        RewriteEngine On
        RewriteBase /api
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule ^(.*)$ /api/index.php/$1 [L]
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/washnet_error.log
    CustomLog ${APACHE_LOG_DIR}/washnet_access.log combined
</VirtualHost>
```

Save and exit (Ctrl+X, then Y, then Enter)

Now enable the site:

```bash
# Enable the new site
sudo a2ensite washnet.conf

# Disable default site
sudo a2dissite 000-default.conf

# Test Apache configuration
sudo apache2ctl configtest

# If OK, restart Apache
sudo systemctl restart apache2
```

**✅ After this step:** Web server is configured and running.

---

### **STEP 10: Configure Firewall**

```bash
# Allow HTTP traffic
sudo ufw allow 'Apache Full'

# Allow SSH (important - don't lock yourself out!)
sudo ufw allow ssh

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

**✅ After this step:** Firewall is configured.

---

### **STEP 11: Create Admin User**

```bash
cd /var/www/laundry/laundry-backend

# Open Laravel Tinker
php artisan tinker
```

In the tinker prompt, type:

```php
$admin = new App\Models\User();
$admin->name = 'Admin';
$admin->email = 'admin@washnet.com';
$admin->password = Hash::make('admin123'); // Change this password!
$admin->role = 'admin';
$admin->save();
exit
```

**⚠️ IMPORTANT:** Change `admin123` to a secure password!

**✅ After this step:** Admin user is created.

---

### **STEP 12: Test Your Application**

1. **Open your browser** and go to: `http://YOUR_EC2_PUBLIC_IP`

2. **Test the API** (from EC2 or your computer):
   ```bash
   curl http://YOUR_EC2_IP/api/orders/search?customer_name=test
   ```

3. **Check if everything is working:**
   - Frontend loads? ✅
   - Can search for orders? ✅
   - Weather forecast shows? ✅
   - Admin login works? ✅

**✅ After this step:** Your application is live!

---

## 🎉 YOU'RE DONE!

Your WASHNET Laundry application should now be accessible at:
**http://YOUR_EC2_PUBLIC_IP**

---

## 🔄 Updating Your Application (After Making Changes)

When you make changes locally and want to update EC2:

**On your Windows computer:**
```powershell
cd C:\xampp\htdocs\laundrys
git add .
git commit -m "Your update description"
git push
```

**On EC2 (SSH into server):**
```bash
cd /var/www/laundry
git pull
cd laundry-backend
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache
php artisan route:cache
cd ../laundry-frontend
npm install
npm run build
sudo systemctl restart apache2
```

---

## 🐛 Troubleshooting

### Can't access the website?
```bash
# Check Apache status
sudo systemctl status apache2

# Check Apache error logs
sudo tail -f /var/log/apache2/washnet_error.log

# Restart Apache
sudo systemctl restart apache2
```

### Database connection errors?
```bash
# Verify MySQL is running
sudo systemctl status mysql

# Test MySQL connection
sudo mysql -u root -e "SHOW DATABASES;"

# Verify database exists
sudo mysql -u root -e "USE laundry_db; SHOW TABLES;"
```

### Laravel errors?
```bash
# Check Laravel logs
tail -f /var/www/laundry/laundry-backend/storage/logs/laravel.log

# Clear Laravel cache
cd /var/www/laundry/laundry-backend
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

### Permission errors?
```bash
# Fix permissions
sudo chown -R www-data:www-data /var/www/laundry
sudo chmod -R 755 /var/www/laundry
sudo chmod -R 775 /var/www/laundry/laundry-backend/storage
sudo chmod -R 775 /var/www/laundry/laundry-backend/bootstrap/cache
```

---

## 📝 Quick Reference: Database Configuration

**Your .env file should have:**
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=laundry_db
DB_USERNAME=root
DB_PASSWORD=
```

**✅ YES - The migrations will automatically create all tables when you run `php artisan migrate`!**

The database name MUST be `laundry_db` (not washnet) as you specified.

---

## 🆘 Need Help?

- Check Apache logs: `sudo tail -f /var/log/apache2/washnet_error.log`
- Check Laravel logs: `tail -f /var/www/laundry/laundry-backend/storage/logs/laravel.log`
- Verify database: `sudo mysql -u root -e "USE laundry_db; SHOW TABLES;"`

