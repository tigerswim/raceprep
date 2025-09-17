// src/components/PersonalSite.tsx

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

const PersonalSite = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Create stable refs using useRef for each section
  const homeRef = useRef<HTMLElement>(null);
  const aboutRef = useRef<HTMLElement>(null);
  const servicesRef = useRef<HTMLElement>(null);
  const experienceRef = useRef<HTMLElement>(null);
  const contactRef = useRef<HTMLElement>(null);

  // Set up intersection observer for scroll animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.2,
      rootMargin: '-20px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const sectionId = entry.target.getAttribute('data-section');
        if (sectionId && entry.isIntersecting) {
          setActiveSection(sectionId);
        }
      });
    }, observerOptions);

    // Observe all sections
    const refs = [homeRef, aboutRef, servicesRef, experienceRef, contactRef];
    refs.forEach((ref) => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const navigationItems = [
    { id: 'home', label: 'Home' },
    { id: 'services', label: 'Services' },
    { id: 'about', label: 'About' },
    { id: 'experience', label: 'Experience' },
    { id: 'contact', label: 'Contact' }
  ];

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(!mobileMenuOpen);
  }, [mobileMenuOpen]);

  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setActiveSection(sectionId);
    setMobileMenuOpen(false);
  }, []);

  const Header = () => (
    <header className="site-header">
      <div className="container">
        <nav className="nav-bar">
          <a href="#home" className="logo" onClick={() => scrollToSection('home')}>
            Kinetic Brand Partners
          </a>
          
          <button 
            className="mobile-menu-toggle"
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
          
          <ul className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
            {navigationItems.map(item => (
              <li key={item.id}>
                <a 
                  href={`#${item.id}`}
                  className={activeSection === item.id ? 'active' : ''}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(item.id);
                  }}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );

  const HeroSection = () => (
    <section 
      id="home" 
      ref={homeRef}
      data-section="home"
      className="hero"
    >
      <div className="container">
        <h1>{"Transform Your Marketing From Tactical to Strategic Advantage"}</h1>
        <p className="subhead">{
          "I help established companies ($50M-$750M) break through growth plateaus by transforming their marketing organizations from reactive tactics to strategic growth engines. With 15+ years of brand management, including P&L ownership and award-winning campaign experience, I bring both the art and science needed to scale your business."}
        </p>
        
        <div className="cta-group">
          <a 
            href="#contact" 
            className="btn btn-primary"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('contact');
            }}
          >
            {"Get Your Marketing Assessment"}
          </a>
          <a 
            href="#services" 
            className="btn btn-secondary"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('services');
            }}
          >
            {"View Services"}
          </a>
        </div>
        
        <div className="metrics">
          <div className="metric">
            <strong>{"4B+"}</strong>
            {"Campaign Impressions"}
          </div>
          <div className="metric">
            <strong>{"25+"}</strong>
            {"Team Members Led"}
          </div>
          <div className="metric">
            <strong>{"15+"}</strong>
            {"Years P&L Experience"}
          </div>
        </div>
      </div>
    </section>
  );

  const ServicesSection = () => (
    <section 
      id="services" 
      ref={servicesRef}
      data-section="services"
      style={{ padding: '4rem 0', background: '#f7f9fc' }}
    >
      <div className="container">
        <div className="spotlight">
          <h2>Strategic Marketing Services</h2>
          <p>{"Comprehensive solutions to transform your marketing organization and accelerate growth"}</p>
        </div>
        
        <div className="values">
          <article>
            <h3>Brand Transformation &amp; Positioning</h3>
            <p>{
              "Modernize your brand to break through commodity competition and command premium positioning. From comprehensive brand audits to complete visual and messaging transformations that drive business results."}
            </p>
            <ul className="pillars">
              <li>Brand architecture development</li>
              <li>Competitive positioning strategy</li>
              <li>Message framework creation</li>
              <li>Visual identity transformation</li>
            </ul>
          </article>
          
          <article style={{ borderLeftColor: 'var(--accent-green)' }}>
            <h3>{"Marketing Organization Development"}</h3>
            <p>{
              "Build marketing capabilities that scale with your business. Transform from ad-hoc campaigns to strategic, data-driven operations with clear processes, metrics, and team structures."}
            </p>
            <ul className="pillars">
              <li>{"Marketing maturity assessment"}</li>
              <li>{"Team structure optimization"}</li>
              <li>{"Process & workflow design"}</li>
              <li>{"Performance measurement systems"}</li>
            </ul>
          </article>
          
          <article>
            <h3>{"Digital Marketing Transformation"}</h3>
            <p>{
              "Move beyond traditional approaches to modern, omnichannel marketing that meets customers where they are. Integrate digital capabilities while maintaining your brand's authentic voice."}
            </p>
            <ul className="pillars">
              <li>{"Digital strategy development"}</li>
              <li>{"Marketing technology stack"}</li>
              <li>{"Omnichannel campaign design"}</li>
              <li>{"Performance optimization"}</li>
            </ul>
          </article>
          
          <article>
            <h3>{"Revenue Growth Acceleration"}</h3>
            <p>{
              "Apply proven methodologies to break through growth plateaus. Combine strategic vision with tactical execution to deliver measurable revenue impact and sustainable growth."}
            </p>
            <ul className="pillars">
              <li>{"Growth strategy development"}</li>
              <li>{"Market opportunity analysis"}</li>
              <li>{"Go-to-market optimization"}</li>
              <li>{"Revenue attribution modeling"}</li>
            </ul>
          </article>
        </div>
      </div>
    </section>
  );

const AboutSection = () => (
    <section 
      id="about" 
      ref={aboutRef}
      data-section="about"
      style={{ padding: '4rem 0' }}
    >
      <div className="container">
        <div className="spotlight">
          <h2>The Marketing Leader Your Business Needs</h2>
        </div>
        
        <div className="about-content">
          <div className="headshot-container">
            <img 
              src="/Photos/Professional headshot.png" 
              alt="Professional headshot"
              style={{
                width: 'auto',
                height: '300px',
                objectFit: 'cover',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                maxWidth: '100%'
              }}
            />
          </div>
          <div className="about-intro">
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--primary-dark)' }}>
              Strategic Marketing Leadership with Proven Results
            </h3>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              With 15+ years of P&L ownership and cross-functional leadership experience, I bring a complete business perspective to every marketing challenge. I've scaled teams from startup environments to Fortune 500 enterprises, managing budgets from thousands to millions.
            </p>
            <div className="credentials" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              <span style={{ 
                padding: '0.5rem 1rem', 
                background: 'rgba(156,175,136,0.1)', 
                borderRadius: '20px', 
                fontSize: '0.9rem',
                fontWeight: '600'
              }}>
                MBA, UVA Darden
              </span>
              <span style={{ 
                padding: '0.5rem 1rem', 
                background: 'rgba(212,117,107,0.1)', 
                borderRadius: '20px', 
                fontSize: '0.9rem',
                fontWeight: '600'
              }}>
                Clio Sports Awards
              </span>
              <span style={{ 
                padding: '0.5rem 1rem', 
                background: 'rgba(156,175,136,0.1)', 
                borderRadius: '20px', 
                fontSize: '0.9rem',
                fontWeight: '600'
              }}>
                $1.5B+ Portfolio
              </span>
            </div>
          </div>
        </div>
        
        <div className="values">
          <article>
            <h3>{"Holistic Business Perspective"}</h3>
            <p>{
              "Unlike traditional marketing consultants, I bring a complete business perspective to every challenge. With 15+ years of P&L ownership and cross-functional leadership experience, I understand how marketing drives business results, not just marketing metrics."}
            </p>
          </article>
          
          <article>
            <h3>Proven Versatility</h3>
            <p>{
              "I'm equally at home setting strategic direction and rolling up my sleeves for tactical execution. Whether you need marketing as the hub of growth or as a strategic support function, I adapt my approach to what your business needs most."}
            </p>
            <p>
              <em>{"Great marketing isn't about choosing between creativity and analytics — it's about knowing when to lean into each and how to make them work together seamlessly."}</em>
            </p>
          </article>
          
          <article>
            <h3>{"Enterprise Experience, Entrepreneurial Agility"}</h3>
            <p>{
              "I've scaled marketing teams from startup environments to Fortune 500 enterprises, managing budgets from thousands to millions. This unique combination allows me to bring enterprise-level strategic thinking with the agility and resourcefulness your growing business demands."}
            </p>
          </article>
        </div>
      </div>
    </section>
  );

  const ExperienceSection = () => (
    <section 
      id="experience" 
      ref={experienceRef}
      data-section="experience"
      style={{ padding: '4rem 0', background: '#f7f9fc' }}
    >
      <div className="container">
        <div className="spotlight">
          <h2>Track Record of Transformational Results</h2>
        </div>
        
        <div className="values">
          <article>
            <h3>Leadership Background</h3>
            <ul className="timeline">
              <li><strong>SVP Marketing, Central Garden & Pet:</strong> Led 25-person team managing $1.5B+ brand portfolio</li>
              <li><strong>Brand Manager, Johnson & Johnson:</strong> P&L ownership of $80M+ product lines</li>
              <li><strong>MBA, University of Virginia Darden:</strong> Top-tier strategic business foundation</li>
              <li><strong>Clio Sports Awards:</strong> Silver & Bronze for breakthrough campaign creativity</li>
            </ul>
          </article>
          
          <article>
            <h3>Transformation Case Study</h3>
            <h4>Brand Revitalization: +98.8% EBIT Growth</h4>
            <p><strong>Challenge:</strong> Established lawn care brand facing commoditization and declining margins.</p>
            <p><strong>Strategy:</strong> Complete brand transformation including positioning, innovation pipeline, and omnichannel marketing.</p>
            <p><strong>Results:</strong> 98.8% EBIT growth in first year, followed by additional 12% growth while expanding market share.</p>
          </article>
          
          <article>
            <h3>Campaign Excellence</h3>
            <h4>#FlipTheTurf: 4B Impressions, Award-Winning Impact</h4>
            <p><strong>Challenge:</strong> Break through in crowded sports marketing landscape.</p>
            <p><strong>Innovation:</strong> Created authentic storytelling campaign connecting brand values with cultural moments.</p>
            <p><strong>Results:</strong> 3.95B media impressions, 2 Clio Sports Awards, significant brand awareness lift.</p>
          </article>
        </div>
      </div>
    </section>
  );

  const ContactSection = () => (
    <section 
      id="contact" 
      ref={contactRef}
      data-section="contact"
      style={{ padding: '4rem 0' }}
    >
      <div className="container">
        <div className="spotlight">
          <h2>{"Ready to Transform Your Marketing Strategy?"}</h2>
          <p>{"Let's start with a comprehensive assessment of your marketing organization and growth opportunities"}</p>
        </div>
        
        <div className="values">
          <article style={{ textAlign: 'center' }}>
            <h3>{"Comprehensive Marketing Assessment"}</h3>
            <p>{
              "Get clarity on your marketing maturity, brand positioning, and growth opportunities. In our initial consultation, we'll evaluate your current marketing effectiveness and identify the highest-impact transformation opportunities."}
            </p>
            <a href="mailto:letstalk@kineticbrandpartners.com" className="btn btn-primary">
              {"Schedule Assessment"}
            </a>
          </article>
          
          <article style={{ textAlign: 'center' }}>
            <h3>{"Let's Connect"}</h3>
            <p><strong>{"Email:"}</strong> {"letstalk@kineticbrandpartners.com"}</p>
            <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: '#666' }}>
              <strong>{"Based in Atlanta, GA"}</strong> {"| Working with clients nationwide"}
            </p>
          </article>
        </div>
      </div>
    </section>
  );

  const Footer = () => (
    <footer className="site-footer">
      <div className="container">
        <p>&copy; {"2025 Kinetic Brand Partners, LLC. All rights reserved."}</p>
        <p style={{ fontSize: '0.85rem', marginTop: '1rem' }}>
          {"Strategic Marketing Leadership | Brand Transformation | Revenue Growth Acceleration"}
        </p>
      </div>
    </footer>
  );

  return (
    <div className="site-wrapper">
      <Header />
      <main>
        <HeroSection />
        <ServicesSection />
        <AboutSection />
        <ExperienceSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default PersonalSite;