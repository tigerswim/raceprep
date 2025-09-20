import React from 'react';
import styled from 'styled-components';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'outline-white';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
  className?: string;
  as?: React.ElementType;
  to?: string;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
}

const StyledButton = styled(motion.button)<Omit<ButtonProps, 'as' | 'to'>>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: ${props => props.theme.borderRadius.lg};
  font-weight: ${props => props.theme.fontWeights.semibold};
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  width: ${props => props.fullWidth ? '100%' : 'auto'};
  
  /* Size variations */
  ${props => {
    switch (props.size) {
      case 'sm':
        return `
          padding: ${props.theme.spacing.sm} ${props.theme.spacing.md};
          font-size: ${props.theme.fontSizes.sm};
        `;
      case 'lg':
        return `
          padding: ${props.theme.spacing.md} ${props.theme.spacing.xl};
          font-size: ${props.theme.fontSizes.lg};
        `;
      default: // 'md'
        return `
          padding: ${props.theme.spacing.sm} ${props.theme.spacing.lg};
          font-size: ${props.theme.fontSizes.md};
        `;
    }
  }}
  
  /* Variant styles */
  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: ${props.theme.colors.primary};
          color: ${props.theme.colors.white};
          
          &:hover:not(:disabled) {
            background: ${props.theme.colors.navy[700]};
          }
          
          &:active {
            background: ${props.theme.colors.navy[800]};
          }
        `;
      case 'secondary':
        return `
          background: ${props.theme.colors.secondary};
          color: ${props.theme.colors.white};
          
          &:hover:not(:disabled) {
            background: #ea580c;
          }
          
          &:active {
            background: #c2410c;
          }
        `;
      case 'outline':
        return `
          background: transparent;
          color: ${props.theme.colors.primary};
          border: 2px solid ${props.theme.colors.primary};
          
          &:hover:not(:disabled) {
            background: ${props.theme.colors.primary};
            color: ${props.theme.colors.white};
          }
          
          &:active {
            background: ${props.theme.colors.navy[700]};
            border-color: ${props.theme.colors.navy[700]};
          }
        `;
      case 'outline-white':
        return `
          background: transparent;
          color: ${props.theme.colors.gray[300]};
          border: 2px solid ${props.theme.colors.gray[300]};
          
          &:hover:not(:disabled) {
            background: ${props.theme.colors.gray[300]};
            color: ${props.theme.colors.primary};
          }
          
          &:active {
            background: rgba(209, 213, 219, 0.9);
            color: ${props.theme.colors.primary};
          }
        `;
      default:
        return `
          background: ${props.theme.colors.primary};
          color: ${props.theme.colors.white};
          
          &:hover:not(:disabled) {
            background: ${props.theme.colors.navy[700]};
          }
        `;
    }
  }}
  
  /* Disabled state */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  /* Focus styles */
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${props => props.theme.colors.navy[200]};
  }
`;

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled = false,
  style,
  className,
  as,
  to,
  type = 'button',
  fullWidth = false,
  ...props
}) => {
  return (
    <StyledButton
      as={as}
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled}
      style={style}
      className={className}
      to={to}
      type={type}
      fullWidth={fullWidth}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ duration: 0.1 }}
      {...props}
    >
      {children}
    </StyledButton>
  );
};

export default Button;