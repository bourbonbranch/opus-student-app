import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const MOCK_MUSIC = [
    { id: '1', title: 'O Magnum Mysterium', composer: 'Morten Lauridsen', part: 'Tenor 1' },
    { id: '2', title: 'Sicut Cervus', composer: 'Palestrina', part: 'Tenor' },
    { id: '3', title: 'The Road Home', composer: 'Stephen Paulus', part: 'Tenor 1' },
];

export default function Music() {
    return (
        <View style={styles.container}>
            <FlatList
                data={MOCK_MUSIC}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.card}>
                        <View style={styles.iconBox}>
                            <FontAwesome name="music" size={20} color="#fff" />
                        </View>
                        <View style={styles.info}>
                            <Text style={styles.title}>{item.title}</Text>
                            <Text style={styles.composer}>{item.composer}</Text>
                            <Text style={styles.part}>{item.part}</Text>
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
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 2,
    },
    composer: {
        fontSize: 14,
        color: '#94a3b8',
        marginBottom: 2,
    },
    part: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '500',
    },
});
