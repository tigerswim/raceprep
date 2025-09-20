import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';

const ShowcaseSection = styled.section`
  padding: ${props => props.theme.spacing.lg} 0;
  background: ${props => props.theme.colors.gray[50]};
`;

const SectionHeader = styled.div`
  text-align: left;
  margin-bottom: ${props => props.theme.spacing.lg};
  max-width: 800px;

  h2 {
    font-size: ${props => props.theme.fontSizes['4xl']};
    font-weight: ${props => props.theme.fontWeights.bold};
    color: ${props => props.theme.colors.gray[900]};
    margin-bottom: ${props => props.theme.spacing.lg};
    line-height: 1.2;
  }

  p {
    font-size: ${props => props.theme.fontSizes.xl};
    color: ${props => props.theme.colors.gray[600]};
    line-height: 1.6;
  }
`;

const ShowcaseGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.xl};

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const ShowcaseCard = styled(motion.div)`
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius['2xl']};
  overflow: hidden;
  box-shadow: ${props => props.theme.shadows.md};
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${props => props.theme.shadows.xl};
  }

  .image-container {
    position: relative;
    height: 240px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    &:hover img {
      transform: scale(1.05);
    }

    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(to bottom, transparent, rgba(0,0,0,0.7));
      display: flex;
      align-items: flex-end;
      padding: ${props => props.theme.spacing.lg};

      .category {
        background: ${props => props.theme.colors.secondary};
        color: ${props => props.theme.colors.white};
        padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
        border-radius: ${props => props.theme.borderRadius.full};
        font-size: ${props => props.theme.fontSizes.sm};
        font-weight: ${props => props.theme.fontWeights.medium};
      }
    }
  }

  .content {
    padding: ${props => props.theme.spacing.lg};

    h3 {
      font-size: ${props => props.theme.fontSizes.lg};
      font-weight: ${props => props.theme.fontWeights.bold};
      color: ${props => props.theme.colors.gray[900]};
      margin-bottom: ${props => props.theme.spacing.sm};
    }

    p {
      color: ${props => props.theme.colors.gray[600]};
      line-height: 1.5;
      margin-bottom: ${props => props.theme.spacing.md};
    }

    .metrics {
      display: flex;
      justify-content: space-between;
      padding-top: ${props => props.theme.spacing.md};
      border-top: 1px solid ${props => props.theme.colors.gray[200]};

      .metric {
        text-align: center;

        .value {
          font-size: ${props => props.theme.fontSizes.lg};
          font-weight: ${props => props.theme.fontWeights.bold};
          color: ${props => props.theme.colors.primary};
        }

        .label {
          font-size: ${props => props.theme.fontSizes.xs};
          color: ${props => props.theme.colors.gray[500]};
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
      }
    }
  }
`;

const CTASection = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing['2xl']};
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius['2xl']};
  box-shadow: ${props => props.theme.shadows.lg};

  h3 {
    font-size: ${props => props.theme.fontSizes['2xl']};
    font-weight: ${props => props.theme.fontWeights.bold};
    color: ${props => props.theme.colors.gray[900]};
    margin-bottom: ${props => props.theme.spacing.md};
  }

  p {
    font-size: ${props => props.theme.fontSizes.md};
    color: ${props => props.theme.colors.gray[600]};
    margin-bottom: ${props => props.theme.spacing.lg};
  }

  .button-group {
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing.md};

    @media (min-width: ${props => props.theme.breakpoints.sm}) {
      flex-direction: row;
      justify-content: center;
    }
  }
`;

const SolutionsShowcase: React.FC = () => {
  const navigate = useNavigate();
  const solutions = [
    {
      title: 'Drive-Thru Excellence',
      category: 'Fast Food',
      description: 'Dynamic menu boards that increase order values and reduce wait times in high-traffic drive-thru environments.',
      image: '/images/signage/SageNet-blog-drive-thru-technology.jpg',
      imageAlt: 'Digital menu boards in restaurant drive-thru showing dynamic food offerings',
      metrics: [
        { value: '33%', label: 'Sales Increase' },
        { value: '2.5%', label: 'Order Value ↑' },
        { value: '70%', label: 'Revenue Source' }
      ]
    },
    {
      title: 'In-Store Experience',
      category: 'QSR',
      description: 'Eye-catching promotional displays that drive impulse purchases and enhance brand messaging throughout the dining experience.',
      image: '/images/signage/SageNet-blog-Restaurant-Signage.jpg',
      imageAlt: 'Restaurant digital signage displaying promotional combo menu',
      metrics: [
        { value: '400%', label: 'More Engaging' },
        { value: '$1.5M', label: '5-Year Impact' },
        { value: '99.9%', label: 'Uptime' }
      ]
    },
    {
      title: 'In-Store Operations',
      category: 'Retail',
      description: 'Flexible signage solutions that promote seasonal items, sales, and brand partnerships while reducing operational costs.',
      image: '/images/signage/SageNet-blog-Signage-Small-Stores.jpg',
      imageAlt: 'Digital signage in retail store showing promotional sale content',
      metrics: [
        { value: '$30K', label: 'Annual Savings' },
        { value: '80%', label: 'Print Reduction' },
        { value: '24/7', label: 'Remote Updates' }
      ]
    }
  ];

  return (
    <ShowcaseSection>
      <div className="container">
        <SectionHeader>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Solutions in Action Across Industries
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            See how leading brands are transforming customer experiences and driving revenue 
            with SageNet's integrated digital solutions and network infrastructure.
          </motion.p>
        </SectionHeader>

        <ShowcaseGrid>
          {solutions.map((solution, index) => (
            <ShowcaseCard
              key={solution.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <div className="image-container">
                <img src={solution.image} alt={solution.imageAlt} />
                <div className="overlay">
                  <div className="category">{solution.category}</div>
                </div>
              </div>
              <div className="content">
                <h3>{solution.title}</h3>
                <p>{solution.description}</p>
                <div className="metrics">
                  {solution.metrics.map((metric, metricIndex) => (
                    <div key={metricIndex} className="metric">
                      <div className="value">{metric.value}</div>
                      <div className="label">{metric.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </ShowcaseCard>
          ))}
        </ShowcaseGrid>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <CTASection>
            <h3>Ready to Transform Your Locations?</h3>
            <p>
              Join industry leaders who are already seeing measurable results from SageNet's 
              integrated approach to connectivity and digital experiences.
            </p>
            <div className="button-group">
              <Button 
                variant="primary" 
                size="lg"
                onClick={() => navigate('/contact')}
              >
                Schedule a Demo
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => {
                  const calculatorElement = document.getElementById('roi-calculator');
                  if (calculatorElement) {
                    calculatorElement.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Calculate Your ROI
              </Button>
            </div>
          </CTASection>
        </motion.div>
      </div>
    </ShowcaseSection>
  );
};

export default SolutionsShowcase;