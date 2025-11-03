# Quick Start Guide - Deploy to EC2

## The Easiest Way: Git Repository + EC2

### Step 1: Push to GitHub (5 minutes)

1. **Initialize Git** (if not done):
   ```bash
   cd c:\xampp\htdocs\laundrys
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create GitHub Repository**:
   - Go to https://github.com/new
   - Create a new repository (don't initialize with README)
   - Copy the repository URL

3. **Push Your Code**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Setup EC2 Instance (10 minutes)

1. **Connect to EC2**:
   
   For **Ubuntu** instances:
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```
   
   For **Amazon Linux 2023** instances:
   ```bash
   ssh -i your-key.pem ec2-user@your-ec2-ip
   ```

2. **Run the Automated Setup**:
   ```bash
   # Create /var/www directory if it doesn't exist
   sudo mkdir -p /var/www
   sudo chown $USER:$USER /var/www
   
   # Clone your repository
   cd /var/www
   git clone https://github.com/remaruru/WASHNET-Laundry.git laundry
   cd laundry
   
   # For Ubuntu: Make deploy script executable and run
   chmod +x deploy.sh
   ./deploy.sh
   
   # For Amazon Linux 2023: Use the Amazon Linux script
   chmod +x deploy-amazon-linux.sh
   ./deploy-amazon-linux.sh
   ```

3. **Configure Environment Files**:
   ```bash
   # Backend config
   nano laundry-backend/.env
   # Set: APP_URL=http://your-domain.com (or EC2 IP)
   # Set: APP_DEBUG=false
   
   # Frontend config
   nano laundry-frontend/.env
   # Set: REACT_APP_API_URL=http://your-domain.com/api
   # Set: REACT_APP_WEATHER_API_KEY=your-key
   ```

4. **Rebuild Frontend**:
   ```bash
   cd laundry-frontend
   npm run build
   ```

5. **Configure Apache** (follow DEPLOYMENT.md Step 6)
   - Note: On Ubuntu use `apache2`, on Amazon Linux use `httpd`

6. **Restart Apache**:
   
   For **Ubuntu**:
   ```bash
   sudo systemctl restart apache2
   ```
   
   For **Amazon Linux**:
   ```bash
   sudo systemctl restart httpd
   ```

### Step 3: Create Admin User

```bash
cd /var/www/laundry/laundry-backend
php artisan tinker
```

In tinker:
```php
$admin = new App\Models\User();
$admin->name = 'Admin';
$admin->email = 'admin@washnet.com';
$admin->password = Hash::make('your-secure-password');
$admin->role = 'admin';
$admin->save();
exit
```

## That's It! 🎉

Your application should now be accessible at `http://your-ec2-ip` or `http://your-domain.com`

---

## Future Updates

When you make changes locally:

```bash
# Local
git add .
git commit -m "Your changes"
git push

# On EC2
cd /var/www/laundry
git pull
cd laundry-backend
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache
cd ../laundry-frontend
npm run build
# Ubuntu: sudo systemctl restart apache2
# Amazon Linux: sudo systemctl restart httpd
```

---

## Troubleshooting

- **Can't access the site?** Check Apache: 
  - Ubuntu: `sudo systemctl status apache2`
  - Amazon Linux: `sudo systemctl status httpd`
- **API not working?** Check Laravel logs: `tail -f laundry-backend/storage/logs/laravel.log`
- **Frontend not loading?** Make sure you ran `npm run build`
- **Permission errors?** Run: 
  - Ubuntu: `sudo chown -R www-data:www-data /var/www/laundry`
  - Amazon Linux: `sudo chown -R apache:apache /var/www/laundry`

For detailed instructions, see `DEPLOYMENT.md`
