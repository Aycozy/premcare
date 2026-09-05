import { Redirect } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { colors } from '../constants/theme';
import { LoadingSplash } from '../components/ui/LoadingSplash';

export default function Index() {
    const { session, profile } = useAuthStore();

    if (!session) {
        return <Redirect href="/(auth)/login" />;
    }

    // Wait for the profile to load before deciding which dashboard to show
    if (!profile) {
        return <LoadingSplash />;
    }

    if (profile.role === 'clinician') {
        return <Redirect href="/(clinician)/(tabs)/dashboard" />;
    }

    return <Redirect href="/(patient)/(tabs)/home" />;
}

const styles = StyleSheet.create({});
