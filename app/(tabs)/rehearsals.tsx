import { View, Text, StyleSheet, FlatList } from 'react-native';

const MOCK_REHEARSALS = [
    { id: '1', title: 'Chamber Choir', date: 'Tomorrow', time: '7:00 PM - 9:00 PM', location: 'Main Hall' },
    { id: '2', title: 'Sectionals', date: 'Wed, Nov 29', time: '6:00 PM - 7:30 PM', location: 'Room 204' },
    { id: '3', title: 'Full Rehearsal', date: 'Fri, Dec 1', time: '7:00 PM - 9:30 PM', location: 'Main Hall' },
];

export default function Rehearsals() {
    return (
        <View style={styles.container}>
            <FlatList
                data={MOCK_REHEARSALS}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.dateBox}>
                            <Text style={styles.dateText}>{item.date.split(',')[0]}</Text>
                        </View>
                        <View style={styles.info}>
                            <Text style={styles.title}>{item.title}</Text>
                            <Text style={styles.time}>{item.time}</Text>
                            <Text style={styles.location}>{item.location}</Text>
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
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        width: 60,
    },
    dateText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
        textAlign: 'center',
    },
    info: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    time: {
        fontSize: 14,
        color: '#94a3b8',
        marginBottom: 2,
    },
    location: {
        fontSize: 12,
        color: '#64748b',
    },
});
