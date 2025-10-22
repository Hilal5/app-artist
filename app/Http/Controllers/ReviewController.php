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

    // ✅ DEBUG: Check apa yang diterima
    \Log::info('Raw request files:', [
        'has_images' => $request->hasFile('images'),
        'images_count' => $request->hasFile('images') ? count($request->file('images')) : 0,
    ]);

    // ✅ CRITICAL FIX: Deduplicate files SEBELUM validation
    $uploadedFiles = [];
    if ($request->hasFile('images')) {
        $rawFiles = $request->file('images');
        if (!is_array($rawFiles)) {
            $rawFiles = [$rawFiles];
        }

        // ✅ Remove duplicates by file hash
        $seenHashes = [];
        foreach ($rawFiles as $file) {
            $hash = md5($file->getClientOriginalName() . $file->getSize());
            if (!in_array($hash, $seenHashes)) {
                $uploadedFiles[] = $file;
                $seenHashes[] = $hash;
            }
        }

        // ✅ Replace request files dengan yang sudah di-deduplicate
        $request->merge(['images' => $uploadedFiles]);
    }

    \Log::info('After deduplication:', [
        'count' => count($uploadedFiles)
    ]);

    // ✅ NOW validate dengan file yang sudah bersih
    $validator = Validator::make([
        'rating' => $request->rating,
        'comment' => $request->comment,
        'commission_type' => $request->commission_type,
        'images' => $uploadedFiles, // ✅ Use deduplicated array
    ], [
        'rating' => 'required|integer|min:1|max:5',
        'comment' => 'required|string|min:10|max:1000',
        'commission_type' => 'nullable|string|max:255',
        'images' => 'nullable|array|max:3',
        'images.*' => 'file|mimes:jpeg,png,jpg,gif,webp,mp4,webm,mov|max:20480',
    ]);

    if ($validator->fails()) {
        \Log::error('Validation failed:', [
            'errors' => $validator->errors()->toArray(),
            'files_count' => count($uploadedFiles)
        ]);
        
        return response()->json([
            'success' => false,
            'message' => $validator->errors()->first()
        ], 422);
    }

    // ✅ Continue dengan upload files yang sudah bersih
    $filePaths = [];
    
    if (!empty($uploadedFiles)) {
        $destinationPath = public_path('storage/reviews');
        
        if (!file_exists($destinationPath)) {
            mkdir($destinationPath, 0755, true);
        }

        foreach ($uploadedFiles as $index => $file) {
            $timestamp = time();
            $random = bin2hex(random_bytes(8));
            $extension = $file->getClientOriginalExtension();
            $filename = "{$timestamp}_{$random}_{$index}.{$extension}";
            
            $file->move($destinationPath, $filename);
            $filePaths[] = $filename;
            
            \Log::info('File uploaded:', ['filename' => $filename]);
        }
    }

    // Create review
    $review = Review::create([
        'user_id' => Auth::id(),
        'order_id' => null,
        'rating' => $request->rating,
        'comment' => $request->comment,
        'commission_type' => $request->commission_type,
        'images' => !empty($filePaths) ? $filePaths : null,
        'verified' => false,
        'is_approved' => false,
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
