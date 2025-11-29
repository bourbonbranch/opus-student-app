import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { FontAwesome } from '@expo/vector-icons';

export default function Home() {
    const { user, ensembles } = useAuth();

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.greeting}>Welcome back,</Text>
                <Text style={styles.name}>{user?.firstName}</Text>
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

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Next Rehearsal</Text>
                        <View style={styles.card}>
                            <Text style={styles.cardBody}>
                                Check the Rehearsals tab for upcoming sessions
                            </Text>
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
