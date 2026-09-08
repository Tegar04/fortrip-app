<?php

namespace App\Actions;

class GetPublicSeo
{
    /** @param array<string, mixed> $parameters
     * @return array{title: string, description: string, canonical: string, image: ?string, type: string, robots: string}
     */
    public function handle(string $title, string $description, string $routeName, array $parameters = [], ?string $image = null): array
    {
        return [
            'title' => $title,
            'description' => $description,
            'canonical' => rtrim(config('app.url'), '/').route($routeName, $parameters, false),
            'image' => $image ?: config('seo.default_image_url'),
            'type' => 'website',
            'robots' => config('seo.indexable') ? 'index, follow' : 'noindex, nofollow',
        ];
    }
}
