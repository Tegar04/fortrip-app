<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleAndPermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles & permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        /*
        |--------------------------------------------------------------------------
        | PERMISSIONS
        |--------------------------------------------------------------------------
        */

        $permissions = [
            // Site settings
            'manage site settings',

            // Banners
            'view banners',
            'create banners',
            'edit banners',
            'delete banners',

            // Packages
            'view packages',
            'create packages',
            'edit packages',
            'delete packages',

            // Testimonials
            'view testimonials',
            'create testimonials',
            'edit testimonials',
            'delete testimonials',

            // Customers
            'view customers',
            'create customers',
            'edit customers',
            'delete customers',

            // Bookings
            'view bookings',
            'create bookings',
            'edit bookings',
            'delete bookings',

            // Invoices
            'view invoices',
            'create invoices',
            'edit invoices',
            'delete invoices',
            'download invoices',

            // Reports
            'view reports',
            'export reports',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        /*
        |--------------------------------------------------------------------------
        | ROLES
        |--------------------------------------------------------------------------
        */

        /** Admin — akses penuh ke semua fitur */
        $adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $adminRole->syncPermissions($permissions);

        /** Staff — akses operasional, tidak boleh kelola konten CMS atau hapus data */
        $staffRole = Role::firstOrCreate(['name' => 'staff', 'guard_name' => 'web']);
        $staffRole->syncPermissions([
            'view banners',
            'view packages',
            'view testimonials',
            'view customers',
            'create customers',
            'edit customers',
            'view bookings',
            'create bookings',
            'edit bookings',
            'view invoices',
            'create invoices',
            'edit invoices',
            'download invoices',
            'view reports',
            'export reports',
        ]);

        /*
        |--------------------------------------------------------------------------
        | USERS
        |--------------------------------------------------------------------------
        */

        $admin = User::firstOrCreate(
            ['email' => 'admin@travel.com'],
            [
                'name' => 'Admin Travel',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );
        $admin->assignRole('admin');

        $staff = User::firstOrCreate(
            ['email' => 'staff@travel.com'],
            [
                'name' => 'Staff Travel',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );
        $staff->assignRole('staff');
    }
}
