import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Button from '../common/Button';

const ROISection = styled.section`
  background: ${props => props.theme.colors.navy[50]};
  padding: ${props => props.theme.spacing.xl} 0;
`;

const Container = styled.div`
  max-width: 1024px;
  margin: 0 auto;
  padding: 0 ${props => props.theme.spacing.lg};
`;

const SectionHeader = styled(motion.div)`
  text-align: center;
  margin-bottom: ${props => props.theme.spacing['3xl']};
  
  h2 {
    font-size: ${props => props.theme.fontSizes['4xl']};
    font-weight: ${props => props.theme.fontWeights.bold};
    color: ${props => props.theme.colors.gray[900]};
    margin-bottom: ${props => props.theme.spacing.lg};
  }
  
  p {
    font-size: ${props => props.theme.fontSizes.xl};
    color: ${props => props.theme.colors.gray[600]};
  }
`;

const CalculatorCard = styled.div`
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius['2xl']};
  box-shadow: ${props => props.theme.shadows.xl};
  padding: ${props => props.theme.spacing['3xl']};
`;

const CalculatorGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${props => props.theme.spacing['3xl']};
  
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: 1fr 1fr;
  }
`;

const InputSection = styled.div`
  h3 {
    font-size: ${props => props.theme.fontSizes['2xl']};
    font-weight: ${props => props.theme.fontWeights.bold};
    color: ${props => props.theme.colors.gray[900]};
    margin-bottom: ${props => props.theme.spacing.lg};
  }
`;

const InputGroup = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};
  
  label {
    display: block;
    font-size: ${props => props.theme.fontSizes.sm};
    font-weight: ${props => props.theme.fontWeights.medium};
    color: ${props => props.theme.colors.gray[700]};
    margin-bottom: ${props => props.theme.spacing.sm};
  }
`;

const SliderContainer = styled.div`
  position: relative;
  margin-bottom: ${props => props.theme.spacing.sm};
  
  input[type="range"] {
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: ${props => props.theme.colors.gray[200]};
    outline: none;
    appearance: none;
    
    &::-webkit-slider-thumb {
      appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: ${props => props.theme.colors.primary};
      cursor: pointer;
    }
    
    &::-moz-range-thumb {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: ${props => props.theme.colors.primary};
      cursor: pointer;
      border: none;
    }
  }
`;

const SliderValue = styled.div`
  text-align: center;
  margin-top: ${props => props.theme.spacing.sm};
  
  .value {
    font-size: ${props => props.theme.fontSizes['2xl']};
    font-weight: ${props => props.theme.fontWeights.bold};
    color: ${props => props.theme.colors.primary};
  }
`;

const ResultsSection = styled.div`
  h3 {
    font-size: ${props => props.theme.fontSizes['2xl']};
    font-weight: ${props => props.theme.fontWeights.bold};
    color: ${props => props.theme.colors.gray[900]};
    margin-bottom: ${props => props.theme.spacing.lg};
  }
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const ResultCard = styled(motion.div)<{ color: 'blue' | 'green' | 'orange' | 'purple' }>`
  background: ${props => {
    const colorMap = {
      blue: props.theme.colors.navy[50],
      green: '#ecfdf5',
      orange: '#fff7ed',
      purple: '#faf5ff'
    };
    return colorMap[props.color] || colorMap.blue;
  }};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.xl};
  text-align: center;
  
  .value {
    font-size: ${props => props.theme.fontSizes['2xl']};
    font-weight: ${props => props.theme.fontWeights.bold};
    color: ${props => {
      const colorMap = {
        blue: props.theme.colors.primary,
        green: '#059669',
        orange: '#ea580c',
        purple: '#9333ea'
      };
      return colorMap[props.color] || colorMap.blue;
    }};
    margin-bottom: ${props => props.theme.spacing.xs};
  }
  
  .label {
    font-size: ${props => props.theme.fontSizes.sm};
    color: ${props => props.theme.colors.gray[600]};
  }
`;

interface ROIInputs {
  locations: number;
  avgTransaction: number;
}

const ROICalculator: React.FC = () => {
  const [inputs, setInputs] = useState<ROIInputs>({
    locations: 25,
    avgTransaction: 12
  });

  const calculateResults = () => {
    const { locations, avgTransaction } = inputs;
    const annualRevenue = locations * avgTransaction * 1000 * 365;
    const salesIncrease = annualRevenue * 0.15;
    const monthlySalesIncrease = salesIncrease / 12;
    const implementationCost = locations * 2000;
    const paybackMonths = Math.round(implementationCost / monthlySalesIncrease);
    const annualROI = Math.round(((salesIncrease - implementationCost) / implementationCost) * 100);

    return {
      monthlySalesIncrease,
      paybackMonths,
      costReduction: 40,
      annualROI
    };
  };

  const results = calculateResults();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <ROISection>
      <Container>
        <SectionHeader
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2>Calculate Your Impact</h2>
          <p>See how SageNet transforms your business metrics</p>
        </SectionHeader>

        <CalculatorCard>
          <CalculatorGrid>
            <InputSection>
              <h3>Your Business</h3>
              
              <InputGroup>
                <label>Number of Locations</label>
                <SliderContainer>
                  <input
                    type="range"
                    min="1"
                    max="500"
                    value={inputs.locations}
                    onChange={(e) => setInputs({
                      ...inputs,
                      locations: parseInt(e.target.value)
                    })}
                  />
                </SliderContainer>
                <SliderValue>
                  <div className="value">{inputs.locations}</div>
                </SliderValue>
              </InputGroup>

              <InputGroup>
                <label>Average Transaction Size</label>
                <SliderContainer>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={inputs.avgTransaction}
                    onChange={(e) => setInputs({
                      ...inputs,
                      avgTransaction: parseInt(e.target.value)
                    })}
                  />
                </SliderContainer>
                <SliderValue>
                  <div className="value">{formatCurrency(inputs.avgTransaction)}</div>
                </SliderValue>
              </InputGroup>
            </InputSection>

            <ResultsSection>
              <h3>Your Results</h3>
              
              <ResultsGrid>
                <ResultCard
                  color="blue"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="value">
                    {formatCurrency(results.monthlySalesIncrease)}
                  </div>
                  <div className="label">Monthly Sales Increase</div>
                </ResultCard>
                
                <ResultCard
                  color="green"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="value">{results.paybackMonths}</div>
                  <div className="label">Payback (Months)</div>
                </ResultCard>
                
                <ResultCard
                  color="orange"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="value">{results.costReduction}%</div>
                  <div className="label">Cost Reduction</div>
                </ResultCard>
                
                <ResultCard
                  color="purple"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="value">{results.annualROI}%</div>
                  <div className="label">Annual ROI</div>
                </ResultCard>
              </ResultsGrid>

              <Button size="lg" variant="primary" style={{ width: '100%' }}>
                Get Detailed ROI Report
              </Button>
            </ResultsSection>
          </CalculatorGrid>
        </CalculatorCard>
      </Container>
    </ROISection>
  );
};

export default ROICalculator;