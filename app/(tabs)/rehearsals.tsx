import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../src/context/AuthContext';
import client from '../../src/api/client';
import { format } from 'date-fns';

interface Rehearsal {
    id: number;
    ensemble_id: number;
    // date: string; // Deprecated
    start_time: string; // ISO string
    end_time: string; // ISO string
    location: string;
    description: string;
    type: string;
}

export default function Rehearsals() {
    const { ensembles } = useAuth();
    const [rehearsals, setRehearsals] = useState<Rehearsal[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchRehearsals = useCallback(async () => {
        if (ensembles.length === 0) {
            setRehearsals([]);
            setLoading(false);
            return;
        }

        try {
            const allRehearsals: Rehearsal[] = [];

            // Fetch rehearsals for each ensemble
            for (const ensemble of ensembles) {
                const response = await client.get(`/api/students/rehearsals?ensembleId=${ensemble.ensemble_id}`);
                const ensembleRehearsals = response.data.map((r: any) => ({
                    ...r,
                    ensemble_name: ensemble.ensemble_name // Add ensemble name to display
                }));
                allRehearsals.push(...ensembleRehearsals);
            }

            // Sort by date and time
            allRehearsals.sort((a, b) => {
                const dateA = new Date(a.start_time);
                const dateB = new Date(b.start_time);
                return dateA.getTime() - dateB.getTime();
            });

            setRehearsals(allRehearsals);
        } catch (error) {
            console.error('Failed to fetch rehearsals:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [ensembles]);

    useEffect(() => {
        fetchRehearsals();
    }, [fetchRehearsals]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchRehearsals();
    }, [fetchRehearsals]);

    const formatTime = (dateStr: string) => {
        if (!dateStr) return '';
        try {
            return format(new Date(dateStr), 'h:mm a');
        } catch {
            return '';
        }
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        try {
            return format(new Date(dateStr), 'EEE, MMM d');
        } catch {
            return '';
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={rehearsals}
                keyExtractor={(item) => `${item.id}-${item.ensemble_id}`}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No upcoming rehearsals</Text>
                    </View>
                }
                renderItem={({ item }: { item: Rehearsal & { ensemble_name?: string } }) => (
                    <View style={styles.card}>
                        <View style={styles.dateBox}>
                            <Text style={styles.dateText}>{formatDate(item.start_time).split(',')[0]}</Text>
                            <Text style={styles.dayText}>{new Date(item.start_time).getDate()}</Text>
                        </View>
                        <View style={styles.info}>
                            <Text style={styles.ensembleName}>{item.ensemble_name}</Text>
                            <Text style={styles.title}>{(item as any).title || item.type || 'Rehearsal'}</Text>
                            <Text style={styles.time}>{formatTime(item.start_time)}</Text>
                            <Text style={styles.location}>{item.location || item.description || ''}</Text>
                        </View>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        padding: 20,
        gap: 16,
    },
    card: {
        backgroundColor: '#1e293b',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        borderWidth: 1,
        borderColor: '#334155',
    },
    dateBox: {
        backgroundColor: '#3b82f6',
        padding: 8,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        width: 60,
        height: 60,
    },
    dateText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
        textTransform: 'uppercase',
    },
    dayText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
    info: {
        flex: 1,
    },
    ensembleName: {
        fontSize: 12,
        color: '#94a3b8',
        marginBottom: 2,
        textTransform: 'uppercase',
        fontWeight: '600',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    time: {
        fontSize: 14,
        color: '#cbd5e1',
        marginBottom: 2,
    },
    location: {
        fontSize: 12,
        color: '#64748b',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: '#94a3b8',
        fontSize: 16,
    },
});
