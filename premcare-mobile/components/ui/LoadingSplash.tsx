import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, fontWeight, spacing } from '../../constants/theme';

export function LoadingSplash() {
    const pulseAnim = useRef(new Animated.Value(0.5)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0.5,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [pulseAnim]);

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.iconContainer, { opacity: pulseAnim, transform: [{ scale: pulseAnim.interpolate({ inputRange: [0.5, 1], outputRange: [0.95, 1.05] }) }] }]}>
                <Ionicons name="medical" size={64} color={colors.primary} />
            </Animated.View>
            <Text style={styles.brandText}>PREMCARE</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.bgDark,
    },
    iconContainer: {
        marginBottom: spacing.xl,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    brandText: {
        fontSize: fontSize['2xl'],
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
        letterSpacing: 4,
    },
});
