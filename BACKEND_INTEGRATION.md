# Backend Integration Guide

This guide explains how to properly integrate the React frontend with the Laravel API backend.

## 🔧 Laravel Backend Setup

### 1. CORS Configuration

Update `config/cors.php` in your Laravel project:

```php
<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:3000', 'http://127.0.0.1:3000'],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

### 2. API Routes Verification

Ensure these routes exist in `routes/api.php`:

```php
// Authentication routes
Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('register', [AuthController::class, 'register']);
    Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('profile', [AuthController::class, 'profile'])->middleware('auth:sanctum');
});

// System health check (optional)
Route::prefix('system')->group(function () {
    Route::get('health', function () {
        return response()->json(['status' => 'ok', 'timestamp' => now()]);
    });
});
```

### 3. AuthController Implementation

Your `AuthController` should return responses in this format:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (Auth::attempt($request->only('email', 'password'))) {
            $user = Auth::user();
            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'data' => [
                    'user' => $user,
                    'token' => $token,
                ]
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Invalid credentials'
        ], 401);
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'type' => 'user', // Default role
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User registered successfully',
            'data' => ['user' => $user]
        ]);
    }

    public function profile(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => ['user' => $request->user()]
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }
}
```

### 4. User Model

Ensure your User model has the required fields:

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;

    protected $fillable = [
        'name',
        'email',
        'password',
        'type',
        'phone',
        'address',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];
}
```

### 5. Database Migration

Create or update the users table migration:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUsersTable extends Migration
{
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->enum('type', ['admin', 'manager', 'staff_sale', 'inventory_staff', 'user'])->default('user');
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('users');
    }
}
```

### 6. Seeder for Demo Users

Create a seeder for demo accounts:

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        $users = [
            [
                'name' => 'Administrator',
                'email' => 'admin@example.com',
                'password' => Hash::make('password'),
                'type' => 'admin',
            ],
            [
                'name' => 'Manager',
                'email' => 'manager@example.com',
                'password' => Hash::make('password'),
                'type' => 'manager',
            ],
            [
                'name' => 'Sales Staff',
                'email' => 'sales@example.com',
                'password' => Hash::make('password'),
                'type' => 'staff_sale',
            ],
            [
                'name' => 'Inventory Staff',
                'email' => 'inventory@example.com',
                'password' => Hash::make('password'),
                'type' => 'inventory_staff',
            ],
        ];

        foreach ($users as $userData) {
            User::updateOrCreate(
                ['email' => $userData['email']],
                $userData
            );
        }
    }
}
```

## 🚀 Testing the Integration

### 1. Start Laravel Server
```bash
cd inventory_api
php artisan serve
```

### 2. Start React Development Server
```bash
cd react_system
npm run dev
```

### 3. Test Authentication
Visit `http://localhost:3000/test-auth` to run automated backend tests.

### 4. Manual Testing
1. Go to `http://localhost:3000/login`
2. Try logging in with demo credentials:
   - Email: `admin@example.com`
   - Password: `password`

## 🔍 Troubleshooting

### Common Issues:

1. **CORS Errors**
   - Ensure CORS is properly configured in Laravel
   - Check that the React dev server URL is in allowed origins

2. **401 Unauthorized**
   - Verify the AuthController is returning the correct response format
   - Check that Sanctum is properly configured

3. **404 Not Found**
   - Ensure API routes are properly defined
   - Check that the Laravel server is running on port 8000

4. **Token Issues**
   - Verify that tokens are being stored and sent correctly
   - Check the Authorization header format

### Debug Steps:

1. Check Laravel logs: `tail -f storage/logs/laravel.log`
2. Check browser network tab for API requests
3. Use the `/test-auth` route to run automated tests
4. Verify database connections and migrations

## 📝 Environment Variables

### Laravel (.env)
```
APP_URL=http://localhost:8000
SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000
```

### React (if needed)
```
VITE_API_URL=http://localhost:8000/api
```

## ✅ Success Indicators

When everything is working correctly:
- ✅ Login page loads without errors
- ✅ Demo accounts can log in successfully
- ✅ Dashboard loads after login
- ✅ API requests include proper Authorization headers
- ✅ Role-based permissions work correctly
- ✅ Registration creates new users
- ✅ Logout clears tokens and redirects to login