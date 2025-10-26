# Laravel Suppliers API Setup

This guide provides the Laravel backend setup for the Suppliers functionality.

## 🔧 Laravel Backend Setup for Suppliers

### 1. Create Supplier Model

Create `app/Models/Supplier.php`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    use HasFactory;

    protected $fillable = [
        'supplier',
        'sup_con',
        'sup_add',
        'status'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('supplier', 'like', "%{$search}%")
              ->orWhere('sup_con', 'like', "%{$search}%")
              ->orWhere('sup_add', 'like', "%{$search}%");
        });
    }
}
```

### 2. Create Supplier Controller

Create `app/Http/Controllers/SupplierController.php`:

```php
<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SupplierController extends Controller
{
    /**
     * Display a listing of suppliers
     */
    public function index(Request $request)
    {
        try {
            $query = Supplier::query();

            // Search functionality
            if ($request->has('search') && $request->search) {
                $query->search($request->search);
            }

            // Status filter
            if ($request->has('status') && $request->status) {
                $query->where('status', $request->status);
            }

            // Sorting
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Pagination
            $perPage = $request->get('per_page', 15);
            $suppliers = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $suppliers->items(),
                'meta' => [
                    'current_page' => $suppliers->currentPage(),
                    'last_page' => $suppliers->lastPage(),
                    'per_page' => $suppliers->perPage(),
                    'total' => $suppliers->total(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch suppliers',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created supplier
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'supplier' => 'required|string|max:255',
            'sup_con' => 'required|string|max:255',
            'sup_add' => 'required|string|max:500',
            'status' => 'in:active,inactive'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $supplier = Supplier::create([
                'supplier' => $request->supplier,
                'sup_con' => $request->sup_con,
                'sup_add' => $request->sup_add,
                'status' => $request->status ?? 'active'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Supplier created successfully',
                'data' => $supplier
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create supplier',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified supplier
     */
    public function show($id)
    {
        try {
            $supplier = Supplier::findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $supplier
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Supplier not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified supplier
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'supplier' => 'required|string|max:255',
            'sup_con' => 'required|string|max:255',
            'sup_add' => 'required|string|max:500',
            'status' => 'in:active,inactive'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $supplier = Supplier::findOrFail($id);
            
            $supplier->update([
                'supplier' => $request->supplier,
                'sup_con' => $request->sup_con,
                'sup_add' => $request->sup_add,
                'status' => $request->status ?? $supplier->status
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Supplier updated successfully',
                'data' => $supplier
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update supplier',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified supplier
     */
    public function destroy($id)
    {
        try {
            $supplier = Supplier::findOrFail($id);
            $supplier->delete();

            return response()->json([
                'success' => true,
                'message' => 'Supplier deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete supplier',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get active suppliers for dropdown
     */
    public function active()
    {
        try {
            $suppliers = Supplier::active()
                ->select('id', 'supplier as name')
                ->orderBy('supplier')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $suppliers
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch active suppliers',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
```

### 3. Create Migration

Create migration `database/migrations/xxxx_xx_xx_xxxxxx_create_suppliers_table.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            $table->string('supplier');
            $table->string('sup_con');
            $table->text('sup_add');
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('suppliers');
    }
};
```

### 4. Create Seeder

Create `database/seeders/SupplierSeeder.php`:

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Supplier;

class SupplierSeeder extends Seeder
{
    public function run()
    {
        $suppliers = [
            [
                'supplier' => 'TechWorld Distribution',
                'sup_con' => '555-0001',
                'sup_add' => '123 Technology Blvd, Tech City',
                'status' => 'active'
            ],
            [
                'supplier' => 'Global Electronics Supply',
                'sup_con' => '555-3002',
                'sup_add' => '456 Electronics Ave, Silicon Valley',
                'status' => 'active'
            ],
            [
                'supplier' => 'SportGear Wholesale',
                'sup_con' => '555-3003',
                'sup_add' => '789 Sports Complex, Athletic City',
                'status' => 'active'
            ],
            [
                'supplier' => 'Fashion Forward Inc',
                'sup_con' => '555-3004',
                'sup_add' => '321 Fashion District, Style Town',
                'status' => 'active'
            ],
            [
                'supplier' => 'Home Essentials Ltd',
                'sup_con' => '555-3005',
                'sup_add' => '654 Home Center, Comfort City',
                'status' => 'active'
            ],
            [
                'supplier' => 'Office Pro Solutions',
                'sup_con' => '555-3006',
                'sup_add' => '987 Business Park, Corporate City',
                'status' => 'active'
            ]
        ];

        foreach ($suppliers as $supplierData) {
            Supplier::updateOrCreate(
                ['supplier' => $supplierData['supplier']],
                $supplierData
            );
        }
    }
}
```

### 5. Update API Routes

Add to `routes/api.php`:

```php
// Add this inside the auth:sanctum middleware group
Route::middleware('auth:sanctum')->group(function () {
    // ... existing routes ...
    
    // Suppliers routes
    Route::apiResource('suppliers', SupplierController::class);
    Route::get('suppliers-active', [SupplierController::class, 'active']);
});
```

### 6. Update DatabaseSeeder

Update `database/seeders/DatabaseSeeder.php`:

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        $this->call([
            UserSeeder::class,
            SupplierSeeder::class,
        ]);
    }
}
```

## 🚀 Setup Commands

Run these commands in your Laravel project:

```bash
# Create the model, controller, and migration
php artisan make:model Supplier -mcr

# Run migrations
php artisan migrate

# Seed suppliers
php artisan db:seed --class=SupplierSeeder

# Or seed everything
php artisan db:seed

# Clear cache
php artisan config:clear
php artisan cache:clear
```

## 🧪 Testing the Suppliers API

### Test Get All Suppliers:
```bash
curl -X GET http://localhost:8000/api/suppliers \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

### Test Create Supplier:
```bash
curl -X POST http://localhost:8000/api/suppliers \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"supplier":"New Supplier","sup_con":"555-1234","sup_add":"123 New Street","status":"active"}'
```

### Test Update Supplier:
```bash
curl -X PUT http://localhost:8000/api/suppliers/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"supplier":"Updated Supplier","sup_con":"555-5678","sup_add":"456 Updated Ave","status":"active"}'
```

### Test Delete Supplier:
```bash
curl -X DELETE http://localhost:8000/api/suppliers/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

## ✅ Expected Response Format

### Successful Get All:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "supplier": "TechWorld Distribution",
      "sup_con": "555-0001",
      "sup_add": "123 Technology Blvd, Tech City",
      "status": "active",
      "created_at": "2024-01-01T00:00:00.000000Z",
      "updated_at": "2024-01-01T00:00:00.000000Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 1,
    "per_page": 15,
    "total": 6
  }
}
```

This setup provides complete CRUD functionality for suppliers that matches your React frontend!