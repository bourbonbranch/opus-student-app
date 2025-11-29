import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { Stack, Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }

        setLoading(true);
        try {
            await signIn(email, password);
        } catch (error: any) {
            Alert.alert('Login Failed', error.response?.data?.error || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="light" />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>Opus</Text>
                    <Text style={styles.subtitle}>Student Portal</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your email"
                            placeholderTextColor="#666"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your password"
                            placeholderTextColor="#666"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Sign In</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Don't have an account? </Text>
                    <Link href="/(auth)/signup" asChild>
                        <TouchableOpacity>
                            <Text style={styles.link}>Sign Up</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a', // Slate 900
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
        paddingBottom: 40,
    },
    header: {
        marginBottom: 48,
        alignItems: 'center',
    },
    title: {
        fontSize: 42,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 18,
        color: '#94a3b8', // Slate 400
    },
    form: {
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        color: '#e2e8f0', // Slate 200
        fontSize: 14,
        fontWeight: '500',
    },
    input: {
        backgroundColor: '#1e293b', // Slate 800
        borderWidth: 1,
        borderColor: '#334155', // Slate 700
        borderRadius: 12,
        padding: 16,
        color: '#fff',
        fontSize: 16,
    },
    button: {
        backgroundColor: '#3b82f6', // Blue 500
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    footerText: {
        color: '#94a3b8',
        fontSize: 14,
    },
    link: {
        color: '#3b82f6',
        fontSize: 14,
        fontWeight: '600',
    },
});
