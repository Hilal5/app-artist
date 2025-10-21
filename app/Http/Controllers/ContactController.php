<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function send(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|max:255',
            'email' => 'required|email',
            'subject' => 'required',
            'message' => 'required|min:10'
        ]);

        try {
            // Kirim email
            Mail::raw($validated['message'], function ($message) use ($validated) {
                $message->from($validated['email'], $validated['name'])
                        ->to('hilalprayogi42@gmail.com') // Ganti dengan email kamu
                        ->subject('[Contact Form] ' . $validated['subject'] . ' - ' . $validated['name']);
            });

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['success' => false], 500);
        }
    }
}