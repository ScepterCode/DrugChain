import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import QRScanner from '../components/QRScanner';

interface VerificationResult {
    pack_id: string;
    product_name: string;
    batch_id: string;
    manufacturer: string;
    production_date: string;
    expiry_date: string;
    status: 'AUTHENTIC' | 'COUNTERFEIT' | 'EXPIRED' | 'RECALLED';
    verification_count: number;
    last_verified: string;
}

const VerificationScreen: React.FC = () => {
    const [showScanner, setShowScanner] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<VerificationResult | null>(null);

    const handleScan = async (qrData: string) => {
        setShowScanner(false);
        setLoading(true);
        
        try {
            // Extract pack ID from QR code data
            const packId = extractPackIdFromQR(qrData);
            
            // Call verification API
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/v1/verify/${packId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    location: 'Mobile App',
                    timestamp: new Date().toISOString(),
                }),
            });
            
            const data = await response.json();
            
            if (response.ok) {
                setResult(data.data);
            } else {
                Alert.alert('Verification Failed', data.detail || 'Unable to verify product');
            }
        } catch (error) {
            console.error('Verification error:', error);
            Alert.alert('Error', 'Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    const extractPackIdFromQR = (qrData: string): string => {
        // Handle different QR code formats
        try {
            const parsed = JSON.parse(qrData);
            return parsed.pack_id || parsed.id;
        } catch {
            // If not JSON, assume it's just the pack ID
            return qrData;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'AUTHENTIC':
                return '#10B981'; // Green
            case 'COUNTERFEIT':
                return '#EF4444'; // Red
            case 'EXPIRED':
                return '#F59E0B'; // Yellow
            case 'RECALLED':
                return '#8B5CF6'; // Purple
            default:
                return '#6B7280'; // Gray
        }
    };

    const getStatusMessage = (status: string) => {
        switch (status) {
            case 'AUTHENTIC':
                return 'This product is authentic and safe to use.';
            case 'COUNTERFEIT':
                return 'WARNING: This product appears to be counterfeit. Do not use.';
            case 'EXPIRED':
                return 'WARNING: This product has expired. Do not use.';
            case 'RECALLED':
                return 'WARNING: This product has been recalled. Do not use.';
            default:
                return 'Unable to determine product status.';
        }
    };

    if (showScanner) {
        return (
            <QRScanner
                onScan={handleScan}
                onClose={() => setShowScanner(false)}
            />
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Product Verification</Text>
                <Text style={styles.subtitle}>Scan QR code to verify authenticity</Text>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>Verifying product...</Text>
                </View>
            ) : result ? (
                <ScrollView style={styles.resultContainer}>
                    <View style={[styles.statusCard, { backgroundColor: getStatusColor(result.status) }]}>
                        <Text style={styles.statusText}>{result.status}</Text>
                        <Text style={styles.statusMessage}>{getStatusMessage(result.status)}</Text>
                    </View>

                    <View style={styles.detailsCard}>
                        <Text style={styles.cardTitle}>Product Details</Text>
                        
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Product:</Text>
                            <Text style={styles.detailValue}>{result.product_name}</Text>
                        </View>
                        
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Manufacturer:</Text>
                            <Text style={styles.detailValue}>{result.manufacturer}</Text>
                        </View>
                        
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Batch ID:</Text>
                            <Text style={styles.detailValue}>{result.batch_id}</Text>
                        </View>
                        
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Pack ID:</Text>
                            <Text style={styles.detailValue}>{result.pack_id}</Text>
                        </View>
                        
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Production Date:</Text>
                            <Text style={styles.detailValue}>
                                {new Date(result.production_date).toLocaleDateString()}
                            </Text>
                        </View>
                        
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Expiry Date:</Text>
                            <Text style={styles.detailValue}>
                                {new Date(result.expiry_date).toLocaleDateString()}
                            </Text>
                        </View>
                        
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Verification Count:</Text>
                            <Text style={styles.detailValue}>{result.verification_count}</Text>
                        </View>
                        
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Last Verified:</Text>
                            <Text style={styles.detailValue}>
                                {new Date(result.last_verified).toLocaleString()}
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.scanAgainButton}
                        onPress={() => {
                            setResult(null);
                            setShowScanner(true);
                        }}
                    >
                        <Text style={styles.scanAgainButtonText}>Scan Another Product</Text>
                    </TouchableOpacity>
                </ScrollView>
            ) : (
                <View style={styles.scanPrompt}>
                    <Text style={styles.promptText}>
                        Tap the button below to scan a QR code and verify the authenticity of your medication.
                    </Text>
                    
                    <TouchableOpacity
                        style={styles.scanButton}
                        onPress={() => setShowScanner(true)}
                    >
                        <Text style={styles.scanButtonText}>Scan QR Code</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        backgroundColor: '#007AFF',
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        marginTop: 5,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    resultContainer: {
        flex: 1,
        padding: 20,
    },
    statusCard: {
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
        alignItems: 'center',
    },
    statusText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 8,
    },
    statusMessage: {
        fontSize: 16,
        color: 'white',
        textAlign: 'center',
        lineHeight: 22,
    },
    detailsCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    detailLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
        flex: 1,
    },
    detailValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '600',
        flex: 2,
        textAlign: 'right',
    },
    scanPrompt: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    promptText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 40,
    },
    scanButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderRadius: 25,
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    scanButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    scanAgainButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 20,
    },
    scanAgainButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default VerificationScreen;