<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    use Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'google_id',
        'avatar',
        'role',
        'profile_photo',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // Relationships
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    // Helper methods
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isClient(): bool
    {
        return $this->role === 'client';
    }

    public function getAvatarUrl(): string
    {
        if ($this->avatar) {
            return $this->avatar; // Google avatar URL
        }
        
        if ($this->profile_photo) {
            return asset('storage/profile/' . $this->profile_photo);
        }
        
        return asset('images/profile/default-avatar.png');
    }

    /**
     * Check if user can leave a review
     * 
     * Logic:
     * 1. User harus client (bukan admin)
     * 2. User punya minimal 1 completed order
     * 3. User belum pernah review ATAU bisa review multiple (tergantung kebijakan)
     */
    public function canLeaveReview(): bool
    {
        // Admin tidak bisa review
        if ($this->isAdmin()) {
            return false;
        }

        // Client harus punya completed order
        $hasCompletedOrder = $this->orders()
            ->where('status', 'completed')
            ->exists();

        if (!$hasCompletedOrder) {
            return false;
        }

        // PILIHAN 1: User hanya bisa review 1x saja (RECOMMENDED)
        return !$this->hasReviewed();

        // PILIHAN 2: User bisa review berkali-kali (uncomment jika ingin)
        // return true;
        
        // PILIHAN 3: User bisa review per order yang belum direview
        // return $this->orders()
        //     ->where('status', 'completed')
        //     ->where('can_review', true)
        //     ->whereDoesntHave('review')
        //     ->exists();
    }

    /**
     * Check if user has submitted any review
     */
    public function hasReviewed(): bool
    {
        return $this->reviews()
                    ->where('is_approved', true)
                    ->exists();
    }

    /**
     * Get total completed orders
     */
    public function getCompletedOrdersCount(): int
    {
        return $this->orders()->where('status', 'completed')->count();
    }

    /**
     * Get orders that can be reviewed
     */
    public function getReviewableOrders()
    {
        return $this->orders()
            ->where('status', 'completed')
            ->where('can_review', true)
            ->whereDoesntHave('review')
            ->get();
    }
}