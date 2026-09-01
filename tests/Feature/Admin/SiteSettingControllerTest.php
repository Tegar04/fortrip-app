<?php

use App\Models\SiteSetting;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Inertia\Testing\AssertableInertia as Assert;

function siteSettingsUser(string $email): User
{
    test()->seed(RoleAndPermissionSeeder::class);

    return User::query()->where('email', $email)->firstOrFail();
}

test('guests are redirected from site settings', function () {
    $this->get(route('admin.site-settings.edit'))
        ->assertRedirect(route('login'));
});

test('staff cannot manage site settings', function () {
    $staff = siteSettingsUser('staff@travel.com');

    $this->actingAs($staff)
        ->get(route('admin.site-settings.edit'))
        ->assertForbidden();
});

test('admin can view stored site settings and defaults', function () {
    $this->withoutVite();
    $admin = siteSettingsUser('admin@travel.com');
    SiteSetting::factory()->create([
        'key' => 'company_name',
        'value' => 'ForTrip Indonesia',
    ]);

    $this->actingAs($admin)
        ->get(route('admin.site-settings.edit'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/site-settings')
            ->where('settings.company_name', 'ForTrip Indonesia')
            ->where('settings.company_tagline', null)
            ->has('settings', 11));
});

test('admin can update site settings', function () {
    $admin = siteSettingsUser('admin@travel.com');
    SiteSetting::factory()->create([
        'key' => 'company_name',
        'value' => 'Old Travel',
    ]);

    $response = $this->actingAs($admin)
        ->put(route('admin.site-settings.update'), validSiteSettings([
            'company_name' => 'ForTrip Indonesia',
            'unexpected_key' => 'must not be stored',
        ]));

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('admin.site-settings.edit'));

    $this->assertDatabaseHas('site_settings', [
        'key' => 'company_name',
        'value' => 'ForTrip Indonesia',
    ]);
    $this->assertDatabaseHas('site_settings', [
        'key' => 'hero_title',
        'value' => 'Jelajahi Indonesia',
    ]);
    $this->assertDatabaseMissing('site_settings', [
        'key' => 'unexpected_key',
    ]);
});

test('admin receives validation errors for invalid site settings', function () {
    $admin = siteSettingsUser('admin@travel.com');

    $response = $this->actingAs($admin)
        ->from(route('admin.site-settings.edit'))
        ->put(route('admin.site-settings.update'), validSiteSettings([
            'company_name' => '',
            'company_email' => 'not-an-email',
            'facebook_url' => 'javascript:alert(1)',
            'hero_title' => '',
        ]));

    $response
        ->assertSessionHasErrors([
            'company_name',
            'company_email',
            'facebook_url',
            'hero_title',
        ])
        ->assertRedirect(route('admin.site-settings.edit'));

    $this->assertDatabaseCount('site_settings', 0);
});

/**
 * @param  array<string, string|null>  $overrides
 * @return array<string, string|null>
 */
function validSiteSettings(array $overrides = []): array
{
    return array_replace([
        'company_name' => 'ForTrip',
        'company_tagline' => 'Teman perjalanan Anda',
        'company_address' => 'Jakarta, Indonesia',
        'company_phone' => '0211234567',
        'company_email' => 'hello@fortrip.test',
        'whatsapp_number' => '6281234567890',
        'facebook_url' => 'https://facebook.com/fortrip',
        'instagram_url' => 'https://instagram.com/fortrip',
        'youtube_url' => 'https://youtube.com/@fortrip',
        'hero_title' => 'Jelajahi Indonesia',
        'hero_subtitle' => 'Paket wisata pilihan untuk pengalaman terbaik.',
    ], $overrides);
}
