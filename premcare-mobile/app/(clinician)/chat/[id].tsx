import React, { useEffect, useState, useRef } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput,
    KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../stores/authStore';
import { useMessageStore } from '../../../stores/messageStore';
import type { Message } from '../../../stores/messageStore';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../../constants/theme';
import { format, parseISO, isToday, isYesterday } from 'date-fns';

export default function ClinicianChatScreen() {
    const router = useRouter();
    const { id: patientId } = useLocalSearchParams<{ id: string }>();
    const { profile } = useAuthStore();
    const {
        messages, fetchMessages, sendMessage, getOrCreateConversation,
        markMessagesAsRead, subscribeToMessages,
    } = useMessageStore();
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [inputText, setInputText] = useState('');
    const [sending, setSending] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        const init = async () => {
            if (!profile || !patientId) return;
            const convoId = await getOrCreateConversation(patientId, profile.id);
            if (convoId) {
                setConversationId(convoId);
                await fetchMessages(convoId);
                await markMessagesAsRead(convoId, profile.id);
            }
        };
        init();
    }, [profile, patientId]);

    useEffect(() => {
        if (!conversationId) return;
        const unsubscribe = subscribeToMessages(conversationId);
        return unsubscribe;
    }, [conversationId]);

    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        }
    }, [messages.length]);

    const handleSend = async () => {
        if (!inputText.trim() || !conversationId || !profile) return;
        const text = inputText.trim();
        setInputText('');
        setSending(true);
        await sendMessage(conversationId, profile.id, text);
        setSending(false);
    };

    const formatMessageTime = (dateStr: string) => format(parseISO(dateStr), 'h:mm a');

    const formatDateSeparator = (dateStr: string) => {
        const date = parseISO(dateStr);
        if (isToday(date)) return 'Today';
        if (isYesterday(date)) return 'Yesterday';
        return format(date, 'EEEE, MMM d');
    };

    const shouldShowDate = (index: number) => {
        if (index === 0) return true;
        const current = format(parseISO(messages[index].created_at), 'yyyy-MM-dd');
        const prev = format(parseISO(messages[index - 1].created_at), 'yyyy-MM-dd');
        return current !== prev;
    };

    const renderMessage = ({ item, index }: { item: Message; index: number }) => {
        const isMe = item.sender_id === profile?.id;
        const showDate = shouldShowDate(index);
        return (
            <>
                {showDate && (
                    <View style={styles.dateSeparator}>
                        <Text style={styles.dateSeparatorText}>{formatDateSeparator(item.created_at)}</Text>
                    </View>
                )}
                <View style={[styles.messageBubbleRow, isMe && styles.messageBubbleRowMe]}>
                    <View style={[styles.messageBubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
                        <Text style={styles.messageText}>{item.content}</Text>
                        <Text style={[styles.messageTime, isMe && styles.messageTimeMe]}>
                            {formatMessageTime(item.created_at)}
                            {isMe && <Text> {item.is_read ? '✓✓' : '✓'}</Text>}
                        </Text>
                    </View>
                </View>
            </>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <View style={styles.headerAvatar}>
                        <Text style={styles.headerAvatarText}>P</Text>
                    </View>
                    <Text style={styles.headerName}>Patient</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderMessage}
                    contentContainerStyle={styles.messagesList}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyChat}>
                            <Ionicons name="chatbubble-ellipses-outline" size={48} color={colors.textMuted} />
                            <Text style={styles.emptyChatText}>Send a message to your patient</Text>
                        </View>
                    }
                />
                <View style={styles.inputBar}>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Type a message..."
                            placeholderTextColor={colors.textMuted}
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                            maxLength={1000}
                        />
                    </View>
                    <TouchableOpacity
                        style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
                        onPress={handleSend}
                        disabled={!inputText.trim() || sending}
                    >
                        <Ionicons name="send" size={20} color={inputText.trim() ? colors.textPrimary : colors.textMuted} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.bgDark },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
        borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 12, backgroundColor: colors.bgCard,
        justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border,
    },
    headerInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    headerAvatar: {
        width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primaryDark,
        justifyContent: 'center', alignItems: 'center',
    },
    headerAvatarText: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.textPrimary },
    headerName: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.textPrimary },
    messagesList: { padding: spacing.xl, paddingBottom: spacing.md, flexGrow: 1, justifyContent: 'flex-end' },
    dateSeparator: { alignItems: 'center', marginVertical: spacing.lg },
    dateSeparatorText: {
        fontSize: fontSize.xs, color: colors.textMuted, backgroundColor: colors.bgCard,
        paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.full,
    },
    messageBubbleRow: { flexDirection: 'row', marginBottom: spacing.sm, justifyContent: 'flex-start' },
    messageBubbleRowMe: { justifyContent: 'flex-end' },
    messageBubble: { maxWidth: '78%', borderRadius: borderRadius.lg, padding: spacing.md, paddingBottom: spacing.sm },
    bubbleMe: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
    bubbleThem: { backgroundColor: colors.bgCard, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: colors.border },
    messageText: { fontSize: fontSize.base, color: colors.textPrimary, lineHeight: 22 },
    messageTime: { fontSize: 10, color: colors.textMuted, marginTop: 4, textAlign: 'right' },
    messageTimeMe: { color: 'rgba(255,255,255,0.6)' },
    emptyChat: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing['5xl'] },
    emptyChatText: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.md, textAlign: 'center' },
    inputBar: {
        flexDirection: 'row', alignItems: 'flex-end',
        paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
        borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.bgDark, gap: spacing.sm,
    },
    inputContainer: {
        flex: 1, backgroundColor: colors.bgCard, borderRadius: borderRadius.xl,
        borderWidth: 1, borderColor: colors.border,
        paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, maxHeight: 100,
    },
    textInput: { fontSize: fontSize.base, color: colors.textPrimary, maxHeight: 80 },
    sendBtn: {
        width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary,
        justifyContent: 'center', alignItems: 'center',
    },
    sendBtnDisabled: { backgroundColor: colors.bgCard },
});
