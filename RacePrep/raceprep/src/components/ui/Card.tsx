import React from 'react';
import { View, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'gradient';
  className?: string;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  variant = 'default',
  className = '',
  style 
}) => {
  const variantClasses = {
    default: 'bg-white/5 backdrop-blur-xl border-white/10',
    glass: 'bg-white/10 backdrop-blur-2xl border-white/20',
    gradient: 'bg-gradient-to-br from-blue-500/20 to-orange-500/20 border-blue-400/30'
  };
  
  return (
    <View 
      className={`rounded-2xl border shadow-xl ${variantClasses[variant]} ${className}`}
      style={style}
    >
      {children}
    </View>
  );
};