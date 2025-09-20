import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const FooterWrapper = styled.footer`
  background: ${props => props.theme.colors.gray[900]};
  color: ${props => props.theme.colors.gray[300]};
  padding: ${props => props.theme.spacing['3xl']} 0 ${props => props.theme.spacing.xl} 0;
`;

const FooterContent = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${props => props.theme.spacing['2xl']};

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: 2fr 1fr 1fr 1fr;
  }
`;

const FooterSection = styled.div`
  h3 {
    color: ${props => props.theme.colors.white};
    font-size: ${props => props.theme.fontSizes.lg};
    font-weight: ${props => props.theme.fontWeights.semibold};
    margin-bottom: ${props => props.theme.spacing.md};
  }

  p {
    color: ${props => props.theme.colors.gray[400]};
    line-height: 1.6;
    margin-bottom: ${props => props.theme.spacing.sm};
  }
`;

const FooterLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const FooterLink = styled(Link)`
  color: ${props => props.theme.colors.gray[400]};
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: ${props => props.theme.colors.white};
  }
`;

const FooterBottom = styled.div`
  border-top: 1px solid ${props => props.theme.colors.gray[800]};
  margin-top: ${props => props.theme.spacing['2xl']};
  padding-top: ${props => props.theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
  
  @media (min-width: ${props => props.theme.breakpoints.md}) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const Copyright = styled.p`
  color: ${props => props.theme.colors.gray[500]};
  font-size: ${props => props.theme.fontSizes.sm};
  margin: 0;
`;

const Footer: React.FC = () => {
  return (
    <FooterWrapper>
      <div className="container">
        <FooterContent>
          <FooterSection>
            <h3>SageNet</h3>
            <p>
              The only infrastructure partner built for multi-site retail. Scale both your 
              connectivity and digital experiences with 25+ years of proven expertise.
            </p>
          </FooterSection>

          <FooterSection>
            <h3>Solutions</h3>
            <FooterLinks>
              <FooterLink to="/marketing">Digital Displays</FooterLink>
              <FooterLink to="/it">Managed Networks</FooterLink>
              <FooterLink to="/industries/qsr">Quick Service</FooterLink>
              <FooterLink to="/industries/retail">Retail</FooterLink>
              <FooterLink to="/industries/convenience">Convenience</FooterLink>
            </FooterLinks>
          </FooterSection>

          <FooterSection>
            <h3>Company</h3>
            <FooterLinks>
              <FooterLink to="/about">About</FooterLink>
              <FooterLink to="/customers">Customers</FooterLink>
              <FooterLink to="/careers">Careers</FooterLink>
              <FooterLink to="/news">News</FooterLink>
              <FooterLink to="/contact">Contact</FooterLink>
            </FooterLinks>
          </FooterSection>

          <FooterSection>
            <h3>Resources</h3>
            <FooterLinks>
              <FooterLink to="/resources/blog">Blog</FooterLink>
              <FooterLink to="/resources/whitepapers">Whitepapers</FooterLink>
              <FooterLink to="/resources/case-studies">Case Studies</FooterLink>
              <FooterLink to="/resources/webinars">Webinars</FooterLink>
              <FooterLink to="/support">Support</FooterLink>
            </FooterLinks>
          </FooterSection>
        </FooterContent>

        <FooterBottom>
          <Copyright>
            © {new Date().getFullYear()} SageNet. All rights reserved.
          </Copyright>
          <div style={{ display: 'flex', gap: '24px' }}>
            <FooterLink to="/privacy">Privacy Policy</FooterLink>
            <FooterLink to="/terms">Terms of Service</FooterLink>
          </div>
        </FooterBottom>
      </div>
    </FooterWrapper>
  );
};

export default Footer;