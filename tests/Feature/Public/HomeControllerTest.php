<?php

use App\Models\Banner;
use App\Models\Package;
use App\Models\SiteSetting;
use App\Models\Testimonial;
use Inertia\Testing\AssertableInertia as Assert;

test('guests can view the dynamic home page with active content', function () {
    $this->withoutVite();

    SiteSetting::factory()->create([
        'key' => 'company_name',
        'value' => 'ForTrip Indonesia',
    ]);
    SiteSetting::factory()->create([
        'key' => 'whatsapp_number',
        'value' => '0812-3456-7890',
    ]);
    SiteSetting::factory()->create([
        'key' => 'about_title',
        'value' => 'Perjalanan Tanpa Repot',
    ]);

    $lastBanner = Banner::factory()->create([
        'title' => 'Banner Terakhir',
        'order' => 20,
        'is_active' => true,
    ]);
    $firstBanner = Banner::factory()->create([
        'title' => 'Banner Pertama',
        'order' => 10,
        'is_active' => true,
    ]);
    Banner::factory()->create([
        'title' => 'Banner Nonaktif',
        'order' => 1,
        'is_active' => false,
    ]);

    $olderFeaturedPackage = Package::factory()->create([
        'title' => 'Bali Pilihan',
        'is_active' => true,
        'is_featured' => true,
    ]);
    $newerFeaturedPackage = Package::factory()->create([
        'title' => 'Bromo Pilihan',
        'is_active' => true,
        'is_featured' => true,
    ]);
    Package::factory()->create([
        'title' => 'Paket Biasa',
        'is_active' => true,
        'is_featured' => false,
    ]);
    Package::factory()->create([
        'title' => 'Paket Nonaktif',
        'is_active' => false,
        'is_featured' => true,
    ]);

    $olderTestimonial = Testimonial::factory()->create([
        'name' => 'Pelanggan Pertama',
        'is_active' => true,
    ]);
    $newerTestimonial = Testimonial::factory()->create([
        'name' => 'Pelanggan Terbaru',
        'is_active' => true,
    ]);
    Testimonial::factory()->create([
        'name' => 'Pelanggan Nonaktif',
        'is_active' => false,
    ]);

    $this->get(route('home'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/home')
            ->where('site.company_name', 'ForTrip Indonesia')
            ->where('site.whatsapp_url', 'https://wa.me/6281234567890')
            ->where('content.about_title', 'Perjalanan Tanpa Repot')
            ->has('banners', 2)
            ->where('banners.0.id', $firstBanner->id)
            ->where('banners.1.id', $lastBanner->id)
            ->where('banners.0.image_url', '')
            ->missing('banners.0.is_active')
            ->has('featured_packages', 2)
            ->where('featured_packages.0.id', $newerFeaturedPackage->id)
            ->where('featured_packages.1.id', $olderFeaturedPackage->id)
            ->where('featured_packages.0.cover_url', '')
            ->missing('featured_packages.0.is_active')
            ->has('testimonials', 2)
            ->where('testimonials.0.id', $newerTestimonial->id)
            ->where('testimonials.1.id', $olderTestimonial->id)
            ->where('testimonials.0.avatar_url', '')
            ->missing('testimonials.0.is_active'));
});

test('home page limits featured packages and testimonials to six newest records', function () {
    $this->withoutVite();

    $packages = Package::factory()
        ->count(7)
        ->create([
            'is_active' => true,
            'is_featured' => true,
        ]);
    $testimonials = Testimonial::factory()
        ->count(7)
        ->create(['is_active' => true]);

    $this->get(route('home'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('featured_packages', 6)
            ->where('featured_packages.0.id', $packages->last()->id)
            ->where('featured_packages.5.id', $packages->get(1)->id)
            ->has('testimonials', 6)
            ->where('testimonials.0.id', $testimonials->last()->id)
            ->where('testimonials.5.id', $testimonials->get(1)->id));
});

test('home page uses safe defaults when optional content is empty', function () {
    $this->withoutVite();

    $this->get(route('home'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/home')
            ->where('site.company_name', SiteSetting::DEFAULTS['company_name'])
            ->where('site.whatsapp_url', null)
            ->where('content.hero_title', 'Jelajahi lebih jauh, pulang dengan cerita.')
            ->where('seo.title', SiteSetting::DEFAULTS['seo_default_title'])
            ->has('banners', 0)
            ->has('featured_packages', 0)
            ->has('testimonials', 0));
});
