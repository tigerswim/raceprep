import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';

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
  margin-bottom: ${props => props.theme.spacing.lg};
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

const SolutionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${props => props.theme.spacing.lg};

  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const SolutionCard = styled(motion.div)<{ category: 'digital-experience' | 'infrastructure' | 'integration' }>`
  background: ${props => props.theme.colors.white};
  border: 2px solid ${props => {
    const categoryColors = {
      'digital-experience': props.theme.colors.secondary,
      'infrastructure': props.theme.colors.primary,
      'integration': props.theme.colors.accent
    };
    return categoryColors[props.category];
  }};
  border-radius: ${props => props.theme.borderRadius.xl};
  padding: ${props => props.theme.spacing.xl};
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.theme.shadows.xl};
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => {
      const categoryColors = {
        'digital-experience': props.theme.colors.secondary,
        'infrastructure': props.theme.colors.primary,
        'integration': props.theme.colors.accent
      };
      return categoryColors[props.category];
    }};
  }
`;

const SolutionIcon = styled.div<{ category: 'digital-experience' | 'infrastructure' | 'integration' }>`
  width: 60px;
  height: 60px;
  border-radius: ${props => props.theme.borderRadius.xl};
  background: ${props => {
    const categoryColors = {
      'digital-experience': `${props.theme.colors.secondary}20`,
      'infrastructure': `${props.theme.colors.primary}20`,
      'integration': `${props.theme.colors.accent}20`
    };
    return categoryColors[props.category];
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${props => props.theme.spacing.lg};

  svg {
    width: 30px;
    height: 30px;
    color: ${props => {
      const categoryColors = {
        'digital-experience': props.theme.colors.secondary,
        'infrastructure': props.theme.colors.primary,
        'integration': props.theme.colors.accent
      };
      return categoryColors[props.category];
    }};
  }
`;

const SolutionTitle = styled.h3`
  font-size: ${props => props.theme.fontSizes['2xl']};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.gray[900]};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const SolutionDescription = styled.p`
  font-size: ${props => props.theme.fontSizes.md};
  color: ${props => props.theme.colors.gray[600]};
  line-height: 1.6;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const MetricsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const MetricItem = styled.li`
  display: flex;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.sm};
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.gray[700]};
`;

const MetricIcon = styled.div`
  width: 16px;
  height: 16px;
  background: ${props => props.theme.colors.accent};
  border-radius: 50%;
  margin-right: ${props => props.theme.spacing.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &::after {
    content: '✓';
    color: ${props => props.theme.colors.white};
    font-size: 10px;
    font-weight: bold;
  }
`;

const CTASection = styled(motion.div)`
  text-align: center;
  margin-top: ${props => props.theme.spacing.xl};
`;

const IntegratedSolutions: React.FC = () => {
  const navigate = useNavigate();
  const solutions = [
    {
      title: 'Digital Menu Optimization',
      description: 'Transform static menus into revenue-driving displays with real-time updates across all locations',
      metrics: ['2.5% order value increase', '$30K annual printing savings', '400% more engagement'],
      category: 'digital-experience' as const,
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
      )
    },
    {
      title: 'Enterprise Network Services',
      description: 'The connectivity foundation that powers your digital experiences with 99.9% uptime',
      metrics: ['99.9% uptime guarantee', '24/7 monitoring', 'Multi-site scalability'],
      category: 'infrastructure' as const,
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
        </svg>
      )
    },
    {
      title: 'Unified Management',
      description: 'One partner, one dashboard, one support team for both your network and digital needs',
      metrics: ['Single vendor simplicity', 'Integrated reporting', 'Unified support'],
      category: 'integration' as const,
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      )
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

  const cardVariants = {
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
          <Headline>Integrated Solutions That Scale Your Business</Headline>
          <Subtext>
            The only infrastructure partner that delivers both rock-solid connectivity and 
            revenue-driving digital experiences through a single, unified platform.
          </Subtext>
        </SectionHeader>

        <SolutionsGrid
          as={motion.div}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {solutions.map((solution, index) => (
            <SolutionCard
              key={solution.title}
              category={solution.category}
              variants={cardVariants}
            >
              <SolutionIcon category={solution.category}>
                {solution.icon}
              </SolutionIcon>
              
              <SolutionTitle>{solution.title}</SolutionTitle>
              <SolutionDescription>{solution.description}</SolutionDescription>
              
              <MetricsList>
                {solution.metrics.map((metric, metricIndex) => (
                  <MetricItem key={metricIndex}>
                    <MetricIcon />
                    {metric}
                  </MetricItem>
                ))}
              </MetricsList>
            </SolutionCard>
          ))}
        </SolutionsGrid>

        <CTASection
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
        >
          <Button size="lg" variant="primary" style={{ marginRight: '1rem' }}>
            Calculate Your ROI
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => navigate('/contact')}
          >
            Schedule Demo
          </Button>
        </CTASection>
      </Container>
    </Section>
  );
};

export default IntegratedSolutions;