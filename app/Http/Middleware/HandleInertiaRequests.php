<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
                'permissions' => [
                    'manageSiteSettings' => $request->user()?->can('manage site settings') ?? false,
                    'viewBanners' => $request->user()?->can('view banners') ?? false,
                    'createBanners' => $request->user()?->can('create banners') ?? false,
                    'editBanners' => $request->user()?->can('edit banners') ?? false,
                    'deleteBanners' => $request->user()?->can('delete banners') ?? false,
                    'viewPackages' => $request->user()?->can('view packages') ?? false,
                    'createPackages' => $request->user()?->can('create packages') ?? false,
                    'editPackages' => $request->user()?->can('edit packages') ?? false,
                    'deletePackages' => $request->user()?->can('delete packages') ?? false,
                    'viewTestimonials' => $request->user()?->can('view testimonials') ?? false,
                    'createTestimonials' => $request->user()?->can('create testimonials') ?? false,
                    'editTestimonials' => $request->user()?->can('edit testimonials') ?? false,
                    'deleteTestimonials' => $request->user()?->can('delete testimonials') ?? false,
                ],
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
