import React, { useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import Button from './Button';

const HeaderWrapper = styled.header`
  background: ${props => props.theme.colors.white};
  box-shadow: ${props => props.theme.shadows.sm};
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.sm} 0;

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing.md} 0;
  }
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
  
  img {
    height: 40px;
    width: auto;
    transition: opacity 0.2s ease;
  }

  &:hover img {
    opacity: 0.8;
  }
`;

const NavLinks = styled.div`
  display: none;
  align-items: center;
  gap: ${props => props.theme.spacing.lg};

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    display: flex;
  }
`;

const NavLink = styled(Link)`
  font-weight: ${props => props.theme.fontWeights.medium};
  color: ${props => props.theme.colors.gray[700]};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.md};
  transition: all 0.2s ease;

  &:hover {
    color: ${props => props.theme.colors.primary};
    background-color: ${props => props.theme.colors.gray[50]};
  }
`;

const MobileMenuButton = styled.button`
  display: block;
  padding: ${props => props.theme.spacing.xs};
  color: ${props => props.theme.colors.gray[700]};

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    display: none;
  }
`;

const MobileMenu = styled.div<{ isOpen: boolean }>`
  display: ${props => (props.isOpen ? 'block' : 'none')};
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: ${props => props.theme.colors.white};
  box-shadow: ${props => props.theme.shadows.lg};
  padding: ${props => props.theme.spacing.md};

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    display: none;
  }
`;

const MobileNavLink = styled(Link)`
  display: block;
  padding: ${props => props.theme.spacing.sm};
  color: ${props => props.theme.colors.gray[700]};
  font-weight: ${props => props.theme.fontWeights.medium};
  border-radius: ${props => props.theme.borderRadius.md};
  transition: all 0.2s ease;

  &:hover {
    color: ${props => props.theme.colors.primary};
    background-color: ${props => props.theme.colors.gray[50]};
  }
`;

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <HeaderWrapper>
      <div className="container">
        <Nav>
          <Logo to="/">
            <img src="/images/logo/sagenet-logo-2023.webp" alt="SageNet" />
          </Logo>
          
          <NavLinks>
            <NavLink to="/marketing">Digital Displays</NavLink>
            <NavLink to="/it">Managed Networks</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/resources">Resources</NavLink>
            <Button variant="primary" size="sm" as={Link} to="/contact">
              Get Started
            </Button>
          </NavLinks>

          <MobileMenuButton
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </MobileMenuButton>
        </Nav>

        <MobileMenu isOpen={isMobileMenuOpen}>
          <MobileNavLink to="/marketing" onClick={() => setIsMobileMenuOpen(false)}>
            For Marketing
          </MobileNavLink>
          <MobileNavLink to="/it" onClick={() => setIsMobileMenuOpen(false)}>
            For IT
          </MobileNavLink>
          <MobileNavLink to="/about" onClick={() => setIsMobileMenuOpen(false)}>
            About
          </MobileNavLink>
          <MobileNavLink to="/resources" onClick={() => setIsMobileMenuOpen(false)}>
            Resources
          </MobileNavLink>
          <div style={{ marginTop: '16px' }}>
            <Button variant="primary" size="sm" as={Link} to="/contact" style={{ width: '100%' }}>
              Get Started
            </Button>
          </div>
        </MobileMenu>
      </div>
    </HeaderWrapper>
  );
};

export default Header;