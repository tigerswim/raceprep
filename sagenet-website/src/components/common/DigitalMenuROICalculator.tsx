import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';

const CalculatorContainer = styled.div`
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius['2xl']};
  box-shadow: ${props => props.theme.shadows.xl};
  overflow: hidden;
`;

const ProgressBar = styled.div`
  background: ${props => props.theme.colors.gray[200]};
  height: 4px;
  position: relative;
`;

const ProgressFill = styled(motion.div)`
  background: linear-gradient(90deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
  height: 100%;
`;

const SectionContainer = styled.div`
  padding: ${props => props.theme.spacing['3xl']};
`;

const SectionHeader = styled.div`
  margin-bottom: ${props => props.theme.spacing.xl};
  
  h3 {
    font-size: ${props => props.theme.fontSizes['2xl']};
    font-weight: ${props => props.theme.fontWeights.bold};
    color: ${props => props.theme.colors.gray[900]};
    margin-bottom: ${props => props.theme.spacing.sm};
  }
  
  p {
    font-size: ${props => props.theme.fontSizes.md};
    color: ${props => props.theme.colors.gray[600]};
  }
`;

const InputGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${props => props.theme.spacing.lg};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: 1fr;
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
      box-shadow: ${props => props.theme.shadows.sm};
    }
    
    &::-moz-range-thumb {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: ${props => props.theme.colors.primary};
      cursor: pointer;
      border: none;
      box-shadow: ${props => props.theme.shadows.sm};
    }
  }
`;

const SliderValue = styled.div`
  text-align: center;
  margin-top: ${props => props.theme.spacing.sm};
  
  .value {
    font-size: ${props => props.theme.fontSizes.xl};
    font-weight: ${props => props.theme.fontWeights.bold};
    color: ${props => props.theme.colors.primary};
  }
`;

const SelectContainer = styled.div`
  position: relative;
  
  select {
    width: 100%;
    padding: ${props => props.theme.spacing.md};
    border: 1px solid ${props => props.theme.colors.gray[300]};
    border-radius: ${props => props.theme.borderRadius.md};
    background: ${props => props.theme.colors.white};
    font-size: ${props => props.theme.fontSizes.md};
    color: ${props => props.theme.colors.gray[900]};
    cursor: pointer;
    appearance: none;
    
    &:focus {
      outline: none;
      border-color: ${props => props.theme.colors.primary};
      box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
    }
  }
  
  &::after {
    content: '▼';
    position: absolute;
    right: ${props => props.theme.spacing.md};
    top: 50%;
    transform: translateY(-50%);
    color: ${props => props.theme.colors.gray[500]};
    pointer-events: none;
  }
`;

const ResultsDashboard = styled(motion.div)`
  background: ${props => props.theme.colors.gray[50]};
  border-top: 1px solid ${props => props.theme.colors.gray[200]};
  padding: ${props => props.theme.spacing['3xl']};
`;

const SummaryCards = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing['2xl']};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const MetricCard = styled(motion.div)<{ color: 'blue' | 'green' | 'orange' | 'purple' }>`
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.xl};
  padding: ${props => props.theme.spacing.xl};
  text-align: center;
  box-shadow: ${props => props.theme.shadows.sm};
  border-left: 4px solid ${props => {
    const colorMap = {
      blue: props.theme.colors.primary,
      green: '#059669',
      orange: '#ea580c',
      purple: '#9333ea'
    };
    return colorMap[props.color];
  }};
`;

const MetricValue = styled(motion.div)`
  font-size: ${props => props.theme.fontSizes['3xl']};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.gray[900]};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const MetricLabel = styled.div`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.gray[600]};
  font-weight: ${props => props.theme.fontWeights.medium};
`;

const CTASection = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  justify-content: center;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
  }
`;

const SectionToggle = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.primary};
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.medium};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  margin-bottom: ${props => props.theme.spacing.lg};
  
  &:hover {
    text-decoration: underline;
  }
`;

interface CalculatorInputs {
  numberOfLocations: number;
  avgDailyTransactions: number;
  currentAverageOrderValue: number;
  annualMenuPrintingCosts: number;
  industryType: 'qsr' | 'fastcasual' | 'retail' | 'healthcare' | 'hospitality' | 'other';
  hasLoyaltyProgram: 'yes' | 'no' | 'planning';
  hasMobileOrdering: 'yes' | 'no' | 'planning';
  menuComplexity: 'simple' | 'moderate' | 'complex';
  plannedExpansion: number;
  revenueGrowthTarget: number;
  promotionalFrequency: 'monthly' | 'quarterly' | 'seasonal' | 'annual';
}

interface ROIResults {
  additionalAnnualRevenue: number;
  totalCostSavings: number;
  initialInvestment: number;
  annualServiceCosts: number;
  threeYearROI: number;
  paybackPeriodMonths: number;
}

interface DigitalMenuROICalculatorProps {
  onLeadSubmit?: (leadData: any) => void;
  className?: string;
}

const DigitalMenuROICalculator: React.FC<DigitalMenuROICalculatorProps> = ({
  onLeadSubmit,
  className
}) => {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    numberOfLocations: 25,
    avgDailyTransactions: 150,
    currentAverageOrderValue: 12,
    annualMenuPrintingCosts: 1200,
    industryType: 'qsr',
    hasLoyaltyProgram: 'yes',
    hasMobileOrdering: 'yes',
    menuComplexity: 'moderate',
    plannedExpansion: 10,
    revenueGrowthTarget: 15,
    promotionalFrequency: 'monthly'
  });

  const [showBusinessContext, setShowBusinessContext] = useState(false);
  const [showGrowthObjectives, setShowGrowthObjectives] = useState(false);
  const [results, setResults] = useState<ROIResults | null>(null);

  const calculateProgress = () => {
    let completed = 4; // Basic inputs always completed
    if (showBusinessContext) completed += 4;
    if (showGrowthObjectives) completed += 3;
    return (completed / 11) * 100;
  };

  const calculateROI = (calculatorInputs: CalculatorInputs): ROIResults => {
    const multipliers = {
      qsr: { orderValue: 1.025, traffic: 1.091, operational: 1.15 },
      fastcasual: { orderValue: 1.035, traffic: 1.08, operational: 1.12 },
      retail: { orderValue: 1.030, traffic: 1.085, operational: 1.10 },
      healthcare: { orderValue: 1.020, traffic: 1.06, operational: 1.08 },
      hospitality: { orderValue: 1.028, traffic: 1.075, operational: 1.11 },
      other: { orderValue: 1.025, traffic: 1.075, operational: 1.10 }
    };

    const baselineRevenue = calculatorInputs.numberOfLocations * 
      calculatorInputs.avgDailyTransactions * 
      calculatorInputs.currentAverageOrderValue * 365;

    const improvedRevenue = calculatorInputs.numberOfLocations * 
      (calculatorInputs.avgDailyTransactions * multipliers[calculatorInputs.industryType].traffic) * 
      (calculatorInputs.currentAverageOrderValue * multipliers[calculatorInputs.industryType].orderValue) * 365;

    const printingSavings = calculatorInputs.numberOfLocations * calculatorInputs.annualMenuPrintingCosts;
    const operationalSavings = calculatorInputs.numberOfLocations * multipliers[calculatorInputs.industryType].operational * 2400;

    const initialInvestment = calculatorInputs.numberOfLocations * 15000;
    const annualServiceCosts = calculatorInputs.numberOfLocations * 450 * 12;

    const additionalAnnualRevenue = improvedRevenue - baselineRevenue;
    const totalCostSavings = printingSavings + operationalSavings;
    const netAnnualBenefit = additionalAnnualRevenue + totalCostSavings - annualServiceCosts;
    const paybackPeriodMonths = Math.ceil(initialInvestment / (netAnnualBenefit / 12));
    const threeYearROI = Math.round(((netAnnualBenefit * 3 - initialInvestment) / initialInvestment) * 100);

    return {
      additionalAnnualRevenue,
      totalCostSavings,
      initialInvestment,
      annualServiceCosts,
      threeYearROI,
      paybackPeriodMonths
    };
  };

  useEffect(() => {
    setResults(calculateROI(inputs));
  }, [inputs]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleInputChange = (field: keyof CalculatorInputs, value: any) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <CalculatorContainer className={className}>
      <ProgressBar>
        <ProgressFill 
          initial={{ width: 0 }}
          animate={{ width: `${calculateProgress()}%` }}
          transition={{ duration: 0.5 }}
        />
      </ProgressBar>

      <SectionContainer>
        <SectionHeader>
          <h3>Business Basics</h3>
          <p>Tell us about your current operations to calculate potential impact</p>
        </SectionHeader>

        <InputGrid>
          <InputGroup>
            <label>Number of Locations</label>
            <SliderContainer>
              <input
                type="range"
                min="1"
                max="500"
                value={inputs.numberOfLocations}
                onChange={(e) => handleInputChange('numberOfLocations', parseInt(e.target.value))}
              />
            </SliderContainer>
            <SliderValue>
              <div className="value">{inputs.numberOfLocations}</div>
            </SliderValue>
          </InputGroup>

          <InputGroup>
            <label>Average Daily Transactions per Location</label>
            <SliderContainer>
              <input
                type="range"
                min="50"
                max="1000"
                value={inputs.avgDailyTransactions}
                onChange={(e) => handleInputChange('avgDailyTransactions', parseInt(e.target.value))}
              />
            </SliderContainer>
            <SliderValue>
              <div className="value">{inputs.avgDailyTransactions}</div>
            </SliderValue>
          </InputGroup>

          <InputGroup>
            <label>Current Average Order Value</label>
            <SliderContainer>
              <input
                type="range"
                min="5"
                max="100"
                value={inputs.currentAverageOrderValue}
                onChange={(e) => handleInputChange('currentAverageOrderValue', parseInt(e.target.value))}
              />
            </SliderContainer>
            <SliderValue>
              <div className="value">{formatCurrency(inputs.currentAverageOrderValue)}</div>
            </SliderValue>
          </InputGroup>

          <InputGroup>
            <label>Annual Menu Printing Costs per Location</label>
            <SliderContainer>
              <input
                type="range"
                min="500"
                max="5000"
                step="100"
                value={inputs.annualMenuPrintingCosts}
                onChange={(e) => handleInputChange('annualMenuPrintingCosts', parseInt(e.target.value))}
              />
            </SliderContainer>
            <SliderValue>
              <div className="value">{formatCurrency(inputs.annualMenuPrintingCosts)}</div>
            </SliderValue>
          </InputGroup>
        </InputGrid>

        <SectionToggle onClick={() => setShowBusinessContext(!showBusinessContext)}>
          {showBusinessContext ? '−' : '+'} Business Context (Optional - Improves Accuracy)
        </SectionToggle>

        <AnimatePresence>
          {showBusinessContext && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <InputGrid>
                <InputGroup>
                  <label>Industry Type</label>
                  <SelectContainer>
                    <select
                      value={inputs.industryType}
                      onChange={(e) => handleInputChange('industryType', e.target.value)}
                    >
                      <option value="qsr">Quick Service Restaurant</option>
                      <option value="fastcasual">Fast-Casual</option>
                      <option value="retail">Retail</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="hospitality">Hospitality</option>
                      <option value="other">Other</option>
                    </select>
                  </SelectContainer>
                </InputGroup>

                <InputGroup>
                  <label>Loyalty Program</label>
                  <SelectContainer>
                    <select
                      value={inputs.hasLoyaltyProgram}
                      onChange={(e) => handleInputChange('hasLoyaltyProgram', e.target.value)}
                    >
                      <option value="yes">Yes, implemented</option>
                      <option value="no">No</option>
                      <option value="planning">Planning to implement</option>
                    </select>
                  </SelectContainer>
                </InputGroup>

                <InputGroup>
                  <label>Mobile Ordering</label>
                  <SelectContainer>
                    <select
                      value={inputs.hasMobileOrdering}
                      onChange={(e) => handleInputChange('hasMobileOrdering', e.target.value)}
                    >
                      <option value="yes">Yes, implemented</option>
                      <option value="no">No</option>
                      <option value="planning">Planning to implement</option>
                    </select>
                  </SelectContainer>
                </InputGroup>

                <InputGroup>
                  <label>Menu Complexity</label>
                  <SelectContainer>
                    <select
                      value={inputs.menuComplexity}
                      onChange={(e) => handleInputChange('menuComplexity', e.target.value)}
                    >
                      <option value="simple">Simple (under 20 items)</option>
                      <option value="moderate">Moderate (20-50 items)</option>
                      <option value="complex">Complex (50+ items)</option>
                    </select>
                  </SelectContainer>
                </InputGroup>
              </InputGrid>
            </motion.div>
          )}
        </AnimatePresence>

        <SectionToggle onClick={() => setShowGrowthObjectives(!showGrowthObjectives)}>
          {showGrowthObjectives ? '−' : '+'} Growth Objectives (Optional - Advanced Projections)
        </SectionToggle>

        <AnimatePresence>
          {showGrowthObjectives && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <InputGrid>
                <InputGroup>
                  <label>Planned Expansion (%)</label>
                  <SliderContainer>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={inputs.plannedExpansion}
                      onChange={(e) => handleInputChange('plannedExpansion', parseInt(e.target.value))}
                    />
                  </SliderContainer>
                  <SliderValue>
                    <div className="value">{inputs.plannedExpansion}%</div>
                  </SliderValue>
                </InputGroup>

                <InputGroup>
                  <label>Revenue Growth Target (%)</label>
                  <SliderContainer>
                    <input
                      type="range"
                      min="5"
                      max="30"
                      value={inputs.revenueGrowthTarget}
                      onChange={(e) => handleInputChange('revenueGrowthTarget', parseInt(e.target.value))}
                    />
                  </SliderContainer>
                  <SliderValue>
                    <div className="value">{inputs.revenueGrowthTarget}%</div>
                  </SliderValue>
                </InputGroup>

                <InputGroup>
                  <label>Promotional Frequency</label>
                  <SelectContainer>
                    <select
                      value={inputs.promotionalFrequency}
                      onChange={(e) => handleInputChange('promotionalFrequency', e.target.value)}
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="seasonal">Seasonal</option>
                      <option value="annual">Annual</option>
                    </select>
                  </SelectContainer>
                </InputGroup>
              </InputGrid>
            </motion.div>
          )}
        </AnimatePresence>
      </SectionContainer>

      {results && (
        <ResultsDashboard
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <SummaryCards>
            <MetricCard color="green">
              <MetricValue
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                {formatCurrency(results.additionalAnnualRevenue)}
              </MetricValue>
              <MetricLabel>Additional Annual Revenue</MetricLabel>
            </MetricCard>

            <MetricCard color="blue">
              <MetricValue
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
              >
                {formatCurrency(results.totalCostSavings)}
              </MetricValue>
              <MetricLabel>Total Annual Savings</MetricLabel>
            </MetricCard>

            <MetricCard color="purple">
              <MetricValue
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
              >
                {results.threeYearROI}%
              </MetricValue>
              <MetricLabel>3-Year ROI</MetricLabel>
            </MetricCard>

            <MetricCard color="orange">
              <MetricValue
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
              >
                {results.paybackPeriodMonths} months
              </MetricValue>
              <MetricLabel>Payback Period</MetricLabel>
            </MetricCard>
          </SummaryCards>

          <CTASection>
            <Button size="lg" variant="primary">
              Request Custom Demo
            </Button>
            <Button size="lg" variant="outline">
              Download Detailed Report
            </Button>
          </CTASection>
        </ResultsDashboard>
      )}
    </CalculatorContainer>
  );
};

export default DigitalMenuROICalculator;