import { BleManager, Device } from 'react-native-ble-plx';
import { Platform } from 'react-native';
import * as Location from 'expo-location';

interface Beacon {
    identifier: string;
    label: string;
}

class BeaconScanner {
    private manager: BleManager | null;
    private isScanning: boolean;
    private listeners: Array<(beacon: Beacon, device: Device) => void>;
    private lastCheckIns: Record<string, number>;
    private readonly CHECK_IN_COOLDOWN: number;

    constructor() {
        this.manager = null;
        this.isScanning = false;
        this.listeners = [];
        this.lastCheckIns = {};
        this.CHECK_IN_COOLDOWN = 5 * 60 * 1000; // 5 minutes in milliseconds
    }

    /**
     * Initialize the BLE Manager safely
     */
    private getManager(): BleManager {
        if (!this.manager) {
            try {
                this.manager = new BleManager();
            } catch (error) {
                console.warn('Failed to initialize BleManager. This is expected in Expo Go.', error);
                throw new Error('Bluetooth is not supported in this environment (e.g. Expo Go). Please use a development build.');
            }
        }
        return this.manager;
    }

    /**
     * Request necessary permissions for BLE scanning
     */
    async requestPermissions() {
        try {
            // Request location permissions (required for BLE on both platforms)
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                throw new Error('Location permission is required for Bluetooth scanning');
            }

            // On Android 12+, we need explicit Bluetooth permissions
            if (Platform.OS === 'android' && Platform.Version >= 31) {
                // These are handled by app.json permissions
                console.log('Android 12+ Bluetooth permissions configured in app.json');
            }

            return true;
        } catch (error) {
            console.error('Permission request failed:', error);
            throw error;
        }
    }

    // ... (canCheckIn, recordCheckIn, parseIBeaconData, matchesKnownBeacon methods remain unchanged)

    /**
     * Start scanning for beacons
     * @param {Array} knownBeacons - Array of beacon objects with { identifier, label }
     * @param {Function} onBeaconDetected - Callback when a known beacon is detected
     */
    async startScanning(knownBeacons: Beacon[] = [], onBeaconDetected?: (beacon: Beacon, device: Device) => void): Promise<void> {
        if (this.isScanning) {
            console.log('Already scanning');
            return;
        }

        try {
            // Initialize manager first
            const manager = this.getManager();

            // Request permissions first
            await this.requestPermissions();

            // Check if Bluetooth is powered on
            const state = await manager.state();
            if (state !== 'PoweredOn') {
                throw new Error('Bluetooth is not enabled. Please enable Bluetooth to use auto-attendance.');
            }

            console.log('Starting BLE scan for beacons...');
            this.isScanning = true;

            // Start scanning for all devices
            // Note: We scan for all devices because iBeacon detection requires parsing manufacturer data
            manager.startDeviceScan(
                null, // UUIDs to scan for (null = all)
                {
                    allowDuplicates: false, // Don't report same device multiple times
                    scanMode: Platform.OS === 'android' ? 2 : undefined // Low latency on Android
                },
                (error, device) => {
                    if (error) {
                        console.error('BLE scan error:', error);
                        this.stopScanning();
                        return;
                    }

                    if (device) {
                        // Check if this device matches any of our known beacons
                        const matchedBeacon = this.matchesKnownBeacon(device, knownBeacons);

                        if (matchedBeacon) {
                            console.log('Detected known beacon:', matchedBeacon.label, device.name);

                            // Check cooldown before notifying
                            if (this.canCheckIn(matchedBeacon.identifier)) {
                                console.log('Beacon detected and ready for check-in:', matchedBeacon.identifier);

                                // Notify listeners
                                if (onBeaconDetected) {
                                    onBeaconDetected(matchedBeacon, device);
                                }

                                this.listeners.forEach(listener => {
                                    listener(matchedBeacon, device);
                                });
                            } else {
                                console.log('Beacon detected but in cooldown period:', matchedBeacon.identifier);
                            }
                        }
                    }
                }
            );

            console.log('BLE scanning started successfully');
        } catch (error) {
            console.error('Failed to start scanning:', error);
            this.isScanning = false;
            // Don't throw here to prevent app crash, just log it
            // The UI will show "Not scanning" which is fine for Expo Go
        }
    }

    /**
     * Stop scanning for beacons
     */
    stopScanning() {
        if (!this.isScanning || !this.manager) return;

        console.log('Stopping BLE scan...');
        try {
            this.manager.stopDeviceScan();
        } catch (err) {
            console.warn('Error stopping scan:', err);
        }
        this.isScanning = false;
    }

    /**
     * Add a listener for beacon detection events
     */
    addListener(callback: (beacon: Beacon, device: Device) => void): void {
        this.listeners.push(callback);
    }

    /**
     * Remove a listener
     */
    removeListener(callback: (beacon: Beacon, device: Device) => void): void {
        this.listeners = this.listeners.filter(l => l !== callback);
    }

    /**
     * Clean up resources
     */
    destroy() {
        this.stopScanning();
        this.manager.destroy();
        this.listeners = [];
        this.lastCheckIns = {};
    }
}

// Export singleton instance
export default new BeaconScanner();
