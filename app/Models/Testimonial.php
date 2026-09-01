<?php

namespace App\Models;

use Database\Factories\TestimonialFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Testimonial extends Model implements HasMedia
{
    /** @use HasFactory<TestimonialFactory> */
    use HasFactory, InteractsWithMedia;

    protected $fillable = [
        'name',
        'content',
        'rating',
        'is_active',
    ];

    protected $casts = [
        'rating' => 'integer',
        'is_active' => 'boolean',
    ];

    /**
     * Daftarkan media collections dan konversi untuk Testimonial.
     *
     * Collection 'photo' — foto profil customer (1 file, opsional).
     * Konversi 'avatar'  — foto dipotong menjadi 120×120 px untuk tampil di card.
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('photo')
            ->singleFile()
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp']);
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('avatar')
            ->performOnCollections('photo')
            ->nonQueued()
            ->width(120)
            ->height(120)
            ->sharpen(5);
    }
}
