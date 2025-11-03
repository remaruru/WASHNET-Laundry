#!/bin/bash

# Script to setup MySQL database: laundry_db
# Run this BEFORE running migrations

echo "🔧 Setting up MySQL database: laundry_db"

# Check if MySQL is running
if ! sudo systemctl is-active --quiet mysql; then
    echo "⚠️  MySQL is not running. Starting MySQL..."
    sudo systemctl start mysql
    sudo systemctl enable mysql
fi

# Create database and configure root user
echo "📦 Creating database: laundry_db"

sudo mysql -u root << EOF
-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS laundry_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Allow root to connect without password (for localhost only)
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';
FLUSH PRIVILEGES;

-- Show confirmation
SHOW DATABASES LIKE 'laundry_db';
SELECT 'Database laundry_db created successfully!' AS Status;
EOF

if [ $? -eq 0 ]; then
    echo "✅ Database 'laundry_db' created successfully!"
    echo "✅ Root user configured (blank password)"
    echo ""
    echo "📝 Next step: Run migrations:"
    echo "   cd /var/www/laundry/laundry-backend"
    echo "   php artisan migrate --force"
else
    echo "❌ Error creating database. Please check MySQL installation."
    exit 1
fi

