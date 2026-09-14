<?php

use App\Models\Package;
use App\Models\SiteSetting;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Exceptions;
use Illuminate\Support\Facades\Route;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->withoutVite();
    config(['app.url' => 'https://travel.example', 'inertia.ssr.enabled' => false]);
});

test('about displays managed company content and a direct WhatsApp link', function () {
    foreach (['company_name' => 'Fortrip', 'about_title' => 'Tentang Fortrip', 'about_description' => 'Profil perusahaan.', 'whatsapp_number' => '+62 (812) 3456-7890'] as $key => $value) {
        SiteSetting::factory()->create(compact('key', 'value'));
    }

    $this->get(route('about'))->assertInertia(fn (Assert $page) => $page
        ->component('public/about')->where('content.title', 'Tentang Fortrip')
        ->where('content.description', 'Profil perusahaan.')
        ->where('site.whatsapp_url', 'https://wa.me/6281234567890')
        ->where('seo.canonical', 'https://travel.example/about')
        ->where('seo.title', 'Tentang Kami — Fortrip'));
});

test('contact exposes only public contact data', function () {
    foreach (['about_title' => 'Perjalanan nyaman bersama kami', 'company_address' => 'Jl. Merdeka 1', 'google_maps_url' => 'https://www.google.com/maps/place/Fortrip', 'company_email' => 'hello@example.com', 'company_phone' => '081234567890', 'whatsapp_number' => '081234567890', 'instagram_url' => 'https://instagram.com/fortrip', 'tiktok_url' => 'https://www.tiktok.com/@fortrip'] as $key => $value) {
        SiteSetting::factory()->create(compact('key', 'value'));
    }
    SiteSetting::factory()->create(['key' => 'internal_secret', 'value' => 'private']);

    $this->get(route('contact'))->assertInertia(fn (Assert $page) => $page
        ->component('public/contact')->where('site.company_address', 'Jl. Merdeka 1')
        ->where('site.google_maps_url', 'https://www.google.com/maps/place/Fortrip')
        ->where('site.company_email', 'hello@example.com')
        ->where('site.about_title', 'Perjalanan nyaman bersama kami')
        ->where('site.whatsapp_url', 'https://wa.me/6281234567890')
        ->where('site.social_urls.instagram', 'https://instagram.com/fortrip')
        ->where('site.social_urls.tiktok', 'https://www.tiktok.com/@fortrip')
        ->missing('site.internal_secret')->missing('customers'));
});

test('public information pages work before settings are saved', function (string $routeName) {
    $this->get(route($routeName))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->has('site.company_name')->has('seo.canonical'));
})->with(['about', 'contact']);

test('missing or unsafe contact links are omitted', function (mixed $number) {
    SiteSetting::factory()->create(['key' => 'whatsapp_number', 'value' => $number]);
    SiteSetting::factory()->create(['key' => 'instagram_url', 'value' => 'javascript:alert(1)']);
    SiteSetting::factory()->create(['key' => 'tiktok_url', 'value' => 'javascript:alert(1)']);
    SiteSetting::factory()->create(['key' => 'google_maps_url', 'value' => 'https://example.com/location']);

    $this->get(route('contact'))->assertInertia(fn (Assert $page) => $page
        ->where('site.whatsapp_url', null)
        ->where('site.social_urls.instagram', null)
        ->where('site.social_urls.tiktok', null)
        ->where('site.google_maps_url', null));
})->with([null, '', 'invalid12345678', '123', '1234567890123456']);

test('initial HTML includes escaped canonical and social metadata without SSR', function () {
    config(['seo.indexable' => true, 'seo.default_image_url' => 'https://travel.example/brand.jpg']);
    SiteSetting::factory()->create(['key' => 'company_name', 'value' => '<script>alert(1)</script>']);

    $response = $this->get(route('contact', ['utm_source' => 'test']));
    $response->assertSee('<link data-inertia="canonical" rel="canonical" href="https://travel.example/contact">', false)
        ->assertSee('property="og:url" content="https://travel.example/contact"', false)
        ->assertSee('property="og:image" content="https://travel.example/brand.jpg"', false)
        ->assertSee('name="robots" content="index, follow"', false)
        ->assertDontSee('<script>alert(1)</script>', false);
});

test('pagination has its own canonical without tracking parameters', function () {
    Package::factory()->count(10)->create();

    $this->get(route('packages.index', ['page' => 2, 'utm_source' => 'test']))
        ->assertInertia(fn (Assert $page) => $page->where('seo.canonical', 'https://travel.example/packages?page=2'));
});

test('package canonical uses its slug and cover metadata contract', function () {
    $package = Package::factory()->create();
    $this->get(route('packages.show', ['package' => $package->slug, 'utm_source' => 'test']))
        ->assertInertia(fn (Assert $page) => $page
            ->where('seo.canonical', 'https://travel.example/packages/'.$package->slug)
            ->where('seo.type', 'website'));
});

test('sitemap is valid XML and includes only public pages and active packages', function () {
    $active = Package::factory()->create();
    $inactive = Package::factory()->create(['is_active' => false]);

    $response = $this->get(route('sitemap'))->assertOk()->assertHeader('Content-Type', 'application/xml; charset=UTF-8');
    $xml = simplexml_load_string($response->getContent());
    $urls = array_map(fn ($entry) => (string) $entry->loc, iterator_to_array($xml->url, false));
    expect($urls)->toContain('https://travel.example/', 'https://travel.example/about', 'https://travel.example/contact', 'https://travel.example/packages', 'https://travel.example/packages/'.$active->slug)
        ->not->toContain('https://travel.example/packages/'.$inactive->slug)
        ->toHaveCount(5);
});

test('robots advertises sitemap when indexing is enabled', function () {
    config(['seo.indexable' => true]);
    $this->get(route('robots'))->assertOk()->assertHeader('Content-Type', 'text/plain; charset=UTF-8')
        ->assertSee('Allow: /', false)->assertSee('Sitemap: https://travel.example/sitemap.xml', false);
    $this->get(route('about'))->assertHeaderMissing('X-Robots-Tag');
});

test('nonindexable environments block crawling and send noindex headers', function () {
    config(['seo.indexable' => false]);
    $this->get(route('robots'))->assertSee('Disallow: /', false);
    $this->get(route('contact'))->assertHeader('X-Robots-Tag', 'noindex, nofollow')
        ->assertSee('name="robots" content="noindex, nofollow"', false);
});

test('error pages retain their status without querying company settings', function (int $status) {
    config(['app.debug' => false]);
    Route::get('/test-public-error', fn () => abort($status));
    $queries = [];
    DB::listen(function ($query) use (&$queries) {
        $queries[] = $query->sql;
    });

    $this->get('/test-public-error')->assertStatus($status)
        ->assertHeader('X-Robots-Tag', 'noindex, nofollow')
        ->assertInertia(fn (Assert $page) => $page->component('error')->where('status', $status)->missing('site')->missing('auth'));
    expect($queries)->toBe([]);
})->with([403, 404, 419, 429, 500]);

test('unknown public routes show the public 404 page', function () {
    $this->get('/missing-public-page')->assertNotFound()
        ->assertInertia(fn (Assert $page) => $page->component('error')->where('status', 404));
});

test('JSON errors retain their original response format', function () {
    $this->getJson('/missing-public-page')->assertNotFound()->assertJsonStructure(['message']);
});

test('unexpected exceptions remain hidden in production error responses', function () {
    config(['app.debug' => false]);
    Exceptions::fake();
    Route::get('/test-unexpected-error', fn () => throw new RuntimeException('Private database credentials'));

    $this->get('/test-unexpected-error')->assertInternalServerError()->assertDontSee('Private database credentials')
        ->assertInertia(fn (Assert $page) => $page->component('error')->where('status', 500));
    Exceptions::assertReported(RuntimeException::class);
});
