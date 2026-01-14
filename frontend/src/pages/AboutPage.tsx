import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const AboutPage: React.FC = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Navigation */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center">
                            <Link to="/" className="flex-shrink-0">
                                <h1 className="text-2xl font-bold text-primary-600">PackGuard</h1>
                            </Link>
                        </div>
                        
                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-4">
                            <Link
                                to="/"
                                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                            >
                                Home
                            </Link>
                            <Link
                                to="/about"
                                className="text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
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

                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="text-gray-500 hover:text-gray-700 p-2"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Navigation */}
                    {mobileMenuOpen && (
                        <div className="md:hidden border-t border-gray-200 py-4">
                            <div className="flex flex-col space-y-2">
                                <Link
                                    to="/"
                                    className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Home
                                </Link>
                                <Link
                                    to="/about"
                                    className="text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    About
                                </Link>
                                <Link
                                    to="/how-to-use"
                                    className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    How to Use
                                </Link>
                                <Link
                                    to="/verify"
                                    className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Verify Product
                                </Link>
                                <Link
                                    to="/login"
                                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium text-center"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Login
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* Hero Section */}
            <div className="bg-primary-600">
                <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl">
                            About PackGuard
                        </h1>
                        <p className="mt-3 max-w-md mx-auto text-base text-primary-200 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                            Revolutionizing product authentication and supply chain security across all industries through blockchain technology
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                {/* Mission Section */}
                <div className="lg:text-center mb-16">
                    <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Our Mission</h2>
                    <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                        Protecting Lives Through Technology
                    </p>
                    <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                        PackGuard is dedicated to eliminating counterfeit products across all industries 
                        by providing a transparent, secure, and immutable verification system powered by blockchain technology.
                        From pharmaceuticals to electronics, luxury goods to automotive parts, we protect consumers and brands worldwide.
                    </p>
                </div>

                {/* Problem & Solution */}
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 mb-16">
                    <div className="bg-red-50 rounded-lg p-8">
                        <div className="flex items-center mb-4">
                            <div className="flex-shrink-0">
                                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-500 text-white">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="ml-4 text-lg font-medium text-gray-900">The Problem</h3>
                        </div>
                        <p className="text-gray-600">
                            Counterfeit products pose a serious threat to consumers and businesses worldwide, with the WHO estimating that 
                            the global counterfeit market exceeds $4.2 trillion annually. From fake pharmaceuticals causing deaths to 
                            counterfeit electronics creating fire hazards, traditional supply chain tracking methods are vulnerable to manipulation and lack transparency.
                        </p>
                    </div>

                    <div className="bg-green-50 rounded-lg p-8">
                        <div className="flex items-center mb-4">
                            <div className="flex-shrink-0">
                                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="ml-4 text-lg font-medium text-gray-900">Our Solution</h3>
                        </div>
                        <p className="text-gray-600">
                            PackGuard creates an immutable record of every product's journey from manufacturer to consumer. 
                            Using blockchain technology and unique QR codes, we enable instant verification of product 
                            authenticity across all industries while maintaining complete supply chain transparency.
                        </p>
                    </div>
                </div>

                {/* Industry Coverage */}
                <div className="mb-16">
                    <div className="lg:text-center mb-12">
                        <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Industries We Serve</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            Universal Protection Across All Sectors
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                            <div className="flex items-center mb-4">
                                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="ml-4 text-lg font-medium text-gray-900">Electronics</h3>
                            </div>
                            <p className="text-gray-600 mb-3">
                                Smartphones, laptops, components, and accessories with compatibility verification and warranty tracking.
                            </p>
                            <div className="text-sm text-blue-600 font-medium">
                                Market Impact: $169B in counterfeit electronics annually
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                            <div className="flex items-center mb-4">
                                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                                    </svg>
                                </div>
                                <h3 className="ml-4 text-lg font-medium text-gray-900">Luxury Goods</h3>
                            </div>
                            <p className="text-gray-600 mb-3">
                                Handbags, watches, jewelry with authenticity certificates and provenance tracking.
                            </p>
                            <div className="text-sm text-purple-600 font-medium">
                                Market Impact: $98B in fake luxury items annually
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                            <div className="flex items-center mb-4">
                                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 5M7 13l-1.5-5m0 0L4 3H2m16 16a2 2 0 11-4 0 2 2 0 014 0zm-10 0a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <h3 className="ml-4 text-lg font-medium text-gray-900">Food & Beverages</h3>
                            </div>
                            <p className="text-gray-600 mb-3">
                                Premium wines, organic foods, supplements with origin tracking and safety verification.
                            </p>
                            <div className="text-sm text-green-600 font-medium">
                                Market Impact: $40B in food fraud annually
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
                            <div className="flex items-center mb-4">
                                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-500 text-white">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="ml-4 text-lg font-medium text-gray-900">Automotive Parts</h3>
                            </div>
                            <p className="text-gray-600 mb-3">
                                Engine parts, brake components, airbags with safety-critical verification and compatibility checks.
                            </p>
                            <div className="text-sm text-red-600 font-medium">
                                Market Impact: $45B in counterfeit auto parts annually
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-pink-500">
                            <div className="flex items-center mb-4">
                                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-pink-500 text-white">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </div>
                                <h3 className="ml-4 text-lg font-medium text-gray-900">Cosmetics</h3>
                            </div>
                            <p className="text-gray-600 mb-3">
                                Skincare, makeup, fragrances with ingredient verification and safety tracking.
                            </p>
                            <div className="text-sm text-pink-600 font-medium">
                                Market Impact: $5.4B in fake beauty products annually
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-primary-500">
                            <div className="flex items-center mb-4">
                                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
                                    </svg>
                                </div>
                                <h3 className="ml-4 text-lg font-medium text-gray-900">Pharmaceuticals</h3>
                            </div>
                            <p className="text-gray-600 mb-3">
                                Our original focus - comprehensive drug verification with regulatory compliance and safety tracking.
                            </p>
                            <div className="text-sm text-primary-600 font-medium">
                                Market Impact: Life-threatening counterfeit medications
                            </div>
                        </div>
                    </div>
                </div>

                {/* Key Features */}
                <div className="mb-16">
                    <div className="lg:text-center mb-12">
                        <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Key Features</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            Universal Product Authentication
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mb-4">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Blockchain Security</h3>
                            <p className="text-gray-600">
                                Immutable records stored on blockchain ensure data integrity and prevent tampering.
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mb-4">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Multi-Industry Platform</h3>
                            <p className="text-gray-600">
                                Supports authentication across electronics, luxury goods, food, automotive, cosmetics, and pharmaceuticals.
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mb-4">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Real-time Tracking</h3>
                            <p className="text-gray-600">
                                Track products throughout the supply chain with real-time updates and notifications across all industries.
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mb-4">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Instant Verification</h3>
                            <p className="text-gray-600">
                                QR code scanning provides immediate product authenticity verification for consumers across all industries.
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mb-4">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics & Insights</h3>
                            <p className="text-gray-600">
                                Comprehensive analytics help identify trends and potential security threats.
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mb-4">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Regulatory Compliance</h3>
                            <p className="text-gray-600">
                                Built-in compliance features help meet regulatory requirements and standards.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Technology Stack */}
                <div className="mb-16">
                    <div className="lg:text-center mb-12">
                        <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Technology</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            Built on Modern Infrastructure
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg p-8">
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                            <div className="text-center">
                                <div className="text-primary-600 font-semibold text-lg mb-2">Blockchain</div>
                                <p className="text-gray-600">Hyperledger Fabric for enterprise-grade security</p>
                            </div>
                            <div className="text-center">
                                <div className="text-primary-600 font-semibold text-lg mb-2">Backend</div>
                                <p className="text-gray-600">FastAPI with Python for robust API services</p>
                            </div>
                            <div className="text-center">
                                <div className="text-primary-600 font-semibold text-lg mb-2">Frontend</div>
                                <p className="text-gray-600">React with TypeScript for modern web experience</p>
                            </div>
                            <div className="text-center">
                                <div className="text-primary-600 font-semibold text-lg mb-2">Database</div>
                                <p className="text-gray-600">PostgreSQL for reliable data storage</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Impact */}
                <div className="bg-primary-50 rounded-lg p-8 mb-16">
                    <div className="lg:text-center mb-8">
                        <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Our Impact</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            Making a Difference
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-primary-600 mb-2">100%</div>
                            <div className="text-gray-600">Transparency in supply chain tracking</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-primary-600 mb-2">24/7</div>
                            <div className="text-gray-600">Real-time verification availability</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-primary-600 mb-2">0</div>
                            <div className="text-gray-600">Tolerance for counterfeit drugs</div>
                        </div>
                    </div>
                </div>

                {/* Call to Action */}
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
                        Ready to Secure Your Supply Chain?
                    </h2>
                    <p className="text-xl text-gray-600 mb-8">
                        Join the fight against counterfeit products and protect your customers with PackGuard.
                    </p>
                    <div className="space-x-4">
                        <Link
                            to="/register"
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                        >
                            Get Started
                        </Link>
                        <Link
                            to="/how-to-use"
                            className="inline-flex items-center px-6 py-3 border border-primary-600 text-base font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50"
                        >
                            Learn How to Use
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;