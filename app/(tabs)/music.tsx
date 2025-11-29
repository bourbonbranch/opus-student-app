import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Linking } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import client from '../../src/api/client';

interface MusicFile {
    id: number;
    ensemble_id: number;
    name: string;
    url: string;
    type: string;
    created_at: string;
}

export default function Music() {
    const { ensembles } = useAuth();
    const [musicFiles, setMusicFiles] = useState<MusicFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchMusic = useCallback(async () => {
        if (ensembles.length === 0) {
            setMusicFiles([]);
            setLoading(false);
            return;
        }

        try {
            const allFiles: MusicFile[] = [];

            // Fetch files for each ensemble
            for (const ensemble of ensembles) {
                const response = await client.get(`/api/ensembles/${ensemble.ensemble_id}/files`);
                const ensembleFiles = response.data.map((f: any) => ({
                    ...f,
                    ensemble_name: ensemble.ensemble_name // Add ensemble name to display
                }));
                allFiles.push(...ensembleFiles);
            }

            // Sort by name
            allFiles.sort((a, b) => a.name.localeCompare(b.name));

            setMusicFiles(allFiles);
        } catch (error) {
            console.error('Failed to fetch music:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [ensembles]);

    useEffect(() => {
        fetchMusic();
    }, [fetchMusic]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchMusic();
    }, [fetchMusic]);

    const handlePress = (url: string) => {
        if (url) {
            Linking.openURL(url);
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
                data={musicFiles}
                keyExtractor={(item) => `${item.id}-${item.ensemble_id}`}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No music files found</Text>
                    </View>
                }
                renderItem={({ item }: { item: MusicFile & { ensemble_name?: string } }) => (
                    <TouchableOpacity style={styles.card} onPress={() => handlePress(item.url)}>
                        <View style={styles.iconBox}>
                            <FontAwesome name="music" size={20} color="#fff" />
                        </View>
                        <View style={styles.info}>
                            <Text style={styles.ensembleName}>{item.ensemble_name}</Text>
                            <Text style={styles.title}>{item.name}</Text>
                            <Text style={styles.type}>{item.type}</Text>
                        </View>
                        <FontAwesome name="chevron-right" size={16} color="#64748b" />
                    </TouchableOpacity>
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
        gap: 12,
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
    iconBox: {
        backgroundColor: '#8b5cf6', // Violet 500
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
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
        marginBottom: 2,
    },
    type: {
        fontSize: 12,
        color: '#64748b',
        textTransform: 'uppercase',
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
