<?php

use App\Http\Controllers\Admin\BannerController;
use App\Http\Controllers\Admin\PackageController;
use App\Http\Controllers\Admin\SiteSettingController;
use App\Http\Controllers\Admin\TestimonialController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')
    ->name('admin.')
    ->middleware(['auth', 'role:admin|staff'])
    ->group(function () {

        Route::get('/dashboard', function () {
            return inertia('dashboard');
        })->name('dashboard');

        Route::controller(SiteSettingController::class)
            ->prefix('site-settings')
            ->name('site-settings.')
            ->middleware('permission:manage site settings')
            ->group(function () {
                Route::get('/', 'edit')->name('edit');
                Route::put('/', 'update')->name('update');
            });

        Route::put('banners/reorder', [BannerController::class, 'reorder'])
            ->middleware('permission:edit banners')
            ->name('banners.reorder');
        Route::patch('banners/{banner}/toggle', [BannerController::class, 'toggle'])
            ->middleware('permission:edit banners')
            ->name('banners.toggle');
        Route::resource('banners', BannerController::class)
            ->except('show')
            ->middlewareFor('index', 'permission:view banners')
            ->middlewareFor(['create', 'store'], 'permission:create banners')
            ->middlewareFor(['edit', 'update'], 'permission:edit banners')
            ->middlewareFor('destroy', 'permission:delete banners');

        Route::patch('packages/{package}/toggle-active', [PackageController::class, 'toggleActive'])
            ->middleware('permission:edit packages')
            ->name('packages.toggle-active');
        Route::patch('packages/{package}/toggle-featured', [PackageController::class, 'toggleFeatured'])
            ->middleware('permission:edit packages')
            ->name('packages.toggle-featured');
        Route::delete('packages/{package}/gallery/{media}', [PackageController::class, 'destroyGalleryMedia'])
            ->middleware('permission:edit packages')
            ->name('packages.gallery.destroy');
        Route::resource('packages', PackageController::class)
            ->except('show')
            ->middlewareFor('index', 'permission:view packages')
            ->middlewareFor(['create', 'store'], 'permission:create packages')
            ->middlewareFor(['edit', 'update'], 'permission:edit packages')
            ->middlewareFor('destroy', 'permission:delete packages');

        Route::patch('testimonials/{testimonial}/toggle', [TestimonialController::class, 'toggle'])
            ->middleware('permission:edit testimonials')
            ->name('testimonials.toggle');
        Route::resource('testimonials', TestimonialController::class)
            ->except('show')
            ->middlewareFor('index', 'permission:view testimonials')
            ->middlewareFor(['create', 'store'], 'permission:create testimonials')
            ->middlewareFor(['edit', 'update'], 'permission:edit testimonials')
            ->middlewareFor('destroy', 'permission:delete testimonials');
    });
