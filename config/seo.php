<?php

return [
    'indexable' => env('SEO_INDEXABLE', env('APP_ENV') === 'production'),
    'default_image_url' => env('SEO_IMAGE_URL'),
];
