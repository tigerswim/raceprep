// Google Analytics 4 Configuration and Event Tracking

// Declare gtag function for TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

// GA4 Measurement ID - Replace with your actual measurement ID
export const GA_MEASUREMENT_ID = process.env.REACT_APP_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';

// Helper function to safely call gtag
const gtag = (...args: any[]) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag(...args);
  }
};

// Initialize Google Analytics
export const initGA = () => {
  if (typeof window !== 'undefined' && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX') {
    gtag('config', GA_MEASUREMENT_ID, {
      page_title: document.title,
      page_location: window.location.href,
    });
  }
};

// Track page views
export const trackPageView = (url: string, title?: string) => {
  if (typeof window !== 'undefined' && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX') {
    gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
      page_title: title || document.title,
      page_location: window.location.href,
    });
  }
};

// Track custom events
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (typeof window !== 'undefined' && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX') {
    gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track button clicks
export const trackButtonClick = (buttonName: string, location: string) => {
  trackEvent('click', 'button', `${buttonName} - ${location}`);
};

// Track form submissions
export const trackFormSubmission = (formName: string, success: boolean = true) => {
  trackEvent(success ? 'form_submit_success' : 'form_submit_error', 'form', formName);
};

// Track calculator usage
export const trackCalculatorUsage = (calculatorType: string, action: string) => {
  trackEvent(action, 'calculator', calculatorType);
};

// Track demo/consultation requests
export const trackDemoRequest = (demoType: string, source: string) => {
  trackEvent('demo_request', 'lead_generation', `${demoType} from ${source}`);
};

// Track file downloads
export const trackFileDownload = (fileName: string, fileType: string) => {
  trackEvent('file_download', 'engagement', `${fileName} (${fileType})`);
};

// Track page sections viewed (for scroll tracking)
export const trackSectionView = (sectionName: string) => {
  trackEvent('section_view', 'engagement', sectionName);
};

// Track ROI calculator interactions
export const trackROICalculatorEvent = (action: 'start' | 'complete' | 'pdf_download', details?: string) => {
  trackEvent(`roi_calculator_${action}`, 'calculator', details);
};

// Track navigation events
export const trackNavigation = (destination: string, source: string) => {
  trackEvent('navigation', 'user_journey', `${source} to ${destination}`);
};