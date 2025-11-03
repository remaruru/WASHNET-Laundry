<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update the service_type enum to include 'mixed'
        // SQLite doesn't support MODIFY COLUMN, so we check the driver
        $driver = DB::connection()->getDriverName();
        
        if ($driver === 'mysql' || $driver === 'mariadb') {
            // MySQL/MariaDB: Use MODIFY COLUMN
            DB::statement("ALTER TABLE orders MODIFY COLUMN service_type ENUM('wash_dry', 'wash_only', 'dry_only', 'mixed') DEFAULT 'wash_dry'");
        } elseif ($driver === 'sqlite') {
            // SQLite: Can't modify enum columns directly, but SQLite doesn't enforce enums anyway
            // The column already exists as a string, so we can just update existing data if needed
            // No action needed - SQLite stores enums as strings and doesn't enforce constraints
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert the service_type enum to original values
        $driver = DB::connection()->getDriverName();
        
        if ($driver === 'mysql' || $driver === 'mariadb') {
            // MySQL/MariaDB: Use MODIFY COLUMN
            DB::statement("ALTER TABLE orders MODIFY COLUMN service_type ENUM('wash_dry', 'wash_only', 'dry_only') DEFAULT 'wash_dry'");
        } elseif ($driver === 'sqlite') {
            // SQLite: No action needed
        }
    }
};
