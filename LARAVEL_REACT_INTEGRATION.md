# Laravel + React Integration Guide

## 🚀 Complete Setup Guide

This guide provides step-by-step instructions to set up the Laravel API backend with React frontend integration.

## 📋 Prerequisites

- PHP 8.1 or higher
- Composer
- Node.js 16+ and npm
- MySQL 8.0+
- Git

## 🔧 Laravel Backend Setup

### 1. Install Dependencies

```bash
# Navigate to Laravel directory
cd invetory_api

# Install PHP dependencies
composer install

# Install JWT Auth
composer require tymon/jwt-auth
```

### 2. Environment Configuration

```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Generate JWT secret
php artisan jwt:secret
```

### 3. Database Configuration

Edit `.env` file:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=stock_inout
DB_USERNAME=root
DB_PASSWORD=

# JWT Configuration
JWT_SECRET=your_generated_jwt_secret

# App Configuration
APP_URL=http://localhost:8000
APP_DEBUG=true
```

### 4. Database Setup

```bash
# Create database
mysql -u root -p
CREATE DATABASE stock_inout;
exit

# Run migrations
php artisan migrate

# Seed demo data
php artisan db:seed
```

### 5. Start Laravel Server

```bash
php artisan serve
```

Server will run on `http://localhost:8000`

## ⚛️ React Frontend Setup

### 1. Install Dependencies

```bash
# Navigate to React directory
cd react_system

# Install dependencies
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

React app will run on `http://localhost:3000`

## 🔗 API Integration Details

### Authentication Flow

1. **Login Request**:
   ```javascript
   POST /api/auth/login
   {
     "email": "admin@example.com",
     "password": "password"
   }
   ```

2. **Response Format**:
   ```json
   {
     "success": true,
     "message": "Login successful",
     "access_token": "jwt_token_here",
     "token_type": "Bearer",
     "user": {
       "id": 1,
       "name": "Admin User",
       "email": "admin@example.com",
       "user_type": "admin"
     }
   }
   ```

### Data Endpoints

All data endpoints return this format:

```json
{
  "success": true,
  "data": [
    // Array of items
  ]
}
```

### Key Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | User login | No |
| GET | `/api/products` | Get products | Yes |
| GET | `/api/categories` | Get categories | Yes |
| GET | `/api/brands` | Get brands | Yes |
| GET | `/api/users` | Get users (admin only) | Yes |
| POST | `/api/products` | Create product | Yes |
| PUT | `/api/products/{id}` | Update product | Yes |
| DELETE | `/api/products/{id}` | Delete product | Yes |

## 🔐 Demo Accounts

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| Admin | admin@example.com | password | Full access |
| Manager | manager@example.com | password | Read-only |
| Sales Staff | sales@example.com | password | Orders & Payments |
| Inventory Staff | inventory@example.com | password | Products & Imports |

## 🧪 Testing the Integration

### 1. Automated API Test

```bash
cd react_system
npm run test:api
```

### 2. Manual Testing

1. Start Laravel server: `php artisan serve`
2. Start React server: `npm run dev`
3. Open `http://localhost:3000`
4. Login with demo credentials
5. Check backend status indicator

## 🐛 Troubleshooting

### Common Issues

#### 1. CORS Errors
**Problem**: Cross-origin requests blocked

**Solution**: Check `config/cors.php`:
```php
'allowed_origins' => ['http://localhost:3000'],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
```

#### 2. 401 Unauthorized
**Problem**: Authentication fails

**Solutions**:
- Verify JWT secret is set: `php artisan jwt:secret`
- Check demo users exist: `php artisan db:seed`
- Verify token is being sent in headers

#### 3. 404 Not Found
**Problem**: API endpoints not found

**Solutions**:
- Check routes are defined in `routes/api.php`
- Verify Laravel server is running on port 8000
- Check proxy configuration in `vite.config.js`

#### 4. Database Connection
**Problem**: Cannot connect to database

**Solutions**:
- Verify MySQL is running
- Check database exists: `CREATE DATABASE stock_inout;`
- Verify `.env` database credentials
- Run migrations: `php artisan migrate`

#### 5. 500 Server Error
**Problem**: Internal server error

**Solutions**:
- Check Laravel logs: `storage/logs/laravel.log`
- Verify all required fields in requests
- Check database constraints
- Clear cache: `php artisan cache:clear`

### Debug Commands

```bash
# Laravel debugging
php artisan route:list --path=api
php artisan config:clear
php artisan cache:clear
php artisan queue:work

# Check logs
tail -f storage/logs/laravel.log

# Database debugging
php artisan tinker
>>> User::all()
>>> Product::with(['category', 'brand'])->get()
```

## 📁 Project Structure

```
project/
├── invetory_api/          # Laravel Backend
│   ├── app/
│   │   ├── Http/Controllers/
│   │   └── Models/
│   ├── routes/api.php
│   ├── config/cors.php
│   └── .env
└── react_system/         # React Frontend
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   ├── hooks/
    │   └── utils/
    ├── vite.config.js
    └── package.json
```

## 🔄 Data Flow

1. **React Component** makes API call
2. **Service Layer** formats request
3. **Axios Interceptor** adds auth token
4. **Vite Proxy** forwards to Laravel
5. **Laravel Route** matches endpoint
6. **Controller** processes request
7. **Model** interacts with database
8. **Response** sent back to React
9. **React Hook** updates component state

## 🚀 Production Deployment

### Laravel (Backend)

```bash
# Optimize for production
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Set environment
APP_ENV=production
APP_DEBUG=false
```

### React (Frontend)

```bash
# Build for production
npm run build

# Serve static files
npm run preview
```

## 📚 Additional Resources

- [Laravel Documentation](https://laravel.com/docs)
- [JWT Auth Documentation](https://jwt-auth.readthedocs.io/)
- [React Query Documentation](https://react-query.tanstack.com/)
- [Axios Documentation](https://axios-http.com/)

## 🤝 Support

If you encounter issues:

1. Check this troubleshooting guide
2. Run the API test: `npm run test:api`
3. Check Laravel logs
4. Verify all setup steps completed
5. Check demo credentials are working

---

**✅ Setup Complete When:**
- Laravel server runs on http://localhost:8000
- React app runs on http://localhost:3000
- API test passes
- Login with demo credentials works
- Backend status shows "Connected"
- All pages load data without errors