<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="icon" type="image/x-icon" href="{{ config('app.env') === 'production' ? config('app.url') . '/brand-favicon.png?v=1' : '/brand-favicon.png' }}">

        <title inertia>{{ config('app.name', 'Elevate Interiors') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..700;1,9..144,400..700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        <script>
            window.Ziggy = {
                ...window.Ziggy,
                defaults: {
                    ...(window.Ziggy?.defaults || {}),
                    slug: '{{ auth()->user()?->slug }}'
                }
            };
        </script>
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
