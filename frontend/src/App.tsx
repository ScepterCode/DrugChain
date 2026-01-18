import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import BatchListPage from './pages/batches/BatchListPage';
import BatchDetailsPage from './pages/batches/BatchDetailsPage';
import NewBatchPage from './pages/batches/NewBatchPage';
import ProductListPage from './pages/products/ProductListPage';
import NewProductPage from './pages/products/NewProductPage';
import UserManagementPage from './pages/UserManagementPage';
import VerificationPage from './pages/VerificationPage';
import AboutPage from './pages/AboutPage';
import HowToUsePage from './pages/HowToUsePage';
import SupplyChainDashboard from './pages/SupplyChainDashboard';
import SearchPage from './pages/SearchPage';
import ProtectedRoute from './components/ProtectedRoute';
import NotFoundPage from './pages/NotFoundPage';

function App() {
    return (
        <Provider store={store}>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <div className="min-h-screen bg-gray-50">
                    <Routes>
                        {/* Public routes */}
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/verify" element={<VerificationPage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/how-to-use" element={<HowToUsePage />} />

                        {/* Protected routes */}
                        <Route path="/portal" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                            <Route index element={<Navigate to="/portal/dashboard" replace />} />
                            <Route path="dashboard" element={<DashboardPage />} />
                            <Route path="products" element={<ProductListPage />} />
                            <Route path="products/new" element={<NewProductPage />} />
                            <Route path="batches" element={<BatchListPage />} />
                            <Route path="batches/new" element={<NewBatchPage />} />
                            <Route path="batches/:batchId" element={<BatchDetailsPage />} />
                            <Route path="analytics" element={<AnalyticsPage />} />
                            <Route path="users" element={<UserManagementPage />} />
                            <Route path="distributor" element={<SupplyChainDashboard />} />
                            <Route path="verify" element={<VerificationPage />} />
                            <Route path="search" element={<SearchPage />} />
                        </Route>

                        {/* Legacy redirects */}
                        <Route path="/dashboard" element={<Navigate to="/portal/dashboard" replace />} />
                        <Route path="/batches" element={<Navigate to="/portal/batches" replace />} />
                        <Route path="/batches/*" element={<Navigate to="/portal/batches" replace />} />

                        {/* 404 catch-all route */}
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </div>
            </Router>
        </Provider>
    );
}

export default App;
