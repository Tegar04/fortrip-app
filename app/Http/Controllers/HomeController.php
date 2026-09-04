<?php

namespace App\Http\Controllers;

use App\Actions\GetPublicSiteData;
use App\Models\Banner;
use App\Models\Package;
use App\Models\SiteSetting;
use App\Models\Testimonial;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    /**
     * Display the public landing page.
     */
    public function __invoke(GetPublicSiteData $getPublicSiteData): Response
    {
        $settings = SiteSetting::values();

        $banners = Banner::query()
            ->select(['id', 'title', 'subtitle', 'button_text', 'button_url', 'order'])
            ->with('media')
            ->where('is_active', true)
            ->orderBy('order')
            ->orderBy('id')
            ->get()
            ->map(fn (Banner $banner): array => [
                'id' => $banner->id,
                'title' => $banner->title,
                'subtitle' => $banner->subtitle,
                'button_text' => $banner->button_text,
                'button_url' => $banner->button_url,
                'image_url' => $banner->getFirstMediaUrl('image'),
            ]);

        $featuredPackages = Package::query()
            ->select(['id', 'title', 'slug', 'destination', 'duration_days', 'price'])
            ->with('media')
            ->where('is_active', true)
            ->where('is_featured', true)
            ->latest('id')
            ->limit(6)
            ->get()
            ->map(fn (Package $package): array => [
                'id' => $package->id,
                'title' => $package->title,
                'slug' => $package->slug,
                'destination' => $package->destination,
                'duration_days' => $package->duration_days,
                'price' => $package->price,
                'cover_url' => $package->getFirstMediaUrl('cover', 'thumb'),
            ]);

        $testimonials = Testimonial::query()
            ->select(['id', 'name', 'content', 'rating'])
            ->with('media')
            ->where('is_active', true)
            ->latest('id')
            ->limit(6)
            ->get()
            ->map(fn (Testimonial $testimonial): array => [
                'id' => $testimonial->id,
                'name' => $testimonial->name,
                'content' => $testimonial->content,
                'rating' => $testimonial->rating,
                'avatar_url' => $testimonial->getFirstMediaUrl('photo', 'avatar'),
            ]);

        return Inertia::render('public/home', [
            'site' => $getPublicSiteData->handle($settings),
            'content' => [
                'hero_title' => $settings['hero_title'],
                'hero_subtitle' => $settings['hero_subtitle'],
                'about_title' => $settings['about_title'],
                'about_description' => $settings['about_description'],
                'packages_title' => $settings['home_packages_title'],
                'packages_subtitle' => $settings['home_packages_subtitle'],
                'testimonials_title' => $settings['home_testimonials_title'],
                'testimonials_subtitle' => $settings['home_testimonials_subtitle'],
                'cta_title' => $settings['home_cta_title'],
                'cta_description' => $settings['home_cta_description'],
                'cta_button_text' => $settings['home_cta_button_text'],
            ],
            'seo' => [
                'title' => $settings['seo_default_title'],
                'description' => $settings['seo_default_description'],
            ],
            'banners' => $banners,
            'featured_packages' => $featuredPackages,
            'testimonials' => $testimonials,
        ]);
    }
}
