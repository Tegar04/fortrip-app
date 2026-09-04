<?php

namespace App\Http\Controllers;

use App\Actions\GetPublicSiteData;
use App\Models\Package;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class PublicPackageController extends Controller
{
    public function __construct(private GetPublicSiteData $getPublicSiteData) {}

    /**
     * Display the active travel packages.
     */
    public function index(): Response
    {
        $site = $this->getPublicSiteData->handle();
        $packages = Package::query()
            ->select([
                'id',
                'title',
                'slug',
                'description',
                'destination',
                'duration_days',
                'price',
                'created_at',
            ])
            ->with('media')
            ->where('is_active', true)
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate(9)
            ->withQueryString()
            ->through(fn (Package $package): array => $this->packageCardData($package));

        return Inertia::render('public/packages/index', [
            'site' => $site,
            'seo' => [
                'title' => 'Paket Wisata — '.$site['company_name'],
                'description' => 'Temukan paket wisata pilihan untuk perjalanan berkesan bersama '.$site['company_name'].'.',
            ],
            'packages' => $packages,
        ]);
    }

    /**
     * Display an active travel package.
     */
    public function show(Package $package): Response
    {
        abort_unless($package->is_active, 404);

        $site = $this->getPublicSiteData->handle();
        $package->load('media');

        return Inertia::render('public/packages/show', [
            'site' => $site,
            'seo' => [
                'title' => $package->title.' — '.$site['company_name'],
                'description' => Str::limit($package->description, 155),
            ],
            'package' => $this->packageDetailData($package),
        ]);
    }

    /**
     * @return array{
     *     id: int,
     *     title: string,
     *     slug: string,
     *     excerpt: string,
     *     destination: string,
     *     duration_days: int,
     *     price: string,
     *     cover_url: string
     * }
     */
    private function packageCardData(Package $package): array
    {
        return [
            'id' => $package->id,
            'title' => $package->title,
            'slug' => $package->slug,
            'excerpt' => Str::limit($package->description, 120),
            'destination' => $package->destination,
            'duration_days' => $package->duration_days,
            'price' => $package->price,
            'cover_url' => $package->getFirstMediaUrl('cover', 'thumb'),
        ];
    }

    /**
     * @return array{
     *     id: int,
     *     title: string,
     *     slug: string,
     *     description: string,
     *     destination: string,
     *     duration_days: int,
     *     price: string,
     *     cover_url: string,
     *     cover_original_url: string,
     *     gallery: list<array{id: int, url: string, thumb_url: string}>
     * }
     */
    private function packageDetailData(Package $package): array
    {
        return [
            'id' => $package->id,
            'title' => $package->title,
            'slug' => $package->slug,
            'description' => $package->description,
            'destination' => $package->destination,
            'duration_days' => $package->duration_days,
            'price' => $package->price,
            'cover_url' => $package->getFirstMediaUrl('cover', 'hero'),
            'cover_original_url' => $package->getFirstMediaUrl('cover'),
            'gallery' => array_values(
                $package->getMedia('gallery')
                    ->map(fn (Media $media): array => [
                        'id' => $media->id,
                        'url' => $media->getUrl(),
                        'thumb_url' => $media->getUrl('thumb'),
                    ])
                    ->all(),
            ),
        ];
    }
}
