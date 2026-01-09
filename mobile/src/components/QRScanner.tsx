import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import { BarCodeScanningResult } from 'expo-camera';

interface QRScannerProps {
    onScan: (data: string) => void;
    onClose: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        if (!permission?.granted) {
            requestPermission();
        }
    }, [permission]);

    const handleBarCodeScanned = ({ data }: BarCodeScanningResult) => {
        if (!scanned) {
            setScanned(true);
            onScan(data);
        }
    };

    if (!permission) {
        return (
            <View style={styles.container}>
                <Text>Requesting camera permission...</Text>
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>Camera permission is required to scan QR codes</Text>
                <TouchableOpacity style={styles.button} onPress={requestPermission}>
                    <Text style={styles.buttonText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView
                style={styles.camera}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ['qr'],
                }}
            >
                <View style={styles.overlay}>
                    <View style={styles.scanArea}>
                        <View style={styles.corner} />
                        <View style={[styles.corner, styles.topRight]} />
                        <View style={[styles.corner, styles.bottomLeft]} />
                        <View style={[styles.corner, styles.bottomRight]} />
                    </View>
                    
                    <Text style={styles.instructionText}>
                        Position the QR code within the frame
                    </Text>
                    
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                    
                    {scanned && (
                        <TouchableOpacity
                            style={styles.scanAgainButton}
                            onPress={() => setScanned(false)}
                        >
                            <Text style={styles.scanAgainButtonText}>Scan Again</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </CameraView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
    },
    camera: {
        flex: 1,
        width: '100%',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanArea: {
        width: 250,
        height: 250,
        position: 'relative',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    corner: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderColor: '#00ff00',
        borderWidth: 3,
        top: -2,
        left: -2,
        borderRightWidth: 0,
        borderBottomWidth: 0,
    },
    topRight: {
        top: -2,
        right: -2,
        left: 'auto',
        borderLeftWidth: 0,
        borderBottomWidth: 0,
        borderRightWidth: 3,
    },
    bottomLeft: {
        bottom: -2,
        left: -2,
        top: 'auto',
        borderRightWidth: 0,
        borderTopWidth: 0,
        borderBottomWidth: 3,
    },
    bottomRight: {
        bottom: -2,
        right: -2,
        top: 'auto',
        left: 'auto',
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderRightWidth: 3,
        borderBottomWidth: 3,
    },
    instructionText: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 50,
        paddingHorizontal: 20,
    },
    text: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
    },
    closeButtonText: {
        color: 'white',
        fontSize: 16,
    },
    scanAgainButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 20,
    },
    scanAgainButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default QRScanner;