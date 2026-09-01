<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePackageRequest;
use App\Http\Requests\Admin\UpdatePackageRequest;
use App\Models\Package;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class PackageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $packages = Package::query()
            ->with('media')
            ->latest('id')
            ->get()
            ->map(fn (Package $package): array => $this->packageData($package));

        return Inertia::render('admin/packages/index', [
            'packages' => $packages,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('admin/packages/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePackageRequest $request): RedirectResponse
    {
        $package = Package::query()->create(
            $request->safe()->except(['cover', 'gallery']),
        );

        $package->addMediaFromRequest('cover')->toMediaCollection('cover');
        $this->addGalleryImages($request, $package);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Package created.'),
        ]);

        return to_route('admin.packages.index');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Package $package): Response
    {
        $package->load('media');

        return Inertia::render('admin/packages/edit', [
            'package' => $this->packageData($package),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePackageRequest $request, Package $package): RedirectResponse
    {
        $package->update($request->safe()->except(['cover', 'gallery']));

        if ($request->hasFile('cover')) {
            $package->addMediaFromRequest('cover')->toMediaCollection('cover');
        }

        $this->addGalleryImages($request, $package);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Package updated.'),
        ]);

        return to_route('admin.packages.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Package $package): RedirectResponse
    {
        if ($package->bookings()->exists()) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => __('Packages with bookings cannot be deleted.'),
            ]);

            return back();
        }

        $package->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Package deleted.'),
        ]);

        return to_route('admin.packages.index');
    }

    /**
     * Toggle the package's active state.
     */
    public function toggleActive(Package $package): RedirectResponse
    {
        $package->update([
            'is_active' => ! $package->is_active,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Package status updated.'),
        ]);

        return back();
    }

    /**
     * Toggle the package's featured state.
     */
    public function toggleFeatured(Package $package): RedirectResponse
    {
        $package->update([
            'is_featured' => ! $package->is_featured,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Featured package status updated.'),
        ]);

        return back();
    }

    /**
     * Remove one image from the package gallery.
     */
    public function destroyGalleryMedia(Package $package, Media $media): RedirectResponse
    {
        abort_unless(
            $media->model_type === Package::class
                && $media->model_id === $package->id
                && $media->collection_name === 'gallery',
            404,
        );

        $media->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Gallery image deleted.'),
        ]);

        return back();
    }

    private function addGalleryImages(
        StorePackageRequest|UpdatePackageRequest $request,
        Package $package,
    ): void {
        $galleryImages = $request->file('gallery', []);

        if (! is_array($galleryImages)) {
            return;
        }

        foreach ($galleryImages as $galleryImage) {
            $package->addMedia($galleryImage)->toMediaCollection('gallery');
        }
    }

    /**
     * @return array{id: int, title: string, slug: string, description: string, destination: string, duration_days: int, price: string, is_featured: bool, is_active: bool, cover_url: string, cover_thumb_url: string, gallery: array<int, array{id: int, url: string, thumb_url: string}>}
     */
    private function packageData(Package $package): array
    {
        return [
            'id' => $package->id,
            'title' => $package->title,
            'slug' => $package->slug,
            'description' => $package->description,
            'destination' => $package->destination,
            'duration_days' => $package->duration_days,
            'price' => $package->price,
            'is_featured' => $package->is_featured,
            'is_active' => $package->is_active,
            'cover_url' => $package->getFirstMediaUrl('cover'),
            'cover_thumb_url' => $package->getFirstMediaUrl('cover', 'thumb'),
            'gallery' => $package->getMedia('gallery')
                ->map(fn (Media $media): array => [
                    'id' => $media->id,
                    'url' => $media->getUrl(),
                    'thumb_url' => $media->getUrl('thumb'),
                ])
                ->values()
                ->all(),
        ];
    }
}
