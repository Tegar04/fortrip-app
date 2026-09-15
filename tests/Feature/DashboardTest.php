<?php

use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users without an operational role cannot visit the dashboard', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertForbidden();
});

test('staff can visit the dashboard', function () {
    $this->seed(RoleAndPermissionSeeder::class);
    $staff = User::query()->where('email', 'staff@travel.com')->firstOrFail();

    $this->withoutVite()
        ->actingAs($staff)
        ->get(route('dashboard'))
        ->assertOk();
});
