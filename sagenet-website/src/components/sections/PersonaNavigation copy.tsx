import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';

const NavigationCard = styled(motion.div)`
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius['2xl']};
  padding: ${props => props.theme.spacing['2xl']};
  box-shadow: ${props => props.theme.shadows.xl};
  max-width: 400px;
`;

const CardTitle = styled.h3`
  font-size: ${props => props.theme.fontSizes['2xl']};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.gray[900]};
  margin-bottom: ${props => props.theme.spacing.sm};
  text-align: center;
`;

const CardDescription = styled.p`
  color: ${props => props.theme.colors.gray[600]};
  text-align: center;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const PersonaButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const PersonaButton = styled(Button)`
  justify-content: flex-start;
  text-align: left;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  height: auto;
  
  div {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  
  .title {
    font-size: ${props => props.theme.fontSizes.md};
    font-weight: ${props => props.theme.fontWeights.semibold};
    margin-bottom: 4px;
  }
  
  .subtitle {
    font-size: ${props => props.theme.fontSizes.sm};
    opacity: 0.8;
    font-weight: ${props => props.theme.fontWeights.normal};
  }
`;

const PersonaIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => props.theme.colors.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: ${props => props.theme.spacing.md};
  flex-shrink: 0;

  svg {
    width: 20px;
    height: 20px;
    color: ${props => props.theme.colors.white};
  }
`;

const PersonaNavigation: React.FC = () => {
  const navigate = useNavigate();

  return (
    <NavigationCard
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <CardTitle>Choose Your Path</CardTitle>
      <CardDescription>
        Select your role to see solutions tailored to your specific needs and challenges.
      </CardDescription>
      
      <PersonaButtons>
        <PersonaButton
          variant="primary"
          onClick={() => navigate('/marketing')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <PersonaIcon>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </PersonaIcon>
          <div>
            <div className="title">I Drive Sales & Marketing</div>
            <div className="subtitle">Boost revenue with digital experiences</div>
          </div>
        </PersonaButton>
        
        <PersonaButton
          variant="outline"
          onClick={() => navigate('/it')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <PersonaIcon style={{ background: '#6b7280' }}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </PersonaIcon>
          <div>
            <div className="title">I Manage IT & Operations</div>
            <div className="subtitle">Scale infrastructure efficiently</div>
          </div>
        </PersonaButton>
      </PersonaButtons>
    </NavigationCard>
  );
};

export default PersonaNavigation;