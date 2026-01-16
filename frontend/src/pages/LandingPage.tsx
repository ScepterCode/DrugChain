import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { verificationService, VerificationResponse } from '../services/verificationService';
import VerificationResult from '../components/verification/VerificationResult';
import QRScanner from '../components/QRScanner';

const LandingPage: React.FC = () => {
    const [packId, setPackId] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<VerificationResponse | null>(null);
    const [showScanner, setShowScanner] = useState(false);

    const verify = async (id: string) => {
        if (!id.trim()) return;
        setLoading(true);
        setShowScanner(false);
        
        try {
            // Detect code type and route accordingly
            const cleanId = id.trim().toUpperCase();
            
            if (cleanId.startsWith('CARTON-') || cleanId.includes('CARTON')) {
                // This is a carton code - check if user is authorized
                const data = await verificationService.verifyCarton(cleanId);
                // Convert CartonVerificationResponse to VerificationResponse format
                setResult({
                    success: data.success,
                    verification_result: data.verification_result as any,
                    message: data.message,
                    data: data.data as any
                });
            } else {
                // This is a pack code - proceed with normal verification
                const data = await verificationService.verifyPack(cleanId);
                setResult(data);
            }
        } catch (error) {
            console.error(error);
            setResult({
                success: false,
                verification_result: 'INVALID',
                message: 'An error occurred while connecting to the server. Please try again.',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleScan = (text: string) => {
        if (text) {
            let scannedId = text;
            if (text.includes('id=')) {
                try {
                    const urlParams = new URLSearchParams(new URL(text).search);
                    scannedId = urlParams.get('id') || text;
                } catch (e) {
                    const parts = text.split('id=');
                    if (parts.length > 1) {
                        scannedId = parts[1];
                    }
                }
            }
            setPackId(scannedId);
            verify(scannedId);
            // Close scanner after successful scan
            setShowScanner(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        await verify(packId);
    };

    const handleReset = () => {
        setResult(null);
        setPackId('');
        setShowScanner(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center">
                            <Link to="/" className="flex-shrink-0">
                                <h1 className="text-2xl font-bold text-primary-600">PackGuard</h1>
                            </Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link
                                to="/about"
                                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                            >
                                About
                            </Link>
                            <Link
                                to="/how-to-use"
                                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                            >
                                How to Use
                            </Link>
                            <Link
                                to="/verify"
                                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                            >
                                Verify Product
                            </Link>
                            <Link
                                to="/login"
                                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                            >
                                Login
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center">
                    <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                        <span className="block">Protect Yourself from</span>
                        <span className="block text-primary-600">Counterfeit Products</span>
                    </h1>
                    <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                        Verify the authenticity of any product instantly using our blockchain-powered verification system. 
                        Each product has a unique code that can only be verified once.
                    </p>
                </div>

                {/* Verification Section */}
                <div className="mt-16 max-w-2xl mx-auto">
                    {!result ? (
                        <div className="bg-white rounded-2xl shadow-xl p-8">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Product</h2>
                                <p className="text-gray-600">
                                    Scan the QR code or enter the Pack ID found on your product packaging
                                </p>
                            </div>

                            {showScanner ? (
                                <div className="mb-6">
                                    <QRScanner
                                        isVisible={showScanner}
                                        onScan={handleScan}
                                        onClose={() => setShowScanner(false)}
                                    />
                                </div>
                            ) : (
                                <div className="mb-6 text-center">
                                    <button
                                        type="button"
                                        onClick={() => setShowScanner(true)}
                                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                    >
                                        <svg className="mr-2 -ml-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                        </svg>
                                        Scan QR Code
                                    </button>
                                    <div className="mt-6 relative">
                                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                            <div className="w-full border-t border-gray-300" />
                                        </div>
                                        <div className="relative flex justify-center">
                                            <span className="px-2 bg-white text-sm text-gray-500">Or enter manually</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleVerify} className="space-y-6">
                                <div>
                                    <label htmlFor="pack-id" className="block text-sm font-medium text-gray-700 mb-2">
                                        Pack ID
                                    </label>
                                    <input
                                        id="pack-id"
                                        name="pack-id"
                                        type="text"
                                        required
                                        className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                        placeholder="Enter Pack ID (e.g. PK-ABC123XYZ)"
                                        value={packId}
                                        onChange={(e) => setPackId(e.target.value)}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                                >
                                    {loading ? 'Verifying...' : 'Verify Now'}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-xl p-8">
                            <VerificationResult
                                result={result.verification_result as any}
                                message={result.message}
                                data={result.data}
                                onScanAnother={handleReset}
                            />
                        </div>
                    )}
                </div>

                {/* Features Section */}
                <div className="mt-20">
                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-gray-900">
                            How PackGuard Protects You
                        </h2>
                        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                            Our advanced blockchain technology ensures every product is authentic and traceable
                        </p>
                    </div>

                    <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mx-auto">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="mt-4 text-lg font-medium text-gray-900 text-center">One-Time Verification</h3>
                            <p className="mt-2 text-base text-gray-500 text-center">
                                Each product can only be verified once, preventing counterfeit codes from being reused
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mx-auto">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="mt-4 text-lg font-medium text-gray-900 text-center">Instant Results</h3>
                            <p className="mt-2 text-base text-gray-500 text-center">
                                Get immediate verification results with detailed product information and safety alerts
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mx-auto">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h3 className="mt-4 text-lg font-medium text-gray-900 text-center">Regulatory Approved</h3>
                            <p className="mt-2 text-base text-gray-500 text-center">
                                Integrated with regulatory systems for official product authentication and safety reporting
                            </p>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="mt-20 bg-primary-600 rounded-2xl shadow-xl">
                    <div className="px-6 py-12 sm:px-12 sm:py-16 lg:px-16">
                        <div className="text-center">
                            <h2 className="text-3xl font-extrabold text-white">
                                For Healthcare Professionals
                            </h2>
                            <p className="mt-4 text-lg text-primary-100">
                                Access our manufacturer portal to manage batches, track supply chains, and monitor verification analytics
                            </p>
                            <div className="mt-8">
                                <Link
                                    to="/login"
                                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50"
                                >
                                    Access Portal
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 mt-20">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <p className="text-base text-gray-500">
                            © 2026 PackGuard. Protecting consumers from counterfeit products worldwide.
                        </p>
                        <p className="mt-2 text-sm text-gray-400">
                            Report suspicious products to NAFDAC: +234-1-448-0772 | pharmacovigilance@nafdac.gov.ng
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;