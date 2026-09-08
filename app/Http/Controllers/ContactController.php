<?php

namespace App\Http\Controllers;

use App\Actions\GetPublicSeo;
use App\Actions\GetPublicSiteData;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    public function __invoke(GetPublicSiteData $siteData, GetPublicSeo $seo): Response
    {
        $site = $siteData->handle();

        return Inertia::render('public/contact', [
            'site' => $site,
            'seo' => $seo->handle('Kontak — '.$site['company_name'], 'Hubungi '.$site['company_name'].' untuk informasi paket wisata dan konsultasi perjalanan.', 'contact'),
        ]);
    }
}
