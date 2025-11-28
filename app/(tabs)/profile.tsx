import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { FontAwesome } from '@expo/vector-icons';

export default function Profile() {
    const { user, signOut } = useAuth();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </Text>
                </View>
                <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
                <Text style={styles.email}>{user?.email}</Text>
                <View style={styles.roleTag}>
                    <Text style={styles.roleText}>{user?.role}</Text>
                </View>
            </View>

            <View style={styles.menu}>
                <TouchableOpacity style={styles.menuItem}>
                    <FontAwesome name="gear" size={20} color="#94a3b8" />
                    <Text style={styles.menuText}>Settings</Text>
                    <FontAwesome name="chevron-right" size={16} color="#64748b" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <FontAwesome name="bell" size={20} color="#94a3b8" />
                    <Text style={styles.menuText}>Notifications</Text>
                    <FontAwesome name="chevron-right" size={16} color="#64748b" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <FontAwesome name="question-circle" size={20} color="#94a3b8" />
                    <Text style={styles.menuText}>Help & Support</Text>
                    <FontAwesome name="chevron-right" size={16} color="#64748b" />
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
                <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
        marginTop: 20,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#3b82f6',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        borderWidth: 4,
        borderColor: '#1e293b',
    },
    avatarText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#fff',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    email: {
        fontSize: 16,
        color: '#94a3b8',
        marginBottom: 12,
    },
    roleTag: {
        backgroundColor: '#1e293b',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#334155',
    },
    roleText: {
        color: '#cbd5e1',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    menu: {
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 8,
        borderWidth: 1,
        borderColor: '#334155',
        marginBottom: 24,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#334155',
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        color: '#fff',
    },
    logoutButton: {
        backgroundColor: '#ef4444', // Red 500
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    logoutText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
