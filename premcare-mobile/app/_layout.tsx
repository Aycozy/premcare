import { useEffect, useRef } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { colors } from '../constants/theme';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from '../lib/notifications';
import { ToastContainer } from '../components/ui';
import { LoadingSplash } from '../components/ui/LoadingSplash';

export default function RootLayout() {
    const { isInitialized, session, profile, initialize, isPasswordRecovery } = useAuthStore();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        initialize();
    }, []);

    useEffect(() => {
        const currentPage = segments[1];
        console.log('[Layout] Guard effect | isInitialized:', isInitialized, '| segments:', segments.join('/'), '| session:', !!session, '| profile:', !!profile, '| isPasswordRecovery:', isPasswordRecovery);

        if (!isInitialized) return;

        const inAuthGroup = segments[0] === '(auth)';

        // Password recovery flow: stay on update-password screen.
        // This MUST come before the callback early-return so that when isPasswordRecovery
        // is set to true while still on the callback page, we navigate to update-password.
        if (isPasswordRecovery) {
            console.log('[Layout] isPasswordRecovery=true | currentPage:', currentPage);
            if (currentPage !== 'update-password') {
                console.log('[Layout] → Navigating to update-password');
                router.replace('/(auth)/update-password');
            } else {
                console.log('[Layout] Already on update-password — no redirect needed');
            }
            return;
        }

        // Let the callback page do its own work — never interfere with it
        if (currentPage === 'callback') {
            console.log('[Layout] On callback page — skipping guard');
            return;
        }

        if (!session && !inAuthGroup) {
            console.log('[Layout] No session, not in auth group → login');
            router.replace('/(auth)/login');
        } else if (session && inAuthGroup) {
            // Wait for profile before navigating to dashboard
            if (!profile) {
                console.log('[Layout] Have session but no profile yet — waiting');
                return;
            }

            if (profile.role === 'clinician') {
                console.log('[Layout] → Clinician dashboard');
                router.replace('/(clinician)/(tabs)/dashboard');
            } else {
                console.log('[Layout] → Patient home');
                router.replace('/(patient)/(tabs)/home');
            }
        }
    }, [isInitialized, session, profile, segments, isPasswordRecovery]);

    const notificationListener = useRef<any>(null);
    const responseListener = useRef<any>(null);

    useEffect(() => {
        if (profile && Platform.OS !== 'web') {
            registerForPushNotificationsAsync(profile.id).catch(err => console.error(err));

            notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
                // handle notification received while app is foregrounded
                console.log(notification);
            });

            responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
                // handle when user taps notification
                console.log(response);
            });

            return () => {
                if (notificationListener.current) {
                    notificationListener.current.remove();
                }
                if (responseListener.current) {
                    responseListener.current.remove();
                }
            };
        }
    }, [profile?.id]);

    // Show loading while initializing.
    // During password recovery or while on the callback page, skip the profile-wait check.
    // This prevents trapping the user in the spinner when session exists but profile hasn't
    // been fetched (intentionally skipped during password recovery).
    const onCallbackPage = segments[1] === 'callback';
    if (!isInitialized || (session && !profile && !isPasswordRecovery && !onCallbackPage)) {
        return (
            <>
                <LoadingSplash />
                <StatusBar style="light" />
            </>
        );
    }

    return (
        <>
            <StatusBar style="light" />
            <Slot />
            <ToastContainer />
        </>
    );
}

const styles = StyleSheet.create({});
