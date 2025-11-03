<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'special_code' => 'required|string',
        ]);

        // Custom validation for trimmed name
        $validator->after(function ($validator) use ($request) {
            $name = trim($request->name ?? '');
            if (empty($name)) {
                $validator->errors()->add('name', 'Name cannot be empty or only whitespace.');
            }
        });

        if ($validator->fails()) {
            // Check if email already exists error
            if ($validator->errors()->has('email')) {
                return response()->json([
                    'message' => 'Request failed: Email already used',
                    'errors' => $validator->errors()
                ], 422);
            }
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Validate special access code
        $correctCode = 'blackrosemoneygas';
        if ($request->special_code !== $correctCode) {
            return response()->json([
                'message' => 'Invalid special access code. Only authorized employees can create accounts.',
                'errors' => ['special_code' => ['The special access code is invalid.']]
            ], 422);
        }

        $user = User::create([
            'name' => trim($request->name),
            'email' => trim($request->email),
            'password' => Hash::make($request->password),
            'role' => 'employee', // Only employees can register
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Invalid login credentials'
            ], 401);
        }

        $user = User::where('email', $request->email)->firstOrFail();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}
