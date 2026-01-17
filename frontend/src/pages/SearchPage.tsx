import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { searchService, UnifiedSearchResult } from '../services/searchService';

const SearchPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [searchType, setSearchType] = useState<'all' | 'product' | 'batch' | 'pack' | 'manufacturer'>('all');
    const [results, setResults] = useState<UnifiedSearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

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
        setHasSearched(true);

        try {
            const searchResults = await searchService.unifiedSearch(searchQuery, searchType, 50);
            setResults(searchResults);
        } catch (err) {
            setError('Failed to perform search. Please try again.');
            console.error('Search error:', err);
            setResults([]);
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
            case 'manufacturer':
                return (
                    <svg className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
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

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'product': return 'bg-blue-100 text-blue-800';
            case 'batch': return 'bg-green-100 text-green-800';
            case 'pack': return 'bg-purple-100 text-purple-800';
            case 'manufacturer': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getDetailLink = (result: UnifiedSearchResult) => {
        switch (result.type) {
            case 'product': return `/portal/products`;
            case 'batch': return `/portal/batches/${result.id}`;
            case 'pack': return `/portal/verify?pack_id=${result.id}`;
            case 'manufacturer': return `/portal/search?q=${result.title}`;
            default: return '#';
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
                    Search across products, batches, packs, and manufacturers for regulatory oversight and investigation.
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
                                    placeholder="Enter product name, batch ID, pack ID, manufacturer name, or NAFDAC number..."
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-2 border"
                                />
                            </div>
                            <div className="w-52">
                                <label htmlFor="search-type" className="block text-sm font-medium text-gray-700">
                                    Search Type
                                </label>
                                <select
                                    id="search-type"
                                    value={searchType}
                                    onChange={(e) => setSearchType(e.target.value as any)}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-2 border"
                                >
                                    <option value="all">All Types</option>
                                    <option value="product">Products</option>
                                    <option value="batch">Batches</option>
                                    <option value="pack">Packs</option>
                                    <option value="manufacturer">Manufacturers</option>
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
                                <div key={`${result.type}-${result.id}`} className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 mt-1">
                                            {getResultIcon(result.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2">
                                                <h4 className="text-sm font-medium text-gray-900">
                                                    {result.title}
                                                </h4>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(result.type)}`}>
                                                    {result.type}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-sm text-gray-600">
                                                {result.description}
                                            </p>
                                            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                                <span>ID: {result.id.substring(0, 12)}...</span>
                                                {Object.entries(result.metadata).slice(0, 4).map(([key, value]) => (
                                                    <span key={key} className="bg-gray-100 px-2 py-0.5 rounded">
                                                        {key.replace(/_/g, ' ')}: {String(value).substring(0, 20)}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0">
                                            <div className="flex space-x-2">
                                                {result.type === 'pack' && (
                                                    <Link
                                                        to={`/portal/verify?pack_id=${result.id}`}
                                                        className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                                                    >
                                                        Verify
                                                    </Link>
                                                )}
                                                <Link
                                                    to={getDetailLink(result)}
                                                    className="text-gray-600 hover:text-gray-500 text-sm font-medium"
                                                >
                                                    View Details
                                                </Link>
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
            {!loading && hasSearched && results.length === 0 && !error && (
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <div className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                No items match your search criteria "{query}". Try adjusting your search terms or search type.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!hasSearched && !loading && (
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <div className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Start your investigation</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Enter a search query above to find products, batches, packs, or manufacturers.
                            </p>
                            <div className="mt-6 text-sm text-gray-600">
                                <p className="font-medium mb-2">Search tips:</p>
                                <ul className="space-y-1 text-left max-w-md mx-auto">
                                    <li>• Search by product name (e.g., "Panadol")</li>
                                    <li>• Search by batch ID (e.g., "BATCH-2024-001")</li>
                                    <li>• Search by pack ID for verification history</li>
                                    <li>• Search by manufacturer name</li>
                                    <li>• Search by NAFDAC registration number</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchPage;