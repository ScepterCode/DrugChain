import React, { useState } from 'react';
import { supplyChainService } from '../../services/supplyChainService';

interface StockReceiveModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const StockReceiveModal: React.FC<StockReceiveModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [cartonIds, setCartonIds] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [sender, setSender] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            // Parse carton IDs (split by newline or comma)
            const idsList = cartonIds.split(/[\n,]+/).map(id => id.trim()).filter(id => id.length > 0);

            if (idsList.length === 0) {
                setError('Please enter at least one Carton ID');
                setLoading(false);
                return;
            }

            if (!sender) {
                setError('Please specify who you are receiving from');
                setLoading(false);
                return;
            }

            const result = await supplyChainService.receiveStock(idsList, sender);

            if (result.success) {
                setSuccessMessage(result.message);
                setTimeout(() => {
                    onSuccess();
                    onClose();
                }, 2000);
            } else {
                setError('Failed to receive stock');
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.detail || 'An error occurred while receiving stock');
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
                            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                    Receive Stock
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500 mb-4">
                                        Scan or enter Carton IDs to receive items into your inventory.
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
                                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="sender">
                                                Received From (Sender)
                                            </label>
                                            <input
                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                id="sender"
                                                type="text"
                                                placeholder="e.g. Pfizer Inc."
                                                value={sender}
                                                onChange={(e) => setSender(e.target.value)}
                                            />
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
                                                className={`mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                {loading ? 'Processing...' : 'Receive Stock'}
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

export default StockReceiveModal;
