import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const HowToUsePage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('manufacturer');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const tabs = [
        { id: 'manufacturer', label: 'Manufacturer', icon: '🏭' },
        { id: 'distributor', label: 'Distributor', icon: '🚚' },
        { id: 'pharmacy', label: 'Pharmacy', icon: '💊' },
        { id: 'consumer', label: 'Consumer', icon: '👤' },
        { id: 'regulator', label: 'Regulator', icon: '🏛️' }
    ];

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
                                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                            >
                                About
                            </Link>
                            <Link
                                to="/how-to-use"
                                className="text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
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
                                    className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    About
                                </Link>
                                <Link
                                    to="/how-to-use"
                                    className="text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
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
                            How to Use PackGuard
                        </h1>
                        <p className="mt-3 max-w-md mx-auto text-base text-primary-200 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                            Step-by-step guide for all stakeholders in the pharmaceutical supply chain
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                {/* Tab Navigation */}
                <div className="mb-12">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8 overflow-x-auto">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                                        activeTab === tab.id
                                            ? 'border-primary-500 text-primary-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <span className="text-lg">{tab.icon}</span>
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-lg shadow-lg p-8">
                    {activeTab === 'manufacturer' && (
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">For Manufacturers</h2>
                            <p className="text-lg text-gray-600 mb-8">
                                As a manufacturer, you're the starting point of the supply chain. Here's how to use PackGuard to secure your products:
                            </p>

                            <div className="space-y-8">
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold">1</div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Register Your Organization</h3>
                                        <p className="text-gray-600 mb-4">
                                            Create your manufacturer account with your company details, NAFDAC license, and GMP certification.
                                        </p>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-sm text-gray-700">
                                                <strong>Required Information:</strong> Company name, registration number, NAFDAC license, contact details
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold">2</div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Add Your Products</h3>
                                        <p className="text-gray-600 mb-4">
                                            Register all your pharmaceutical products with detailed information including active ingredients, dosage, and therapeutic category.
                                        </p>
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <p className="text-sm text-blue-700">
                                                <strong>Tip:</strong> Include high-quality product images and comprehensive descriptions for better verification
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold">3</div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Generate Batch IDs</h3>
                                        <p className="text-gray-600 mb-4">
                                            For each production batch, generate unique IDs for both individual packs and cartons. The system creates QR codes automatically.
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="bg-green-50 p-4 rounded-lg">
                                                <h4 className="font-semibold text-green-800 mb-2">Pack IDs</h4>
                                                <p className="text-sm text-green-700">Individual product packages get unique QR codes for consumer verification</p>
                                            </div>
                                            <div className="bg-yellow-50 p-4 rounded-lg">
                                                <h4 className="font-semibold text-yellow-800 mb-2">Carton IDs</h4>
                                                <p className="text-sm text-yellow-700">Shipping cartons get master QR codes for supply chain tracking</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold">4</div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Apply QR Codes & Ship</h3>
                                        <p className="text-gray-600 mb-4">
                                            Print and apply the generated QR codes to your products and cartons before shipping to distributors.
                                        </p>
                                        <div className="bg-red-50 p-4 rounded-lg">
                                            <p className="text-sm text-red-700">
                                                <strong>Important:</strong> Ensure QR codes are clearly visible and not damaged during packaging
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold">5</div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Monitor & Analyze</h3>
                                        <p className="text-gray-600 mb-4">
                                            Track your products through the supply chain and analyze verification patterns to identify potential issues.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'distributor' && (
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">For Distributors</h2>
                            <p className="text-lg text-gray-600 mb-8">
                                As a distributor, you play a crucial role in maintaining supply chain integrity:
                            </p>

                            <div className="space-y-8">
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold">1</div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Register as Distributor</h3>
                                        <p className="text-gray-600 mb-4">
                                            Create your distributor account with proper licensing and warehouse information.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold">2</div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Verify Incoming Products</h3>
                                        <p className="text-gray-600 mb-4">
                                            Scan carton QR codes when receiving products from manufacturers to verify authenticity and update location.
                                        </p>
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <p className="text-sm text-blue-700">
                                                <strong>Best Practice:</strong> Always verify products before accepting delivery
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold">3</div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Track Inventory</h3>
                                        <p className="text-gray-600 mb-4">
                                            Use the platform to track your inventory levels and monitor product movement through your warehouse.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold">4</div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Update Supply Chain</h3>
                                        <p className="text-gray-600 mb-4">
                                            When shipping to pharmacies, scan cartons to update their location in the blockchain.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'pharmacy' && (
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">For Pharmacies</h2>
                            <p className="text-lg text-gray-600 mb-8">
                                As the final point before consumers, pharmacies ensure product authenticity:
                            </p>

                            <div className="space-y-8">
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold">1</div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Register Your Pharmacy</h3>
                                        <p className="text-gray-600 mb-4">
                                            Set up your pharmacy account with proper licensing and location details.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold">2</div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Verify Deliveries</h3>
                                        <p className="text-gray-600 mb-4">
                                            Scan carton QR codes when receiving products from distributors to confirm authenticity.
                                        </p>
                                        <div className="bg-red-50 p-4 rounded-lg">
                                            <p className="text-sm text-red-700">
                                                <strong>Alert:</strong> Reject any products that fail verification
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold">3</div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Educate Customers</h3>
                                        <p className="text-gray-600 mb-4">
                                            Show customers how to verify their medications using the QR codes on individual packs.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold">4</div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Report Issues</h3>
                                        <p className="text-gray-600 mb-4">
                                            Immediately report any suspicious or unverifiable products to regulators through the platform.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'consumer' && (
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">For Consumers</h2>
                            <p className="text-lg text-gray-600 mb-8">
                                Protect yourself by verifying your medications before use:
                            </p>

                            <div className="space-y-8">
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold">1</div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Look for QR Codes</h3>
                                        <p className="text-gray-600 mb-4">
                                            Check that your product package has a PackGuard QR code. Authentic products will always have one.
                                        </p>
                                        <div className="bg-green-50 p-4 rounded-lg">
                                            <p className="text-sm text-green-700">
                                                <strong>Location:</strong> QR codes are typically found on the side or back of the package
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold">2</div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Scan the QR Code</h3>
                                        <p className="text-gray-600 mb-4">
                                            Use your smartphone camera or any QR code scanner app to scan the code on your medication.
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="bg-blue-50 p-4 rounded-lg">
                                                <h4 className="font-semibold text-blue-800 mb-2">Mobile App</h4>
                                                <p className="text-sm text-blue-700">Download our mobile app for the best verification experience</p>
                                            </div>
                                            <div className="bg-purple-50 p-4 rounded-lg">
                                                <h4 className="font-semibold text-purple-800 mb-2">Web Browser</h4>
                                                <p className="text-sm text-purple-700">Visit our website and use the verification tool</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold">3</div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Check Verification Results</h3>
                                        <p className="text-gray-600 mb-4">
                                            The system will show you detailed information about your medication including:
                                        </p>
                                        <ul className="list-disc list-inside text-gray-600 space-y-2">
                                            <li>Product name and manufacturer</li>
                                            <li>Production and expiry dates</li>
                                            <li>Supply chain journey</li>
                                            <li>Authenticity status</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold">!</div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-red-600 mb-2">If Verification Fails</h3>
                                        <p className="text-gray-600 mb-4">
                                            If the QR code doesn't scan or shows "COUNTERFEIT" or "SUSPICIOUS":
                                        </p>
                                        <div className="bg-red-50 p-4 rounded-lg">
                                            <ul className="list-disc list-inside text-red-700 space-y-1">
                                                <li><strong>DO NOT</strong> consume the medication</li>
                                                <li>Return to the pharmacy immediately</li>
                                                <li>Report the incident through our platform</li>
                                                <li>Contact NAFDAC if necessary</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'regulator' && (
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">For Regulators</h2>
                            <p className="text-lg text-gray-600 mb-8">
                                Regulatory authorities can monitor and enforce compliance across the supply chain:
                            </p>

                            <div className="space-y-8">
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold">1</div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Access Regulatory Dashboard</h3>
                                        <p className="text-gray-600 mb-4">
                                            Use your regulator account to access comprehensive oversight tools and analytics.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold">2</div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Monitor Supply Chain</h3>
                                        <p className="text-gray-600 mb-4">
                                            Track all registered products and their movement through the supply chain in real-time.
                                        </p>
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <p className="text-sm text-blue-700">
                                                <strong>Features:</strong> Geographic distribution maps, volume analytics, verification trends
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold">3</div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Investigate Alerts</h3>
                                        <p className="text-gray-600 mb-4">
                                            Receive automatic alerts for suspicious activities and investigate potential counterfeit incidents.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold">4</div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Verify Organizations</h3>
                                        <p className="text-gray-600 mb-4">
                                            Approve and verify manufacturer, distributor, and pharmacy registrations to maintain system integrity.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold">5</div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Generate Reports</h3>
                                        <p className="text-gray-600 mb-4">
                                            Create comprehensive reports for policy making and compliance monitoring.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick Start Guide */}
                <div className="mt-16 bg-primary-50 rounded-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Quick Start Guide</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
                            <h3 className="font-semibold text-gray-900 mb-2">Sign Up</h3>
                            <p className="text-gray-600">Create your account and verify your organization</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
                            <h3 className="font-semibold text-gray-900 mb-2">Set Up</h3>
                            <p className="text-gray-600">Configure your products and supply chain settings</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
                            <h3 className="font-semibold text-gray-900 mb-2">Start Tracking</h3>
                            <p className="text-gray-600">Begin generating IDs and tracking your products</p>
                        </div>
                    </div>
                </div>

                {/* Call to Action */}
                <div className="text-center mt-16">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
                        Ready to Get Started?
                    </h2>
                    <p className="text-xl text-gray-600 mb-8">
                        Join thousands of organizations already using PackGuard to secure their supply chains.
                    </p>
                    <div className="space-x-4">
                        <Link
                            to="/register"
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                        >
                            Create Account
                        </Link>
                        <Link
                            to="/verify"
                            className="inline-flex items-center px-6 py-3 border border-primary-600 text-base font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50"
                        >
                            Try Verification
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HowToUsePage;