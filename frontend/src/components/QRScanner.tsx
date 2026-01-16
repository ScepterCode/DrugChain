import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScannerState } from 'html5-qrcode';

interface QRScannerProps {
    onScan: (result: string) => void;
    onClose: () => void;
    isVisible: boolean;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose, isVisible }) => {
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [permissionDenied, setPermissionDenied] = useState(false);

    useEffect(() => {
        if (!isVisible) {
            cleanup();
            return;
        }

        // Check if we're on HTTPS or localhost (required for camera access)
        const isSecure = window.location.protocol === 'https:' || 
                        window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1';

        if (!isSecure) {
            setError('Camera access requires HTTPS. Please use the secure version of this site.');
            setIsLoading(false);
            return;
        }

        // Check camera permissions first
        checkCameraPermissions();
    }, [isVisible]);

    const checkCameraPermissions = async () => {
        try {
            // Check if getUserMedia is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                setError('Camera access is not supported in this browser.');
                setIsLoading(false);
                return;
            }

            // Request camera permission
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            
            // Stop the stream immediately - we just needed to check permission
            stream.getTracks().forEach(track => track.stop());
            
            // Permission granted, initialize scanner
            initializeScanner();
        } catch (err: any) {
            console.error('Camera permission error:', err);
            
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setPermissionDenied(true);
                setError('Camera permission denied. Please allow camera access and try again.');
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                setError('No camera found on this device.');
            } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                setError('Camera is already in use by another application.');
            } else {
                setError('Unable to access camera. Please check your browser settings.');
            }
            
            setIsLoading(false);
        }
    };

    const initializeScanner = () => {
        // Wait for DOM element to be ready
        setTimeout(() => {
            const readerElement = document.getElementById('qr-reader');
            if (!readerElement) {
                setError('Scanner element not found.');
                setIsLoading(false);
                return;
            }

            try {
                const scanner = new Html5QrcodeScanner(
                    'qr-reader',
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0,
                        showTorchButtonIfSupported: true,
                        supportedScanTypes: [], // Auto-detect QR codes and barcodes
                    },
                    false // verbose
                );

                scannerRef.current = scanner;

                scanner.render(
                    (decodedText: string) => {
                        console.log('QR Code scanned:', decodedText);
                        onScan(decodedText);
                        // Don't auto-close, let parent handle it
                    },
                    (errorMessage: string) => {
                        // This is called for every scan attempt, so we don't want to show errors here
                        // Only log for debugging
                        console.debug('QR scan error:', errorMessage);
                    }
                );

                setIsLoading(false);
                setError(null);
            } catch (err: any) {
                console.error('Scanner initialization error:', err);
                setError('Failed to initialize camera scanner.');
                setIsLoading(false);
            }
        }, 100);
    };

    const cleanup = () => {
        if (scannerRef.current) {
            try {
                // Check if scanner is in a state that allows clearing
                if (scannerRef.current.getState() !== Html5QrcodeScannerState.NOT_STARTED) {
                    scannerRef.current.clear();
                }
            } catch (err) {
                console.warn('Error clearing scanner:', err);
            }
            scannerRef.current = null;
        }
        setError(null);
        setIsLoading(true);
        setPermissionDenied(false);
    };

    const requestPermissionAgain = () => {
        setPermissionDenied(false);
        setError(null);
        setIsLoading(true);
        checkCameraPermissions();
    };

    if (!isVisible) {
        return null;
    }

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Scan QR Code</h3>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {isLoading && (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
                    <p className="text-gray-600">Initializing camera...</p>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Camera Access Error</h3>
                            <p className="mt-1 text-sm text-red-700">{error}</p>
                            {permissionDenied && (
                                <div className="mt-3">
                                    <button
                                        onClick={requestPermissionAgain}
                                        className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm font-medium"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div 
                id="qr-reader" 
                className={`${isLoading || error ? 'hidden' : 'block'}`}
                style={{ width: '100%', minHeight: '300px' }}
            />

            {!isLoading && !error && (
                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600 mb-2">
                        Position the QR code within the scanning area
                    </p>
                    <button
                        onClick={onClose}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
};

export default QRScanner;