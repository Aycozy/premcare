import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Profile } from '../lib/types';

export interface Conversation {
    id: string;
    patient_id: string;
    clinician_id: string;
    last_message_text: string | null;
    last_message_at: string | null;
    created_at: string;
    patient?: Profile;
    clinician?: Profile;
}

export interface Message {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    is_read: boolean;
    created_at: string;
}

interface MessageState {
    conversations: Conversation[];
    messages: Message[];
    activeConversation: Conversation | null;
    isLoading: boolean;
    totalUnread: number;

    // Actions
    fetchConversations: (userId: string, role: 'patient' | 'clinician') => Promise<void>;
    fetchMessages: (conversationId: string) => Promise<void>;
    sendMessage: (conversationId: string, senderId: string, content: string) => Promise<{ error: string | null }>;
    getOrCreateConversation: (patientId: string, clinicianId: string) => Promise<string | null>;
    markMessagesAsRead: (conversationId: string, userId: string) => Promise<void>;
    subscribeToMessages: (conversationId: string) => () => void;
    fetchUnreadCount: (userId: string) => Promise<void>;
}

export const useMessageStore = create<MessageState>((set, get) => ({
    conversations: [],
    messages: [],
    activeConversation: null,
    isLoading: false,
    totalUnread: 0,

    fetchConversations: async (userId: string, role: 'patient' | 'clinician') => {
        set({ isLoading: true });
        try {
            const column = role === 'patient' ? 'patient_id' : 'clinician_id';
            const { data, error } = await supabase
                .from('conversations')
                .select(`
                    *,
                    patient:profiles!conversations_patient_id_fkey(*),
                    clinician:profiles!conversations_clinician_id_fkey(*)
                `)
                .eq(column, userId)
                .order('last_message_at', { ascending: false, nullsFirst: false });

            if (error) throw error;
            set({ conversations: (data as Conversation[]) || [], isLoading: false });
        } catch (error) {
            console.error('Fetch conversations error:', error);
            set({ isLoading: false });
        }
    },

    fetchMessages: async (conversationId: string) => {
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true })
                .limit(100);

            if (error) throw error;
            set({ messages: (data as Message[]) || [] });
        } catch (error) {
            console.error('Fetch messages error:', error);
        }
    },

    sendMessage: async (conversationId: string, senderId: string, content: string) => {
        try {
            const { error } = await supabase
                .from('messages')
                .insert({
                    conversation_id: conversationId,
                    sender_id: senderId,
                    content: content.trim(),
                });

            if (error) return { error: error.message };
            return { error: null };
        } catch (err: any) {
            return { error: err.message };
        }
    },

    getOrCreateConversation: async (patientId: string, clinicianId: string) => {
        try {
            // Check if conversation exists
            const { data: existing } = await supabase
                .from('conversations')
                .select('id')
                .eq('patient_id', patientId)
                .eq('clinician_id', clinicianId)
                .maybeSingle();

            if (existing) return existing.id;

            // Create new conversation
            const { data, error } = await supabase
                .from('conversations')
                .insert({ patient_id: patientId, clinician_id: clinicianId })
                .select('id')
                .single();

            if (error) throw error;
            return data.id;
        } catch (error) {
            console.error('Get/create conversation error:', error);
            return null;
        }
    },

    markMessagesAsRead: async (conversationId: string, userId: string) => {
        try {
            await supabase
                .from('messages')
                .update({ is_read: true })
                .eq('conversation_id', conversationId)
                .neq('sender_id', userId)
                .eq('is_read', false);

            set((state) => ({
                messages: state.messages.map(m =>
                    m.conversation_id === conversationId && m.sender_id !== userId
                        ? { ...m, is_read: true }
                        : m
                ),
            }));
        } catch (error) {
            console.error('Mark messages read error:', error);
        }
    },

    subscribeToMessages: (conversationId: string) => {
        const channel = supabase
            .channel(`messages:${conversationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`,
                },
                (payload) => {
                    const newMessage = payload.new as Message;
                    set((state) => ({
                        messages: [...state.messages, newMessage],
                    }));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    },

    fetchUnreadCount: async (userId: string) => {
        try {
            // Get all conversations this user is part of
            const { data: convos } = await supabase
                .from('conversations')
                .select('id')
                .or(`patient_id.eq.${userId},clinician_id.eq.${userId}`);

            if (!convos || convos.length === 0) {
                set({ totalUnread: 0 });
                return;
            }

            const convoIds = convos.map(c => c.id);
            const { count } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .in('conversation_id', convoIds)
                .neq('sender_id', userId)
                .eq('is_read', false);

            set({ totalUnread: count || 0 });
        } catch (error) {
            console.error('Fetch unread count error:', error);
        }
    },
}));
