import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Button from '../common/Button';

const HeroSection = styled.section`
  background: linear-gradient(135deg, ${props => props.theme.colors.navy[900]} 0%, ${props => props.theme.colors.navy[800]} 50%, #1e40af 100%);
  color: ${props => props.theme.colors.white};
  position: relative;
  overflow: hidden;
  min-height: 60vh;
  display: flex;
  align-items: center;
  padding: ${props => props.theme.spacing.lg} 0;
`;

const HeroBackground = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  opacity: 0.1;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, ${props => props.theme.colors.navy[900]} 0%, rgba(30, 64, 175, 0.8) 100%);
  }
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 1fr;
  gap: ${props => props.theme.spacing.xl};
  align-items: start;

  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: 1fr 400px;
  }
`;

const HeroContent = styled(motion.div)`
  max-width: 600px;
`;

const Headline = styled(motion.h1)`
  font-size: ${props => props.theme.fontSizes['6xl']};
  font-weight: ${props => props.theme.fontWeights.extrabold};
  line-height: 1.1;
  margin-bottom: ${props => props.theme.spacing.md};
  color: ${props => props.theme.colors.white};

  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    font-size: ${props => props.theme.fontSizes['5xl']};
  }

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    font-size: ${props => props.theme.fontSizes['4xl']};
  }
`;

const AccentText = styled.span`
  color: ${props => props.theme.colors.secondary};
  display: block;
`;

const Subtitle = styled(motion.p)`
  font-size: ${props => props.theme.fontSizes.xl};
  color: ${props => props.theme.colors.gray[200]};
  margin-bottom: ${props => props.theme.spacing.xl};
  line-height: 1.6;
`;

const CTASection = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
  
  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: row;
    align-items: center;
  }
`;

const StatsGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.lg};

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
    gap: ${props => props.theme.spacing.sm};
  }
`;

const StatItem = styled.div`
  text-align: center;

  h3 {
    font-size: ${props => props.theme.fontSizes['2xl']};
    font-weight: ${props => props.theme.fontWeights.bold};
    color: ${props => props.theme.colors.white};
    margin-bottom: ${props => props.theme.spacing.xs};
  }

  p {
    font-size: ${props => props.theme.fontSizes.sm};
    color: ${props => props.theme.colors.gray[300]};
    margin: 0;
  }
`;

const ImageShowcase = styled(motion.div)`
  position: relative;
  border-radius: ${props => props.theme.borderRadius['2xl']};
  overflow: hidden;
  box-shadow: ${props => props.theme.shadows.xl};
  height: 400px;
`;

const ShowcaseImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center center;
  display: block;
`;


const Hero: React.FC = () => {
  return (
    <HeroSection>
      <HeroBackground />
      <div className="container">
        <ContentWrapper>
          <HeroContent>
            <Headline
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Connect Every Location.
              <AccentText>Engage Every Customer.</AccentText>
            </Headline>
            
            <Subtitle
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              We help companies build turn reliable networks and compelling digital 
              experiences into measurable business results across all their locations.
            </Subtitle>

            <CTASection
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Button size="lg" variant="secondary">
                View Live Dashboard
              </Button>
              <Button 
                size="lg" 
                variant="outline-white"
                onClick={() => {
                  const calculatorElement = document.getElementById('roi-calculator');
                  if (calculatorElement) {
                    calculatorElement.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Calculate ROI
              </Button>
            </CTASection>

            <StatsGrid
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <StatItem>
                <h3>400%</h3>
                <p>More Engagement vs Static</p>
              </StatItem>
              <StatItem>
                <h3>33%</h3>
                <p>Sales Increase Potential</p>
              </StatItem>
              <StatItem>
                <h3>$1.5M</h3>
                <p>Revenue Impact Over 5 Years</p>
              </StatItem>
              <StatItem>
                <h3>99.9%</h3>
                <p>Network Uptime</p>
              </StatItem>
            </StatsGrid>
          </HeroContent>

          <ImageShowcase
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <ShowcaseImage 
              src="/images/signage/instore-signage-example.jpg" 
              alt="Digital menu boards in convenience store showing fresh market options and pricing"
              loading="eager"
            />

          </ImageShowcase>
        </ContentWrapper>
      </div>
    </HeroSection>
  );
};

export default Hero;