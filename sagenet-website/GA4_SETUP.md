# Google Analytics 4 (GA4) Setup Guide

This guide will help you set up Google Analytics 4 tracking for your SageNet website.

## Prerequisites

1. A Google Analytics account
2. Admin access to your Google Analytics property

## Step 1: Create GA4 Property

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click **Admin** (gear icon) in the bottom left
3. In the **Account** column, select your account or create a new one
4. In the **Property** column, click **Create Property**
5. Choose **GA4** (Google Analytics 4)
6. Fill in your property details:
   - Property name: "SageNet Website"
   - Reporting time zone: Your local time zone
   - Currency: USD
7. Click **Next** and complete the business information
8. Click **Create**

## Step 2: Get Your Measurement ID

1. In your new GA4 property, go to **Admin** → **Data Streams**
2. Click **Add stream** → **Web**
3. Enter your website URL (e.g., `https://sagenet.com`)
4. Enter a stream name: "SageNet Website"
5. Click **Create stream**
6. Copy the **Measurement ID** (starts with `G-`)

## Step 3: Configure Your Website

1. Create a `.env` file in your project root (if it doesn't exist)
2. Add your Measurement ID:
   ```
   REACT_APP_GA_MEASUREMENT_ID=G-YOUR-MEASUREMENT-ID
   ```
3. Replace `G-YOUR-MEASUREMENT-ID` with your actual Measurement ID from Step 2

## Step 4: Verify Installation

1. Start your development server: `npm start`
2. Open your website in a browser
3. Go to Google Analytics → **Reports** → **Realtime**
4. You should see your visit in the real-time report

## What's Already Tracked

The implementation automatically tracks:

### Page Views
- Automatic page view tracking on all routes
- Custom page titles and URLs

### Events
- **Demo Requests**: When users click demo/consultation buttons
- **ROI Calculator**: Start, completion, and PDF downloads
- **File Downloads**: When users download reports or documents
- **Button Clicks**: Key CTA buttons throughout the site
- **Form Submissions**: Contact form completions

### Custom Events You Can Add

The analytics utility provides these tracking functions:

```typescript
// Track custom button clicks
trackButtonClick('button_name', 'page_location');

// Track form submissions
trackFormSubmission('contact_form', true); // true = success

// Track calculator usage
trackCalculatorUsage('roi_calculator', 'start');

// Track demo requests
trackDemoRequest('marketing_demo', 'homepage');

// Track file downloads
trackFileDownload('brochure.pdf', 'PDF');

// Track section views (scroll tracking)
trackSectionView('pricing_section');

// Track navigation
trackNavigation('/contact', 'homepage');
```

## Recommended GA4 Configuration

### Enhanced Ecommerce (Optional)
If you plan to track conversions as ecommerce events:

1. Go to **Admin** → **Events** → **Create Event**
2. Create custom events for:
   - `demo_request` → `purchase` (assign monetary value)
   - `consultation_scheduled` → `begin_checkout`
   - `roi_calculator_complete` → `add_to_cart`

### Goals & Conversions
Set up conversion events in GA4:

1. Go to **Admin** → **Events** → **Mark as conversion**
2. Mark these events as conversions:
   - `demo_request`
   - `form_submit_success`
   - `roi_calculator_pdf_download`

### Custom Dimensions (Optional)
For more detailed tracking:

1. Go to **Admin** → **Custom Definitions** → **Create custom dimensions**
2. Add dimensions for:
   - Industry Type (from ROI calculator)
   - Number of Locations (from ROI calculator)
   - Demo Type (marketing vs IT vs consultation)

## Privacy Considerations

The implementation respects user privacy:
- Only tracks if a valid Measurement ID is provided
- Uses the latest GA4 privacy-friendly tracking
- No personally identifiable information (PII) is tracked
- Consider adding a cookie consent banner for GDPR compliance

## Testing in Development

GA4 will track events in development. To avoid polluting your analytics:
1. Use a separate GA4 property for development
2. Or set `REACT_APP_GA_MEASUREMENT_ID=` (empty) in development

## Production Deployment

When deploying to production:
1. Set the environment variable in your hosting platform
2. Ensure the Measurement ID is correctly configured
3. Test real-time tracking after deployment

## Troubleshooting

### Events Not Appearing
- Check the browser console for errors
- Verify the Measurement ID is correct
- Ensure the `.env` file is not in `.gitignore` for production

### Real-time Not Working
- Wait 1-2 minutes for data to appear
- Check that your ad blocker isn't blocking analytics
- Verify the script is loading in browser dev tools

## Support

For technical issues with the implementation, check:
- Browser console errors
- Network tab for blocked requests
- GA4 DebugView for event validation

For Google Analytics questions, refer to:
- [GA4 Help Center](https://support.google.com/analytics/topic/9143232)
- [GA4 Measurement Protocol](https://developers.google.com/analytics/devguides/collection/protocol/ga4)