<?php

use App\Http\Controllers\HomeController;
use App\Http\Controllers\PublicPackageController;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');
Route::get('/packages', [PublicPackageController::class, 'index'])->name('packages.index');
Route::get('/packages/{package:slug}', [PublicPackageController::class, 'show'])->name('packages.show');

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', function () {
        return inertia('dashboard');
    })->name('dashboard');
});
