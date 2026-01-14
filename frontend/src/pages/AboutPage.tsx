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
                                <h1 className="text-2xl font-bold text-primary-600">DrugChain</h1>
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
                            About DrugChain
                        </h1>
                        <p className="mt-3 max-w-md mx-auto text-base text-primary-200 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                            Revolutionizing pharmaceutical supply chain security through blockchain technology
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
                        DrugChain is dedicated to eliminating counterfeit drugs from the pharmaceutical supply chain 
                        by providing a transparent, secure, and immutable verification system powered by blockchain technology.
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
                            Counterfeit drugs pose a serious threat to public health, with the WHO estimating that 
                            1 in 10 medical products in developing countries are substandard or falsified. Traditional 
                            supply chain tracking methods are vulnerable to manipulation and lack transparency.
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
                            DrugChain creates an immutable record of every drug's journey from manufacturer to patient. 
                            Using blockchain technology and unique QR codes, we enable instant verification of drug 
                            authenticity while maintaining complete supply chain transparency.
                        </p>
                    </div>
                </div>

                {/* Key Features */}
                <div className="mb-16">
                    <div className="lg:text-center mb-12">
                        <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Key Features</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            Comprehensive Drug Verification
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
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Multi-Stakeholder Platform</h3>
                            <p className="text-gray-600">
                                Connects manufacturers, distributors, pharmacies, and regulators in one ecosystem.
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
                                Track drugs throughout the supply chain with real-time updates and notifications.
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
                                QR code scanning provides immediate drug authenticity verification for consumers.
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
                        Join the fight against counterfeit drugs and protect your customers with DrugChain.
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