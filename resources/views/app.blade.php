<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            @if (isset($page['props']['seo']))
                @php($seo = $page['props']['seo'])
                <title>{{ $seo['title'] }}</title>
                <meta data-inertia="description" name="description" content="{{ $seo['description'] }}">
                <link data-inertia="canonical" rel="canonical" href="{{ $seo['canonical'] }}">
                <meta data-inertia="robots" name="robots" content="{{ $seo['robots'] }}">
                <meta data-inertia="og:title" property="og:title" content="{{ $seo['title'] }}">
                <meta data-inertia="og:description" property="og:description" content="{{ $seo['description'] }}">
                <meta data-inertia="og:type" property="og:type" content="{{ $seo['type'] }}">
                <meta data-inertia="og:url" property="og:url" content="{{ $seo['canonical'] }}">
                @if ($seo['image'])
                    <meta data-inertia="og:image" property="og:image" content="{{ $seo['image'] }}">
                @endif
                <meta data-inertia="twitter:card" name="twitter:card" content="{{ $seo['image'] ? 'summary_large_image' : 'summary' }}">
            @else
                <title>{{ config('app.name', 'Laravel') }}</title>
            @endif
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
