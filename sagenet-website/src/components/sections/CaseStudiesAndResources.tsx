import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';

const Container = styled.div`
  background-color: ${props => props.theme.colors.gray[50]};
  min-height: 100vh;
`;

const Section = styled.section`
  padding: ${props => props.theme.spacing.xl} 0;
`;

const SectionWhite = styled.section`
  padding: ${props => props.theme.spacing.xl} 0;
  background-color: white;
`;

const ContentWrapper = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const HeaderContainer = styled(motion.div)`
  text-align: left;
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const MainTitle = styled.h1`
  font-size: ${props => props.theme.fontSizes['4xl']};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.gray[900]};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const SubTitle = styled.p`
  font-size: ${props => props.theme.fontSizes.lg};
  color: ${props => props.theme.colors.gray[600]};
`;

const FilterContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const FilterWrapper = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  padding: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
`;

const FilterButton = styled.button<{ active: boolean }>`
  padding: 0.5rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
  
  ${props => props.active
    ? `
      background-color: ${props.theme.colors.primary};
      color: white;
    `
    : `
      background-color: transparent;
      color: ${props.theme.colors.gray[600]};
      
      &:hover {
        color: ${props.theme.colors.gray[900]};
      }
    `
  }
`;

const CaseStudyGrid = styled.div`
  display: grid;
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.xl};
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const CaseStudyCard = styled(motion.div)`
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow 0.3s;
  
  &:hover {
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }
`;

const CaseStudyImage = styled.div`
  height: 6rem;
  background: linear-gradient(to right, ${props => props.theme.colors.primary}, ${props => props.theme.colors.navy[600]});
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.2);
  }
`;

const ImageOverlay = styled.div`
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  color: white;
`;

const IndustryLabel = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  opacity: 0.9;
`;

const CompanyName = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
`;

const LocationBadge = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
  border-radius: 9999px;
  padding: 0.25rem 0.75rem;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
`;

const CardContent = styled.div`
  padding: ${props => props.theme.spacing.lg};
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const MetricItem = styled.div`
  text-align: center;
`;

const MetricValue = styled.div<{ color: 'green' | 'blue' | 'orange' }>`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => 
    props.color === 'green' ? props.theme.colors.accent :
    props.color === 'blue' ? props.theme.colors.primary :
    props.theme.colors.secondary
  };
`;

const MetricLabel = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.gray[500]};
`;

const ChallengeSection = styled.div`
  margin-bottom: ${props => props.theme.spacing.md};
`;

const SectionTitle = styled.h3`
  font-weight: 600;
  color: ${props => props.theme.colors.gray[900]};
  margin-bottom: 0.5rem;
`;

const SectionText = styled.p`
  color: ${props => props.theme.colors.gray[600]};
  font-size: 0.875rem;
`;

const TestimonialPreview = styled.div`
  background-color: ${props => props.theme.colors.gray[50]};
  border-radius: 0.5rem;
  padding: ${props => props.theme.spacing.md};
`;

const Quote = styled.blockquote`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.gray[700]};
  margin-bottom: 0.5rem;
  font-style: italic;
`;

const Attribution = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.gray[500]};
`;

const CardFooter = styled.div`
  margin-top: ${props => props.theme.spacing.md};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Timeline = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.gray[500]};
`;

const ViewLink = styled.div`
  color: ${props => props.theme.colors.primary};
  font-weight: 500;
`;

const FeaturedMetrics = styled.div`
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  padding: 2rem;
`;

const FeaturedTitle = styled.h2`
  font-size: 1.875rem;
  font-weight: bold;
  color: ${props => props.theme.colors.gray[900]};
  text-align: center;
  margin-bottom: 2rem;
`;

const FeaturedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const FeaturedMetric = styled(motion.div)`
  text-align: center;
`;

const MetricIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
`;

const FeaturedValue = styled.div`
  font-size: 1.875rem;
  font-weight: bold;
  color: ${props => props.theme.colors.primary};
  margin-bottom: 0.25rem;
`;

const FeaturedLabel = styled.div`
  color: ${props => props.theme.colors.gray[600]};
`;

const ResourcesHeader = styled(motion.div)`
  text-align: left;
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const ResourcesTitle = styled.h2`
  font-size: ${props => props.theme.fontSizes['4xl']};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.gray[900]};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const ResourcesSubtitle = styled.p`
  font-size: ${props => props.theme.fontSizes.lg};
  color: ${props => props.theme.colors.gray[600]};
`;

const TabContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const TabWrapper = styled.div`
  background-color: ${props => props.theme.colors.gray[100]};
  border-radius: 0.5rem;
  padding: 0.25rem;
`;

const TabButton = styled.button<{ active: boolean }>`
  padding: 0.5rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
  
  ${props => props.active
    ? `
      background-color: white;
      color: ${props.theme.colors.primary};
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    `
    : `
      background-color: transparent;
      color: ${props.theme.colors.gray[600]};
      
      &:hover {
        color: ${props.theme.colors.gray[900]};
      }
    `
  }
`;

const ResourceGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const ResourceGridTwo = styled.div`
  display: grid;
  gap: 2rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ResourceCard = styled.div`
  background-color: ${props => props.theme.colors.gray[50]};
  border-radius: 0.75rem;
  padding: 1.5rem;
  transition: box-shadow 0.3s;
  
  &:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }
`;

const ResourceHeader = styled.div`
  display: flex;
  align-items: start;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const ResourceIcon = styled.div<{ bgColor: 'blue' | 'red' | 'green' }>`
  width: 3rem;
  height: 3rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  
  ${props => {
    const colors = {
      blue: `background-color: ${props.theme.colors.navy[100]}; color: ${props.theme.colors.primary};`,
      red: `background-color: #fef2f2; color: #dc2626;`,
      green: `background-color: #f0fdf4; color: ${props.theme.colors.accent};`
    };
    return colors[props.bgColor];
  }}
`;

const DownloadCount = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.gray[500]};
`;

const ResourceTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: bold;
  color: ${props => props.theme.colors.gray[900]};
  margin-bottom: 0.5rem;
`;

const ResourceDescription = styled.p`
  color: ${props => props.theme.colors.gray[600]};
  font-size: 0.875rem;
  margin-bottom: 1rem;
`;

const ResourcePreview = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.gray[500]};
  font-style: italic;
  margin-bottom: 1rem;
`;

const ResourceMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.875rem;
  color: ${props => props.theme.colors.gray[500]};
  margin-bottom: 1rem;
`;

const DownloadButton = styled.button<{ bgColor: 'blue' | 'red' | 'green' }>`
  width: 100%;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
  color: white;
  
  ${props => {
    const colors = {
      blue: `background-color: ${props.theme.colors.primary}; &:hover { background-color: ${props.theme.colors.navy[700]}; }`,
      red: `background-color: #dc2626; &:hover { background-color: #b91c1c; }`,
      green: `background-color: ${props.theme.colors.accent}; &:hover { background-color: #059669; }`
    };
    return colors[props.bgColor];
  }}
`;

const WebinarMeta = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

const WebinarIcon = styled.div`
  width: 3rem;
  height: 3rem;
  background-color: #fef2f2;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #dc2626;
  font-weight: bold;
  margin-right: 1rem;
  font-size: 1.5rem;
`;

const WebinarDetails = styled.div``;

const WebinarDuration = styled.div`
  font-weight: 500;
  color: ${props => props.theme.colors.gray[900]};
`;

const WebinarAttendees = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.gray[500]};
`;

const WebinarTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: bold;
  color: ${props => props.theme.colors.gray[900]};
  margin-bottom: 0.5rem;
`;

const WebinarSpeaker = styled.p`
  color: ${props => props.theme.colors.gray[600]};
  margin-bottom: 1rem;
`;

const WebinarPreview = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.gray[500]};
  margin-bottom: 1.5rem;
`;

const WebinarFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const WebinarDate = styled.span`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.gray[500]};
`;

const CategoryBadge = styled.span`
  font-size: 0.75rem;
  background-color: #f0fdf4;
  color: ${props => props.theme.colors.accent};
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
`;

const GuideMeta = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.gray[500]};
`;

const ModalOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 50;
`;

const ModalContent = styled(motion.div)`
  background-color: white;
  border-radius: 1rem;
  padding: 2rem;
  max-width: 64rem;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
  font-size: 1.875rem;
  font-weight: bold;
  color: ${props => props.theme.colors.gray[900]};
`;

const ModalSubtitle = styled.p`
  font-size: 1.125rem;
  color: ${props => props.theme.colors.gray[600]};
`;

const CloseButton = styled.button`
  color: ${props => props.theme.colors.gray[400]};
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  
  &:hover {
    color: ${props => props.theme.colors.gray[600]};
  }
`;

const ModalMetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
`;

const ModalMetricCard = styled.div<{ bgColor: 'green' | 'blue' | 'orange' | 'purple' }>`
  text-align: center;
  padding: 1rem;
  border-radius: 0.5rem;
  
  ${props => {
    const colors = {
      green: `background-color: #f0fdf4;`,
      blue: `background-color: #eff6ff;`,
      orange: `background-color: #fff7ed;`,
      purple: `background-color: #faf5ff;`
    };
    return colors[props.bgColor];
  }}
`;

const ModalMetricValue = styled.div<{ color: 'green' | 'blue' | 'orange' | 'purple' }>`
  font-size: 1.875rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
  
  ${props => {
    const colors = {
      green: `color: ${props.theme.colors.accent};`,
      blue: `color: ${props.theme.colors.primary};`,
      orange: `color: ${props.theme.colors.secondary};`,
      purple: `color: #7c3aed;`
    };
    return colors[props.color];
  }}
`;

const ModalMetricLabel = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.gray[600]};
`;

const ModalContentGrid = styled.div`
  display: grid;
  gap: 2rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ModalSection = styled.div``;

const ModalSectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: bold;
  color: ${props => props.theme.colors.gray[900]};
  margin-bottom: 0.75rem;
`;

const ModalSectionText = styled.p`
  color: ${props => props.theme.colors.gray[600]};
  margin-bottom: 1.5rem;
`;

const TestimonialCard = styled.div`
  background-color: ${props => props.theme.colors.gray[50]};
  border-radius: 0.5rem;
  padding: 1.5rem;
`;

const TestimonialQuote = styled.blockquote`
  color: ${props => props.theme.colors.gray[700]};
  margin-bottom: 1rem;
  font-style: italic;
`;

const TestimonialAuthor = styled.div`
  display: flex;
  align-items: center;
`;

const AuthorAvatar = styled.div`
  width: 3rem;
  height: 3rem;
  background-color: ${props => props.theme.colors.primary};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  margin-right: 1rem;
`;

const AuthorInfo = styled.div``;

const AuthorName = styled.div`
  font-weight: 600;
  color: ${props => props.theme.colors.gray[900]};
`;

const AuthorTitle = styled.div`
  color: ${props => props.theme.colors.gray[600]};
`;

const ModalFooter = styled.div`
  margin-top: 2rem;
  display: flex;
  justify-content: center;
`;

const CtaButton = styled.button`
  background-color: ${props => props.theme.colors.primary};
  color: white;
  padding: 0.75rem 2rem;
  border-radius: 0.5rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${props => props.theme.colors.navy[700]};
  }
`;

interface CaseStudy {
  id: number;
  category: string;
  company: string;
  industry: string;
  locations: number;
  challenge: string;
  solution: string;
  results: {
    salesIncrease: number;
    costReduction: number;
    uptimeImprovement: number;
    paybackMonths: number;
  };
  testimonial: {
    quote: string;
    author: string;
    title: string;
  };
  image: string;
  timeline: string;
  roi: number;
}

const CaseStudiesAndResources = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<CaseStudy | null>(null);
  const [activeResourceTab, setActiveResourceTab] = useState('whitepapers');

  const caseStudies = [
    {
      id: 1,
      category: 'retail',
      company: 'FashionForward',
      industry: 'Retail Chain',
      locations: 180,
      challenge: 'Inconsistent customer experiences across locations, high IT costs',
      solution: 'Unified network infrastructure with digital signage and analytics',
      results: {
        salesIncrease: 23,
        costReduction: 42,
        uptimeImprovement: 99.9,
        paybackMonths: 8
      },
      testimonial: {
        quote: "SageNet transformed our entire retail operation. We've seen a 23% increase in sales and cut our IT costs nearly in half.",
        author: "Maria Santos",
        title: "VP of Operations"
      },
      image: "retail-transformation.jpg",
      timeline: "6-month implementation",
      roi: 285
    },
    {
      id: 2,
      category: 'qsr',
      company: 'QuickBite Express',
      industry: 'Quick Service Restaurant',
      locations: 250,
      challenge: 'Network downtime causing lost sales, outdated POS systems',
      solution: 'Resilient network architecture with cloud-based POS integration',
      results: {
        salesIncrease: 18,
        costReduction: 35,
        uptimeImprovement: 99.8,
        paybackMonths: 6
      },
      testimonial: {
        quote: "Zero network downtime in the past year. Our customers notice the difference, and so does our bottom line.",
        author: "James Chen",
        title: "CTO"
      },
      image: "restaurant-network.jpg",
      timeline: "4-month rollout",
      roi: 320
    },
    {
      id: 3,
      category: 'convenience',
      company: 'FuelStop Plus',
      industry: 'Convenience Store Chain',
      locations: 95,
      challenge: 'Payment processing failures, poor customer analytics',
      solution: 'Integrated payment systems with real-time customer insights',
      results: {
        salesIncrease: 15,
        costReduction: 28,
        uptimeImprovement: 99.7,
        paybackMonths: 7
      },
      testimonial: {
        quote: "We finally have visibility into our customer behavior across all locations. The insights are game-changing.",
        author: "Sarah Kim",
        title: "Director of Operations"
      },
      image: "convenience-analytics.jpg",
      timeline: "3-month deployment",
      roi: 245
    }
  ];

  const resources = {
    whitepapers: [
      {
        title: "The ROI of Network Modernization in Multi-Site Retail",
        description: "Comprehensive analysis of infrastructure investment returns across 500+ retail locations",
        downloadCount: "2.3K",
        pages: 24,
        date: "March 2024",
        category: "Infrastructure",
        preview: "Companies investing in modern network infrastructure see an average ROI of 340% within 18 months..."
      },
      {
        title: "Digital Signage Impact Study: QSR Performance Metrics",
        description: "Data-driven insights into customer behavior and sales performance improvements",
        downloadCount: "1.8K",
        pages: 18,
        date: "February 2024",
        category: "Marketing Technology",
        preview: "Digital menu boards and promotional displays drive an average 15% increase in transaction value..."
      },
      {
        title: "Network Security in Multi-Location Enterprises",
        description: "Best practices and frameworks for securing distributed retail networks",
        downloadCount: "3.1K",
        pages: 32,
        date: "January 2024",
        category: "Security",
        preview: "Zero-trust network architecture reduces security incidents by 87% in multi-site deployments..."
      }
    ],
    webinars: [
      {
        title: "Future-Proofing Your Retail Infrastructure",
        speaker: "Dr. Alex Rodriguez, Chief Technology Officer",
        duration: "45 min",
        date: "April 15, 2024",
        attendees: "847",
        category: "Strategy",
        preview: "Learn how leading retailers are preparing their infrastructure for next-generation customer experiences"
      },
      {
        title: "Real-Time Analytics: From Data to Decisions",
        speaker: "Jennifer Park, VP of Analytics",
        duration: "35 min",
        date: "March 22, 2024",
        attendees: "623",
        category: "Analytics",
        preview: "Transform raw network and customer data into actionable business insights"
      }
    ],
    guides: [
      {
        title: "Network Assessment Checklist",
        description: "Complete evaluation framework for multi-site network infrastructure",
        type: "PDF Checklist",
        pages: 8,
        category: "Assessment",
        preview: "Step-by-step guide to identifying network optimization opportunities across your locations"
      },
      {
        title: "Digital Transformation Playbook",
        description: "Proven methodology for successful technology rollouts",
        type: "Implementation Guide",
        pages: 42,
        category: "Strategy",
        preview: "From planning to deployment: ensure your digital initiatives deliver measurable results"
      }
    ]
  };

  const filteredCaseStudies = activeFilter === 'all' 
    ? caseStudies 
    : caseStudies.filter(study => study.category === activeFilter);

  return (
    <Container id="case-studies">
      {/* Case Studies Section */}
      <Section>
        <ContentWrapper>
          {/* Header */}
          <HeaderContainer
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <MainTitle>Success Stories</MainTitle>
            <SubTitle>
              Real results from real businesses. See how SageNet transforms operations 
              and drives measurable outcomes across industries.
            </SubTitle>
          </HeaderContainer>

          {/* Filter Tabs */}
          <FilterContainer>
            <FilterWrapper>
              {['all', 'retail', 'qsr', 'convenience'].map((filter) => (
                <FilterButton
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  active={activeFilter === filter}
                >
                  {filter === 'all' ? 'All Industries' : 
                   filter === 'qsr' ? 'Quick Service' :
                   filter.charAt(0).toUpperCase() + filter.slice(1)}
                </FilterButton>
              ))}
            </FilterWrapper>
          </FilterContainer>

          {/* Case Study Grid */}
          <CaseStudyGrid>
            <AnimatePresence>
              {filteredCaseStudies.map((study, index) => (
                <CaseStudyCard
                  key={study.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  onClick={() => setSelectedCaseStudy(study)}
                >
                  {/* Case Study Image Placeholder */}
                  <CaseStudyImage>
                    <ImageOverlay>
                      <IndustryLabel>{study.industry}</IndustryLabel>
                      <CompanyName>{study.company}</CompanyName>
                    </ImageOverlay>
                    <LocationBadge>
                      {study.locations} locations
                    </LocationBadge>
                  </CaseStudyImage>

                  <CardContent>
                    {/* Key Results */}
                    <MetricsGrid>
                      <MetricItem>
                        <MetricValue color="green">+{study.results.salesIncrease}%</MetricValue>
                        <MetricLabel>Sales Increase</MetricLabel>
                      </MetricItem>
                      <MetricItem>
                        <MetricValue color="blue">{study.results.costReduction}%</MetricValue>
                        <MetricLabel>Cost Reduction</MetricLabel>
                      </MetricItem>
                      <MetricItem>
                        <MetricValue color="orange">{study.results.paybackMonths}mo</MetricValue>
                        <MetricLabel>Payback</MetricLabel>
                      </MetricItem>
                    </MetricsGrid>

                    {/* Challenge Preview */}
                    <ChallengeSection>
                      <SectionTitle>Challenge</SectionTitle>
                      <SectionText>{study.challenge}</SectionText>
                    </ChallengeSection>

                    {/* Testimonial Preview */}
                    <TestimonialPreview>
                      <Quote>
                        "{study.testimonial.quote.substring(0, 80)}..."
                      </Quote>
                      <Attribution>
                        — {study.testimonial.author}, {study.testimonial.title}
                      </Attribution>
                    </TestimonialPreview>

                    <CardFooter>
                      <Timeline>{study.timeline}</Timeline>
                      <ViewLink>View Full Case Study →</ViewLink>
                    </CardFooter>
                  </CardContent>
                </CaseStudyCard>
              ))}
            </AnimatePresence>
          </CaseStudyGrid>

          {/* Featured Metrics */}
          <FeaturedMetrics>
            <FeaturedTitle>Aggregate Results Across All Clients</FeaturedTitle>
            <FeaturedGrid>
              {[
                { value: '340%', label: 'Average ROI', icon: '📈' },
                { value: '99.8%', label: 'Network Uptime', icon: '🔗' },
                { value: '38%', label: 'Average Cost Reduction', icon: '💰' },
                { value: '6.2mo', label: 'Average Payback', icon: '⏱️' }
              ].map((metric, index) => (
                <FeaturedMetric
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <MetricIcon>{metric.icon}</MetricIcon>
                  <FeaturedValue>{metric.value}</FeaturedValue>
                  <FeaturedLabel>{metric.label}</FeaturedLabel>
                </FeaturedMetric>
              ))}
            </FeaturedGrid>
          </FeaturedMetrics>
        </ContentWrapper>
      </Section>

      {/* Resources Section */}
      <SectionWhite>
        <ContentWrapper>
          {/* Header */}
          <ResourcesHeader
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <ResourcesTitle>Knowledge Center</ResourcesTitle>
            <ResourcesSubtitle>
              Industry insights, best practices, and actionable guidance for your digital transformation journey
            </ResourcesSubtitle>
          </ResourcesHeader>

          {/* Resource Type Tabs */}
          <TabContainer>
            <TabWrapper>
              {Object.keys(resources).map((tab) => (
                <TabButton
                  key={tab}
                  onClick={() => setActiveResourceTab(tab)}
                  active={activeResourceTab === tab}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </TabButton>
              ))}
            </TabWrapper>
          </TabContainer>

          {/* Resource Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeResourceTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeResourceTab === 'whitepapers' && (
                <ResourceGrid>
                  {resources.whitepapers.map((paper, index) => (
                    <ResourceCard key={index}>
                      <ResourceHeader>
                        <ResourceIcon bgColor="blue">WP</ResourceIcon>
                        <DownloadCount>{paper.downloadCount} downloads</DownloadCount>
                      </ResourceHeader>
                      
                      <ResourceTitle>{paper.title}</ResourceTitle>
                      <ResourceDescription>{paper.description}</ResourceDescription>
                      
                      <ResourcePreview>
                        "{paper.preview}"
                      </ResourcePreview>
                      
                      <ResourceMeta>
                        <span>{paper.pages} pages</span>
                        <span>{paper.date}</span>
                      </ResourceMeta>
                      
                      <DownloadButton bgColor="blue">
                        Download PDF
                      </DownloadButton>
                    </ResourceCard>
                  ))}
                </ResourceGrid>
              )}

              {activeResourceTab === 'webinars' && (
                <ResourceGridTwo>
                  {resources.webinars.map((webinar, index) => (
                    <ResourceCard key={index}>
                      <WebinarMeta>
                        <WebinarIcon>▶</WebinarIcon>
                        <WebinarDetails>
                          <WebinarDuration>{webinar.duration}</WebinarDuration>
                          <WebinarAttendees>{webinar.attendees} attendees</WebinarAttendees>
                        </WebinarDetails>
                      </WebinarMeta>
                      
                      <WebinarTitle>{webinar.title}</WebinarTitle>
                      <WebinarSpeaker>{webinar.speaker}</WebinarSpeaker>
                      <WebinarPreview>{webinar.preview}</WebinarPreview>
                      
                      <WebinarFooter>
                        <WebinarDate>{webinar.date}</WebinarDate>
                        <DownloadButton bgColor="red">
                          Watch Replay
                        </DownloadButton>
                      </WebinarFooter>
                    </ResourceCard>
                  ))}
                </ResourceGridTwo>
              )}

              {activeResourceTab === 'guides' && (
                <ResourceGridTwo>
                  {resources.guides.map((guide, index) => (
                    <ResourceCard key={index}>
                      <ResourceHeader>
                        <ResourceIcon bgColor="green">📋</ResourceIcon>
                        <CategoryBadge>
                          {guide.category}
                        </CategoryBadge>
                      </ResourceHeader>
                      
                      <WebinarTitle>{guide.title}</WebinarTitle>
                      <ResourceDescription>{guide.description}</ResourceDescription>
                      <WebinarPreview>{guide.preview}</WebinarPreview>
                      
                      <WebinarFooter>
                        <GuideMeta>
                          {guide.type} • {guide.pages} pages
                        </GuideMeta>
                        <DownloadButton bgColor="green">
                          Download Guide
                        </DownloadButton>
                      </WebinarFooter>
                    </ResourceCard>
                  ))}
                </ResourceGridTwo>
              )}
            </motion.div>
          </AnimatePresence>
        </ContentWrapper>
      </SectionWhite>

      {/* Modal for Case Study Details */}
      <AnimatePresence>
        {selectedCaseStudy && (
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCaseStudy(null)}
          >
            <ModalContent
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalHeader>
                <ModalSection>
                  <ModalTitle>{selectedCaseStudy.company}</ModalTitle>
                  <ModalSubtitle>{selectedCaseStudy.industry} • {selectedCaseStudy.locations} locations</ModalSubtitle>
                </ModalSection>
                <CloseButton onClick={() => setSelectedCaseStudy(null)}>
                  ✕
                </CloseButton>
              </ModalHeader>

              {/* Results Grid */}
              <ModalMetricsGrid>
                <ModalMetricCard bgColor="green">
                  <ModalMetricValue color="green">+{selectedCaseStudy.results.salesIncrease}%</ModalMetricValue>
                  <ModalMetricLabel>Sales Increase</ModalMetricLabel>
                </ModalMetricCard>
                <ModalMetricCard bgColor="blue">
                  <ModalMetricValue color="blue">{selectedCaseStudy.results.costReduction}%</ModalMetricValue>
                  <ModalMetricLabel>Cost Reduction</ModalMetricLabel>
                </ModalMetricCard>
                <ModalMetricCard bgColor="orange">
                  <ModalMetricValue color="orange">{selectedCaseStudy.results.uptimeImprovement}%</ModalMetricValue>
                  <ModalMetricLabel>Network Uptime</ModalMetricLabel>
                </ModalMetricCard>
                <ModalMetricCard bgColor="purple">
                  <ModalMetricValue color="purple">{selectedCaseStudy.roi}%</ModalMetricValue>
                  <ModalMetricLabel>Annual ROI</ModalMetricLabel>
                </ModalMetricCard>
              </ModalMetricsGrid>

              <ModalContentGrid>
                <ModalSection>
                  <ModalSectionTitle>The Challenge</ModalSectionTitle>
                  <ModalSectionText>{selectedCaseStudy.challenge}</ModalSectionText>
                  
                  <ModalSectionTitle>The Solution</ModalSectionTitle>
                  <ModalSectionText>{selectedCaseStudy.solution}</ModalSectionText>
                </ModalSection>

                <ModalSection>
                  <ModalSectionTitle>Client Testimonial</ModalSectionTitle>
                  <TestimonialCard>
                    <TestimonialQuote>
                      "{selectedCaseStudy.testimonial.quote}"
                    </TestimonialQuote>
                    <TestimonialAuthor>
                      <AuthorAvatar>
                        {selectedCaseStudy.testimonial.author.charAt(0)}
                      </AuthorAvatar>
                      <AuthorInfo>
                        <AuthorName>{selectedCaseStudy.testimonial.author}</AuthorName>
                        <AuthorTitle>{selectedCaseStudy.testimonial.title}</AuthorTitle>
                      </AuthorInfo>
                    </TestimonialAuthor>
                  </TestimonialCard>
                </ModalSection>
              </ModalContentGrid>

              <ModalFooter>
                <CtaButton>
                  Get Similar Results for Your Business
                </CtaButton>
              </ModalFooter>
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default CaseStudiesAndResources;