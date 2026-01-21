import React, { useState, useEffect } from 'react';

interface BlockchainStatusProps {
    className?: string;
}

interface BlockchainInfo {
    network_status: 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE';
    consensus_nodes_active: number;
    total_blockchain_transactions: number;
    blockchain_integrity_score: number;
    last_block_time: string;
}

const BlockchainStatus: React.FC<BlockchainStatusProps> = ({ className = '' }) => {
    const [blockchainInfo, setBlockchainInfo] = useState<BlockchainInfo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBlockchainStatus();
        // Update every 30 seconds
        const interval = setInterval(fetchBlockchainStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchBlockchainStatus = async () => {
        try {
            // TODO: Call blockchain analytics endpoint when available
            // const response = await api.get('/blockchain/status');
            // setBlockchainInfo(response.data);
            
            // For now, set unavailable status
            setBlockchainInfo({
                network_status: 'UNAVAILABLE',
                consensus_nodes_active: 0,
                total_blockchain_transactions: 0,
                blockchain_integrity_score: 0,
                last_block_time: ''
            });
        } catch (error) {
            console.error('Failed to fetch blockchain status:', error);
            setBlockchainInfo({
                network_status: 'UNAVAILABLE',
                consensus_nodes_active: 0,
                total_blockchain_transactions: 0,
                blockchain_integrity_score: 0,
                last_block_time: ''
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'HEALTHY': return 'text-green-600 bg-green-100';
            case 'DEGRADED': return 'text-yellow-600 bg-yellow-100';
            case 'UNAVAILABLE': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'HEALTHY':
                return (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'DEGRADED':
                return (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                );
            case 'UNAVAILABLE':
                return (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className={`animate-pulse ${className}`}>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
        );
    }

    if (!blockchainInfo) {
        return null;
    }

    return (
        <div className={`${className}`}>
            <div className="flex items-center space-x-2">
                <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(blockchainInfo.network_status)}`}>
                    {getStatusIcon(blockchainInfo.network_status)}
                    <span className="ml-1">Blockchain</span>
                </div>
                
                {blockchainInfo.network_status === 'HEALTHY' && (
                    <div className="hidden sm:flex items-center space-x-3 text-xs text-gray-500">
                        <span>Nodes: {blockchainInfo.consensus_nodes_active}</span>
                        <span>Integrity: {blockchainInfo.blockchain_integrity_score}%</span>
                        <span>Txs: {blockchainInfo.total_blockchain_transactions.toLocaleString()}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlockchainStatus;