<?php

use App\Models\Testimonial;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

function testimonialUser(string $email): User
{
    test()->seed(RoleAndPermissionSeeder::class);

    return User::query()->where('email', $email)->firstOrFail();
}

describe('index and access', function () {
    test('guests are redirected from the testimonial list', function () {
        $this->get(route('admin.testimonials.index'))
            ->assertRedirect(route('login'));
    });

    test('staff can view testimonials ordered from newest', function () {
        $this->withoutVite();
        $staff = testimonialUser('staff@travel.com');
        $olderTestimonial = Testimonial::factory()->create();
        $newerTestimonial = Testimonial::factory()->create();

        $this->actingAs($staff)
            ->get(route('admin.testimonials.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/testimonials/index')
                ->has('testimonials', 2)
                ->where('testimonials.0.id', $newerTestimonial->id)
                ->where('testimonials.1.id', $olderTestimonial->id));
    });

    test('staff cannot create edit toggle or delete testimonials', function () {
        $staff = testimonialUser('staff@travel.com');
        $testimonial = Testimonial::factory()->create(['is_active' => true]);

        $this->actingAs($staff)
            ->get(route('admin.testimonials.create'))
            ->assertForbidden();
        $this->actingAs($staff)
            ->get(route('admin.testimonials.edit', $testimonial))
            ->assertForbidden();
        $this->actingAs($staff)
            ->patch(route('admin.testimonials.toggle', $testimonial))
            ->assertForbidden();
        $this->actingAs($staff)
            ->delete(route('admin.testimonials.destroy', $testimonial))
            ->assertForbidden();

        expect($testimonial->refresh()->is_active)->toBeTrue();
        $this->assertModelExists($testimonial);
    });
});

describe('create and update', function () {
    test('admin can create a testimonial with an optional photo', function () {
        Storage::fake('public');
        $admin = testimonialUser('admin@travel.com');

        $response = $this->actingAs($admin)
            ->post(route('admin.testimonials.store'), validTestimonialPayload([
                'photo' => UploadedFile::fake()->image('customer.jpg', 400, 400),
            ]));

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('admin.testimonials.index'));

        $testimonial = Testimonial::query()->sole();
        $photo = $testimonial->getFirstMedia('photo');

        expect($testimonial->name)->toBe('Siti Rahma')
            ->and($testimonial->rating)->toBe(5)
            ->and($testimonial->is_active)->toBeTrue()
            ->and($photo)->not->toBeNull();
        Storage::disk('public')->assertExists($photo->getPathRelativeToRoot());
    });

    test('admin can create a testimonial without a photo', function () {
        $admin = testimonialUser('admin@travel.com');

        $this->actingAs($admin)
            ->post(route('admin.testimonials.store'), validTestimonialPayload())
            ->assertSessionHasNoErrors();

        expect(Testimonial::query()->sole()->getMedia('photo'))->toHaveCount(0);
    });

    test('invalid testimonial fields and photo are rejected', function () {
        Storage::fake('public');
        $admin = testimonialUser('admin@travel.com');

        $response = $this->actingAs($admin)
            ->post(route('admin.testimonials.store'), validTestimonialPayload([
                'name' => '',
                'content' => '',
                'rating' => 6,
                'photo' => UploadedFile::fake()->create(
                    'payload.svg',
                    10,
                    'image/svg+xml',
                ),
            ]));

        $response->assertSessionHasErrors([
            'name',
            'content',
            'rating',
            'photo',
        ]);
        $this->assertDatabaseCount('testimonials', 0);
        $this->assertDatabaseCount('media', 0);
    });

    test('admin can update a testimonial and replace its photo', function () {
        Storage::fake('public');
        $admin = testimonialUser('admin@travel.com');
        $testimonial = Testimonial::factory()->create([
            'name' => 'Nama Lama',
            'rating' => 3,
        ]);
        $oldPhoto = $testimonial
            ->addMedia(UploadedFile::fake()->image('old.jpg'))
            ->toMediaCollection('photo');
        $oldPhotoPath = $oldPhoto->getPathRelativeToRoot();

        $response = $this->actingAs($admin)
            ->put(
                route('admin.testimonials.update', $testimonial),
                validTestimonialPayload([
                    'name' => 'Nama Baru',
                    'rating' => 4,
                    'is_active' => false,
                    'photo' => UploadedFile::fake()->image('new.webp'),
                ]),
            );

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('admin.testimonials.index'));

        $testimonial->refresh();

        expect($testimonial->name)->toBe('Nama Baru')
            ->and($testimonial->rating)->toBe(4)
            ->and($testimonial->is_active)->toBeFalse()
            ->and($testimonial->getMedia('photo'))->toHaveCount(1)
            ->and($testimonial->getFirstMedia('photo')->id)->not->toBe($oldPhoto->id);
        Storage::disk('public')->assertMissing($oldPhotoPath);
    });
});

describe('status and deletion', function () {
    test('admin can toggle testimonial status', function () {
        $admin = testimonialUser('admin@travel.com');
        $testimonial = Testimonial::factory()->create(['is_active' => true]);

        $this->actingAs($admin)
            ->patch(route('admin.testimonials.toggle', $testimonial))
            ->assertRedirect();

        expect($testimonial->refresh()->is_active)->toBeFalse();
    });

    test('admin can delete a testimonial and its photo', function () {
        Storage::fake('public');
        $admin = testimonialUser('admin@travel.com');
        $testimonial = Testimonial::factory()->create();
        $photo = $testimonial
            ->addMedia(UploadedFile::fake()->image('customer.jpg'))
            ->toMediaCollection('photo');
        $photoPath = $photo->getPathRelativeToRoot();

        $this->actingAs($admin)
            ->delete(route('admin.testimonials.destroy', $testimonial))
            ->assertRedirect(route('admin.testimonials.index'));

        $this->assertModelMissing($testimonial);
        $this->assertDatabaseMissing('media', ['id' => $photo->id]);
        Storage::disk('public')->assertMissing($photoPath);
    });
});

/**
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function validTestimonialPayload(array $overrides = []): array
{
    return array_replace([
        'name' => 'Siti Rahma',
        'content' => 'Perjalanannya menyenangkan dan pelayanannya sangat baik.',
        'rating' => 5,
        'is_active' => true,
    ], $overrides);
}
