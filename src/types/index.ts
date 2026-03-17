export interface ClientInfo {
  businessName: string;
  dba: string;
  entityType: 'Corporation' | 'LLC' | 'Partnership' | 'Sole Proprietor';
  naicsCode: string;
  mailingAddress: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  website: string;
  yearsInBusiness: number;
  yearsWithCurrentAgent: number;
  descriptionOfOperations: string;
  annualRevenue: number;
  employeeCount: number;
  locationCount: number;
  linesOfBusiness: string[];
  priorCarrier: string;
  priorPolicyNumber: string;
  priorExpirationDate: string;
  priorPremium: number;
  claimsHistory: ClaimRecord[];
}

export interface ClaimRecord {
  year: number;
  type: string;
  amount: number;
  status: 'Open' | 'Closed';
  description: string;
}

export interface CarrierRecommendation {
  name: string;
  logo?: string;
  matchScore: number;
  appetite: string;
  strengths: string[];
  concerns: string[];
  estimatedPremiumRange: string;
  amBestRating: string;
  specialties: string[];
}

export interface CarrierQuote {
  carrierName: string;
  amBestRating: string;
  totalPremium: number;
  coverages: CoverageDetail[];
  exclusions: string[];
  paymentOptions: string;
  bindDeadline: string;
  overallScore: number;
}

export interface CoverageDetail {
  line: string;
  premium: number;
  deductible: number;
  limit: string;
  aggregateLimit?: string;
  sublimits?: string[];
}

export interface RoiMetrics {
  avgTimePerSubmissionBefore: number; // hours
  avgTimePerSubmissionAfter: number;
  submissionsPerMonth: number;
  brokerCount: number;
  avgBrokerHourlyCost: number;
  errorReductionPercent: number;
  fasterBindingDays: number;
  additionalPoliciesPerMonth: number;
  avgCommissionPerPolicy: number;
}

export type DemoStep = 'intake' | 'acord' | 'carriers' | 'quotes' | 'roi';
