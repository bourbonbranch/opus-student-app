import { useState, useEffect, useCallback, useRef } from 'react';
import BeaconScanner from '../services/BeaconScanner';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Device } from 'react-native-ble-plx';

interface Beacon {
    identifier: string;
    label: string;
}

interface CheckInInfo {
    beacon: Beacon;
    event: string;
    timestamp: Date;
}

export function useBeaconScanner() {
    const { user } = useAuth();
    const [isScanning, setIsScanning] = useState(false);
    const [detectedBeacons, setDetectedBeacons] = useState<Beacon[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [lastCheckIn, setLastCheckIn] = useState<CheckInInfo | null>(null);
    const scannerInitialized = useRef(false);

    // Known beacons configuration
    const knownBeacons: Beacon[] = [
        {
            identifier: 'TEST_BEACON_UUID',
            label: 'Choir Room A (Test)'
        }
    ];

    const handleAutoCheckIn = useCallback(async (beacon: Beacon, device: Device) => {
        if (!user?.email) {
            console.log('No user email available for check-in');
            return;
        }

        try {
            console.log('Attempting auto check-in for beacon:', beacon.identifier);

            const response = await client.post('/auto-attendance/check-in', {
                beacon_identifier: beacon.identifier,
                student_email: user.email
            });

            if (response.data.success) {
                console.log('Auto check-in successful:', response.data);

                BeaconScanner.recordCheckIn(beacon.identifier);

                setLastCheckIn({
                    beacon: beacon,
                    event: response.data.event_name,
                    timestamp: new Date()
                });

                console.log(`✅ Checked in to ${response.data.event_name}`);
            }
        } catch (err: any) {
            console.error('Auto check-in failed:', err);

            if (err.response?.data?.error?.includes('No active')) {
                console.log('No active auto-attendance session for this beacon');
            } else {
                setError(err.response?.data?.error || 'Check-in failed');
            }
        }
    }, [user]);

    const startScanning = useCallback(async () => {
        if (isScanning) return;

        try {
            setError(null);
            await BeaconScanner.startScanning(knownBeacons, handleAutoCheckIn);
            setIsScanning(true);
            console.log('Beacon scanning started');
        } catch (err: any) {
            console.error('Failed to start scanning:', err);
            setError(err.message);
            setIsScanning(false);
        }
    }, [isScanning, handleAutoCheckIn]);

    const stopScanning = useCallback(() => {
        BeaconScanner.stopScanning();
        setIsScanning(false);
        console.log('Beacon scanning stopped');
    }, []);

    const forceCheckIn = useCallback(async (beaconIdentifier = 'TEST_BEACON_UUID') => {
        if (!user?.email) {
            setError('No user logged in');
            return;
        }

        try {
            const response = await client.post('/auto-attendance/check-in', {
                beacon_identifier: beaconIdentifier,
                student_email: user.email
            });

            if (response.data.success) {
                setLastCheckIn({
                    beacon: { identifier: beaconIdentifier, label: 'Manual Check-in' },
                    event: response.data.event_name,
                    timestamp: new Date()
                });

                return response.data;
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || 'Check-in failed';
            setError(errorMsg);
            throw new Error(errorMsg);
        }
    }, [user]);

    useEffect(() => {
        if (user && !scannerInitialized.current) {
            scannerInitialized.current = true;
            startScanning();
        }

        return () => {
            if (scannerInitialized.current) {
                stopScanning();
                scannerInitialized.current = false;
            }
        };
    }, [user]);

    return {
        isScanning,
        detectedBeacons,
        error,
        lastCheckIn,
        startScanning,
        stopScanning,
        forceCheckIn
    };
}
