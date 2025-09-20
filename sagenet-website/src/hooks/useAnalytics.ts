import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView, initGA } from '../utils/analytics';

// Custom hook for Google Analytics integration
export const useAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Initialize GA on first load
    initGA();
  }, []);

  useEffect(() => {
    // Track page views on route changes
    const path = location.pathname + location.search;
    trackPageView(path);
  }, [location]);
};