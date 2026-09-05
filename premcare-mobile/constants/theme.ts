// Premcare Design System — shared tokens between web & mobile
export const colors = {
    // Brand
    primary: '#0A6847',
    primaryLight: '#0E8C5F',
    primaryDark: '#064D34',
    accent: '#1A936F',
    accentLight: '#22B88A',

    // Backgrounds
    bgDark: '#0A0F1E',
    bgCard: '#111827',
    bgCardHover: '#1A2332',
    bgInput: '#1E293B',
    bgOverlay: 'rgba(10, 15, 30, 0.85)',

    // Text
    textPrimary: '#FFFFFF',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    textInverse: '#1A1A2E',

    // Status
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',

    // Misc
    border: '#1E293B',
    borderLight: '#334155',
    divider: 'rgba(148, 163, 184, 0.1)',
    shadow: 'rgba(0, 0, 0, 0.3)',
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
    '5xl': 48,
};

export const borderRadius = {
    sm: 6,
    md: 10,
    lg: 14,
    xl: 20,
    full: 9999,
};

export const fontSize = {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    '2xl': 28,
    '3xl': 34,
    '4xl': 40,
};

export const fontWeight = {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
};

export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.18,
        shadowRadius: 2,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.22,
        shadowRadius: 6,
        elevation: 6,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 12,
    },
};
