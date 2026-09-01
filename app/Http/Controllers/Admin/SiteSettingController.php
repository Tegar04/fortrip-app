<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateSiteSettingsRequest;
use App\Models\SiteSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SiteSettingController extends Controller
{
    /**
     * @var array<string, string|null>
     */
    private const DEFAULTS = [
        'company_name' => 'Arcadia Travel',
        'company_tagline' => null,
        'company_address' => null,
        'company_phone' => null,
        'company_email' => null,
        'whatsapp_number' => null,
        'facebook_url' => null,
        'instagram_url' => null,
        'youtube_url' => null,
        'hero_title' => null,
        'hero_subtitle' => null,
    ];

    /**
     * Show the site settings form.
     */
    public function edit(): Response
    {
        $storedSettings = SiteSetting::query()
            ->whereIn('key', array_keys(self::DEFAULTS))
            ->pluck('value', 'key')
            ->all();

        return Inertia::render('admin/site-settings', [
            'settings' => array_replace(self::DEFAULTS, $storedSettings),
        ]);
    }

    /**
     * Update the site settings.
     */
    public function update(UpdateSiteSettingsRequest $request): RedirectResponse
    {
        DB::transaction(function () use ($request): void {
            foreach ($request->validated() as $key => $value) {
                SiteSetting::query()->updateOrCreate(
                    ['key' => $key],
                    ['value' => $value],
                );
            }
        });

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Site settings updated.'),
        ]);

        return to_route('admin.site-settings.edit');
    }
}
