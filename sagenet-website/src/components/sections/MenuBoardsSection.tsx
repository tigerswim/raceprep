import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const Section = styled.section`
  background: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing.xl} 0;
`;

const Container = styled.div`
  max-width: ${props => props.theme.breakpoints.xl};
  margin: 0 auto;
  padding: 0 ${props => props.theme.spacing.lg};
`;

const SectionHeader = styled(motion.div)`
  text-align: left;
  margin-bottom: ${props => props.theme.spacing.xl};
  max-width: 800px;
`;

const Headline = styled.h2`
  font-size: ${props => props.theme.fontSizes['4xl']};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.gray[900]};
  margin-bottom: ${props => props.theme.spacing.lg};
  line-height: 1.2;
`;

const Subtext = styled.p`
  font-size: ${props => props.theme.fontSizes.xl};
  color: ${props => props.theme.colors.gray[600]};
  line-height: 1.6;
`;

const BenefitsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.xl};

  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const BenefitColumn = styled(motion.div)`
  background: ${props => props.theme.colors.gray[50]};
  border-radius: ${props => props.theme.borderRadius.xl};
  padding: ${props => props.theme.spacing.xl};
  border: 1px solid ${props => props.theme.colors.gray[200]};
`;

const ColumnHeader = styled.h3`
  font-size: ${props => props.theme.fontSizes['2xl']};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.gray[900]};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const ColumnContent = styled.div``;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: flex-start;
  margin-bottom: ${props => props.theme.spacing.md};
  font-size: ${props => props.theme.fontSizes.md};
  color: ${props => props.theme.colors.gray[700]};
  line-height: 1.5;
`;

const CheckIcon = styled.div`
  width: 20px;
  height: 20px;
  background: ${props => props.theme.colors.primary};
  border-radius: 50%;
  margin-right: ${props => props.theme.spacing.md};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;

  &::after {
    content: '✓';
    color: ${props => props.theme.colors.white};
    font-size: 12px;
    font-weight: bold;
  }
`;

const CustomerSpotlight = styled(motion.div)`
  background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.navy[700]} 100%);
  border-radius: ${props => props.theme.borderRadius['2xl']};
  padding: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.white};
  margin-bottom: ${props => props.theme.spacing.xl};
  position: relative;
  overflow: hidden;
`;

const SpotlightContent = styled.div`
  position: relative;
  z-index: 2;
`;

const SpotlightStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.xl};

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const SpotlightStat = styled.div`
  text-align: center;

  .value {
    font-size: ${props => props.theme.fontSizes['3xl']};
    font-weight: ${props => props.theme.fontWeights.bold};
    margin-bottom: ${props => props.theme.spacing.xs};
  }

  .label {
    font-size: ${props => props.theme.fontSizes.sm};
    opacity: 0.9;
  }
`;

const SpotlightQuote = styled.blockquote`
  font-size: ${props => props.theme.fontSizes.xl};
  font-style: italic;
  margin: 0 0 ${props => props.theme.spacing.lg} 0;
  line-height: 1.6;
`;

const SpotlightAttribution = styled.div`
  font-size: ${props => props.theme.fontSizes.md};
  opacity: 0.9;
`;

const IndustryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: ${props => props.theme.spacing.lg};

  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const IndustryCard = styled(motion.div)`
  background: ${props => props.theme.colors.white};
  border: 2px solid ${props => props.theme.colors.gray[200]};
  border-radius: ${props => props.theme.borderRadius.xl};
  padding: ${props => props.theme.spacing.xl};
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    transform: translateY(-4px);
    box-shadow: ${props => props.theme.shadows.lg};
  }
`;

const IndustryIcon = styled.div`
  font-size: ${props => props.theme.fontSizes['3xl']};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const IndustryTitle = styled.h4`
  font-size: ${props => props.theme.fontSizes.lg};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.gray[900]};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const IndustryDescription = styled.p`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.gray[600]};
  line-height: 1.4;
`;

const MenuBoardsSection: React.FC = () => {
  const revenueFeatures = [
    'Smart upselling with dynamic item positioning',
    'A/B testing for optimal menu performance',
    'Real-time pricing optimization',
    'Promotional campaign automation',
    'Integration with POS and loyalty systems'
  ];

  const brandFeatures = [
    'Centralized menu control across all locations',
    'Instant updates without printing costs',
    'Brand guideline enforcement',
    'Seasonal menu rollouts in minutes',
    'Local customization within brand standards'
  ];

  const creativeFeatures = [
    'Professional design team collaboration',
    'Interactive menu experiences',
    'Motion graphics and animations',
    'Custom branded templates',
    'Eye-tracking optimization studies'
  ];

  const industries = [
    {
      icon: '🍔',
      title: 'Quick Service',
      description: 'Drive-thru optimization and speed-of-service improvements'
    },
    {
      icon: '🥗',
      title: 'Fast-Casual',
      description: 'Premium positioning with lifestyle-focused messaging'
    },
    {
      icon: '🛒',
      title: 'Retail',
      description: 'Product showcasing and promotional campaign execution'
    },
    {
      icon: '🏥',
      title: 'Healthcare',
      description: 'Patient communication and wayfinding solutions'
    },
    {
      icon: '🏨',
      title: 'Hospitality',
      description: 'Guest experience enhancement and service promotion'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Section>
      <Container>
        <SectionHeader
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Headline>Menu Boards That Drive Revenue, Not Just Display Information</Headline>
          <Subtext>
            Corporate marketing teams develop sophisticated menu strategies, promotional campaigns, and pricing 
            optimizations – but traditional static displays make it impossible to execute these strategies 
            consistently across multiple locations.
          </Subtext>
        </SectionHeader>

        <BenefitsGrid
          as={motion.div}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <BenefitColumn variants={itemVariants}>
            <ColumnHeader>Revenue Growth Management</ColumnHeader>
            <ColumnContent>
              <FeatureList>
                {revenueFeatures.map((feature, index) => (
                  <FeatureItem key={index}>
                    <CheckIcon />
                    {feature}
                  </FeatureItem>
                ))}
              </FeatureList>
            </ColumnContent>
          </BenefitColumn>

          <BenefitColumn variants={itemVariants}>
            <ColumnHeader>Brand Consistency That Scales</ColumnHeader>
            <ColumnContent>
              <FeatureList>
                {brandFeatures.map((feature, index) => (
                  <FeatureItem key={index}>
                    <CheckIcon />
                    {feature}
                  </FeatureItem>
                ))}
              </FeatureList>
            </ColumnContent>
          </BenefitColumn>

          <BenefitColumn variants={itemVariants}>
            <ColumnHeader>Creative Excellence</ColumnHeader>
            <ColumnContent>
              <FeatureList>
                {creativeFeatures.map((feature, index) => (
                  <FeatureItem key={index}>
                    <CheckIcon />
                    {feature}
                  </FeatureItem>
                ))}
              </FeatureList>
            </ColumnContent>
          </BenefitColumn>
        </BenefitsGrid>

        <CustomerSpotlight
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <SpotlightContent>
            <SpotlightStats>
              <SpotlightStat>
                <div className="value">2.5%</div>
                <div className="label">Order Value Increase</div>
              </SpotlightStat>
              <SpotlightStat>
                <div className="value">$30K</div>
                <div className="label">Annual Printing Savings</div>
              </SpotlightStat>
              <SpotlightStat>
                <div className="value">400%</div>
                <div className="label">More Engagement</div>
              </SpotlightStat>
            </SpotlightStats>
            
            <SpotlightQuote>
              "SageNet's digital menu solution transformed how we execute promotions across 800+ locations. 
              The real-time A/B testing capabilities alone increased our average order value by 2.5% within 
              the first quarter."
            </SpotlightQuote>
            
            <SpotlightAttribution>
              VP of Marketing, National QSR Chain
            </SpotlightAttribution>
          </SpotlightContent>
        </CustomerSpotlight>

        <IndustryGrid
          as={motion.div}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {industries.map((industry, index) => (
            <IndustryCard key={index} variants={itemVariants}>
              <IndustryIcon>{industry.icon}</IndustryIcon>
              <IndustryTitle>{industry.title}</IndustryTitle>
              <IndustryDescription>{industry.description}</IndustryDescription>
            </IndustryCard>
          ))}
        </IndustryGrid>
      </Container>
    </Section>
  );
};

export default MenuBoardsSection;