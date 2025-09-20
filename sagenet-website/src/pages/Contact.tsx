import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Button from '../components/common/Button';

const ContactWrapper = styled.div`
  min-height: 80vh;
  padding: ${props => props.theme.spacing['4xl']} 0;
`;

const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${props => props.theme.spacing['3xl']};
  max-width: 1200px;
  margin: 0 auto;

  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: 1fr 1fr;
  }
`;

const ContactInfo = styled(motion.div)`
  h2 {
    font-size: ${props => props.theme.fontSizes['4xl']};
    color: ${props => props.theme.colors.gray[900]};
    margin-bottom: ${props => props.theme.spacing.lg};
  }

  p {
    font-size: ${props => props.theme.fontSizes.lg};
    color: ${props => props.theme.colors.gray[600]};
    margin-bottom: ${props => props.theme.spacing['2xl']};
  }
`;

const ContactForm = styled(motion.form)`
  background: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing['2xl']};
  border-radius: ${props => props.theme.borderRadius['2xl']};
  box-shadow: ${props => props.theme.shadows.lg};
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${props => props.theme.spacing.md};

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: 1fr 1fr;
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const Label = styled.label`
  font-weight: ${props => props.theme.fontWeights.medium};
  color: ${props => props.theme.colors.gray[700]};
  font-size: ${props => props.theme.fontSizes.sm};
`;

const Input = styled.input`
  padding: ${props => props.theme.spacing.sm};
  border: 2px solid ${props => props.theme.colors.gray[200]};
  border-radius: ${props => props.theme.borderRadius.lg};
  font-size: ${props => props.theme.fontSizes.md};
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.navy[200]};
  }
`;

const TextArea = styled.textarea`
  padding: ${props => props.theme.spacing.sm};
  border: 2px solid ${props => props.theme.colors.gray[200]};
  border-radius: ${props => props.theme.borderRadius.lg};
  font-size: ${props => props.theme.fontSizes.md};
  font-family: ${props => props.theme.fonts.primary};
  resize: vertical;
  min-height: 120px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.navy[200]};
  }
`;

const Select = styled.select`
  padding: ${props => props.theme.spacing.sm};
  border: 2px solid ${props => props.theme.colors.gray[200]};
  border-radius: ${props => props.theme.borderRadius.lg};
  font-size: ${props => props.theme.fontSizes.md};
  background: ${props => props.theme.colors.white};
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.navy[200]};
  }
`;

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    role: '',
    locations: '',
    interest: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // In production, integrate with your CRM/form handler
    alert('Thank you! We\'ll be in touch soon.');
  };

  return (
    <ContactWrapper>
      <div className="container">
        <ContactGrid>
          <ContactInfo
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2>Ready to Scale Your Retail Infrastructure?</h2>
            <p>
              Let's discuss how SageNet can help you bridge IT reliability with marketing 
              impact. Whether you're growing from 50 to 500 locations or need to upgrade 
              existing infrastructure, we'll create a custom solution that works for both teams.
            </p>
            
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ color: '#1e3a8a', marginBottom: '16px' }}>What to Expect:</h3>
              <ul style={{ color: '#6b7280', paddingLeft: '20px' }}>
                <li>30-minute discovery call</li>
                <li>Custom ROI analysis</li>
                <li>Technical requirements review</li>
                <li>Implementation timeline</li>
              </ul>
            </div>
          </ContactInfo>

          <ContactForm
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            onSubmit={handleSubmit}
          >
            <FormGrid>
              <InputGroup>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </InputGroup>

              <InputGroup>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </InputGroup>
            </FormGrid>

            <InputGroup style={{ marginTop: '16px' }}>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </InputGroup>

            <FormGrid style={{ marginTop: '16px' }}>
              <InputGroup>
                <Label htmlFor="company">Company *</Label>
                <Input
                  id="company"
                  name="company"
                  type="text"
                  required
                  value={formData.company}
                  onChange={handleChange}
                />
              </InputGroup>

              <InputGroup>
                <Label htmlFor="locations">Number of Locations</Label>
                <Input
                  id="locations"
                  name="locations"
                  type="number"
                  value={formData.locations}
                  onChange={handleChange}
                />
              </InputGroup>
            </FormGrid>

            <FormGrid style={{ marginTop: '16px' }}>
              <InputGroup>
                <Label htmlFor="role">Your Role</Label>
                <Select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="">Select your role</option>
                  <option value="cmo">CMO/VP Marketing</option>
                  <option value="marketing-director">Marketing Director</option>
                  <option value="brand-manager">Brand Manager</option>
                  <option value="cio">CIO/CTO</option>
                  <option value="it-director">IT Director</option>
                  <option value="network-manager">Network Manager</option>
                  <option value="operations">Operations</option>
                  <option value="other">Other</option>
                </Select>
              </InputGroup>

              <InputGroup>
                <Label htmlFor="interest">Primary Interest</Label>
                <Select
                  id="interest"
                  name="interest"
                  value={formData.interest}
                  onChange={handleChange}
                >
                  <option value="">Select primary interest</option>
                  <option value="digital-signage">Digital Signage</option>
                  <option value="network-services">Network Services</option>
                  <option value="integrated-solution">Integrated Solution</option>
                  <option value="consultation">General Consultation</option>
                </Select>
              </InputGroup>
            </FormGrid>

            <InputGroup style={{ marginTop: '16px' }}>
              <Label htmlFor="message">Tell us about your goals</Label>
              <TextArea
                id="message"
                name="message"
                placeholder="What challenges are you trying to solve? What are your growth plans?"
                value={formData.message}
                onChange={handleChange}
              />
            </InputGroup>

            <div style={{ marginTop: '24px', textAlign: 'center' }}>
              <Button type="submit" size="lg" variant="primary" fullWidth>
                Get Started
              </Button>
            </div>
          </ContactForm>
        </ContactGrid>
      </div>
    </ContactWrapper>
  );
};

export default Contact;