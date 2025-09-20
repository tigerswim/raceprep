import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
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

const PersonaButton = styled(Button)<{ isActive: boolean }>`
  justify-content: flex-start;
  text-align: left;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  height: auto;
  position: relative;
  overflow: hidden;
  
  .content {
    display: flex;
    align-items: center;
    width: 100%;
  }
  
  .text {
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

const PersonaIcon = styled.div<{ bgColor: string }>`
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => props.bgColor};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: ${props => props.theme.spacing.md};
  flex-shrink: 0;
  font-size: 20px;
`;

const BenefitsList = styled(motion.div)`
  margin-top: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.gray[50]};
  border-radius: ${props => props.theme.borderRadius.lg};
`;

const BenefitItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.xs};
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.gray[700]};
  
  &:last-child {
    margin-bottom: 0;
  }
  
  &::before {
    content: '';
    width: 8px;
    height: 8px;
    background: ${props => props.theme.colors.accent};
    border-radius: 50%;
    margin-right: ${props => props.theme.spacing.sm};
    flex-shrink: 0;
  }
`;

const PersonaNavigation: React.FC = () => {
  const navigate = useNavigate();
  const [activePersona, setActivePersona] = useState<number | null>(null);

  const personas = [
    {
      title: "I Drive Sales & Marketing",
      subtitle: "Boost revenue with digital experiences",
      icon: "📈",
      bgColor: "#3b82f6",
      route: "/marketing",
      benefits: [
        "15% average sales lift",
        "Real-time customer insights", 
        "Automated campaign management"
      ]
    },
    {
      title: "I Manage IT & Operations",
      subtitle: "Scale infrastructure efficiently", 
      icon: "⚙️",
      bgColor: "#f97316",
      route: "/it",
      benefits: [
        "40% reduction in IT costs",
        "99.9% network uptime",
        "24/7 proactive monitoring"
      ]
    }
  ];

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
        {personas.map((persona, index) => (
          <div key={index}>
            <PersonaButton
              variant={index === 0 ? "primary" : "outline"}
              isActive={activePersona === index}
              onClick={() => navigate(persona.route)}
              onMouseEnter={() => setActivePersona(index)}
              onMouseLeave={() => setActivePersona(null)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="content">
                <PersonaIcon bgColor={persona.bgColor}>
                  {persona.icon}
                </PersonaIcon>
                <div className="text">
                  <div className="title">{persona.title}</div>
                  <div className="subtitle">{persona.subtitle}</div>
                </div>
              </div>
            </PersonaButton>
            
            <AnimatePresence>
              {activePersona === index && (
                <BenefitsList
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {persona.benefits.map((benefit, benefitIndex) => (
                    <BenefitItem key={benefitIndex}>
                      {benefit}
                    </BenefitItem>
                  ))}
                </BenefitsList>
              )}
            </AnimatePresence>
          </div>
        ))}
      </PersonaButtons>
    </NavigationCard>
  );
};

export default PersonaNavigation;