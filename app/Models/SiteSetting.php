<?php

namespace App\Models;

use Database\Factories\SiteSettingFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SiteSetting extends Model
{
    /** @use HasFactory<SiteSettingFactory> */
    use HasFactory;

    /**
     * @var array<string, string|null>
     */
    public const DEFAULTS = [
        'company_name' => 'Fortuna Travel & Trip',
        'company_tagline' => null,
        'company_address' => null,
        'company_phone' => null,
        'company_email' => null,
        'whatsapp_number' => null,
        'facebook_url' => null,
        'instagram_url' => null,
        'youtube_url' => null,
        'hero_title' => 'Jelajahi lebih jauh, pulang dengan cerita.',
        'hero_subtitle' => 'Paket perjalanan pilihan dengan layanan yang hangat dan rencana yang dibuat lebih mudah.',
        'about_title' => 'Perjalanan yang dirancang dengan sepenuh hati',
        'about_description' => 'Kami membantu Anda menikmati liburan tanpa repot, mulai dari memilih destinasi hingga memastikan setiap detail perjalanan berjalan nyaman.',
        'home_packages_title' => 'Paket perjalanan pilihan',
        'home_packages_subtitle' => 'Temukan pengalaman terbaik yang telah kami siapkan untuk perjalanan Anda berikutnya.',
        'home_testimonials_title' => 'Cerita dari para traveler',
        'home_testimonials_subtitle' => 'Pengalaman nyata dari pelanggan yang telah mempercayakan perjalanannya kepada kami.',
        'home_cta_title' => 'Siap merencanakan perjalanan berikutnya?',
        'home_cta_description' => 'Ceritakan destinasi impian Anda. Tim kami siap membantu menyiapkan perjalanan yang sesuai kebutuhan.',
        'home_cta_button_text' => 'Konsultasi via WhatsApp',
        'seo_default_title' => 'Arcadia Travel — Temukan Perjalanan Terbaik Anda',
        'seo_default_description' => 'Temukan paket wisata pilihan dan rencanakan perjalanan berkesan bersama Arcadia Travel.',
    ];

    protected $fillable = [
        'key',
        'value',
    ];

    /**
     * Get all supported settings with their fallback values.
     *
     * @return array<string, string|null>
     */
    public static function values(): array
    {
        $storedSettings = static::query()
            ->whereIn('key', array_keys(self::DEFAULTS))
            ->pluck('value', 'key')
            ->all();

        return array_replace(self::DEFAULTS, $storedSettings);
    }
}
