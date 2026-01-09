
// To avoid dependency errors if lucide not installed, using simple SVG.

interface VerificationResultProps {
    result: 'GENUINE' | 'COUNTERFEIT' | 'INVALID' | 'EXPIRED' | 'RECALLED' | 'SUSPICIOUS' | 'UNAUTHORIZED';
    message: string;
    data?: {
        product_name?: string;
        manufacturer?: string;
        verification_count?: number;
        expiry_date?: string;
        pack_id?: string;
        first_scanned_at?: string;
        alert_type?: string;
        nafdac_reg?: string;
        blockchain_verified?: boolean;
        blockchain_tx_id?: string;
        blockchain_hash?: string;
        error_type?: string;
        reason?: string;
        allowed_action?: string;
        contact_info?: string;
    };
    onScanAnother: () => void;
}

const VerificationResult: React.FC<VerificationResultProps> = ({ result, message, data, onScanAnother }) => {

    const getStyles = () => {
        switch (result) {
            case 'GENUINE':
                return {
                    bg: 'bg-green-50',
                    border: 'border-green-400',
                    text: 'text-green-800',
                    icon: (
                        <svg className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )
                };
            case 'UNAUTHORIZED':
                return {
                    bg: 'bg-red-50',
                    border: 'border-red-400',
                    text: 'text-red-800',
                    icon: (
                        <svg className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                        </svg>
                    )
                };
            case 'SUSPICIOUS':
                return {
                    bg: 'bg-orange-50',
                    border: 'border-orange-400',
                    text: 'text-orange-800',
                    icon: (
                        <svg className="h-12 w-12 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    )
                };
            case 'EXPIRED':
            case 'RECALLED':
                return {
                    bg: 'bg-yellow-50',
                    border: 'border-yellow-400',
                    text: 'text-yellow-800',
                    icon: (
                        <svg className="h-12 w-12 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    )
                };
            default: // INVALID, COUNTERFEIT
                return {
                    bg: 'bg-red-50',
                    border: 'border-red-400',
                    text: 'text-red-800',
                    icon: (
                        <svg className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )
                };
        }
    };

    const styles = getStyles();

    return (
        <div className={`rounded-xl border-2 ${styles.border} ${styles.bg} p-6 shadow-sm`}>
            <div className="flex flex-col items-center text-center">
                {styles.icon}
                <h3 className={`mt-4 text-2xl font-bold ${styles.text}`}>{result}</h3>
                <p className="mt-2 text-base text-gray-700 whitespace-pre-line">{message}</p>

                {/* Special alert for unauthorized carton access */}
                {result === 'UNAUTHORIZED' && data?.error_type === 'UNAUTHORIZED_CARTON_ACCESS' && (
                    <div className="mt-4 w-full bg-red-100 border border-red-300 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                            <svg className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                            </svg>
                            <span className="text-sm font-medium text-red-800">
                                ACCESS DENIED: Carton Code Verification
                            </span>
                        </div>
                        <div className="text-sm text-red-700 space-y-2">
                            <p><strong>Reason:</strong> {data.reason}</p>
                            <p><strong>What you can do:</strong> {data.allowed_action}</p>
                            <p><strong>Need help?</strong> {data.contact_info}</p>
                        </div>
                        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                            <p className="text-xs text-blue-700">
                                💡 <strong>Tip:</strong> Individual pack codes start with "PK-" and can be scanned by anyone to verify product authenticity.
                            </p>
                        </div>
                    </div>
                )}

                {/* Special alert for suspicious/reused codes */}
                {result === 'SUSPICIOUS' && data?.alert_type === 'REUSED_CODE' && (
                    <div className="mt-4 w-full bg-red-100 border border-red-300 rounded-lg p-4">
                        <div className="flex items-center">
                            <svg className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span className="text-sm font-medium text-red-800">
                                COUNTERFEIT ALERT: This code was already used
                            </span>
                        </div>
                        {data.first_scanned_at && (
                            <p className="mt-2 text-xs text-red-700">
                                Originally scanned: {new Date(data.first_scanned_at).toLocaleString()}
                            </p>
                        )}
                        <div className="mt-3 text-xs text-red-700">
                            <p>🚨 Report to NAFDAC: +234-1-448-0772</p>
                            <p>📧 Email: pharmacovigilance@nafdac.gov.ng</p>
                        </div>
                    </div>
                )}

                {data && result === 'GENUINE' && (
                    <div className="mt-6 w-full bg-white/50 rounded-lg p-4 border border-gray-200">
                        <div className="grid grid-cols-2 gap-4 text-left text-sm">
                            <div>
                                <span className="block font-medium text-gray-500">Product</span>
                                <span className="block font-bold text-gray-900">{data.product_name || 'Unknown'}</span>
                            </div>
                            <div>
                                <span className="block font-medium text-gray-500">Manufacturer</span>
                                <span className="block font-bold text-gray-900">{data.manufacturer || 'Licensed Manufacturer'}</span>
                            </div>
                            <div>
                                <span className="block font-medium text-gray-500">Expiry</span>
                                <span className="block font-bold text-gray-900">
                                    {data.expiry_date ? new Date(data.expiry_date).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>
                            <div>
                                <span className="block font-medium text-gray-500">NAFDAC Reg</span>
                                <span className="block font-bold text-gray-900">{data.nafdac_reg || 'Registered'}</span>
                            </div>
                        </div>
                        
                        {/* Blockchain verification badge */}
                        {data?.blockchain_verified && (
                            <div className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded-lg">
                                <div className="flex items-center">
                                    <svg className="h-4 w-4 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    <span className="text-xs font-medium text-blue-800">
                                        🔗 Blockchain Verified
                                    </span>
                                </div>
                                {data.blockchain_tx_id && (
                                    <p className="mt-1 text-xs text-blue-700">
                                        Transaction ID: {data.blockchain_tx_id.substring(0, 16)}...
                                    </p>
                                )}
                                {data.blockchain_hash && (
                                    <p className="mt-1 text-xs text-blue-700">
                                        Hash: {data.blockchain_hash}
                                    </p>
                                )}
                            </div>
                        )}
                        
                        {/* One-time scan confirmation */}
                        <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg">
                            <div className="flex items-center">
                                <svg className="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-xs font-medium text-green-800">
                                    ✅ This code has been marked as used to prevent counterfeiting
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Show basic info for other results */}
                {data && result !== 'GENUINE' && result !== 'SUSPICIOUS' && (
                    <div className="mt-6 w-full bg-white/50 rounded-lg p-4 border border-gray-200">
                        <div className="grid grid-cols-2 gap-4 text-left text-sm">
                            {data.product_name && (
                                <div>
                                    <span className="block font-medium text-gray-500">Product</span>
                                    <span className="block font-bold text-gray-900">{data.product_name}</span>
                                </div>
                            )}
                            {data.expiry_date && (
                                <div>
                                    <span className="block font-medium text-gray-500">Expiry</span>
                                    <span className="block font-bold text-gray-900">
                                        {new Date(data.expiry_date).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <button
                    onClick={onScanAnother}
                    className="mt-8 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                    Verify Another Code
                </button>
            </div>
        </div>
    );
};

export default VerificationResult;
