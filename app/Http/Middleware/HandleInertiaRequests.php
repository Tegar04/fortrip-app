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
                    'viewCustomers' => $request->user()?->can('view customers') ?? false,
                    'createCustomers' => $request->user()?->can('create customers') ?? false,
                    'editCustomers' => $request->user()?->can('edit customers') ?? false,
                    'deleteCustomers' => $request->user()?->can('delete customers') ?? false,
                    'viewBookings' => $request->user()?->can('view bookings') ?? false,
                    'createBookings' => $request->user()?->can('create bookings') ?? false,
                    'editBookings' => $request->user()?->can('edit bookings') ?? false,
                    'deleteBookings' => $request->user()?->can('delete bookings') ?? false,
                    'viewInvoices' => $request->user()?->can('view invoices') ?? false,
                    'createInvoices' => $request->user()?->can('create invoices') ?? false,
                    'editInvoices' => $request->user()?->can('edit invoices') ?? false,
                    'deleteInvoices' => $request->user()?->can('delete invoices') ?? false,
                    'downloadInvoices' => $request->user()?->can('download invoices') ?? false,
                    'viewReports' => $request->user()?->can('view reports') ?? false,
                    'exportReports' => $request->user()?->can('export reports') ?? false,
                ],
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
