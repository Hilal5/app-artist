<?php

namespace App\Http\Controllers;

use App\Models\Commission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class CommissionController extends Controller
{
    /**
     * Display a listing of commissions
     */
    public function index()
    {
        $commissions = Commission::orderBy('created_at', 'desc')->get();
        
        return response()->json([
            'success' => true,
            'commissions' => $commissions
        ]);
    }

    /**
     * Display the specified commission
     */
    public function show($id)
    {
        $commission = Commission::findOrFail($id);
        
        return response()->json([
            'success' => true,
            'commission' => $commission
        ]);
    }

    /**
     * Store a newly created commission
     */
    public function store(Request $request)
    {
        if (!Auth::check() || Auth::user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        // ✅ UPDATE: Max 20MB, support video
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'required|string|min:20|max:5000',
            'price' => 'required|integer|min:0',
            'delivery_time' => 'required|string|max:100',
            'slots_available' => 'required|integer|min:0',
            'images' => 'nullable|array|max:5',
            'images.*' => 'file|mimes:jpeg,png,jpg,gif,mp4,webm|max:20480', // ← 20MB = 20480 KB
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        $data = $request->except('images');
        
        $isActive = $request->input('is_active', '0');
        $data['is_active'] = ($isActive === '1' || $isActive === 1 || $isActive === true);

        if ($request->hasFile('images')) {
            try {
                $uploadedFiles = [];
                $destinationPath = public_path('storage/commissions');
                
                if (!file_exists($destinationPath)) {
                    mkdir($destinationPath, 0755, true);
                }
                
                foreach ($request->file('images') as $file) {
                    $fileName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                    $file->move($destinationPath, $fileName);
                    $uploadedFiles[] = $fileName;
                }
                
                $data['images'] = $uploadedFiles;
                
                \Log::info('Multiple files uploaded:', [
                    'count' => count($uploadedFiles),
                    'files' => $uploadedFiles,
                ]);
                
            } catch (\Exception $e) {
                \Log::error('File upload failed:', ['error' => $e->getMessage()]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to upload files: ' . $e->getMessage()
                ], 500);
            }
        }

        $commission = Commission::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Commission created successfully',
            'commission' => $commission
        ]);
    }

    /**
     * Update the specified commission
     */
    public function update(Request $request, $id)
    {
        if (!Auth::check() || Auth::user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $commission = Commission::findOrFail($id);

        // ✅ UPDATE: Max 20MB, support video
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'required|string|min:20|max:5000',
            'price' => 'required|integer|min:0',
            'delivery_time' => 'required|string|max:100',
            'slots_available' => 'required|integer|min:0',
            'images' => 'nullable|array|max:5',
            'images.*' => 'file|mimes:jpeg,png,jpg,gif,mp4,webm|max:20480', // ← 20MB
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        $data = $request->except('images');
        
        $isActive = $request->input('is_active', '0');
        $data['is_active'] = ($isActive === '1' || $isActive === 1 || $isActive === true);

        if ($request->hasFile('images')) {
            try {
                // Delete old files
                if ($commission->images && is_array($commission->images)) {
                    foreach ($commission->images as $oldFile) {
                        $oldFilePath = public_path('storage/commissions/' . $oldFile);
                        if (file_exists($oldFilePath)) {
                            unlink($oldFilePath);
                        }
                    }
                }

                $uploadedFiles = [];
                $destinationPath = public_path('storage/commissions');
                
                if (!file_exists($destinationPath)) {
                    mkdir($destinationPath, 0755, true);
                }
                
                foreach ($request->file('images') as $file) {
                    $fileName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                    $file->move($destinationPath, $fileName);
                    $uploadedFiles[] = $fileName;
                }
                
                $data['images'] = $uploadedFiles;
                
                \Log::info('Files updated:', [
                    'old_count' => is_array($commission->images) ? count($commission->images) : 0,
                    'new_count' => count($uploadedFiles),
                ]);
                
            } catch (\Exception $e) {
                \Log::error('File update failed:', ['error' => $e->getMessage()]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to upload files: ' . $e->getMessage()
                ], 500);
            }
        }

        $commission->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Commission updated successfully',
            'commission' => $commission
        ]);
    }

    /**
     * Remove the specified commission
     */
    public function destroy($id)
    {
        if (!Auth::check() || Auth::user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $commission = Commission::findOrFail($id);

        if ($commission->images && is_array($commission->images)) {
            foreach ($commission->images as $file) {
                $filePath = public_path('storage/commissions/' . $file);
                if (file_exists($filePath)) {
                    unlink($filePath);
                }
            }
        }

        $commission->delete();

        return response()->json([
            'success' => true,
            'message' => 'Commission deleted successfully'
        ]);
    }
}