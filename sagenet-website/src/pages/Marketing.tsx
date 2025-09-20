import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import Button from '../components/common/Button';
import MenuBoardsSection from '../components/sections/MenuBoardsSection';
import { trackDemoRequest } from '../utils/analytics';

const PageWrapper = styled.div`
  min-height: 80vh;
`;

const HeroSection = styled.section`
  background: linear-gradient(135deg, ${props => props.theme.colors.secondary} 0%, #ea580c 100%);
  color: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing.lg} 0;
  text-align: center;
`;

const PageTitle = styled(motion.h1)`
  font-size: ${props => props.theme.fontSizes['4xl']};
  font-weight: ${props => props.theme.fontWeights.extrabold};
  margin-bottom: ${props => props.theme.spacing.md};
  color: ${props => props.theme.colors.white} !important;

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    font-size: ${props => props.theme.fontSizes['3xl']};
  }
`;

const PageSubtitle = styled(motion.p)`
  font-size: ${props => props.theme.fontSizes.lg};
  margin-bottom: ${props => props.theme.spacing.md};
  opacity: 0.9;
  color: ${props => props.theme.colors.white} !important;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
`;

const StatsBar = styled(motion.div)`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.lg};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    flex-direction: column;
    gap: ${props => props.theme.spacing.sm};
  }
`;

const StatBadge = styled.div`
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: ${props => props.theme.borderRadius.full};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  font-size: ${props => props.theme.fontSizes.xs};
  font-weight: ${props => props.theme.fontWeights.medium};
  white-space: nowrap;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    text-align: center;
  }
`;

const ContentSection = styled.section`
  padding: ${props => props.theme.spacing.lg} 0;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.lg};

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const FeatureCard = styled(motion.div)`
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius['2xl']};
  box-shadow: ${props => props.theme.shadows.md};
  overflow: hidden;
  text-align: left;

  .image-section {
    height: 160px;
    overflow: hidden;
    position: relative;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  &:hover img {
    transform: scale(1.05);
  }

  .content-section {
    padding: ${props => props.theme.spacing.md};
  }

  h3 {
    font-size: ${props => props.theme.fontSizes.lg};
    color: ${props => props.theme.colors.gray[900]};
    margin-bottom: ${props => props.theme.spacing.xs};
  }

  p {
    color: ${props => props.theme.colors.gray[600]};
    line-height: 1.5;
    font-size: ${props => props.theme.fontSizes.sm};
  }
`;

const Marketing: React.FC = () => {
  const navigate = useNavigate();
  
  const features = [
    {
      title: 'Drive-Thru Digital Transformation',
      description: 'Capture 70% of QSR revenue potential with digital menu boards that increase order values by 2.5% and promotional conversion by 2%. Only 19.3% of competitors have adopted this technology.',
      image: '/images/signage/SageNet-blog-drive-thru-technology.jpg',
      imageAlt: 'Digital menu boards in a restaurant drive-thru showing dynamic food offerings and pricing'
    },
    {
      title: 'Forecourt & Pump-Side Optimization',
      description: 'Engage captive customers during 3-4 minute fueling sessions with contactless ordering that brings the store to the forecourt. Perfect for food-to-go focused convenience operations.',
      image: '/images/signage/forecourt-video-screen.png',
      imageAlt: 'Restaurant digital signage displaying promotional combo menu in modern dining environment'
    },
    {
      title: 'Operational Cost Reduction',
      description: 'Save $30,000 annually per location by eliminating printing costs and manual menu updates. Centralized content management reduces labor while ensuring brand consistency.',
      image: '/images/signage/SageNet-blog-Signage-Small-Stores.jpg',
      imageAlt: 'Digital signage in retail store showing promotional content and sale information'
    }
  ];

  return (
    <PageWrapper>
      <HeroSection>
        <div className="container">
          <PageTitle
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Drive Sales & Marketing Results That Scale
          </PageTitle>
          <PageSubtitle
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Marketing leaders at multi-site restaurant and retail chains choose SageNet to execute 
            revenue-driving digital experiences that increase average order values, improve brand 
            consistency, and deliver measurable ROI across every location.
          </PageSubtitle>
          <StatsBar
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <StatBadge>33% Sales Increase Potential</StatBadge>
            <StatBadge>70% Drive-Thru Revenue Opportunity</StatBadge>
            <StatBadge>400% More Engagement vs Static</StatBadge>
            <StatBadge>$30K Annual Operational Savings</StatBadge>
          </StatsBar>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => {
                trackDemoRequest('marketing_demo', 'marketing_page');
                navigate('/contact');
              }}
            >
              Schedule Marketing Demo
            </Button>
          </motion.div>
        </div>
      </HeroSection>

      <ContentSection>
        <div className="container">
          <FeatureGrid>
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="image-section">
                  <img src={feature.image} alt={feature.imageAlt} />
                </div>
                <div className="content-section">
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              </FeatureCard>
            ))}
          </FeatureGrid>
        </div>
      </ContentSection>

      <MenuBoardsSection />
    </PageWrapper>
  );
};

export default Marketing;