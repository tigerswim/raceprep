import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const TestimonialsSection = styled.section`
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
  
  h2 {
    font-size: ${props => props.theme.fontSizes['4xl']};
    font-weight: ${props => props.theme.fontWeights.bold};
    color: ${props => props.theme.colors.gray[900]};
    margin-bottom: ${props => props.theme.spacing.md};
  }
  
  p {
    font-size: ${props => props.theme.fontSizes.lg};
    color: ${props => props.theme.colors.gray[600]};
  }
`;

const TestimonialsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${props => props.theme.spacing.xl};
`;

const TestimonialCard = styled(motion.div)`
  background: ${props => props.theme.colors.gray[50]};
  padding: ${props => props.theme.spacing.xl};
  border-radius: ${props => props.theme.borderRadius.xl};
  border: 1px solid ${props => props.theme.colors.gray[200]};
`;

const Quote = styled.blockquote`
  font-size: ${props => props.theme.fontSizes.lg};
  color: ${props => props.theme.colors.gray[700]};
  font-style: italic;
  margin-bottom: ${props => props.theme.spacing.lg};
  line-height: 1.6;
`;

const Author = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const AuthorAvatar = styled.div`
  width: 48px;
  height: 48px;
  background: ${props => props.theme.colors.primary};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.white};
  font-weight: ${props => props.theme.fontWeights.bold};
  font-size: ${props => props.theme.fontSizes.lg};
`;

const AuthorInfo = styled.div`
  h4 {
    font-weight: ${props => props.theme.fontWeights.semibold};
    color: ${props => props.theme.colors.gray[900]};
    margin-bottom: ${props => props.theme.spacing.xs};
  }
  
  p {
    color: ${props => props.theme.colors.gray[600]};
    font-size: ${props => props.theme.fontSizes.sm};
  }
`;

const TestimonialsSectionComponent: React.FC = () => {
  const testimonials = [
    {
      quote: "SageNet transformed our network infrastructure across 200+ locations, reducing downtime by 95% and increasing our operational efficiency dramatically.",
      author: "Sarah Chen",
      title: "CTO, RetailMax",
      company: "Leading retail chain with 200+ locations"
    },
    {
      quote: "The ROI was immediate. We saw a 40% reduction in IT costs within the first quarter while improving performance across all locations.",
      author: "Michael Rodriguez",
      title: "VP of Operations, QuickBite",
      company: "Fast-casual restaurant franchise"
    },
    {
      quote: "SageNet's proactive monitoring and support lets us focus on growing our business instead of managing network issues.",
      author: "Jennifer Park",
      title: "IT Director, FuelStop",
      company: "Convenience store chain"
    }
  ];

  return (
    <TestimonialsSection>
      <Container>
        <SectionHeader
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2>Trusted by Industry Leaders</h2>
          <p>Real results from real businesses</p>
        </SectionHeader>
        
        <TestimonialsGrid>
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Quote>"{testimonial.quote}"</Quote>
              <Author>
                <AuthorAvatar>
                  {testimonial.author.charAt(0)}
                </AuthorAvatar>
                <AuthorInfo>
                  <h4>{testimonial.author}</h4>
                  <p>{testimonial.title}</p>
                  <p>{testimonial.company}</p>
                </AuthorInfo>
              </Author>
            </TestimonialCard>
          ))}
        </TestimonialsGrid>
      </Container>
    </TestimonialsSection>
  );
};

export default TestimonialsSectionComponent;