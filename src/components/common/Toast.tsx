import React, { useEffect } from 'react';
import { Text, View, Dimensions, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  id: string;
  title: string;
  message?: string;
  type: ToastType;
  duration?: number;
  onHide: (id: string) => void;
}

const TOAST_ICONS = {
  success: <CheckCircle color="#10B981" size={24} strokeWidth={2.5} />,
  error: <XCircle color="#EF4444" size={24} strokeWidth={2.5} />,
  warning: <AlertTriangle color="#F59E0B" size={24} strokeWidth={2.5} />,
  info: <Info color="#3B82F6" size={24} strokeWidth={2.5} />,
};

const TOAST_COLORS = {
  success: 'bg-emerald-50 border-emerald-200',
  error: 'bg-red-50 border-red-200',
  warning: 'bg-amber-50 border-amber-200',
  info: 'bg-blue-50 border-blue-200',
};

const TOAST_TEXT_COLORS = {
  success: 'text-emerald-800',
  error: 'text-red-800',
  warning: 'text-amber-800',
  info: 'text-blue-800',
};

export const Toast: React.FC<ToastProps> = ({ id, title, message, type, duration = 4000, onHide }) => {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Animate in
    translateY.value = withSpring(insets.top + (Platform.OS === 'ios' ? 10 : 20), {
      damping: 15,
      stiffness: 150,
    });
    opacity.value = withTiming(1, { duration: 300 });

    // Animate out after duration
    const timeout = setTimeout(() => {
      translateY.value = withTiming(-100, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 }, (finished) => {
        if (finished) {
          runOnJS(onHide)(id);
        }
      });
    }, duration);

    return () => clearTimeout(timeout);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
      position: 'absolute',
      top: 0,
      left: 20,
      right: 20,
      zIndex: 9999,
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <View
        className={`flex-row items-center p-4 rounded-2xl border ${TOAST_COLORS[type]} shadow-xl shadow-black/10`}
      >
        <View className="mr-4">
          {TOAST_ICONS[type]}
        </View>
        <View className="flex-1">
          <Text className={`text-base font-bold ${TOAST_TEXT_COLORS[type]}`}>
            {title}
          </Text>
          {message && (
            <Text className={`text-sm mt-0.5 ${TOAST_TEXT_COLORS[type]} opacity-80`}>
              {message}
            </Text>
          )}
        </View>
      </View>
    </Animated.View>
  );
};
