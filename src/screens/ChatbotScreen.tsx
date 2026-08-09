import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { useUserLocation } from '../context/LocationContext';
import { Header } from '../components/common/Header';

const API = 'http://192.168.8.121:3001/api/chatbot/message';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const WELCOME: Message = {
  role: 'model',
  text: 'Hi! I\'m your Suraksha health & safety assistant 🤝\n\nDescribe any symptom or problem — I\'ll ask what you have at home and give you a remedy.\n\nWhat can I help you with?',
};

export default function ChatbotScreen() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const userLocation = useUserLocation();

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, loading]);

  const buildHistory = (msgs: Message[]) =>
    msgs.slice(1).map(m => ({ role: m.role, parts: [{ text: m.text }] }));

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: 'user', text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const { data } = await axios.post(API, {
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
      <Header title="Health Assistant" subtitle="AI-powered home remedy guide" showBack />

      {/* Emergency bar */}
      <View style={styles.emergencyBar}>
        <Text style={styles.emergencyText}>⚠ Life emergency? Call 1990 immediately</Text>
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
                styles.bubble,
                msg.role === 'user' ? styles.userBubble : styles.botBubble,
              ]}
            >
              {msg.role === 'model' && (
                <Text style={styles.botLabel}>🤖 Suraksha</Text>
              )}
              <Text style={msg.role === 'user' ? styles.userText : styles.botText}>
                {msg.text}
              </Text>
            </View>
          ))}

          {loading && (
            <View style={styles.botBubble}>
              <Text style={styles.botLabel}>🤖 Suraksha</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <ActivityIndicator size="small" color="#06b6d4" />
                <Text style={styles.botText}>Thinking…</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Describe your symptom…"
            placeholderTextColor="#64748b"
            multiline
            maxLength={500}
            onSubmitEditing={send}
          />
          <TouchableOpacity
            onPress={send}
            disabled={!input.trim() || loading}
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  emergencyBar: {
    backgroundColor: '#7f1d1d',
    paddingVertical: 6,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  emergencyText: { color: '#fca5a5', fontSize: 11, fontWeight: '800' },
  messages: { flex: 1, backgroundColor: '#0f172a' },
  bubble: {
    marginBottom: 12,
    maxWidth: '85%',
    borderRadius: 18,
    padding: 12,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#2563eb',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#1e293b',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  botLabel: { fontSize: 10, color: '#06b6d4', fontWeight: '800', marginBottom: 4 },
  userText: { color: '#fff', fontSize: 14, lineHeight: 20 },
  botText: { color: '#e2e8f0', fontSize: 14, lineHeight: 22 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    gap: 8,
    backgroundColor: '#131f33',
    borderTopWidth: 1,
    borderTopColor: 'rgba(6,182,212,0.15)',
  },
  input: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 14,
    maxHeight: 100,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#06b6d4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendIcon: { color: '#fff', fontSize: 16, fontWeight: '900' },
});
