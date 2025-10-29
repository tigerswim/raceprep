import React from 'react';
import { TouchableOpacity, Text, ViewStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  style
}) => {
  const baseClasses = 'rounded-xl font-medium shadow-lg flex items-center justify-center';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-500 to-orange-500',
    secondary: 'bg-white/10 backdrop-blur-lg border border-white/20',
    outline: 'border border-blue-400/30 bg-blue-500/20'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4'
  };
  
  const textClasses = {
    primary: 'text-white font-semibold',
    secondary: 'text-white font-medium',
    outline: 'text-blue-300 font-medium'
  };
  
  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };
  
  return (
    <TouchableOpacity
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className} ${disabled ? 'opacity-50' : ''}`}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={style}
    >
      <Text className={`${textClasses[variant]} ${textSizeClasses[size]}`}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};