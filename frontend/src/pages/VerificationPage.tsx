import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { verificationService, VerificationResponse } from '../services/verificationService';
import VerificationResult from '../components/verification/VerificationResult';
import QRScanner from '../components/QRScanner';
import { detectIDType, extractIDFromQR } from '../utils/idDetector';

const VerificationPage: React.FC = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialPackId = queryParams.get('id') || '';

    const [packId, setPackId] = useState(initialPackId);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<VerificationResponse | null>(null);
    const [showScanner, setShowScanner] = useState(false);

    useEffect(() => {
        if (initialPackId) {
            verify(initialPackId);
        }
    }, [initialPackId]);

    const verify = async (id: string) => {
        if (!id.trim()) return;
        setLoading(true);
        setShowScanner(false);
        
        try {
            // Use centralized ID detection
            const detection = detectIDType(id);
            const cleanId = detection.cleanId;
            
            console.log('[VerificationPage] Original ID:', id);
            console.log('[VerificationPage] Detected type:', detection.type);
            console.log('[VerificationPage] Clean ID:', cleanId);
            
            // Route based on detected type
            if (detection.type === 'CARTON') {
                console.log('[VerificationPage] Calling verifyCarton()');
                const data = await verificationService.verifyCarton(cleanId);
                console.log('[VerificationPage] Carton verification response:', data);
                // Convert CartonVerificationResponse to VerificationResponse format
                setResult({
                    success: data.success,
                    verification_result: data.verification_result as any,
                    message: data.message,
                    data: data.data as any
                });
            } else {
                console.log('[VerificationPage] Calling verifyPack()');
                const data = await verificationService.verifyPack(cleanId);
                console.log('[VerificationPage] Pack verification response:', data);
                setResult(data);
            }
        } catch (error) {
            console.error('[VerificationPage] Verification error:', error);
            setResult({
                success: false,
                verification_result: 'INVALID',
                message: 'An error occurred while connecting to the server. Please try again.',
            });
        } finally {
            setLoading(false);
        }
    }

    const handleScan = (text: string) => {
        if (text) {
            // Extract ID from QR code (handles URLs with id= parameter)
            const scannedId = extractIDFromQR(text);
            console.log('[VerificationPage] QR scanned:', text);
            console.log('[VerificationPage] Extracted ID:', scannedId);
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
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Verify Product Authenticity
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Enter the Pack ID or Carton ID found on your product packaging to instantly verify its authenticity.
                    </p>
                </div>

                {!result ? (
                    <>
                        {showScanner && (
                            <div className="mb-6">
                                <QRScanner
                                    isVisible={showScanner}
                                    onScan={handleScan}
                                    onClose={() => setShowScanner(false)}
                                />
                            </div>
                        )}

                        {!showScanner && (
                            <div className="mb-6 text-center">
                                <button
                                    type="button"
                                    onClick={() => setShowScanner(true)}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                >
                                    <svg className="mr-2 -ml-1 h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                    </svg>
                                    Scan using camera directly
                                </button>
                                <div className="mt-4 relative">
                                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                        <div className="w-full border-t border-gray-300" />
                                    </div>
                                    <div className="relative flex justify-center">
                                        <span className="px-2 bg-gray-50 text-sm text-gray-500">Or enter manually</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <form className="mt-8 space-y-6" onSubmit={handleVerify}>
                            <div className="rounded-md shadow-sm -space-y-px">
                                <div>
                                    <label htmlFor="pack-id" className="sr-only">Pack ID</label>
                                    <input
                                        id="pack-id"
                                        name="pack-id"
                                        type="text"
                                        required
                                        className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                                        placeholder="Enter Pack ID (PK-...) or Carton ID (CT-...)"
                                        value={packId}
                                        onChange={(e) => setPackId(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                                >
                                    {loading ? 'Verifying...' : 'Verify Now'}
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <VerificationResult
                        result={result.verification_result as any}
                        message={result.message}
                        data={result.data}
                        onScanAnother={handleReset}
                    />
                )}

                <div className="text-center mt-8">
                    <a href="/login" className="font-medium text-primary-600 hover:text-primary-500">
                        Log in to Manufacturer Portal
                    </a>
                </div>
            </div>
        </div>
    );
};

export default VerificationPage;
