<?php

use App\Models\Package;
use App\Models\SiteSetting;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

describe('index', function () {
    test('guests see only active packages ordered from newest', function () {
        $this->withoutVite();

        SiteSetting::factory()->create([
            'key' => 'company_name',
            'value' => 'Arcadia Travel',
        ]);
        $activePackages = Package::factory()
            ->count(10)
            ->create(['is_active' => true]);
        Package::factory()->create([
            'title' => 'Paket Rahasia',
            'is_active' => false,
        ]);

        $this->get(route('packages.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('public/packages/index')
                ->where('site.company_name', 'Arcadia Travel')
                ->where('seo.title', 'Paket Wisata — Arcadia Travel')
                ->where('packages.total', 10)
                ->where('packages.per_page', 9)
                ->where('packages.current_page', 1)
                ->where('packages.last_page', 2)
                ->has('packages.data', 9)
                ->where('packages.data.0.id', $activePackages->last()->id)
                ->has('packages.data.0.excerpt')
                ->has('packages.data.0.cover_url')
                ->missing('packages.data.0.description')
                ->missing('packages.data.0.is_active')
                ->missing('packages.data.0.created_at'));
    });

    test('guests can open the next package page', function () {
        $this->withoutVite();

        $activePackages = Package::factory()
            ->count(10)
            ->create(['is_active' => true]);

        $this->get(route('packages.index', ['page' => 2]))
            ->assertInertia(fn (Assert $page) => $page
                ->where('packages.current_page', 2)
                ->has('packages.data', 1)
                ->where('packages.data.0.id', $activePackages->first()->id));
    });
});

describe('show', function () {
    test('guests can view an active package by slug with its media', function () {
        $this->withoutVite();
        Storage::fake('public');

        SiteSetting::factory()->create([
            'key' => 'company_name',
            'value' => 'Arcadia Travel',
        ]);
        $package = Package::factory()->create([
            'title' => 'Petualangan Labuan Bajo',
            'description' => 'Nikmati perjalanan berkesan mengunjungi pulau-pulau terbaik di Labuan Bajo.',
            'destination' => 'Labuan Bajo',
            'duration_days' => 4,
            'price' => '3500000.00',
            'is_active' => true,
        ]);
        $package
            ->addMedia(UploadedFile::fake()->image('cover.jpg', 1200, 675))
            ->toMediaCollection('cover');
        $package
            ->addMedia(UploadedFile::fake()->image('gallery-one.jpg', 900, 600))
            ->toMediaCollection('gallery');
        $package
            ->addMedia(UploadedFile::fake()->image('gallery-two.jpg', 900, 600))
            ->toMediaCollection('gallery');

        $this->get(route('packages.show', ['package' => $package->slug]))
            ->assertInertia(fn (Assert $page) => $page
                ->component('public/packages/show')
                ->where('seo.title', 'Petualangan Labuan Bajo — Arcadia Travel')
                ->where('package.id', $package->id)
                ->where('package.slug', $package->slug)
                ->where('package.destination', 'Labuan Bajo')
                ->where('package.duration_days', 4)
                ->where('package.price', '3500000.00')
                ->where('package.cover_url', $package->getFirstMediaUrl('cover', 'hero'))
                ->where('package.cover_original_url', $package->getFirstMediaUrl('cover'))
                ->has('package.gallery', 2)
                ->has('package.gallery.0.id')
                ->has('package.gallery.0.url')
                ->has('package.gallery.0.thumb_url')
                ->missing('package.is_active')
                ->missing('package.bookings'));
    });

    test('inactive packages return 404', function () {
        $package = Package::factory()->create(['is_active' => false]);

        $this->get(route('packages.show', ['package' => $package->slug]))
            ->assertNotFound();
    });

    test('unknown package slugs return 404', function () {
        $this->get(route('packages.show', ['package' => 'paket-tidak-ada']))
            ->assertNotFound();
    });
});
