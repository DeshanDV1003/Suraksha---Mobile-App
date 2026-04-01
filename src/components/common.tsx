import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';

interface CustomButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
}

export const CustomButton: React.FC<CustomButtonProps> = ({ 
  label, 
  onPress, 
  variant = 'primary',
  className = ''
}) => {
  const bgClass = variant === 'primary' ? 'bg-primary' : variant === 'secondary' ? 'bg-secondary' : 'bg-danger';

  return (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.7}
      className={`py-3 px-6 rounded-lg items-center justify-center ${bgClass} shadow-md ${className}`}
    >
      <Text className="text-white font-semibold text-lg">{label}</Text>
    </TouchableOpacity>
  );
};

export const Card: React.FC<{ children: React.ReactNode; title?: string; className?: string }> = ({ 
  children, 
  title, 
  className = '' 
}) => (
  <View className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 my-2 ${className}`}>
    {title && <Text className="text-lg font-bold mb-2 text-gray-800">{title}</Text>}
    {children}
  </View>
);
