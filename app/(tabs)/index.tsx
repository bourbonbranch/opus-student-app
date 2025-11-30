import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { FontAwesome } from '@expo/vector-icons';
import { useState, useEffect, useCallback } from 'react';
import client from '../../src/api/client';
import { format } from 'date-fns';
import { useBeaconScanner } from '../../src/hooks/useBeaconScanner';

export default function Home() {
    const { user, ensembles } = useAuth();
    const [nextRehearsal, setNextRehearsal] = useState<any>(null);
    const [refreshing, setRefreshing] = useState(false);
    const { isScanning, lastCheckIn, error: scanError, forceCheckIn } = useBeaconScanner();

    const fetchNextRehearsal = useCallback(async () => {
        if (ensembles.length === 0) {
            setNextRehearsal(null);
            return;
        }

        try {
            const allRehearsals: any[] = [];

            for (const ensemble of ensembles) {
                const response = await client.get(`/api/students/rehearsals?ensembleId=${ensemble.ensemble_id}`);
                const ensembleRehearsals = response.data.map((r: any) => ({
                    ...r,
                    ensemble_name: ensemble.ensemble_name
                }));
                allRehearsals.push(...ensembleRehearsals);
            }

            allRehearsals.sort((a, b) => {
                const dateA = new Date(a.start_time);
                const dateB = new Date(b.start_time);
                return dateA.getTime() - dateB.getTime();
            });

            if (allRehearsals.length > 0) {
                setNextRehearsal(allRehearsals[0]);
            } else {
                setNextRehearsal(null);
            }
        } catch (error) {
            console.error('Failed to fetch next rehearsal:', error);
        } finally {
            setRefreshing(false);
        }
    }, [ensembles]);

    useEffect(() => {
        fetchNextRehearsal();
    }, [fetchNextRehearsal]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchNextRehearsal();
    }, [fetchNextRehearsal]);

    const formatTime = (time: string) => {
        if (!time) return '';
        try {
            return format(new Date(time), 'h:mm a');
        } catch {
            return '';
        }
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        } else {
            return format(date, 'EEE, MMM d');
        }
    };

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
            }
        >
            <View style={styles.header}>
                <Text style={styles.greeting}>Welcome back,</Text>
                <Text style={styles.name}>{user?.firstName}</Text>
                <Text style={{ color: 'yellow', fontSize: 12 }}>Debug: {user?.email}</Text>
            </View>

            {ensembles.length > 0 ? (
                <>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Your Ensembles</Text>
                        {ensembles.map((ensemble) => (
                            <View key={ensemble.id} style={[styles.card, { marginBottom: 12 }]}>
                                <Text style={styles.cardTitle}>{ensemble.ensemble_name}</Text>
                                <Text style={styles.cardSubtitle}>
                                    {ensemble.section && ensemble.part
                                        ? `${ensemble.section} - ${ensemble.part}`
                                        : ensemble.section || ensemble.part || 'Member'}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* Auto-Attendance Status */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Auto Check-In</Text>
                        <View style={[styles.card, { backgroundColor: isScanning ? '#10b98120' : '#6b728020' }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                                <FontAwesome
                                    name={isScanning ? "bluetooth" : "bluetooth-b"}
                                    size={20}
                                    color={isScanning ? "#10b981" : "#6b7280"}
                                />
                                <Text style={[styles.cardTitle, { marginLeft: 8, marginBottom: 0 }]}>
                                    {isScanning ? "Scanning for beacons..." : "Not scanning"}
                                </Text>
                            </View>

                            {lastCheckIn && (
                                <View style={{ marginTop: 8, padding: 12, backgroundColor: '#10b98110', borderRadius: 8 }}>
                                    <Text style={{ color: '#10b981', fontWeight: '600', marginBottom: 4 }}>
                                        ✅ Last Check-In
                                    </Text>
                                    <Text style={{ color: '#fff', fontSize: 14 }}>
                                        {lastCheckIn.event}
                                    </Text>
                                    <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 4 }}>
                                        {lastCheckIn.timestamp.toLocaleTimeString()}
                                    </Text>
                                </View>
                            )}

                            {scanError && (
                                <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 8 }}>
                                    {scanError}
                                </Text>
                            )}

                            {/* Test Button for Simulator */}
                            <TouchableOpacity
                                style={{
                                    marginTop: 12,
                                    padding: 12,
                                    backgroundColor: '#3b82f6',
                                    borderRadius: 8,
                                    alignItems: 'center'
                                }}
                                onPress={async () => {
                                    try {
                                        await forceCheckIn();
                                        Alert.alert('Success', 'Check-in successful!');
                                    } catch (err: any) {
                                        Alert.alert('Error', err.message);
                                    }
                                }}
                            >
                                <Text style={{ color: '#fff', fontWeight: '600' }}>
                                    Test Check-In (Simulator)
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Next Rehearsal</Text>
                        <View style={styles.card}>
                            {nextRehearsal ? (
                                <>
                                    <View style={styles.cardHeader}>
                                        <FontAwesome name="calendar" size={20} color="#3b82f6" />
                                        <Text style={styles.cardDate}>
                                            {formatDate(nextRehearsal.start_time)}, {formatTime(nextRehearsal.start_time)}
                                        </Text>
                                    </View>
                                    <Text style={styles.cardTitle}>{nextRehearsal.type || 'Rehearsal'}</Text>
                                    <Text style={styles.cardSubtitle}>{nextRehearsal.location}</Text>
                                    <Text style={[styles.cardSubtitle, { marginTop: 4, color: '#94a3b8' }]}>
                                        {nextRehearsal.ensemble_name}
                                    </Text>
                                </>
                            ) : (
                                <Text style={styles.cardBody}>
                                    No upcoming rehearsals scheduled.
                                </Text>
                            )}
                        </View>
                    </View>
                </>
            ) : (
                <View style={styles.section}>
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>No Ensembles Found</Text>
                        <Text style={styles.cardBody}>
                            Your account hasn't been linked to any ensembles yet.
                            Make sure your director has added your email to the roster.
                        </Text>
                    </View>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
        padding: 20,
    },
    header: {
        marginTop: 20,
        marginBottom: 30,
    },
    greeting: {
        fontSize: 18,
        color: '#94a3b8',
    },
    name: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#e2e8f0',
        marginBottom: 12,
    },
    card: {
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#334155',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    cardDate: {
        color: '#3b82f6',
        fontWeight: '600',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#94a3b8',
    },
    cardBody: {
        fontSize: 14,
        color: '#cbd5e1',
        lineHeight: 20,
    },
});
