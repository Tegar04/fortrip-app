<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreTestimonialRequest;
use App\Http\Requests\Admin\UpdateTestimonialRequest;
use App\Models\Testimonial;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TestimonialController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $testimonials = Testimonial::query()
            ->with('media')
            ->latest('id')
            ->get()
            ->map(fn (Testimonial $testimonial): array => $this->testimonialData($testimonial));

        return Inertia::render('admin/testimonials/index', [
            'testimonials' => $testimonials,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('admin/testimonials/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTestimonialRequest $request): RedirectResponse
    {
        $testimonial = Testimonial::query()->create(
            $request->safe()->except('photo'),
        );

        if ($request->hasFile('photo')) {
            $testimonial->addMediaFromRequest('photo')->toMediaCollection('photo');
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Testimonial created.'),
        ]);

        return to_route('admin.testimonials.index');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Testimonial $testimonial): Response
    {
        $testimonial->load('media');

        return Inertia::render('admin/testimonials/edit', [
            'testimonial' => $this->testimonialData($testimonial),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTestimonialRequest $request, Testimonial $testimonial): RedirectResponse
    {
        $testimonial->update($request->safe()->except('photo'));

        if ($request->hasFile('photo')) {
            $testimonial->addMediaFromRequest('photo')->toMediaCollection('photo');
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Testimonial updated.'),
        ]);

        return to_route('admin.testimonials.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Testimonial $testimonial): RedirectResponse
    {
        $testimonial->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Testimonial deleted.'),
        ]);

        return to_route('admin.testimonials.index');
    }

    public function toggle(Testimonial $testimonial): RedirectResponse
    {
        $testimonial->update([
            'is_active' => ! $testimonial->is_active,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Testimonial status updated.'),
        ]);

        return back();
    }

    /**
     * @return array{id: int, name: string, content: string, rating: int, is_active: bool, photo_url: string, avatar_url: string}
     */
    private function testimonialData(Testimonial $testimonial): array
    {
        return [
            'id' => $testimonial->id,
            'name' => $testimonial->name,
            'content' => $testimonial->content,
            'rating' => $testimonial->rating,
            'is_active' => $testimonial->is_active,
            'photo_url' => $testimonial->getFirstMediaUrl('photo'),
            'avatar_url' => $testimonial->getFirstMediaUrl('photo', 'avatar'),
        ];
    }
}
