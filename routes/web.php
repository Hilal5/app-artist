<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\CommissionController;
use App\Http\Controllers\ChatController; // ← TAMBAHAN INI

// Home
Route::get('/', function () {
    return view('home');
})->name('home');

// Authentication Routes
Route::post('/login', [LoginController::class, 'login'])->name('login');
Route::post('/register', [RegisterController::class, 'register'])->name('register');
Route::post('/logout', [LoginController::class, 'logout'])->name('logout');

// Redirect GET requests to home
Route::get('/login', fn() => redirect('/'));
Route::get('/register', fn() => redirect('/'));

// Google OAuth
Route::get('/auth/google', [GoogleAuthController::class, 'redirectToGoogle'])->name('google.login');
Route::get('/auth/google/callback', [GoogleAuthController::class, 'handleGoogleCallback']);

// Public Routes
Route::post('/contact/send', [ContactController::class, 'send'])->name('contact.send');

// Public - Get reviews
Route::get('/reviews', [ReviewController::class, 'index'])->name('reviews.index');
Route::get('/reviews/statistics', [ReviewController::class, 'statistics'])->name('reviews.statistics');

// Public - Get commissions
Route::get('/commissions', [CommissionController::class, 'index'])->name('commissions.index');
Route::get('/commissions/{id}', [CommissionController::class, 'show'])->name('commissions.show');

// Protected Routes (Require Login)
Route::middleware('auth')->group(function () {
    // Profile
    Route::post('/profile/upload-photo', [ProfileController::class, 'uploadPhoto'])->name('profile.upload-photo');
    
    // Reviews
    Route::post('/reviews', [ReviewController::class, 'store'])->name('reviews.store');
    
    // Commissions (Admin only via middleware check in controller)
    Route::post('/commissions', [CommissionController::class, 'store'])->name('commissions.store');
    Route::put('/commissions/{id}', [CommissionController::class, 'update'])->name('commissions.update');
    Route::post('/commissions/{id}', [CommissionController::class, 'update'])->name('commissions.update.post'); // ← PENTING!
    Route::delete('/commissions/{id}', [CommissionController::class, 'destroy'])->name('commissions.destroy');
    
    // ================================================
    // CHAT ROUTES - TAMBAHAN BARU
    // ================================================
    Route::get('/chat/admin', [ChatController::class, 'getAdmin'])->name('chat.admin');
    Route::get('/chat/conversations', [ChatController::class, 'getConversations'])->name('chat.conversations');
    Route::get('/chat/messages', [ChatController::class, 'getMessages'])->name('chat.messages');
    Route::post('/chat/send', [ChatController::class, 'sendMessage'])->name('chat.send');
    Route::get('/chat/unread-count', [ChatController::class, 'getUnreadCount'])->name('chat.unread-count');
    Route::post('/chat/mark-read', [ChatController::class, 'markAsRead'])->name('chat.mark-read');
});

// Admin only routes
Route::middleware(['auth', 'admin'])->group(function () {
    Route::post('/reviews/{id}/approve', [ReviewController::class, 'approve'])->name('reviews.approve');
    Route::delete('/reviews/{id}', [ReviewController::class, 'destroy'])->name('reviews.destroy');
});


// ================================================
// REVIEW ROUTES
// ================================================

// Public: Get approved reviews
Route::get('/reviews', [ReviewController::class, 'index']);
Route::get('/reviews/statistics', [ReviewController::class, 'statistics']);

// Auth Required: Submit review
Route::middleware(['auth'])->group(function () {
    Route::post('/reviews', [ReviewController::class, 'store']);
});

// Admin Only
Route::middleware(['auth'])->group(function () {
    Route::get('/reviews/pending', [ReviewController::class, 'pending']);
    Route::post('/reviews/{id}/approve', [ReviewController::class, 'approve']);
    Route::post('/reviews/{id}/toggle-verified', [ReviewController::class, 'toggleVerified']);
    Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);
});