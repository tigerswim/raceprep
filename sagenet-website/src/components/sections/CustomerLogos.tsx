import React from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';

const scroll = keyframes`
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
`;

const LogosSection = styled.section`
  background: ${props => props.theme.colors.gray[50]};
  padding: ${props => props.theme.spacing.sm} 0 ${props => props.theme.spacing.lg} 0;
`;

const LogosContainer = styled.div`
  overflow: hidden;
  white-space: nowrap;
  position: relative;
  
  &:hover .logos-track {
    animation-play-state: paused;
  }
`;

const LogosTrack = styled.div`
  display: inline-flex;
  animation: ${scroll} 30s linear infinite;
  gap: ${props => props.theme.spacing.lg};
  padding: ${props => props.theme.spacing.sm} 0;
`;

const LogoItem = styled(motion.div)`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 90px;
  min-width: 180px;
  padding: 0 ${props => props.theme.spacing.sm};
  
  img {
    max-height: 60px;
    max-width: 150px;
    object-fit: contain;
    filter: grayscale(100%) opacity(0.7);
    transition: filter 0.3s ease;
  }

  &:hover img {
    filter: grayscale(0%) opacity(1);
  }
`;

const TestimonialSection = styled(motion.div)`
  max-width: 800px;
  margin: ${props => props.theme.spacing.lg} auto 0;
  padding: 0 ${props => props.theme.spacing.md};
  text-align: center;
`;

const TestimonialQuote = styled.blockquote`
  background: ${props => props.theme.colors.navy[900]};
  color: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing.lg} ${props => props.theme.spacing.lg};
  font-family: Georgia, 'Times New Roman', Times, serif;
  font-size: ${props => props.theme.fontSizes['2xl']};
  font-style: italic;
  font-weight: 400;
  line-height: 1.4;
  text-align: center;
  margin: 0;
  position: relative;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  border-radius: ${props => props.theme.borderRadius['2xl']};

  &::before {
    content: '';
    display: block;
    width: 60px;
    height: 2px;
    background: ${props => props.theme.colors.secondary};
    margin: 0 auto ${props => props.theme.spacing.lg};
  }

  &::after {
    content: '';
    display: block;
    width: 60px;
    height: 2px;
    background: ${props => props.theme.colors.secondary};
    margin: ${props => props.theme.spacing.lg} auto 0;
  }

  .highlight {
    color: ${props => props.theme.colors.secondary};
    font-weight: 500;
  }
`;

const TestimonialAttribution = styled.div`
  font-family: ${props => props.theme.fonts.primary};
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.medium};
  color: ${props => props.theme.colors.white};
  text-align: center;
  margin-top: ${props => props.theme.spacing.lg};
  text-transform: uppercase;
  letter-spacing: 2px;
  opacity: 0.9;
`;

// Customer logo data - using actual logo files
const customerLogos = [
  { name: 'Patagonia', logoUrl: '/images/customers/patagonia-logo.svg' },
  { name: 'Sunoco', logoUrl: '/images/customers/sunoco-logo.svg' },
  { name: 'Phillips 66', logoUrl: '/images/customers/phillips-66.svg' },
  { name: 'T-Mobile', logoUrl: '/images/customers/t-mobile-logo.svg' },
  { name: 'Arby\'s', logoUrl: '/images/customers/Arbys_logo.svg' },
  { name: 'Cumberland Farms', logoUrl: '/images/customers/Cumberland_Farms_logo.png' },
  { name: 'Dollar General', logoUrl: '/images/customers/Dollar-General-Logo.png' },
  { name: 'Noodles & Company', logoUrl: '/images/customers/Noodles-and-Company-logo.png' },
];

const CustomerLogos: React.FC = () => {
  // Double the logos for seamless scrolling
  const duplicatedLogos = [...customerLogos, ...customerLogos];

  return (
    <LogosSection>
      <div className="container">
        <LogosContainer>
          <LogosTrack className="logos-track">
            {duplicatedLogos.map((logo, index) => (
              <LogoItem
                key={`${logo.name}-${index}`}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <img src={logo.logoUrl} alt={`${logo.name} logo`} />
              </LogoItem>
            ))}
          </LogosTrack>
        </LogosContainer>

        <TestimonialSection
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <TestimonialQuote>
            "SageNet's digital signage transformation delivered <span className="highlight">$30,000 in operational cost savings</span> per location 
            annually while increasing our <span className="highlight">average order value by 2.5%</span> across 400+ restaurants. 
            The ROI was immediate and measurable."
            <TestimonialAttribution>
              Operations Director, Multi-Site Restaurant Group
            </TestimonialAttribution>
          </TestimonialQuote>
        </TestimonialSection>
      </div>
    </LogosSection>
  );
};

export default CustomerLogos;