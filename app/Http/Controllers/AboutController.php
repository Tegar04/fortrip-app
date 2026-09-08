<?php

namespace App\Http\Controllers;

use App\Actions\GetPublicSeo;
use App\Actions\GetPublicSiteData;
use App\Models\SiteSetting;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AboutController extends Controller
{
    public function __invoke(GetPublicSiteData $siteData, GetPublicSeo $seo): Response
    {
        $settings = SiteSetting::values();
        $site = $siteData->handle($settings);

        return Inertia::render('public/about', [
            'site' => $site,
            'content' => ['title' => $settings['about_title'], 'description' => $settings['about_description']],
            'seo' => $seo->handle('Tentang Kami — '.$site['company_name'], Str::limit($settings['about_description'], 155), 'about'),
        ]);
    }
}
