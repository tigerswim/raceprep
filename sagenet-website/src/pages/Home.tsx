import React from 'react';
import Hero from '../components/sections/Hero';
import CustomerLogos from '../components/sections/CustomerLogos';
import StatsSection from '../components/sections/StatsSection';
import IntegratedSolutions from '../components/sections/IntegratedSolutions';
import SolutionsShowcase from '../components/sections/SolutionsShowcase';
import ROIPreview from '../components/sections/ROIPreview';
import CompetitiveAdvantage from '../components/sections/CompetitiveAdvantage';
import AdvancedROICalculator from '../components/sections/AdvancedROICalculator';
import CaseStudiesAndResources from '../components/sections/CaseStudiesAndResources';

const Home: React.FC = () => {
  return (
    <>
      <Hero />
      <CustomerLogos />
      <StatsSection />
      <IntegratedSolutions />
      <SolutionsShowcase />
      <ROIPreview />
      <CompetitiveAdvantage />
      <AdvancedROICalculator />
      <CaseStudiesAndResources />
    </>
  );
};

export default Home;