import React, { useState, useEffect } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Animated } from 'react-native';
import { MessageCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  navigationRef: React.MutableRefObject<any>;
  loggedIn: boolean;
}

export default function ChatFAB({ navigationRef, loggedIn }: Props) {
  const insets = useSafeAreaInsets();
  const pulse = React.useRef(new Animated.Value(1)).current;
  const [visible, setVisible] = useState(loggedIn);

  // Keep visible state in sync with login status
  useEffect(() => { setVisible(loggedIn); }, [loggedIn]);

  // Subtle pulse every few seconds to draw attention
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.12, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.delay(3000),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  if (!visible) return null;

  const handlePress = () => {
    try {
      navigationRef.current?.navigate('MainTabs', {
        screen: 'Home',
        params: { screen: 'Chatbot' },
      });
    } catch {
      // Already on chatbot or nav not ready
    }
  };

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        { bottom: insets.bottom + 80 }, // sit just above the tab bar
      ]}
    >
      <Animated.View style={{ transform: [{ scale: pulse }] }}>
        <TouchableOpacity
          onPress={handlePress}
          style={styles.fab}
          activeOpacity={0.85}
        >
          <MessageCircle size={22} color="white" strokeWidth={2.5} />
          {/* Online dot */}
          <View style={styles.dot} />
        </TouchableOpacity>
      </Animated.View>
      <Text style={styles.label}>AI Help</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    right: 16,
    zIndex: 9999,
    alignItems: 'center',
    pointerEvents: 'box-none' as any,
  },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#0891b2',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  dot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: '#0891b2',
  },
  label: {
    marginTop: 4,
    color: '#06b6d4',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
