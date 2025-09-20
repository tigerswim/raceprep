import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ROIResults {
  additionalAnnualRevenue: number;
  orderValueIncrease: number;
  trafficIncrease: number;
  competitiveAdvantage: number;
  engagementLift: number;
  printingSavings: number;
  operationalSavings: number;
  downtimeSavings: number;
  initialInvestment: number;
  annualServiceCosts: number;
  totalAnnualBenefit: number;
  netAnnualBenefit: number;
  roiPercentage: number;
  paybackMonths: number;
}

interface BusinessInputs {
  locations: number;
  industryType: string;
  avgDailyTransactions: number;
  avgOrderValue: number;
  operatingHoursDaily: number;
  monthlyDowntime: number;
  annualPrintingCosts: number;
  staffHourlyRate: number;
  currentDigitalSolution: string;
  promotionalFrequency: string;
  seasonalChanges: boolean;
  posIntegration: boolean;
  driveThruPercentage: number;
  currentStaticSignCount: number;
  competitorDigitalAdoption: number;
  dwellTimeMinutes: number;
}

interface ReportData {
  serviceType: 'digital' | 'networking' | 'combined';
  inputs: BusinessInputs;
  results: ROIResults;
  companyName?: string;
  contactName?: string;
}

export const generateROIReport = (data: ReportData): void => {
  const doc = new jsPDF();
  
  let yPosition = 20;
  
  // Header
  doc.setFillColor(30, 58, 138); // Primary blue
  doc.rect(0, 0, 210, 25, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('ROI Analysis Report', 15, 18);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('SageNet Digital Solutions', 140, 18);
  
  yPosition = 35;
  
  // Executive Summary
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Executive Summary', 15, yPosition);
  yPosition += 10;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const serviceTypeText = {
    'digital': 'Digital Menu Board Solution',
    'networking': 'Managed Network Services',
    'combined': 'Combined Digital & Network Solution'
  };
  
  const summaryText = [
    `Service Type: ${serviceTypeText[data.serviceType]}`,
    `Number of Locations: ${data.inputs.locations}`,
    `Industry: ${data.inputs.industryType.toUpperCase()}`,
    ``,
    `Key Financial Metrics:`,
    `• Net Annual Benefit: ${formatCurrency(data.results.netAnnualBenefit)}`,
    `• 3-Year ROI: ${data.results.roiPercentage}%`,
    `• Payback Period: ${data.results.paybackMonths} months`,
    `• Initial Investment: ${formatCurrency(data.results.initialInvestment)}`
  ];
  
  summaryText.forEach(line => {
    doc.text(line, 15, yPosition);
    yPosition += 6;
  });
  
  yPosition += 10;
  
  // Financial Projections Table
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Financial Projections', 15, yPosition);
  yPosition += 10;
  
  const financialData = [
    ['Revenue Impact', formatCurrency(data.results.additionalAnnualRevenue)],
    ['Order Value Increase', formatCurrency(data.results.orderValueIncrease)],
    ['Traffic Increase Revenue', formatCurrency(data.results.trafficIncrease)],
    ['', ''],
    ['Cost Savings', ''],
    ['Printing Savings', formatCurrency(data.results.printingSavings)],
    ['Operational Savings', formatCurrency(data.results.operationalSavings)],
    ['Downtime Savings', formatCurrency(data.results.downtimeSavings)],
    ['', ''],
    ['Investment', ''],
    ['Initial Investment', formatCurrency(data.results.initialInvestment)],
    ['Annual Service Costs', formatCurrency(data.results.annualServiceCosts)],
    ['', ''],
    ['Net Results', ''],
    ['Total Annual Benefit', formatCurrency(data.results.totalAnnualBenefit)],
    ['Net Annual Benefit', formatCurrency(data.results.netAnnualBenefit)]
  ];
  
  autoTable(doc, {
    startY: yPosition,
    head: [['Metric', 'Annual Value']],
    body: financialData,
    theme: 'striped',
    headStyles: { fillColor: [30, 58, 138] },
    styles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { halign: 'right' }
    }
  });
  
  yPosition = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 15 : yPosition + 80;
  
  // Assumptions & Methodology
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Assumptions & Methodology', 15, yPosition);
  yPosition += 10;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const assumptions = [
    'Industry Benchmarks Used:',
    '• Order value increases: 2-5% (QSR Magazine, 2023)',
    '• Traffic increases: 6-9% (Digital Signage Research, 2023)',
    '• Operational efficiency: 8-15% (Network Infrastructure Studies)',
    '• Average downtime cost: $280-$450/hour by industry',
    '',
    'Calculation Methodology:',
    '• Revenue projections based on current transaction volume',
    '• Cost savings calculated from operational improvements',
    '• ROI calculated over 3-year period',
    '• Conservative estimates used for all projections',
    '',
    'Implementation Assumptions:',
    '• 6-month implementation timeline',
    '• Gradual benefit realization over first year',
    '• Ongoing support and maintenance included',
    '• Integration with existing systems'
  ];
  
  assumptions.forEach(line => {
    if (yPosition > 280) {
      doc.addPage();
      yPosition = 20;
    }
    doc.text(line, 15, yPosition);
    yPosition += 6;
  });
  
  // Add new page for input summary
  doc.addPage();
  yPosition = 20;
  
  // Input Summary
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Your Business Profile', 15, yPosition);
  yPosition += 10;
  
  const inputData = [
    ['Business Parameter', 'Your Input'],
    ['Number of Locations', data.inputs.locations.toString()],
    ['Industry Type', data.inputs.industryType.toUpperCase()],
    ['Daily Transactions/Location', data.inputs.avgDailyTransactions.toString()],
    ['Average Order Value', formatCurrency(data.inputs.avgOrderValue)],
    ['Operating Hours/Day', `${data.inputs.operatingHoursDaily} hours`],
    ['Monthly Network Downtime', `${data.inputs.monthlyDowntime} hours`],
    ['Annual Printing Costs/Location', formatCurrency(data.inputs.annualPrintingCosts)],
    ['Average Staff Hourly Rate', `$${data.inputs.staffHourlyRate}/hr`],
    ['Promotional Frequency', data.inputs.promotionalFrequency],
    ['Current Digital Solution', data.inputs.currentDigitalSolution],
    ['POS Integration Needed', data.inputs.posIntegration ? 'Yes' : 'No']
  ];
  
  autoTable(doc, {
    startY: yPosition,
    body: inputData,
    theme: 'striped',
    headStyles: { fillColor: [30, 58, 138] },
    styles: { fontSize: 10 }
  });
  
  yPosition = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 20 : yPosition + 80;
  
  // Next Steps
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Recommended Next Steps', 15, yPosition);
  yPosition += 10;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const nextSteps = [
    '1. Schedule a consultation to review these projections',
    '2. Conduct a detailed site assessment at pilot locations',
    '3. Develop customized implementation timeline',
    '4. Create phased rollout plan based on your priorities',
    '5. Begin pilot program to validate ROI projections',
    '',
    'Contact Information:',
    '• Phone: 1-800-SAGENET',
    '• Email: solutions@sagenet.com',
    '• Website: www.sagenet.com'
  ];
  
  nextSteps.forEach(line => {
    doc.text(line, 15, yPosition);
    yPosition += 6;
  });
  
  // Footer on all pages
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated by SageNet ROI Calculator - ${new Date().toLocaleDateString()}`, 15, 285);
    doc.text(`Page ${i} of ${pageCount}`, 180, 285);
  }
  
  // Save the PDF
  const fileName = `SageNet_ROI_Report_${data.inputs.locations}locations_${Date.now()}.pdf`;
  doc.save(fileName);
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(value));
};