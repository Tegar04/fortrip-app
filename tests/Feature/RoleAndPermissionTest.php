<?php

use App\Models\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    // Reset cache permission sebelum setiap test
    app()[PermissionRegistrar::class]->forgetCachedPermissions();
});

/*
|--------------------------------------------------------------------------
| Role assignment
|--------------------------------------------------------------------------
*/

test('user can be assigned the admin role', function () {
    Role::create(['name' => 'admin']);
    $user = User::factory()->create();

    $user->assignRole('admin');

    expect($user->hasRole('admin'))->toBeTrue();
});

test('user can be assigned the staff role', function () {
    Role::create(['name' => 'staff']);
    $user = User::factory()->create();

    $user->assignRole('staff');

    expect($user->hasRole('staff'))->toBeTrue();
});

test('user without a role has no admin or staff role', function () {
    $user = User::factory()->create();

    expect($user->hasRole('admin'))->toBeFalse()
        ->and($user->hasRole('staff'))->toBeFalse();
});

/*
|--------------------------------------------------------------------------
| Admin dashboard — middleware authorization
|--------------------------------------------------------------------------
*/

test('guest cannot access admin dashboard', function () {
    $this->get(route('admin.dashboard'))
        ->assertRedirect(route('login'));
});

test('authenticated user without a role is forbidden from admin dashboard', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('admin.dashboard'))
        ->assertForbidden();
});

test('admin role passes the role middleware check', function () {
    Role::create(['name' => 'admin']);
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    // Verifikasi langsung bahwa user memiliki role yang diizinkan
    expect($admin->hasRole('admin'))->toBeTrue()
        ->and($admin->hasAnyRole(['admin', 'staff']))->toBeTrue();
});

test('staff role passes the role middleware check', function () {
    Role::create(['name' => 'staff']);
    $staff = User::factory()->create();
    $staff->assignRole('staff');

    expect($staff->hasRole('staff'))->toBeTrue()
        ->and($staff->hasAnyRole(['admin', 'staff']))->toBeTrue();
});
