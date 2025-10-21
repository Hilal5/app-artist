<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'order_id',
        'rating',
        'comment',
        'commission_type',
        'images',
        'verified',
        'is_approved',
    ];

    protected $casts = [
        'rating' => 'integer',
        'images' => 'array', // ✅ CRITICAL: Cast to array
        'verified' => 'boolean',
        'is_approved' => 'boolean',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    // Scopes
    public function scopeApproved($query)
    {
        return $query->where('is_approved', true);
    }

    public function scopeRating($query, $rating)
    {
        return $query->where('rating', $rating);
    }

    public function scopeWithImages($query)
    {
        return $query->whereNotNull('images')
                     ->where('images', '!=', '[]');
    }

    // Accessor
    public function getTimeAgoAttribute(): string
    {
        return $this->created_at->diffForHumans();
    }
}