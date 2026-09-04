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
     * Show the site settings form.
     */
    public function edit(): Response
    {
        return Inertia::render('admin/site-settings', [
            'settings' => SiteSetting::values(),
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
