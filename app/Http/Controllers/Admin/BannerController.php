<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ReorderBannersRequest;
use App\Http\Requests\Admin\StoreBannerRequest;
use App\Http\Requests\Admin\UpdateBannerRequest;
use App\Models\Banner;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class BannerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $banners = Banner::query()
            ->with('media')
            ->orderBy('order')
            ->orderBy('id')
            ->get()
            ->map(fn (Banner $banner): array => $this->bannerData($banner));

        return Inertia::render('admin/banners/index', [
            'banners' => $banners,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('admin/banners/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreBannerRequest $request): RedirectResponse
    {
        $banner = Banner::query()->create([
            ...$request->safe()->except('image'),
            'order' => ((int) Banner::query()->max('order')) + 1,
        ]);

        $banner->addMediaFromRequest('image')->toMediaCollection('image');

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Banner created.'),
        ]);

        return to_route('admin.banners.index');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Banner $banner): Response
    {
        $banner->load('media');

        return Inertia::render('admin/banners/edit', [
            'banner' => $this->bannerData($banner),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateBannerRequest $request, Banner $banner): RedirectResponse
    {
        $banner->update($request->safe()->except('image'));

        if ($request->hasFile('image')) {
            $banner->addMediaFromRequest('image')->toMediaCollection('image');
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Banner updated.'),
        ]);

        return to_route('admin.banners.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Banner $banner): RedirectResponse
    {
        $banner->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Banner deleted.'),
        ]);

        return to_route('admin.banners.index');
    }

    /**
     * Toggle the banner's active state.
     */
    public function toggle(Banner $banner): RedirectResponse
    {
        $banner->update([
            'is_active' => ! $banner->is_active,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Banner status updated.'),
        ]);

        return back();
    }

    /**
     * Persist the global banner order.
     */
    public function reorder(ReorderBannersRequest $request): RedirectResponse
    {
        DB::transaction(function () use ($request): void {
            foreach ($request->validated('banners') as $index => $bannerId) {
                Banner::query()
                    ->whereKey($bannerId)
                    ->update(['order' => $index + 1]);
            }
        });

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Banner order updated.'),
        ]);

        return back();
    }

    /**
     * @return array{id: int, title: string, subtitle: string|null, button_text: string|null, button_url: string|null, order: int, is_active: bool, image_url: string, thumb_url: string}
     */
    private function bannerData(Banner $banner): array
    {
        return [
            'id' => $banner->id,
            'title' => $banner->title,
            'subtitle' => $banner->subtitle,
            'button_text' => $banner->button_text,
            'button_url' => $banner->button_url,
            'order' => $banner->order,
            'is_active' => $banner->is_active,
            'image_url' => $banner->getFirstMediaUrl('image'),
            'thumb_url' => $banner->getFirstMediaUrl('image', 'thumb'),
        ];
    }
}
