<?php

namespace App\Models;

use Database\Factories\PackageFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Sluggable\Attributes\Sluggable;

#[Sluggable(from: 'title', to: 'slug')]
class Package extends Model implements HasMedia
{
    /** @use HasFactory<PackageFactory> */
    use HasFactory, InteractsWithMedia;

    protected $fillable = [
        'title',
        'description',
        'destination',
        'duration_days',
        'price',
        'is_featured',
        'is_active',
    ];

    protected $casts = [
        'duration_days' => 'integer',
        'price' => 'decimal:2',
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
    ];

    /**
     * Satu Package dapat memiliki banyak Booking.
     *
     * @return HasMany<Booking, $this>
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * Daftarkan media collections dan konversi untuk Package.
     *
     * Collection 'cover'   — foto utama paket (1 file, tampil di card & detail).
     * Collection 'gallery' — galeri foto tambahan (multiple files).
     * Konversi 'thumb'     — thumbnail 600×400 px untuk listing.
     * Konversi 'hero'      — gambar besar 1200×675 px untuk halaman detail.
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('cover')
            ->singleFile()
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp']);

        $this->addMediaCollection('gallery')
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp']);
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumb')
            ->performOnCollections('cover', 'gallery')
            ->nonQueued()
            ->width(600)
            ->height(400)
            ->sharpen(5);

        $this->addMediaConversion('hero')
            ->performOnCollections('cover')
            ->nonQueued()
            ->width(1200)
            ->height(675)
            ->sharpen(3);
    }
}
