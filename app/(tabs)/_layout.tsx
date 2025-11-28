import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { Redirect } from 'expo-router';

export default function TabLayout() {
    const { user, isLoading } = useAuth();

    // Protect the route
    if (!isLoading && !user) {
        return <Redirect href="/(auth)/login" />;
    }

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#3b82f6', // Blue 500
                tabBarInactiveTintColor: '#94a3b8', // Slate 400
                tabBarStyle: {
                    backgroundColor: '#0f172a', // Slate 900
                    borderTopColor: '#1e293b', // Slate 800
                },
                headerStyle: {
                    backgroundColor: '#0f172a', // Slate 900
                },
                headerTintColor: '#fff',
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => <FontAwesome name="home" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="rehearsals"
                options={{
                    title: 'Rehearsals',
                    tabBarIcon: ({ color }) => <FontAwesome name="calendar" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="music"
                options={{
                    title: 'Music',
                    tabBarIcon: ({ color }) => <FontAwesome name="music" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color }) => <FontAwesome name="user" size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}
