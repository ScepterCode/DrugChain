import React, { useState } from 'react';
import { verificationService } from '../../services/verificationService';
import VerificationResult from './VerificationResult';
import QRScanner from '../QRScanner';

const VerificationWidget: React.FC = () => {
    const [verificationId, setVerificationId] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [showScanner, setShowScanner] = useState(false);

    const handleVerify = async () => {
        if (!verificationId.trim()) {
            alert('Please enter a product ID');
            return;
        }

        setLoading(true);
        try {
            const data = await verificationService.verifyProduct(verificationId.trim());
            setResult(data);
        } catch (error: any) {
            console.error('Verification failed:', error);
            setResult({
                result: 'INVALID',
                message: error.response?.data?.detail || 'Verification failed. Please check the ID and try again.',
                data: {}
            });
        } finally {
            setLoading(false);
        }
    };

    const handleScanSuccess = (scannedId: string) => {
        setVerificationId(scannedId);
        setShowScanner(false);
        // Auto-verify after scan
        setTimeout(() => {
            handleVerify();
        }, 100);
    };

    const handleReset = () => {
        setResult(null);
        setVerificationId('');
    };

    if (result) {
        return (
            <VerificationResult
                result={result.result}
                message={result.message}
                data={result.data}
                onScanAnother={handleReset}
            />
        );
    }

    return (
        <div className="space-y-4">
            {/* Input Section */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                    <input
                        type="text"
                        value={verificationId}
                        onChange={(e) => setVerificationId(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
                        placeholder="Enter Pack ID (e.g., PK-20240101-ABC123)"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        disabled={loading}
                    />
                </div>
                <button
                    onClick={handleVerify}
                    disabled={loading || !verificationId.trim()}
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? (
                        <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Verifying...
                        </span>
                    ) : (
                        'Verify'
                    )}
                </button>
            </div>

            {/* OR Divider */}
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">OR</span>
                </div>
            </div>

            {/* Scan Button */}
            <button
                onClick={() => setShowScanner(true)}
                className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-700 hover:border-primary-500 hover:text-primary-600 transition-colors"
            >
                <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                Scan QR Code
            </button>

            {/* QR Scanner Modal */}
            {showScanner && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Scan QR Code</h3>
                            <button
                                onClick={() => setShowScanner(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <QRScanner
                            isVisible={showScanner}
                            onScan={handleScanSuccess}
                            onClose={() => setShowScanner(false)}
                        />
                    </div>
                </div>
            )}

            {/* Help Text */}
            <div className="text-sm text-gray-500 space-y-1">
                <p>💡 <strong>Tip:</strong> You can verify any product code to check authenticity</p>
                <p>• Pack codes start with "PK-"</p>
                <p>• Carton codes start with "CT-" (distributor/retailer only)</p>
                <p>• Batch codes start with "BT-" (manufacturer only)</p>
            </div>
        </div>
    );
};

export default VerificationWidget;
