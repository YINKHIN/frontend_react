import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import Layout from './components/Layout'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import AuthTest from './components/AuthTest'
// import LaravelSetupGuide from './components/LaravelSetupGuide'
import DashboardPage from './pages/DashboardPage'
import ProductsPage from './pages/ProductsPage'
import CategoriesPage from './pages/CategoriesPage'
import BrandsPage from './pages/BrandsPage'
import SuppliersPage from './pages/SuppliersPage'
import CustomersPage from './pages/CustomersPage'
import StaffPage from './pages/StaffPage'
import ImportsPageNew from './pages/ImportsPageNew'
import OrdersPage from './pages/OrdersPage'
import PaymentsPage from './pages/PaymentsPage'
import ReportsPage from './pages/ReportsPage'
import AnalyticsPage from './pages/AnalyticsPage'
import UsersPage from './pages/UsersPage'
import NotificationsPage from './pages/NotificationsPage'
import ProfilePage from './pages/ProfilePage'

function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/test-auth" element={<AuthTest />} />
                {/* <Route path="/setup-guide" element={<LaravelSetupGuide />} /> */
}
                <Route path="/" element={
                    <ProtectedRoute>
                        <Layout />
                    </ProtectedRoute>
                }>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="products" element={<ProductsPage />} />
                    <Route path="categories" element={<CategoriesPage />} />
                    <Route path="brands" element={<BrandsPage />} />
                    <Route path="suppliers" element={<SuppliersPage />} />
                    <Route path="customers" element={<CustomersPage />} />
                    <Route path="staff" element={<StaffPage />} />
                    <Route path="orders" element={<OrdersPage />} />
                    <Route path="imports" element={<ImportsPageNew />} />
                    <Route path="payments" element={<PaymentsPage />} />
                    <Route path="reports" element={<ReportsPage />} />
                    <Route path="analytics" element={<AnalyticsPage />} />
                    <Route path="users" element={<UsersPage />} />
                    <Route path="notifications" element={<NotificationsPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                </Route>
            </Routes>
        </AuthProvider>
    )
}

export default App