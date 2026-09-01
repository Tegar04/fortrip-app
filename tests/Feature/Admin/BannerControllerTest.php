<?php

use App\Models\Banner;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

function bannerUser(string $email): User
{
    test()->seed(RoleAndPermissionSeeder::class);

    return User::query()->where('email', $email)->firstOrFail();
}

describe('index', function () {
    test('guests are redirected from the banner list', function () {
        $this->get(route('admin.banners.index'))
            ->assertRedirect(route('login'));
    });

    test('staff can view banners in their configured order', function () {
        $this->withoutVite();
        $staff = bannerUser('staff@travel.com');
        $lastBanner = Banner::factory()->create(['order' => 20]);
        $firstBanner = Banner::factory()->create(['order' => 10]);

        $this->actingAs($staff)
            ->get(route('admin.banners.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/banners/index')
                ->has('banners', 2)
                ->where('banners.0.id', $firstBanner->id)
                ->where('banners.1.id', $lastBanner->id));
    });

    test('staff cannot open the banner creation page', function () {
        $staff = bannerUser('staff@travel.com');

        $this->actingAs($staff)
            ->get(route('admin.banners.create'))
            ->assertForbidden();
    });

    test('staff cannot toggle a banner status', function () {
        $staff = bannerUser('staff@travel.com');
        $banner = Banner::factory()->create(['is_active' => true]);

        $this->actingAs($staff)
            ->patch(route('admin.banners.toggle', $banner))
            ->assertForbidden();

        expect($banner->refresh()->is_active)->toBeTrue();
    });

    test('staff cannot delete a banner', function () {
        $staff = bannerUser('staff@travel.com');
        $banner = Banner::factory()->create();

        $this->actingAs($staff)
            ->delete(route('admin.banners.destroy', $banner))
            ->assertForbidden();

        $this->assertModelExists($banner);
    });
});

describe('create and update', function () {
    test('admin can create a banner with an image', function () {
        Storage::fake('public');
        $admin = bannerUser('admin@travel.com');

        $response = $this->actingAs($admin)
            ->post(route('admin.banners.store'), validBannerPayload([
                'image' => UploadedFile::fake()->image('bromo.jpg', 1200, 675),
            ]));

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('admin.banners.index'));

        $banner = Banner::query()->sole();
        $media = $banner->getFirstMedia('image');

        expect($banner->title)->toBe('Wisata Bromo')
            ->and($banner->order)->toBe(1)
            ->and($banner->is_active)->toBeTrue()
            ->and($media)->not->toBeNull();
        Storage::disk('public')->assertExists($media->getPathRelativeToRoot());
    });

    test('invalid banner input is rejected without creating data', function () {
        Storage::fake('public');
        $admin = bannerUser('admin@travel.com');

        $response = $this->actingAs($admin)
            ->post(route('admin.banners.store'), validBannerPayload([
                'title' => '',
                'button_url' => 'javascript:alert(1)',
                'image' => UploadedFile::fake()->create('payload.svg', 10, 'image/svg+xml'),
            ]));

        $response->assertSessionHasErrors(['title', 'button_url', 'image']);
        $this->assertDatabaseCount('banners', 0);
        $this->assertDatabaseCount('media', 0);
    });

    test('admin can update a banner and replace its image', function () {
        Storage::fake('public');
        $admin = bannerUser('admin@travel.com');
        $banner = Banner::factory()->create(['title' => 'Banner Lama']);
        $banner->addMedia(UploadedFile::fake()->image('old.jpg', 1200, 675))
            ->toMediaCollection('image');
        $oldMedia = $banner->getFirstMedia('image');
        $oldMediaPath = $oldMedia->getPathRelativeToRoot();

        $response = $this->actingAs($admin)
            ->put(route('admin.banners.update', $banner), validBannerPayload([
                'title' => 'Banner Baru',
                'is_active' => false,
                'image' => UploadedFile::fake()->image('new.webp', 1200, 675),
            ]));

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('admin.banners.index'));

        $banner->refresh();

        expect($banner->title)->toBe('Banner Baru')
            ->and($banner->is_active)->toBeFalse()
            ->and($banner->getMedia('image'))->toHaveCount(1)
            ->and($banner->getFirstMedia('image')->id)->not->toBe($oldMedia->id);
        Storage::disk('public')->assertMissing($oldMediaPath);
    });
});

describe('status, order, and deletion', function () {
    test('admin can toggle a banner status', function () {
        $admin = bannerUser('admin@travel.com');
        $banner = Banner::factory()->create(['is_active' => true]);

        $response = $this->actingAs($admin)
            ->patch(route('admin.banners.toggle', $banner));

        $response->assertRedirect();
        expect($banner->refresh()->is_active)->toBeFalse();
    });

    test('admin can reorder every banner', function () {
        $admin = bannerUser('admin@travel.com');
        $firstBanner = Banner::factory()->create(['order' => 1]);
        $secondBanner = Banner::factory()->create(['order' => 2]);
        $thirdBanner = Banner::factory()->create(['order' => 3]);

        $response = $this->actingAs($admin)
            ->put(route('admin.banners.reorder'), [
                'banners' => [
                    $thirdBanner->id,
                    $firstBanner->id,
                    $secondBanner->id,
                ],
            ]);

        $response->assertSessionHasNoErrors();
        expect($thirdBanner->refresh()->order)->toBe(1)
            ->and($firstBanner->refresh()->order)->toBe(2)
            ->and($secondBanner->refresh()->order)->toBe(3);
    });

    test('a partial banner order is rejected without changing positions', function () {
        $admin = bannerUser('admin@travel.com');
        $firstBanner = Banner::factory()->create(['order' => 1]);
        $secondBanner = Banner::factory()->create(['order' => 2]);

        $response = $this->actingAs($admin)
            ->put(route('admin.banners.reorder'), [
                'banners' => [$secondBanner->id],
            ]);

        $response->assertSessionHasErrors('banners');
        expect($firstBanner->refresh()->order)->toBe(1)
            ->and($secondBanner->refresh()->order)->toBe(2);
    });

    test('admin can delete a banner and its image', function () {
        Storage::fake('public');
        $admin = bannerUser('admin@travel.com');
        $banner = Banner::factory()->create();
        $media = $banner
            ->addMedia(UploadedFile::fake()->image('banner.jpg', 1200, 675))
            ->toMediaCollection('image');
        $mediaPath = $media->getPathRelativeToRoot();

        $response = $this->actingAs($admin)
            ->delete(route('admin.banners.destroy', $banner));

        $response->assertRedirect(route('admin.banners.index'));
        $this->assertModelMissing($banner);
        $this->assertDatabaseMissing('media', ['id' => $media->id]);
        Storage::disk('public')->assertMissing($mediaPath);
    });
});

/**
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function validBannerPayload(array $overrides = []): array
{
    return array_replace([
        'title' => 'Wisata Bromo',
        'subtitle' => 'Nikmati matahari terbit terbaik di Jawa Timur.',
        'button_text' => 'Lihat paket',
        'button_url' => '/packages',
        'is_active' => true,
    ], $overrides);
}
