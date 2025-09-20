export interface ROIInputs {
  locations: number;
  avgTransactionSize: number;
  currentConversionRate: number;
}

export interface ROIResults {
  salesLift: number;
  monthlySalesIncrease: number;
  annualSalesIncrease: number;
  paybackPeriod: number;
  roi: number;
}
