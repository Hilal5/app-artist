<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\User;
use App\Models\Commission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ChatController extends Controller
{
    /**
     * Get admin for chat (first admin user)
     */
    public function getAdmin()
    {
        $admin = User::where('role', 'admin')->first();
        
        if (!$admin) {
            return response()->json([
                'success' => false,
                'message' => 'No admin available'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'admin' => [
                'id' => $admin->id,
                'name' => $admin->name,
                'email' => $admin->email,
                'avatar' => $admin->avatar,
            ]
        ]);
    }
    

    /**
     * Get all conversations (Admin only)
     */
    public function getConversations()
{
    if (!Auth::check() || Auth::user()->role !== 'admin') {
        return response()->json([
            'success' => false,
            'message' => 'Unauthorized'
        ], 403);
    }

    $adminId = Auth::id();
    
    // ✅ FIX: Get unique users yang pernah chat dengan admin
    $conversations = Message::where(function($query) use ($adminId) {
        $query->where('sender_id', $adminId)
              ->orWhere('receiver_id', $adminId);
    })
    ->with(['sender', 'receiver'])
    ->orderBy('created_at', 'desc')
    ->get()
    ->map(function($message) use ($adminId) {
        // Return user yang BUKAN admin
        return $message->sender_id == $adminId ? $message->receiver : $message->sender;
    })
    ->unique('id') // ← Ambil unique user saja
    ->map(function($user) use ($adminId) {
        // Get last message
        $lastMessage = Message::where(function($query) use ($user, $adminId) {
            $query->where('sender_id', $user->id)->where('receiver_id', $adminId)
                  ->orWhere('sender_id', $adminId)->where('receiver_id', $user->id);
        })
        ->orderBy('created_at', 'desc')
        ->first();
        
        // Count unread
        $unreadCount = Message::where('sender_id', $user->id)
                              ->where('receiver_id', $adminId)
                              ->where('is_read', false)
                              ->count();
        
        return [
            'user_id' => $user->id,
            'user_name' => $user->name,
            'user_email' => $user->email,
            'user_avatar' => $user->avatar,
            'last_message' => $lastMessage ? $lastMessage->message : 'No messages yet',
            'last_message_at' => $lastMessage ? $lastMessage->created_at->diffForHumans() : '',
            'last_message_time' => $lastMessage ? $lastMessage->created_at : null,
            'unread_count' => $unreadCount,
        ];
    })
    ->sortByDesc('last_message_time') // Sort by time
    ->values() // Reset array keys
    ->toArray();

    return response()->json([
        'success' => true,
        'conversations' => $conversations
    ]);
}

    public function getMessages(Request $request)
{
    if (!Auth::check()) {
        return response()->json([
            'success' => false,
            'message' => 'Unauthorized'
        ], 401);
    }

    $userId = Auth::id();
    $otherUserId = $request->query('user_id');

    if (!$otherUserId) {
        return response()->json([
            'success' => false,
            'message' => 'User ID required'
        ], 422);
    }

    $messages = Message::where(function($query) use ($userId, $otherUserId) {
        $query->where('sender_id', $userId)
              ->where('receiver_id', $otherUserId);
    })
    ->orWhere(function($query) use ($userId, $otherUserId) {
        $query->where('sender_id', $otherUserId)
              ->where('receiver_id', $userId);
    })
    ->with(['sender', 'receiver', 'commission'])
    ->orderBy('created_at', 'asc')
    ->get()
    ->map(function($message) use ($userId) {
        $data = [
            'id' => $message->id,
            'message' => $message->message,
            'attachment' => $message->attachment,
            'sender_id' => $message->sender_id,
            'sender_name' => $message->sender->name,
            'sender_avatar' => $message->sender->avatar,
            'is_own' => $message->sender_id == $userId,
            'is_read' => $message->is_read,
            'created_at' => $message->created_at->format('H:i'),
            'created_at_full' => $message->created_at->format('Y-m-d H:i:s'),
        ];

        // ✅ FIX: Add commission info LENGKAP
        if ($message->commission) {
            $data['commission'] = [
                'id' => $message->commission->id,
                'name' => $message->commission->name,
                'description' => $message->commission->description, // ✅ TAMBAHKAN
                'price' => $message->commission->price,
                'delivery_time' => $message->commission->delivery_time, // ✅ TAMBAHKAN
            ];
        }

        return $data;
    });

    // Mark messages as read
    Message::where('sender_id', $otherUserId)
           ->where('receiver_id', $userId)
           ->where('is_read', false)
           ->update(['is_read' => true]);

    return response()->json([
        'success' => true,
        'messages' => $messages
    ]);
}

    /**
     * Send a message
     */
public function sendMessage(Request $request)
{
    if (!Auth::check()) {
        return response()->json([
            'success' => false,
            'message' => 'Unauthorized'
        ], 401);
    }

    $validator = Validator::make($request->all(), [
        'receiver_id' => 'required|exists:users,id',
        'message' => 'nullable|string|max:5000',
        'attachment' => 'nullable|file|mimes:jpeg,png,jpg,gif,mp4,webm|max:20480',
        'commission_id' => 'nullable|exists:commissions,id',
    ]);

    if (!$request->message && !$request->hasFile('attachment') && !$request->commission_id) {
        return response()->json([
            'success' => false,
            'message' => 'Message, attachment, or commission is required'
        ], 422);
    }

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'message' => $validator->errors()->first()
        ], 422);
    }

    // ✅ CHECK: Jika ada commission_id, cek slot availability
    if ($request->commission_id) {
        $commission = Commission::find($request->commission_id);
        
        if (!$commission) {
            return response()->json([
                'success' => false,
                'message' => 'Commission not found'
            ], 404);
        }

        // ✅ Validasi slot masih available
        if ($commission->slots_available <= 0) {
            return response()->json([
                'success' => false,
                'message' => 'Sorry, this commission is fully booked!'
            ], 422);
        }

    }

    $data = [
        'sender_id' => Auth::id(),
        'receiver_id' => $request->receiver_id,
        'message' => $request->message,
        'commission_id' => $request->commission_id,
    ];

    // Handle attachment
    if ($request->hasFile('attachment')) {
        try {
            $file = $request->file('attachment');
            $fileName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            
            $destinationPath = public_path('storage/chat_attachments');
            if (!file_exists($destinationPath)) {
                mkdir($destinationPath, 0755, true);
            }
            
            $file->move($destinationPath, $fileName);
            $data['attachment'] = $fileName;
            
            \Log::info('Chat attachment uploaded:', ['file' => $fileName]);
            
        } catch (\Exception $e) {
            \Log::error('Upload attachment error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload attachment: ' . $e->getMessage()
            ], 500);
        }
    }

    try {
        // ✅ START TRANSACTION
        \DB::beginTransaction();

        $message = Message::create($data);
        $message->load(['sender', 'commission']);

        // ✅ DECREASE SLOT jika ada commission_id
        if ($request->commission_id) {
            $commission = Commission::find($request->commission_id);
            $commission->decrement('slots_available'); // Kurangi 1 slot
            
            \Log::info('Commission slot decreased:', [
                'commission_id' => $commission->id,
                'remaining_slots' => $commission->slots_available
            ]);
        }

        \DB::commit();

        $responseData = [
            'id' => $message->id,
            'message' => $message->message,
            'attachment' => $message->attachment,
            'sender_id' => $message->sender_id,
            'sender_name' => Auth::user()->name,
            'sender_avatar' => Auth::user()->avatar,
            'is_own' => true,
            'is_read' => false,
            'created_at' => $message->created_at->format('H:i'),
            'created_at_full' => $message->created_at->format('Y-m-d H:i:s'),
        ];

        if ($message->commission) {
            $responseData['commission'] = [
                'id' => $message->commission->id,
                'name' => $message->commission->name,
                'description' => $message->commission->description,
                'price' => $message->commission->price,
                'delivery_time' => $message->commission->delivery_time,
            ];
        }

        return response()->json([
            'success' => true,
            'message' => 'Order sent successfully! Slot reserved.',
            'data' => $responseData
        ]);
        
    } catch (\Exception $e) {
        \DB::rollBack();
        \Log::error('Send message error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to send message: ' . $e->getMessage()
        ], 500);
    }
}

    /**
     * Get unread count
     */
    public function getUnreadCount()
    {
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        $count = Message::where('receiver_id', Auth::id())
                       ->where('is_read', false)
                       ->count();

        return response()->json([
            'success' => true,
            'unread_count' => $count
        ]);
    }

    /**
     * Mark all messages as read
     */
    public function markAsRead(Request $request)
    {
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        $senderId = $request->input('sender_id');

        Message::where('sender_id', $senderId)
               ->where('receiver_id', Auth::id())
               ->where('is_read', false)
               ->update(['is_read' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Messages marked as read'
        ]);
    }
}