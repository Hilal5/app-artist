<?php

namespace App\Http\Controllers;

use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ReviewController extends Controller
{
    /**
     * Get all approved reviews (Public)
     */
    public function index(Request $request)
    {
        $query = Review::with('user')
            ->where('is_approved', true)
            ->orderBy('created_at', 'desc');

        // Filter by rating
        if ($request->has('rating') && $request->rating !== 'all') {
            if ($request->rating === 'images') {
                $query->whereNotNull('images')
                      ->where('images', '!=', '[]');
            } else {
                $query->where('rating', $request->rating);
            }
        }

        $reviews = $query->paginate(10);

        return response()->json([
            'success' => true,
            'reviews' => $reviews
        ]);
    }

    /**
     * Get review statistics (Public)
     */
    public function statistics()
    {
        $totalReviews = Review::where('is_approved', true)->count();
        
        $ratingCounts = [];
        for ($i = 5; $i >= 1; $i--) {
            $ratingCounts[$i] = Review::where('is_approved', true)
                                      ->where('rating', $i)
                                      ->count();
        }

        $averageRating = Review::where('is_approved', true)->avg('rating');

        return response()->json([
            'success' => true,
            'total_reviews' => $totalReviews,
            'rating_counts' => $ratingCounts,
            'average_rating' => round($averageRating ?? 0, 1),
        ]);
    }

    /**
     * Submit review (Auth Required)
     */
    public function store(Request $request)
{
    if (!Auth::check()) {
        return response()->json([
            'success' => false,
            'message' => 'Please login to submit a review'
        ], 401);
    }

    // Check if user already reviewed
    $existingReview = Review::where('user_id', Auth::id())
                            ->where('is_approved', true)
                            ->first();
    
    if ($existingReview) {
        return response()->json([
            'success' => false,
            'message' => 'You have already submitted a review. Thank you!'
        ], 403);
    }

    // ✅ DEBUG: Log request data
    \Log::info('Review submission started', [
        'user_id' => Auth::id(),
        'has_files' => $request->hasFile('images'),
        'files_count' => $request->hasFile('images') ? count($request->file('images')) : 0,
    ]);

    // Validate
    $validator = Validator::make($request->all(), [
        'rating' => 'required|integer|min:1|max:5',
        'comment' => 'required|string|min:10|max:1000',
        'commission_type' => 'nullable|string|max:255',
        'images' => 'nullable|array|max:3',
        'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:10240', // 10MB
    ]);

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'message' => $validator->errors()->first()
        ], 422);
    }

    // ✅ FIX: Handle image uploads dengan DISTINCT filenames
    $imagePaths = [];
    
    if ($request->hasFile('images')) {
        $destinationPath = public_path('storage/reviews');
        
        if (!file_exists($destinationPath)) {
            mkdir($destinationPath, 0755, true);
        }

        $uploadedFiles = $request->file('images');
        
        // ✅ CRITICAL: Ensure it's an array
        if (!is_array($uploadedFiles)) {
            $uploadedFiles = [$uploadedFiles];
        }

        // ✅ DEBUG: Log files being processed
        \Log::info('Processing files:', [
            'count' => count($uploadedFiles),
            'files' => array_map(fn($f) => $f->getClientOriginalName(), $uploadedFiles)
        ]);

        foreach ($uploadedFiles as $index => $image) {
            // ✅ CRITICAL: Unique filename dengan microtime
            $filename = time() . '_' . uniqid() . '_' . $index . '.' . $image->getClientOriginalExtension();
            
            // Move file
            $image->move($destinationPath, $filename);
            
            // ✅ CRITICAL: Check if already added (prevent duplicates)
            if (!in_array($filename, $imagePaths)) {
                $imagePaths[] = $filename;
                \Log::info('Image uploaded:', ['filename' => $filename]);
            }
        }

        // ✅ DEBUG: Log final paths
        \Log::info('Final image paths:', ['paths' => $imagePaths]);
    }

    // Create review
    $review = Review::create([
        'user_id' => Auth::id(),
        'order_id' => null,
        'rating' => $request->rating,
        'comment' => $request->comment,
        'commission_type' => $request->commission_type,
        'images' => !empty($imagePaths) ? $imagePaths : null, // ✅ Array or null
        'verified' => false,
        'is_approved' => false,
    ]);

    // ✅ DEBUG: Log created review
    \Log::info('Review created:', [
        'id' => $review->id,
        'images_count' => $review->images ? count($review->images) : 0,
        'images' => $review->images
    ]);

    return response()->json([
        'success' => true,
        'message' => 'Thank you for your review! It will be published after admin approval.',
        'review' => $review->load('user')
    ]);
}

    /**
     * Get pending reviews (Admin Only)
     */
    public function pending()
    {
        if (!Auth::check() || Auth::user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $reviews = Review::with('user')
                        ->where('is_approved', false)
                        ->orderBy('created_at', 'desc')
                        ->get();

        return response()->json([
            'success' => true,
            'reviews' => $reviews
        ]);
    }

    /**
     * Approve review (Admin Only)
     */
    public function approve($id)
    {
        if (!Auth::check() || Auth::user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $review = Review::findOrFail($id);
        $review->update(['is_approved' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Review approved successfully',
            'review' => $review->load('user')
        ]);
    }

    /**
     * Toggle verified badge (Admin Only)
     */
    public function toggleVerified($id)
    {
        if (!Auth::check() || Auth::user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $review = Review::findOrFail($id);
        $review->update(['verified' => !$review->verified]);

        return response()->json([
            'success' => true,
            'message' => 'Verified status updated',
            'review' => $review->load('user')
        ]);
    }

    /**
     * Delete review (Admin Only)
     */
    public function destroy($id)
    {
        if (!Auth::check() || Auth::user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $review = Review::findOrFail($id);
        
        // Delete images
        if ($review->images && is_array($review->images)) {
            foreach ($review->images as $image) {
                $imagePath = public_path('storage/reviews/' . $image);
                if (file_exists($imagePath)) {
                    unlink($imagePath);
                }
            }
        }

        $review->delete();

        return response()->json([
            'success' => true,
            'message' => 'Review deleted successfully'
        ]);
    }
}