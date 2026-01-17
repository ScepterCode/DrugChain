import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../store/hooks';
import { Link, useSearchParams } from 'react-router-dom';

interface SearchResult {
    id: string;
    type: 'product' | 'batch' | 'pack' | 'verification';
    title: string;
    description: string;
    metadata: Record<string, any>;
    created_at: string;
}

const SearchPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [searchType, setSearchType] = useState('all');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Auto-search if query parameter is provided
    useEffect(() => {
        const initialQuery = searchParams.get('q');
        if (initialQuery) {
            setQuery(initialQuery);
            performSearch(initialQuery);
        }
    }, [searchParams]);

    const performSearch = async (searchQuery: string) => {
        if (!searchQuery.trim()) return;

        setLoading(true);
        setError(null);

        try {
            // TODO: Implement actual search API call
            // For now, return mock results based on query
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
            
            const mockResults: SearchResult[] = [
                {
                    id: `prod-${Date.now()}`,
                    type: 'product',
                    title: `Product: ${searchQuery}`,
                    description: `Pharmaceutical product matching "${searchQuery}" - Active ingredient details and manufacturing information`,
                    metadata: { 
                        manufacturer: 'ABC Pharma Ltd', 
                        status: 'Active',
                        batch_count: 15,
                        last_verified: '2024-01-15'
                    },
                    created_at: new Date().toISOString()
                },
                {
                    id: `batch-${Date.now()}`,
                    type: 'batch',
                    title: `Batch containing "${searchQuery}"`,
                    description: `Production batch with related information for products matching your search criteria`,
                    metadata: { 
                        batch_size: 1000, 
                        status: 'Distributed',
                        manufacturer: 'ABC Pharma Ltd',
                        production_date: '2024-01-10'
                    },
                    created_at: new Date().toISOString()
                },
                {
                    id: `pack-${Date.now()}`,
                    type: 'pack',
                    title: `Pack ID: ${searchQuery.toUpperCase()}`,
                    description: `Individual product pack with verification history and supply chain tracking`,
                    metadata: { 
                        status: 'Verified', 
                        verification_count: 3,
                        last_location: 'Lagos, Nigeria',
                        distributor: 'XYZ Distribution'
                    },
                    created_at: new Date().toISOString()
                }
            ];

            // Filter results based on search type
            const filteredResults = searchType === 'all' 
                ? mockResults 
                : mockResults.filter(result => result.type === searchType);

            setResults(filteredResults);
        } catch (err) {
            setError('Failed to perform search. Please try again.');
            console.error('Search error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        await performSearch(query);
    };

    const getResultIcon = (type: string) => {
        switch (type) {
            case 'product':
                return (
                    <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                );
            case 'batch':
                return (
                    <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                );
            case 'pack':
                return (
                    <svg className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                );
            case 'verification':
                return (
                    <svg className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            default:
                return (
                    <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                );
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Search & Investigation
                </h1>
                <p className="mt-2 text-gray-600">
                    Search across products, batches, packs, and verification records for regulatory oversight.
                </p>
            </div>

            {/* Quick Verification Section */}
            <div className="bg-white shadow rounded-lg mb-8">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Product Verification</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Need to verify a specific product? Use the quick verification tool below.
                    </p>
                    <div className="flex space-x-4">
                        <Link
                            to="/portal/verify"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Verify Product
                        </Link>
                        <Link
                            to="/portal/verify"
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Scan QR Code
                        </Link>
                    </div>
                </div>
            </div>

            {/* Search Form */}
            <div className="bg-white shadow rounded-lg mb-8">
                <div className="px-4 py-5 sm:p-6">
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="flex space-x-4">
                            <div className="flex-1">
                                <label htmlFor="search-query" className="block text-sm font-medium text-gray-700">
                                    Search Query
                                </label>
                                <input
                                    type="text"
                                    id="search-query"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Enter product code, batch ID, pack ID, or keywords..."
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                />
                            </div>
                            <div className="w-48">
                                <label htmlFor="search-type" className="block text-sm font-medium text-gray-700">
                                    Search Type
                                </label>
                                <select
                                    id="search-type"
                                    value={searchType}
                                    onChange={(e) => setSearchType(e.target.value)}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                >
                                    <option value="all">All Types</option>
                                    <option value="product">Products</option>
                                    <option value="batch">Batches</option>
                                    <option value="pack">Packs</option>
                                    <option value="verification">Verifications</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={loading || !query.trim()}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Searching...
                                    </>
                                ) : (
                                    <>
                                        <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        Search
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            {/* Search Results */}
            {results.length > 0 && (
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                            Search Results ({results.length})
                        </h3>
                        
                        <div className="space-y-4">
                            {results.map((result) => (
                                <div key={result.id} className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 mt-1">
                                            {getResultIcon(result.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2">
                                                <h4 className="text-sm font-medium text-gray-900">
                                                    {result.title}
                                                </h4>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    result.type === 'product' ? 'bg-blue-100 text-blue-800' :
                                                    result.type === 'batch' ? 'bg-green-100 text-green-800' :
                                                    result.type === 'pack' ? 'bg-purple-100 text-purple-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {result.type}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-sm text-gray-600">
                                                {result.description}
                                            </p>
                                            <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                                                <span>ID: {result.id}</span>
                                                <span>Created: {new Date(result.created_at).toLocaleDateString()}</span>
                                                {Object.entries(result.metadata).map(([key, value]) => (
                                                    <span key={key}>{key}: {value}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0">
                                            <div className="flex space-x-2">
                                                <Link
                                                    to={`/portal/verify?id=${result.id}&type=${result.type}`}
                                                    className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                                                >
                                                    Verify
                                                </Link>
                                                <button className="text-gray-600 hover:text-gray-500 text-sm font-medium">
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* No Results */}
            {!loading && query && results.length === 0 && !error && (
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <div className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                No items match your search criteria. Try adjusting your search terms or search type.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!query && results.length === 0 && (
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <div className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Start your investigation</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Enter a search query above to find products, batches, packs, or verification records.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchPage;