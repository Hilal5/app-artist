<!DOCTYPE html>
<html lang="en">
<head>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Hilal Prayogi - Portfolio')</title>
    @vite(['resources/css/app.css'])
</head>
<body class="dark-mode">
    <div class="bg-animated"></div>
    <div class="stars" id="stars"></div>


    <div class="deco-circle"></div>
    <div class="deco-circle"></div>

    <!-- User Menu (Kiri Atas) -->
    <x-auth.user-menu />

    <!-- Theme Toggle (Kanan Atas) -->
    <x-theme-toggle />

    <!-- Main Content -->
    <div class="container">
        @yield('content')
    </div>

    <!-- Overlays -->
    <x-overlays.about />
    <x-overlays.links />
    <x-overlays.contact />
    <x-overlays.faq />
    <x-overlays.rating />
    <x-overlays.review-form />
    <x-overlays.commission />
    <x-overlays.chat />
    <x-overlays.admin />

    <!-- Auth Modals -->
    <x-auth.login-modal />
    <x-auth.register-modal />

    <script>
    @auth
        // ✅ Set user info dari backend
        window.chatUserRole = '{{ auth()->user()->role }}';
        window.chatUserId = {{ auth()->user()->id }};
        window.chatUserName = '{{ addslashes(auth()->user()->name) }}';
        window.chatUserAvatar = '{{ auth()->user()->avatar ?? "/images/default-avatar.jpg" }}';
    @else
        // ✅ Guest user
        window.chatUserRole = 'guest';
        window.chatUserId = null;
        window.chatUserName = null;
        window.chatUserAvatar = null;
    @endauth
    
    console.log('💬 Chat User Info:', {
        role: window.chatUserRole,
        id: window.chatUserId,
        name: window.chatUserName
    });
</script>
    
    <script src="{{ asset('js/app.js') }}"></script>
</body>
</html>
