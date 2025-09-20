import React from 'react';
import { ThemeProvider } from 'styled-components';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { theme } from './styles/theme';
import GlobalStyles from './styles/GlobalStyles';
import { useAnalytics } from './hooks/useAnalytics';

// Component imports
import Header from './components/common/Header';
import Footer from './components/common/Footer';

// Page imports
import Home from './pages/Home';
import Marketing from './pages/Marketing';
import IT from './pages/IT';
import Contact from './pages/Contact';

// Analytics wrapper component
const AppWithAnalytics: React.FC = () => {
  useAnalytics();
  
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/marketing" element={<Marketing />} />
          <Route path="/it" element={<IT />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<div style={{ padding: '4rem 1rem', textAlign: 'center' }}><h1>About SageNet</h1><p>Learn more about our company and mission. This page is coming soon.</p></div>} />
          <Route path="/resources" element={<div style={{ padding: '4rem 1rem', textAlign: 'center' }}><h1>Resources</h1><p>Access our knowledge base, case studies, and technical documentation. This page is coming soon.</p></div>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <Router>
        <AppWithAnalytics />
      </Router>
    </ThemeProvider>
  );
};

export default App;