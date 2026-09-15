<?php

use App\Http\Controllers\AboutController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\PublicBookingController;
use App\Http\Controllers\PublicPackageController;
use App\Http\Controllers\RobotsController;
use App\Http\Controllers\SitemapController;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');
Route::get('/about', AboutController::class)->name('about');
Route::get('/contact', ContactController::class)->name('contact');
Route::get('/sitemap.xml', SitemapController::class)->name('sitemap');
Route::get('/robots.txt', RobotsController::class)->name('robots');
Route::get('/packages', [PublicPackageController::class, 'index'])->name('packages.index');
Route::get('/packages/{package:slug}', [PublicPackageController::class, 'show'])->name('packages.show');

Route::middleware(['auth', 'role:admin|staff'])->group(function () {
    Route::get('/dashboard', DashboardController::class)->name('dashboard');
});

Route::post('/packages/{package:slug}/bookings', [PublicBookingController::class, 'store'])
    ->middleware('throttle:public-bookings')
    ->name('packages.bookings.store');
