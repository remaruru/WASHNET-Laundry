#!/bin/bash

# WASHNET Deployment Script for AWS EC2 (Amazon Linux 2023)
# This script automates the deployment process for Amazon Linux 2023

set -e  # Exit on error

echo "🚀 Starting WASHNET Deployment for Amazon Linux 2023..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/var/www/laundry"
BACKEND_DIR="$PROJECT_DIR/laundry-backend"
FRONTEND_DIR="$PROJECT_DIR/laundry-frontend"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    print_error "Please do not run as root. Run as regular user with sudo privileges."
    exit 1
fi

# Update system
print_status "Updating system packages..."
sudo dnf update -y

# Install PHP and extensions (Amazon Linux 2023 package names)
print_status "Installing PHP and extensions..."
sudo dnf install -y php php-cli php-common php-mysqlnd php-zip \
    php-gd php-mbstring php-curl php-xml php-bcmath php-pdo sqlite php-sqlite3

# Install Composer
if ! command -v composer &> /dev/null; then
    print_status "Installing Composer..."
    curl -sS https://getcomposer.org/installer | php
    sudo mv composer.phar /usr/local/bin/composer
    sudo chmod +x /usr/local/bin/composer
else
    print_status "Composer already installed"
fi

# Install Git
if ! command -v git &> /dev/null; then
    print_status "Installing Git..."
    sudo dnf install -y git
else
    print_status "Git already installed: $(git --version)"
fi

# Install Node.js (Amazon Linux 2023 uses nodejs20)
if ! command -v node &> /dev/null; then
    print_status "Installing Node.js 20..."
    sudo dnf install -y nodejs20 npm
else
    print_status "Node.js already installed: $(node --version)"
fi

# Install MySQL (MariaDB)
if ! command -v mysql &> /dev/null; then
    print_status "Installing MySQL (MariaDB)..."
    sudo dnf install -y mariadb105-server mariadb105
    sudo systemctl enable mariadb
    sudo systemctl start mariadb
    
    # Setup laundry_db database with root (blank password)
    print_status "Setting up MySQL database: laundry_db..."
    sudo mysql -u root << EOF
CREATE DATABASE IF NOT EXISTS laundry_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';
FLUSH PRIVILEGES;
EOF
    print_status "Database 'laundry_db' created with root user (blank password)"
else
    print_status "MySQL (MariaDB) already installed"
    # Still try to create database if it doesn't exist
    sudo mysql -u root -e "CREATE DATABASE IF NOT EXISTS laundry_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null || true
fi

# Install Apache (httpd)
if ! command -v httpd &> /dev/null; then
    print_status "Installing Apache (httpd)..."
    sudo dnf install -y httpd
    sudo systemctl enable httpd
    sudo systemctl start httpd
else
    print_status "Apache already installed"
fi

# Check if project directory exists
if [ ! -d "$PROJECT_DIR" ]; then
    print_error "Project directory not found: $PROJECT_DIR"
    print_error "Please clone your repository first:"
    print_error "  cd /var/www && sudo git clone <your-repo-url> laundry"
    exit 1
fi

# Set permissions
print_status "Setting up permissions..."
sudo chown -R $USER:$USER $PROJECT_DIR
sudo chmod -R 755 $PROJECT_DIR

# Backend Setup
print_status "Setting up Laravel backend..."
cd $BACKEND_DIR

# Install Composer dependencies
if [ ! -d "vendor" ]; then
    print_status "Installing Composer dependencies..."
    composer install --no-dev --optimize-autoloader
else
    print_status "Composer dependencies already installed"
fi

# Setup .env file
if [ ! -f ".env" ]; then
    print_status "Creating .env file..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
    else
        print_warning ".env.example not found, creating basic .env..."
        cat > .env << EOF
APP_NAME=WASHNET
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=http://localhost

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=laundry_db
DB_USERNAME=root
DB_PASSWORD=

LOG_CHANNEL=stack
LOG_LEVEL=debug
EOF
    fi
    
    # Generate app key
    php artisan key:generate
    print_warning "Please edit .env file with your configuration!"
    print_warning "Run: nano $BACKEND_DIR/.env"
else
    print_status ".env file already exists"
fi

# Create storage link
php artisan storage:link

# Run migrations
print_status "Running database migrations..."
php artisan migrate --force

# Optimize Laravel
print_status "Optimizing Laravel..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Set storage permissions
sudo chmod -R 775 storage bootstrap/cache
sudo chown -R apache:apache storage bootstrap/cache

# Frontend Setup
print_status "Setting up React frontend..."
cd $FRONTEND_DIR

# Install npm dependencies
if [ ! -d "node_modules" ]; then
    print_status "Installing npm dependencies..."
    npm install
else
    print_status "npm dependencies already installed"
fi

# Create .env file for frontend
if [ ! -f ".env" ]; then
    print_status "Creating frontend .env file..."
    cat > .env << EOF
REACT_APP_API_URL=http://localhost/api
REACT_APP_WEATHER_API_KEY=your-openweathermap-api-key
EOF
    print_warning "Please edit .env file with your API URLs and keys!"
    print_warning "Run: nano $FRONTEND_DIR/.env"
fi

# Build frontend
print_status "Building React frontend for production..."
npm run build

print_status "✅ Deployment setup complete!"
print_warning "⚠️  Important next steps:"
echo "  1. Edit backend .env: nano $BACKEND_DIR/.env"
echo "  2. Edit frontend .env: nano $FRONTEND_DIR/.env"
echo "  3. Configure Apache virtual host (see DEPLOYMENT.md)"
echo "  4. Create admin user: cd $BACKEND_DIR && php artisan tinker"
echo ""
echo "📖 See DEPLOYMENT.md for detailed configuration instructions"
echo ""
echo "Note: On Amazon Linux, Apache service is 'httpd', not 'apache2'"
echo "      Use: sudo systemctl restart httpd"

