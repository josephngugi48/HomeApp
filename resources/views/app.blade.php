<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    {{-- Inline script to detect system dark mode preference and apply it immediately --}}
    <script>
        (function ()
        {
            const appearance = '{{ $appearance ?? "system" }}';

            if (appearance === 'system') {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                if (prefersDark) {
                    document.documentElement.classList.add('dark');
                }
            }
        })();
    </script>

    @viteReactRefresh
    @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
    @inertiaHead

    {{-- PWA Meta Tags --}}
    <meta name="theme-color" content="{{ \App\Models\Setting::get('primary_color', '#006738') }}">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">

    {{-- Inline style to set the brand variables based on database settings --}}
    @php
        $primaryColor = \App\Models\Setting::get('primary_color', '#006738');
        $secondaryColor = \App\Models\Setting::get('secondary_color', '#FDB913');
    @endphp
    <style>
        html:root {
            --primary: {{ $primaryColor }};
            --primary-foreground: #ffffff;
            --secondary: {{ $secondaryColor }};
            --secondary-foreground: {{ $primaryColor }};
            
            --foreground: #111827;
            --card-foreground: #111827;
            --popover-foreground: #111827;
            
            --accent: {{ $secondaryColor }};
            --accent-foreground: {{ $primaryColor }};
            
            --ring: {{ $primaryColor }};
            
            --sidebar-primary: {{ $primaryColor }};
            --sidebar-primary-foreground: #ffffff;
            --sidebar-foreground: #374151;
            --sidebar-accent-foreground: {{ $primaryColor }};
            --sidebar-ring: {{ $primaryColor }};
            
            --chart-1: {{ $primaryColor }};
            --chart-2: {{ $secondaryColor }};
        }
        html.dark {
            --primary: {{ $secondaryColor }};
            --primary-foreground: #04120c;
            --secondary: {{ $primaryColor }};
            --secondary-foreground: #ffffff;
            
            --foreground: #f9fafb;
            --card-foreground: #f9fafb;
            --popover-foreground: #f9fafb;
            
            --accent: {{ $secondaryColor }};
            --accent-foreground: #04120c;
            
            --ring: {{ $secondaryColor }};
            
            --sidebar-primary: {{ $secondaryColor }};
            --sidebar-primary-foreground: #04120c;
            --sidebar-foreground: #f3f4f6;
            --sidebar-accent-foreground: #ffffff;
            --sidebar-ring: {{ $secondaryColor }};
            
            --chart-1: {{ $secondaryColor }};
            --chart-2: {{ $primaryColor }};
        }
    </style>
</head>

<body class="font-sans antialiased">
    @inertia
</body>

</html>