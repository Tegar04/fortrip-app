<?php

namespace App\Actions;

use App\Models\SiteSetting;
use Illuminate\Support\Str;

class GetPublicSiteData
{
    /**
     * @param  array<string, string|null>|null  $settings
     * @return array{
     *     company_name: string,
     *     company_tagline: string|null,
     *     company_address: string|null,
     *     company_phone: string|null,
     *     company_email: string|null,
     *     whatsapp_url: string|null,
     *     social_urls: array{
     *         facebook: string|null,
     *         instagram: string|null,
     *         youtube: string|null
     *     }
     * }
     */
    public function handle(?array $settings = null): array
    {
        $settings ??= SiteSetting::values();

        return [
            'company_name' => $settings['company_name'],
            'company_tagline' => $settings['company_tagline'],
            'company_address' => $settings['company_address'],
            'company_phone' => $settings['company_phone'],
            'company_email' => $settings['company_email'],
            'whatsapp_url' => $this->whatsappUrl($settings['whatsapp_number']),
            'social_urls' => [
                'facebook' => $settings['facebook_url'],
                'instagram' => $settings['instagram_url'],
                'youtube' => $settings['youtube_url'],
            ],
        ];
    }

    private function whatsappUrl(?string $number): ?string
    {
        if (blank($number)) {
            return null;
        }

        $normalizedNumber = preg_replace('/\D+/', '', $number);

        if (blank($normalizedNumber)) {
            return null;
        }

        if (Str::startsWith($normalizedNumber, '0')) {
            $normalizedNumber = '62'.Str::after($normalizedNumber, '0');
        }

        return 'https://wa.me/'.$normalizedNumber;
    }
}
