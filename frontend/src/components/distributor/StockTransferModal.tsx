import React, { useState, useEffect } from 'react';
import { supplyChainService } from '../../services/supplyChainService';

interface StockTransferModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const StockTransferModal: React.FC<StockTransferModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [cartonIds, setCartonIds] = useState('');
    const [recipientId, setRecipientId] = useState('');
    const [recipients, setRecipients] = useState<any[]>([]); // To be populated from API
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            // Load potential recipients (e.g., Pharmacies)
            // For now, we'll mock this or assume the user enters an ID manually if no endpoint exists
            // Ideally call `supplyChainService.getPharmacies()` here
            // setRecipients([...]);
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const idsList = cartonIds.split(/[\n,]+/).map(id => id.trim()).filter(id => id.length > 0);

            if (idsList.length === 0) {
                setError('Please enter at least one Carton ID');
                setLoading(false);
                return;
            }

            if (!recipientId) {
                setError('Please specify a recipient');
                setLoading(false);
                return;
            }

            const result = await supplyChainService.transferStock(idsList, recipientId, 'TRANSFER');

            if (result.success) {
                setSuccessMessage(result.message);
                setTimeout(() => {
                    onSuccess();
                    onClose();
                }, 2000);
            } else {
                setError('Failed to transfer stock');
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.detail || 'An error occurred while transferring stock');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                    Transfer Stock Out
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500 mb-4">
                                        Send stock to another registered Pharmacy or Hospital.
                                    </p>

                                    {error && (
                                        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                                            <span className="block sm:inline">{error}</span>
                                        </div>
                                    )}

                                    {successMessage && (
                                        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative" role="alert">
                                            <span className="block sm:inline">{successMessage}</span>
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-4">
                                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="recipient">
                                                Recipient Organization ID (UUID)
                                            </label>
                                            <input
                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                id="recipient"
                                                type="text"
                                                placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                                                value={recipientId}
                                                onChange={(e) => setRecipientId(e.target.value)}
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Enter the Destination Org ID manually for now.</p>
                                        </div>

                                        <div className="mb-4">
                                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="cartonIds">
                                                Carton IDs (one per line)
                                            </label>
                                            <textarea
                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                id="cartonIds"
                                                rows={5}
                                                placeholder="Scan or type IDs here..."
                                                value={cartonIds}
                                                onChange={(e) => setCartonIds(e.target.value)}
                                            ></textarea>
                                        </div>

                                        <div className="flex justify-end pt-2">
                                            <button
                                                type="button"
                                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                                onClick={onClose}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className={`mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                {loading ? 'Processing...' : 'Transfer Stock'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StockTransferModal;
