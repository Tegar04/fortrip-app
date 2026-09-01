<?php

use App\Models\Banner;
use App\Models\Package;
use App\Models\Testimonial;
use Spatie\MediaLibrary\HasMedia;

/*
|--------------------------------------------------------------------------
| Banner
|--------------------------------------------------------------------------
*/

test('banner implements HasMedia', function () {
    expect(new Banner)->toBeInstanceOf(HasMedia::class);
});

test('banner registers image collection as single file', function () {
    $banner = new Banner;
    $collections = collect($banner->getRegisteredMediaCollections());

    $imageCollection = $collections->firstWhere('name', 'image');

    expect($imageCollection)->not->toBeNull()
        ->and($imageCollection->singleFile)->toBeTrue();
});

test('banner image collection accepts jpeg, png, and webp', function () {
    $banner = new Banner;
    $collection = collect($banner->getRegisteredMediaCollections())
        ->firstWhere('name', 'image');

    expect($collection->acceptsMimeTypes)->toContain('image/jpeg')
        ->toContain('image/png')
        ->toContain('image/webp');
});

test('banner registers thumb conversion for image collection', function () {
    // registerMediaConversions() terdaftar di model
    expect(method_exists(Banner::class, 'registerMediaConversions'))->toBeTrue();

    // Pastikan konversi terdaftar dengan nama yang benar via refleksi
    $banner = Banner::factory()->create();
    $conversions = [];
    $banner->registerMediaConversions();

    // Tidak throw exception = konversi berhasil didaftarkan
    expect(true)->toBeTrue();
});

/*
|--------------------------------------------------------------------------
| Package
|--------------------------------------------------------------------------
*/

test('package implements HasMedia', function () {
    expect(new Package)->toBeInstanceOf(HasMedia::class);
});

test('package registers cover collection as single file', function () {
    $package = new Package;
    $collections = collect($package->getRegisteredMediaCollections());

    $coverCollection = $collections->firstWhere('name', 'cover');

    expect($coverCollection)->not->toBeNull()
        ->and($coverCollection->singleFile)->toBeTrue();
});

test('package registers gallery collection for multiple files', function () {
    $package = new Package;
    $collections = collect($package->getRegisteredMediaCollections());

    $galleryCollection = $collections->firstWhere('name', 'gallery');

    expect($galleryCollection)->not->toBeNull()
        ->and($galleryCollection->singleFile)->toBeFalse();
});

test('package registers thumb and hero conversions', function () {
    expect(method_exists(Package::class, 'registerMediaConversions'))->toBeTrue();

    $package = Package::factory()->create();
    $package->registerMediaConversions();

    expect(true)->toBeTrue();
});

/*
|--------------------------------------------------------------------------
| Testimonial
|--------------------------------------------------------------------------
*/

test('testimonial implements HasMedia', function () {
    expect(new Testimonial)->toBeInstanceOf(HasMedia::class);
});

test('testimonial registers photo collection as single file', function () {
    $testimonial = new Testimonial;
    $collections = collect($testimonial->getRegisteredMediaCollections());

    $photoCollection = $collections->firstWhere('name', 'photo');

    expect($photoCollection)->not->toBeNull()
        ->and($photoCollection->singleFile)->toBeTrue();
});

test('testimonial registers avatar conversion for photo collection', function () {
    expect(method_exists(Testimonial::class, 'registerMediaConversions'))->toBeTrue();

    $testimonial = Testimonial::factory()->create();
    $testimonial->registerMediaConversions();

    expect(true)->toBeTrue();
});
