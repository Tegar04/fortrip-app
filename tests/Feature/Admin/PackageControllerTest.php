<?php

use App\Models\Booking;
use App\Models\Package;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

function packageUser(string $email): User
{
    test()->seed(RoleAndPermissionSeeder::class);

    return User::query()->where('email', $email)->firstOrFail();
}

describe('index and access', function () {
    test('guests are redirected from the package list', function () {
        $this->get(route('admin.packages.index'))
            ->assertRedirect(route('login'));
    });

    test('staff can view packages ordered from newest', function () {
        $this->withoutVite();
        $staff = packageUser('staff@travel.com');
        $olderPackage = Package::factory()->create();
        $newerPackage = Package::factory()->create();

        $this->actingAs($staff)
            ->get(route('admin.packages.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/packages/index')
                ->has('packages', 2)
                ->where('packages.0.id', $newerPackage->id)
                ->where('packages.1.id', $olderPackage->id));
    });

    test('staff cannot create edit toggle or delete packages', function () {
        $staff = packageUser('staff@travel.com');
        $package = Package::factory()->create(['is_active' => true]);

        $this->actingAs($staff)
            ->get(route('admin.packages.create'))
            ->assertForbidden();
        $this->actingAs($staff)
            ->get(route('admin.packages.edit', $package))
            ->assertForbidden();
        $this->actingAs($staff)
            ->patch(route('admin.packages.toggle-active', $package))
            ->assertForbidden();
        $this->actingAs($staff)
            ->delete(route('admin.packages.destroy', $package))
            ->assertForbidden();

        expect($package->refresh()->is_active)->toBeTrue();
        $this->assertModelExists($package);
    });
});

describe('create and update', function () {
    test('admin can create a package with an automatic slug cover and gallery', function () {
        Storage::fake('public');
        $admin = packageUser('admin@travel.com');

        $response = $this->actingAs($admin)
            ->post(route('admin.packages.store'), validPackagePayload([
                'cover' => UploadedFile::fake()->image('cover.jpg', 1200, 675),
                'gallery' => [
                    UploadedFile::fake()->image('one.jpg', 900, 600),
                    UploadedFile::fake()->image('two.webp', 900, 600),
                ],
            ]));

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('admin.packages.index'));

        $package = Package::query()->sole();

        expect($package->title)->toBe('Paket Wisata Bali')
            ->and($package->slug)->toBe('paket-wisata-bali')
            ->and($package->getMedia('cover'))->toHaveCount(1)
            ->and($package->getMedia('gallery'))->toHaveCount(2);

        foreach ($package->media as $media) {
            Storage::disk('public')->assertExists($media->getPathRelativeToRoot());
        }
    });

    test('duplicate package titles receive unique slugs', function () {
        Storage::fake('public');
        $admin = packageUser('admin@travel.com');

        $this->actingAs($admin)->post(
            route('admin.packages.store'),
            validPackagePayload([
                'cover' => UploadedFile::fake()->image('first.jpg'),
            ]),
        )->assertSessionHasNoErrors();

        $this->actingAs($admin)->post(
            route('admin.packages.store'),
            validPackagePayload([
                'cover' => UploadedFile::fake()->image('second.jpg'),
            ]),
        )->assertSessionHasNoErrors();

        expect(Package::query()->orderBy('id')->pluck('slug')->all())
            ->toBe(['paket-wisata-bali', 'paket-wisata-bali-1']);
    });

    test('invalid package input and files are rejected without creating data', function () {
        Storage::fake('public');
        $admin = packageUser('admin@travel.com');

        $response = $this->actingAs($admin)
            ->post(route('admin.packages.store'), validPackagePayload([
                'title' => '',
                'duration_days' => 0,
                'price' => -1,
                'cover' => UploadedFile::fake()->create(
                    'payload.svg',
                    10,
                    'image/svg+xml',
                ),
                'gallery' => [
                    UploadedFile::fake()->create('notes.txt', 10, 'text/plain'),
                ],
            ]));

        $response->assertSessionHasErrors([
            'title',
            'duration_days',
            'price',
            'cover',
            'gallery.0',
        ]);
        $this->assertDatabaseCount('packages', 0);
        $this->assertDatabaseCount('media', 0);
    });

    test('admin can update a package replace its cover and add gallery images', function () {
        Storage::fake('public');
        $admin = packageUser('admin@travel.com');
        $package = Package::factory()->create(['title' => 'Package Lama']);
        $oldCover = $package
            ->addMedia(UploadedFile::fake()->image('old.jpg'))
            ->toMediaCollection('cover');
        $oldCoverPath = $oldCover->getPathRelativeToRoot();

        $response = $this->actingAs($admin)
            ->put(route('admin.packages.update', $package), validPackagePayload([
                'title' => 'Package Baru',
                'is_active' => false,
                'is_featured' => true,
                'cover' => UploadedFile::fake()->image('new.webp'),
                'gallery' => [UploadedFile::fake()->image('gallery.jpg')],
            ]));

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('admin.packages.index'));

        $package->refresh();

        expect($package->title)->toBe('Package Baru')
            ->and($package->slug)->toBe('package-baru')
            ->and($package->is_active)->toBeFalse()
            ->and($package->is_featured)->toBeTrue()
            ->and($package->getMedia('cover'))->toHaveCount(1)
            ->and($package->getFirstMedia('cover')->id)->not->toBe($oldCover->id)
            ->and($package->getMedia('gallery'))->toHaveCount(1);
        Storage::disk('public')->assertMissing($oldCoverPath);
    });
});

describe('status gallery and deletion', function () {
    test('admin can toggle active and featured states', function () {
        $admin = packageUser('admin@travel.com');
        $package = Package::factory()->create([
            'is_active' => true,
            'is_featured' => false,
        ]);

        $this->actingAs($admin)
            ->patch(route('admin.packages.toggle-active', $package))
            ->assertRedirect();
        $this->actingAs($admin)
            ->patch(route('admin.packages.toggle-featured', $package))
            ->assertRedirect();

        expect($package->refresh()->is_active)->toBeFalse()
            ->and($package->is_featured)->toBeTrue();
    });

    test('admin can delete one gallery image', function () {
        Storage::fake('public');
        $admin = packageUser('admin@travel.com');
        $package = Package::factory()->create();
        $media = $package
            ->addMedia(UploadedFile::fake()->image('gallery.jpg'))
            ->toMediaCollection('gallery');
        $mediaPath = $media->getPathRelativeToRoot();

        $this->actingAs($admin)
            ->delete(route('admin.packages.gallery.destroy', [$package, $media]))
            ->assertRedirect();

        $this->assertDatabaseMissing('media', ['id' => $media->id]);
        Storage::disk('public')->assertMissing($mediaPath);
    });

    test('gallery deletion rejects media owned by another package', function () {
        Storage::fake('public');
        $admin = packageUser('admin@travel.com');
        $package = Package::factory()->create();
        $otherPackage = Package::factory()->create();
        $media = $otherPackage
            ->addMedia(UploadedFile::fake()->image('gallery.jpg'))
            ->toMediaCollection('gallery');

        $this->actingAs($admin)
            ->delete(route('admin.packages.gallery.destroy', [$package, $media]))
            ->assertNotFound();

        $this->assertDatabaseHas('media', ['id' => $media->id]);
    });

    test('a package with bookings cannot be deleted', function () {
        $admin = packageUser('admin@travel.com');
        $package = Package::factory()->create();
        Booking::factory()->for($package)->create();

        $this->actingAs($admin)
            ->delete(route('admin.packages.destroy', $package))
            ->assertRedirect();

        $this->assertModelExists($package);
    });

    test('admin can delete an unused package and all its media', function () {
        Storage::fake('public');
        $admin = packageUser('admin@travel.com');
        $package = Package::factory()->create();
        $cover = $package
            ->addMedia(UploadedFile::fake()->image('cover.jpg'))
            ->toMediaCollection('cover');
        $gallery = $package
            ->addMedia(UploadedFile::fake()->image('gallery.jpg'))
            ->toMediaCollection('gallery');

        $this->actingAs($admin)
            ->delete(route('admin.packages.destroy', $package))
            ->assertRedirect(route('admin.packages.index'));

        $this->assertModelMissing($package);
        $this->assertDatabaseMissing('media', ['id' => $cover->id]);
        $this->assertDatabaseMissing('media', ['id' => $gallery->id]);
    });
});

/**
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function validPackagePayload(array $overrides = []): array
{
    return array_replace([
        'title' => 'Paket Wisata Bali',
        'description' => 'Nikmati liburan lengkap di Bali bersama pemandu lokal.',
        'destination' => 'Bali',
        'duration_days' => 4,
        'price' => 2500000,
        'is_featured' => false,
        'is_active' => true,
    ], $overrides);
}
