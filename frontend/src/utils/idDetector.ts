/**
 * ID Detection Utility
 * Centralized logic for detecting and routing different ID types
 */

export type IDType = 'CARTON' | 'PACK' | 'BATCH' | 'UNKNOWN';

export interface IDDetectionResult {
    type: IDType;
    cleanId: string;
    originalId: string;
}

/**
 * Detect the type of ID and return cleaned version
 */
export function detectIDType(id: string): IDDetectionResult {
    const originalId = id;
    const cleanId = id.trim().toUpperCase();
    
    // Log for debugging
    console.log('[IDDetector] Analyzing ID:', cleanId);
    
    // Carton ID detection - Multiple patterns
    // Pattern 1: CT-YYYYMMDD-XXXXXX-NNNN (e.g., CT-20260121-829O4Q-0001)
    // Pattern 2: CARTON-... (legacy format)
    // Pattern 3: Contains "CARTON" anywhere
    if (cleanId.startsWith('CT-')) {
        console.log('[IDDetector] Detected as CARTON (CT- prefix)');
        return { type: 'CARTON', cleanId, originalId };
    }
    
    if (cleanId.startsWith('CARTON-') || cleanId.includes('CARTON')) {
        console.log('[IDDetector] Detected as CARTON (CARTON keyword)');
        return { type: 'CARTON', cleanId, originalId };
    }
    
    // Pack ID detection
    // Pattern: PK-XXXXXXXX (e.g., PK-ABC12345)
    if (cleanId.startsWith('PK-')) {
        console.log('[IDDetector] Detected as PACK (PK- prefix)');
        return { type: 'PACK', cleanId, originalId };
    }
    
    // Batch ID detection
    // Pattern: BT-YYYYMMDD-XXXXXX (e.g., BT-20260121-829O4Q)
    if (cleanId.startsWith('BT-') || cleanId.startsWith('BATCH-')) {
        console.log('[IDDetector] Detected as BATCH');
        return { type: 'BATCH', cleanId, originalId };
    }
    
    // If no prefix, check length and format
    // Carton IDs are typically longer (e.g., CT-20260121-829O4Q-0001 = 24 chars)
    // Pack IDs are shorter (e.g., PK-ABC12345 = 11 chars)
    if (cleanId.length > 15 && cleanId.includes('-')) {
        console.log('[IDDetector] Detected as CARTON (length-based heuristic)');
        return { type: 'CARTON', cleanId, originalId };
    }
    
    // Default to PACK for shorter codes
    if (cleanId.length <= 15) {
        console.log('[IDDetector] Detected as PACK (length-based heuristic)');
        return { type: 'PACK', cleanId, originalId };
    }
    
    console.log('[IDDetector] Could not determine type - defaulting to PACK');
    return { type: 'PACK', cleanId, originalId };
}

/**
 * Check if an ID is a carton ID
 */
export function isCartonID(id: string): boolean {
    const detection = detectIDType(id);
    return detection.type === 'CARTON';
}

/**
 * Check if an ID is a pack ID
 */
export function isPackID(id: string): boolean {
    const detection = detectIDType(id);
    return detection.type === 'PACK';
}

/**
 * Extract ID from QR code URL if present
 */
export function extractIDFromQR(qrText: string): string {
    // If it's a URL with id parameter
    if (qrText.includes('id=')) {
        try {
            const urlParams = new URLSearchParams(new URL(qrText).search);
            return urlParams.get('id') || qrText;
        } catch (e) {
            // Try manual split if URL parsing fails
            const parts = qrText.split('id=');
            if (parts.length > 1) {
                return parts[1].split('&')[0]; // Get first parameter value
            }
        }
    }
    
    // Return as-is if not a URL
    return qrText;
}
