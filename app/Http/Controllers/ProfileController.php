<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function uploadPhoto(Request $request)
    {
        $request->validate([
            'profile_photo' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        if ($request->hasFile('profile_photo')) {
            // Simpan foto ke session untuk sementara
            $file = $request->file('profile_photo');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->storeAs('profile', $filename, 'public');

            // Simpan nama file ke session
            session(['profile_photo' => $filename]);

            return response()->json([
                'success' => true,
                'photo_url' => asset('storage/profile/' . $filename)
            ]);
        }

        return response()->json(['success' => false], 400);
    }
}