import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserLocation } from '../context/LocationContext';
import { Header } from '../components/common/Header';
import { Send, Bot, User, AlertTriangle, Sparkles } from 'lucide-react-native';
import api from '../services/api';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const WELCOME: Message = {
  role: 'model',
  text: "Hi! I'm **Suraksha Assistant** 🤝\n\nI can help you with:\n• **Medical guidance** — describe symptoms for home remedies\n• **Nearest relief camps** — based on your location\n• **Flood & disaster safety** — what to do, where to go\n• **First aid steps** — for injuries and emergencies\n\nHow can I help you right now?",
};

const QUICK_CHIPS = [
  'Nearest relief camp',
  'Flood safety tips',
  'First aid for cuts',
  'Emergency numbers',
  'Water purification',
];

export default function ChatbotScreen() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const userLocation = useUserLocation();

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, loading]);

  const buildHistory = (msgs: Message[]) =>
    msgs.slice(1).map(m => ({ role: m.role, parts: [{ text: m.text }] }));

  const send = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;

    const userMsg: Message = { role: 'user', text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/chatbot/message', {
        message: text,
        history: buildHistory(messages),
        lat: userLocation?.lat,
        lng: userLocation?.lng,
      });
      setMessages(prev => [...prev, { role: 'model', text: data.reply }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'model',
        text: 'Could not connect right now. Please check your connection and try again.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Suraksha Assistant" subtitle="AI-powered disaster & health guide" showBack />

      {/* Emergency bar */}
      <View style={styles.emergencyBar}>
        <AlertTriangle size={11} color="#fca5a5" strokeWidth={2.5} />
        <Text style={styles.emergencyText}>  Life emergency? Call 1990 immediately</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg, i) => (
            <View
              key={i}
              style={[
                styles.bubbleRow,
                msg.role === 'user' ? styles.bubbleRowRight : styles.bubbleRowLeft,
              ]}
            >
              {msg.role === 'model' && (
                <View style={styles.avatar}>
                  <Bot size={14} color="#06b6d4" strokeWidth={2} />
                </View>
              )}
              <View style={[styles.bubble, msg.role === 'user' ? styles.userBubble : styles.botBubble]}>
                {msg.role === 'model' && (
                  <Text style={styles.botLabel}>🤖 Suraksha</Text>
                )}
                <FormattedText text={msg.text} isUser={msg.role === 'user'} />
              </View>
              {msg.role === 'user' && (
                <View style={[styles.avatar, styles.avatarBlue]}>
                  <User size={14} color="#93c5fd" strokeWidth={2} />
                </View>
              )}
            </View>
          ))}

          {loading && (
            <View style={styles.bubbleRowLeft}>
              <View style={styles.avatar}>
                <Bot size={14} color="#06b6d4" strokeWidth={2} />
              </View>
              <View style={styles.botBubble}>
                <Text style={styles.botLabel}>🤖 Suraksha</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <ActivityIndicator size="small" color="#06b6d4" />
                  <Text style={styles.botText}>Thinking…</Text>
                </View>
              </View>
            </View>
          )}

          {/* Quick suggestion chips — only at start */}
          {messages.length === 1 && !loading && (
            <View style={styles.chipsSection}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <Sparkles size={12} color="#a78bfa" strokeWidth={2} />
                <Text style={styles.chipsLabel}>Quick questions</Text>
              </View>
              <View style={styles.chipsWrap}>
                {QUICK_CHIPS.map(chip => (
                  <TouchableOpacity
                    key={chip}
                    onPress={() => send(chip)}
                    style={styles.chip}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.chipText}>{chip}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask about safety, health, relief…"
            placeholderTextColor="#475569"
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={() => send()}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            onPress={() => send()}
            disabled={!input.trim() || loading}
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            activeOpacity={0.8}
          >
            <Send size={18} color="white" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Renders **bold** and • bullets as formatted text
function FormattedText({ text, isUser }: { text: string; isUser: boolean }) {
  const lines = text.split('\n');
  return (
    <View>
      {lines.map((line, li) => {
        const parts: React.ReactNode[] = [];
        const boldRegex = /\*\*(.*?)\*\*/g;
        let last = 0;
        let match: RegExpExecArray | null;
        let key = 0;
        while ((match = boldRegex.exec(line)) !== null) {
          if (match.index > last) {
            parts.push(
              <Text key={key++} style={isUser ? styles.userText : styles.botText}>
                {line.slice(last, match.index)}
              </Text>
            );
          }
          parts.push(
            <Text key={key++} style={[isUser ? styles.userText : styles.botText, styles.bold]}>
              {match[1]}
            </Text>
          );
          last = match.index + match[0].length;
        }
        if (last < line.length) {
          parts.push(
            <Text key={key++} style={isUser ? styles.userText : styles.botText}>
              {line.slice(last)}
            </Text>
          );
        }
        return (
          <Text key={li} style={[isUser ? styles.userText : styles.botText, li > 0 && { marginTop: 2 }]}>
            {line.startsWith('•') ? (
              <Text>{'  '}{parts}</Text>
            ) : (
              parts.length > 0 ? parts : <Text>{line}</Text>
            )}
          </Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  emergencyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7f1d1d',
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  emergencyText: { color: '#fca5a5', fontSize: 11, fontWeight: '800' },
  messages: { flex: 1, backgroundColor: '#0f172a' },

  bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12, gap: 8 },
  bubbleRowLeft: { alignSelf: 'flex-start', maxWidth: '90%' },
  bubbleRowRight: { alignSelf: 'flex-end', flexDirection: 'row-reverse', maxWidth: '85%' },

  avatar: {
    width: 28, height: 28, borderRadius: 10,
    backgroundColor: 'rgba(6,182,212,0.15)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(6,182,212,0.2)',
  },
  avatarBlue: {
    backgroundColor: 'rgba(37,99,235,0.2)',
    borderColor: 'rgba(37,99,235,0.25)',
  },

  bubble: { borderRadius: 18, padding: 12, flexShrink: 1 },
  userBubble: {
    backgroundColor: '#2563eb',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: '#1e293b',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  botLabel: { fontSize: 10, color: '#06b6d4', fontWeight: '800', marginBottom: 5 },
  userText: { color: '#fff', fontSize: 14, lineHeight: 21 },
  botText: { color: '#e2e8f0', fontSize: 14, lineHeight: 22 },
  bold: { fontWeight: '800' },

  chipsSection: { marginTop: 8 },
  chipsLabel: { color: '#7c3aed', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: 'rgba(124,58,237,0.12)',
    borderWidth: 1, borderColor: 'rgba(124,58,237,0.3)',
    borderRadius: 50, paddingHorizontal: 14, paddingVertical: 8,
  },
  chipText: { color: '#a78bfa', fontSize: 12, fontWeight: '700' },

  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end',
    padding: 12, gap: 8,
    backgroundColor: '#131f33',
    borderTopWidth: 1, borderTopColor: 'rgba(6,182,212,0.15)',
  },
  input: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    paddingHorizontal: 14, paddingVertical: 10,
    color: '#fff', fontSize: 14, maxHeight: 100,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: '#06b6d4',
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.35 },
});
