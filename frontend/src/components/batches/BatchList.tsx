import React, { useEffect, useState } from 'react';

import { batchService, Batch } from '../../services/batchService';

const BatchList: React.FC = () => {
    const [batches, setBatches] = useState<Batch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [downloading, setDownloading] = useState<string | null>(null);

    useEffect(() => {
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        try {
            const data = await batchService.getBatches();
            setBatches(data);
            setError(null);
        } catch (err: any) {
            console.error('Failed to fetch batches:', err);
            setError('Failed to load batches.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = (batchId: string) => {
        setDownloading(batchId);
        // Use direct window location for file download to handle streaming response simply
        // Ideally use an authenticated blob fetch helper, but assuming cookie/browser handles session if standard auth?
        // Actually, our axios uses Bearer token. Window.location won't send headers.
        // We need a helper method to download with auth headers.

        downloadFile(batchId);
    };

    const downloadFile = async (batchId: string) => {
        try {
            // We need to fetch as blob with axios to send Auth header
            // Import api instance
            const token = localStorage.getItem('token');
            // Simple approach: Use fetch with headers
            const response = await fetch(`http://localhost:8001/api/v1/batches/batch/${batchId}/download`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error("Download failed");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `batch_${batchId}_qrs.zip`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (e) {
            console.error(e);
            alert("Failed to download QR codes");
        } finally {
            setDownloading(null);
        }
    };

    if (loading) {
        return <div className="text-center py-10">Loading batches...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center py-4">{error}</div>;
    }

    return (
        <div className="flex flex-col">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                    <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch ID</th>
                                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th> */}
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {batches.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                                            No batches created yet.
                                        </td>
                                    </tr>
                                ) : (
                                    batches.map((batch) => (
                                        <tr key={batch.batch_id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{batch.batch_id}</div>
                                                <div className="text-xs text-gray-500">{batch.product_id}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">Prod: {batch.production_date}</div>
                                                <div className="text-sm text-gray-500">Exp: {batch.expiry_date}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {batch.total_packs} packs
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                    {batch.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleDownload(batch.batch_id)}
                                                    disabled={downloading === batch.batch_id}
                                                    className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
                                                >
                                                    {downloading === batch.batch_id ? 'Downloading...' : 'Download QRs'}
                                                </button>
                                            </td>
                                        </tr>
                                    )))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BatchList;
