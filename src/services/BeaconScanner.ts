import { BleManager, Device } from 'react-native-ble-plx';
import { Platform } from 'react-native';
import * as Location from 'expo-location';

interface Beacon {
    identifier: string;
    label: string;
}

class BeaconScanner {
    private manager: BleManager;
    private isScanning: boolean;
    private listeners: Array<(beacon: Beacon, device: Device) => void>;
    private lastCheckIns: Record<string, number>;
    private readonly CHECK_IN_COOLDOWN: number;

    constructor() {
        this.manager = new BleManager();
        this.isScanning = false;
        this.listeners = [];
        this.lastCheckIns = {};
        this.CHECK_IN_COOLDOWN = 5 * 60 * 1000; // 5 minutes in milliseconds
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

    /**
     * Check if we can check in for this beacon (cooldown check)
     */
    canCheckIn(beaconId: string): boolean {
        const lastCheckIn = this.lastCheckIns[beaconId];
        if (!lastCheckIn) return true;

        const timeSinceLastCheckIn = Date.now() - lastCheckIn;
        return timeSinceLastCheckIn >= this.CHECK_IN_COOLDOWN;
    }

    /**
     * Record a check-in for cooldown tracking
     */
    recordCheckIn(beaconId: string): void {
        this.lastCheckIns[beaconId] = Date.now();
    }

    /**
     * Parse iBeacon data from manufacturer data
     * iBeacon format: Company ID (2 bytes) + Beacon Type (2 bytes) + UUID (16 bytes) + Major (2 bytes) + Minor (2 bytes) + TX Power (1 byte)
     */
    parseIBeaconData(manufacturerData: any): { uuid: string; major: number; minor: number } | null {
        if (!manufacturerData) return null;

        try {
            // Convert base64 to hex if needed
            const data = manufacturerData;

            // iBeacon manufacturer data starts with 0x004C (Apple) and 0x0215 (iBeacon type)
            // For simplicity, we'll extract UUID, major, minor

            // This is a simplified parser - in production you'd want more robust parsing
            return {
                uuid: 'DETECTED_BEACON', // Placeholder - real implementation would extract UUID
                major: 0,
                minor: 0
            };
        } catch (error) {
            console.error('Error parsing iBeacon data:', error);
            return null;
        }
    }

    /**
     * Check if device matches our known beacons
     * For simulator testing, we'll match by device name containing our beacon identifier
     */
    matchesKnownBeacon(device: Device, knownBeacons: Beacon[]): Beacon | null {
        if (!device || !device.name) return null;

        // Check if device name contains any of our known beacon identifiers
        for (const beacon of knownBeacons) {
            // For simulator testing: match if device name contains the identifier
            if (device.name.includes(beacon.identifier) ||
                device.name.includes('TEST_BEACON') ||
                device.id.includes(beacon.identifier)) {
                return beacon;
            }

            // For real beacons: would parse manufacturer data and match UUID
            // if (device.manufacturerData) {
            //     const beaconData = this.parseIBeaconData(device.manufacturerData);
            //     if (beaconData && beaconData.uuid === beacon.identifier) {
            //         return beacon;
            //     }
            // }
        }

        return null;
    }

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
            // Request permissions first
            await this.requestPermissions();

            // Check if Bluetooth is powered on
            const state = await this.manager.state();
            if (state !== 'PoweredOn') {
                throw new Error('Bluetooth is not enabled. Please enable Bluetooth to use auto-attendance.');
            }

            console.log('Starting BLE scan for beacons...');
            this.isScanning = true;

            // Start scanning for all devices
            // Note: We scan for all devices because iBeacon detection requires parsing manufacturer data
            this.manager.startDeviceScan(
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
            throw error;
        }
    }

    /**
     * Stop scanning for beacons
     */
    stopScanning() {
        if (!this.isScanning) return;

        console.log('Stopping BLE scan...');
        this.manager.stopDeviceScan();
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
