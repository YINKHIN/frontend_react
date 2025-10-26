# Inventory Management System (IMS)

A comprehensive Inventory Management System built with React.js and Tailwind CSS that integrates with a Laravel API backend.

## 🎯 Role-

The system implements strict quested:

- **Admin**: Full CRUD access to all modules (Create, Read, Update, Delete)
- **Manager**: Read-only access to all modules (cannot
- **StaffSale**: Can only manage Sales (Orders and Payments)
- **InventoryStaff**: Can only manage Stockte only)
s

## 📁 Project Structure

```
react_system/
├── src/
│   ├── components/          # Reusable UI cos
│   │   ├── Layout.jsx
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── ProductModal.jsx
│   │   ├── CategoryModal.jsx
jsx
│   │   ├── Suppliejsx
sx
│   ├── page
│   │   ├── auth/
│   │   │   └── LoginPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── ProductsPage.jsx
│   │   ├── CategoriesPage.jsx
│   │   ├── BrandsPage.js
│   │   ├── SuppliersPage.jsx
│   │   ├── CustomersPage.jsx
│   │   ├── StaffPage.jsx

│   │   ├── ImportsPage
│   │   ├── PaymentsPage.jsx
│   │   ├── ReportsPage.jsx
│   │   ├── UsersPage.jsx
jsx
│   │   └── ProfileP.jsx

│  .jsx
│   
│   │   ├── useProducts.js
│   │   ├── useCat
│   │   ├── useBras.js
│   │   ├── useSupp.js
│   │   ├── useCustomers.j
│   │   ├── useOrders.js
│   │   ├── use.js
│   │   ├── usePayments.js
│   │   └── users.js
│   ├── services/        functions
│   │   ├── authService.s
│   │   ├──vice.js
│   │   ├── categoryService.js
│   │   ├── brandServic
│   │   ├── supplierService.js
│   │   ├── customerSe
│   │   ├── staffService.js
│   │   ├──e.js
│   │   ├── importService.js
│   │   ├── paymentSers
│   │   ├── userService.js
│   │   └──.js
│   ├── utils/              # Utility functns
│   │   ├── api.js          # Axios configuration
│   │   ├── request.js      # HTTP request hel
│   │   └── helper.js       # General hel
│   ├── App.jsx
│  
dex.css
├── package.json
s
├── tailwind.config.js
├── postcs.js
└── index.html
```



### Frontend
- **React.js 1mework
- **Ta

- **React Query** - Data fetg
- **React Hook Form** - Form management
- **Axios** - HTTP client with interceptors
brary
- **React Hot Toast** - Notific
- **Vite**

### Bation
i)
- **JWT Authentication** - Seon
- **Role-based permissions** - Access control sysem

## 🔧 Installati Setup

1. **Navigate to the project directory**
``bash
   cd react_system
   ```

2. **Install dependencies**
h
   npm install
 ```

t**
   - Ensure your L000`
   - The Vite proxy is configured to nd

4. **Start development server**
``bash
   npm run dev
   ```

5. **Access the application**
   - Open `http://localhost:3000` in your browser

## 🔐 Demo Accounts

Use these credentials to test different user roles:

/ password
- **Manager**: manage
- **Sales Staff**: sales@example.ord
- **Inventory Staff**: inventory@example.com / password
- **User**: user@example.com / prd

## 🎨 Key Features

### ✅ **Implemented Features**
ction
- **Dashboardck alerts
- **Products Managemeons
- **Categories & Brands**: Management interfaces
- **Suppliers**: Sup
- **Users Management**: Admin-only user management
- **Role-based UI**: Dynamic interface based on user permissions
- **Responsive Dch
-g

tem**


const permissions = {
  admin: ['create', 'read', 'update', 'de
  manager: ['read'], // Cannot update/ins
  staff_sale: ['read', 'creatt'],
'],
  user: ['read'] // Ress
}
```

**
- Mobile-first apprS
- Collapsible sidebar for mobile devices
- Responsive tables and forms
- Touch-friendly interface

### 🔄 **ReaUpdates**
- React Query for efficient datang
- Automatic refetching onus
- Optimistic updates for better UX
- Loading states and error handling

## 🛠 **Develot**

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Archi
- **Component-based**: Reusable ents
- **Custom Hooks**: Data managemlogic
- **Service Layer**: API communica
- **Context API**: Globaagement
s

ion**

The system

### Auts
login
- `POST /api/auth/logout` - User logout
r profile

ts
- **Products**:ations
gement
- **Brands**: `/api/br
- **Suppliers**: `/api/supent
- **Orders**: `/api/ff)
- **Imports**: `/api/impor
- **Payments**: `/api/paf)
)

es**

ication
- Automatiout
oles
- Input sanitization and validationprotection through API integrationole-based component rendering# ment team.he developact t please contstem,gement Syentory Manae Invregarding thquestions nd pport aFor suort**

Supp# 📞 **.

#MIT Licensethe r d undeenset is licprojecs **

Thiense📄 **Lic# quest

#ll reSubmit a pu roles
6. rent userwith diffe
5. Test  handlingr errorpeAdd prore
4. uctude strexisting collow the ranch
3. Foature breate a fe
2. Citoryepos r
1. Fork theuting**
ib🤝 **Contr

## rts and dataan view repo- Cns
ificatiom any modt perforannoules
- C modcess to allRead-only ac
- egular User

### Rctionssales fun access not
- Canmportse ian managroducts
- Cte pupdaadd and f
- Can tory Stafen## Invement

#entory managaccess inv Cannot ents
-ocess paymrs
- Can prge orde manareate and
- Can c Sales Staffs

###nalytics and aort repan view- Cs
accounter modify usannot 
- Cdulesll mocess to aead-only ac- R User  
### Manageration

dministrstem a syt
- Fullgemenana to user ms
- Accessll resourcend delete a, edit, a Can createer
-### Admin Us

ples**e ExamUsag

## 📝 **routingient-side - Handle clnd
   avel backeyour Laruests to PI req  - Proxy Ap
 React aphe e t   - Servo:
r** t web servee yourfigur

3. **Coneb serverr w** to you foldery the `dist`Deplo**
2. 
   ```un build
  npm r  ```bash
 *
 ication*d the appluil **B**

1.n Deployment*Productio🚀 *
#

- R
- CSRF 