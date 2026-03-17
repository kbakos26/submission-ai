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

export type SubmissionStatus = 
  | 'document-collection' 
  | 'data-extraction' 
  | 'forms-review' 
  | 'package-ready';

export interface Submission {
  id: string;
  clientName: string;
  linesOfBusiness: string[];
  status: SubmissionStatus;
  progressPercent: number;
  dateCreated: string;
  assignedBroker: string;
  client?: ClientInfo;
}

export interface ExtractedField {
  category: string;
  label: string;
  value: string;
  confidence: number; // 0-100
  source: string;
}

export interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  status: 'uploaded' | 'processing' | 'extracted';
  uploadedAt: string;
}

export interface RequiredDocument {
  name: string;
  status: 'received' | 'missing' | 'requested';
  requestedDate?: string;
}
