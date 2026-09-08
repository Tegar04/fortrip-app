<?php

namespace App\Http\Controllers;

use App\Models\Package;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function __invoke(): Response
    {
        $base = rtrim(config('app.url'), '/');
        $urls = collect(['home', 'packages.index', 'about', 'contact'])
            ->map(fn (string $name): string => $base.route($name, [], false))
            ->concat(Package::query()->where('is_active', true)->orderBy('id')->pluck('slug')
                ->map(fn (string $slug): string => $base.route('packages.show', ['package' => $slug], false)));

        return response()->view('sitemap', ['urls' => $urls], 200, ['Content-Type' => 'application/xml; charset=UTF-8']);
    }
}
