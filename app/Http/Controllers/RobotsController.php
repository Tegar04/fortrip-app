<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;

class RobotsController extends Controller
{
    public function __invoke(): Response
    {
        $content = config('seo.indexable')
            ? "User-agent: *\nAllow: /\nSitemap: ".rtrim(config('app.url'), '/').route('sitemap', [], false)."\n"
            : "User-agent: *\nDisallow: /\n";

        return response($content, 200, ['Content-Type' => 'text/plain; charset=UTF-8']);
    }
}
