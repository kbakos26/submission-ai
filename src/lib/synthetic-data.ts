import { ClientInfo, CarrierRecommendation, CarrierQuote, RoiMetrics } from '@/types';

export const sampleClient: ClientInfo = {
  businessName: 'Pacific Coast Dining Group, Inc.',
  dba: 'Pacific Coast Dining',
  entityType: 'Corporation',
  naicsCode: '722511',
  mailingAddress: '4200 Harbor Boulevard, Suite 300',
  city: 'Costa Mesa',
  state: 'CA',
  zip: '92626',
  phone: '(714) 555-0189',
  website: 'www.pacificcoastdining.com',
  yearsInBusiness: 14,
  yearsWithCurrentAgent: 3,
  descriptionOfOperations: 'Full-service restaurant chain operating 8 locations across Southern California. Offers dine-in, takeout, catering, and private event services. Serves alcohol at all locations. Average seating capacity of 120 per location. Annual catering revenue approximately $1.8M.',
  annualRevenue: 12000000,
  employeeCount: 180,
  locationCount: 8,
  linesOfBusiness: ['General Liability', 'Property', 'Liquor Liability', 'Workers Compensation', 'Commercial Umbrella'],
  priorCarrier: 'Nationwide Commercial',
  priorPolicyNumber: 'NW-CGL-2024-88412',
  priorExpirationDate: '2025-06-15',
  priorPremium: 52400,
  claimsHistory: [
    { year: 2024, type: 'GL - Slip & Fall', amount: 18500, status: 'Closed', description: 'Customer slip and fall in restroom. Settled.' },
    { year: 2023, type: 'Property - Kitchen Fire', amount: 34200, status: 'Closed', description: 'Grease fire at Costa Mesa location. Equipment damage and 3-day closure.' },
    { year: 2023, type: 'WC - Back Injury', amount: 12800, status: 'Closed', description: 'Line cook back injury from lifting. Full recovery.' },
    { year: 2022, type: 'GL - Food Illness', amount: 8900, status: 'Closed', description: 'Alleged food poisoning claim. Settled for nuisance value.' },
  ],
};

export const carrierRecommendations: CarrierRecommendation[] = [
  {
    name: 'Hartford Commercial',
    matchScore: 94,
    appetite: 'Strong appetite for restaurant groups with $5M-$25M revenue. Actively writing multi-location food service.',
    strengths: ['Restaurant-specific endorsements', 'Multi-location discount program', 'Bundled package pricing', 'Dedicated restaurant risk team'],
    concerns: ['May require fire suppression system upgrade documentation'],
    estimatedPremiumRange: '$44,000 - $50,000',
    amBestRating: 'A+ (XV)',
    specialties: ['Restaurant & Hospitality', 'Food Service', 'Franchise Operations'],
  },
  {
    name: 'Travelers Select',
    matchScore: 91,
    appetite: 'Preferred market for well-managed restaurant chains. Competitive on WC for food service.',
    strengths: ['Best-in-class WC program for restaurants', 'Loss control resources', 'Flexible deductible options', 'Fast quoting turnaround'],
    concerns: ['Higher deductible requirements on property', 'Claims history may impact pricing'],
    estimatedPremiumRange: '$42,000 - $48,000',
    amBestRating: 'A++ (XV)',
    specialties: ['Workers Compensation', 'Commercial Package', 'Risk Management'],
  },
  {
    name: 'CNA Paramount',
    matchScore: 87,
    appetite: 'Writes restaurant risks selectively. Prefers established chains with strong loss control.',
    strengths: ['Broadest liquor liability coverage', 'Highest available limits', 'Superior claims handling', 'Industry-leading umbrella program'],
    concerns: ['Premium will be higher', 'Longer underwriting timeline (10-14 days)'],
    estimatedPremiumRange: '$48,000 - $54,000',
    amBestRating: 'A (XV)',
    specialties: ['Liquor Liability', 'Umbrella/Excess', 'Professional Lines'],
  },
  {
    name: 'Liberty Mutual Commercial',
    matchScore: 85,
    appetite: 'Moderate appetite for restaurant groups. Competitive when bundling all lines.',
    strengths: ['Strong bundle discounts (12-18%)', 'Nationwide claims network', 'Risk engineering services', 'Flexible payment plans'],
    concerns: ['Less specialized in restaurant risks', 'May exclude catering operations from GL'],
    estimatedPremiumRange: '$43,000 - $49,000',
    amBestRating: 'A (XV)',
    specialties: ['Commercial Package', 'Multi-Line Bundles', 'Mid-Market Accounts'],
  },
  {
    name: 'Zurich North America',
    matchScore: 82,
    appetite: 'Targets larger restaurant groups. Strong on property and umbrella.',
    strengths: ['Superior property coverage terms', 'Business income coverage expertise', 'Global claims resources', 'Risk engineering team'],
    concerns: ['Minimum premium thresholds may apply', 'Requires detailed property valuations per location'],
    estimatedPremiumRange: '$46,000 - $53,000',
    amBestRating: 'A+ (XV)',
    specialties: ['Property', 'Business Income', 'Large Commercial'],
  },
];

export const carrierQuotes: CarrierQuote[] = [
  {
    carrierName: 'Hartford Commercial',
    amBestRating: 'A+ (XV)',
    totalPremium: 47200,
    coverages: [
      { line: 'General Liability', premium: 14200, deductible: 2500, limit: '$2,000,000', aggregateLimit: '$4,000,000' },
      { line: 'Property', premium: 11800, deductible: 5000, limit: '$8,500,000', sublimits: ['Business Income: $2M', 'Equipment Breakdown: $500K'] },
      { line: 'Liquor Liability', premium: 6400, deductible: 2500, limit: '$2,000,000', aggregateLimit: '$4,000,000' },
      { line: 'Workers Compensation', premium: 9800, deductible: 0, limit: 'Statutory' },
      { line: 'Commercial Umbrella', premium: 5000, deductible: 10000, limit: '$5,000,000' },
    ],
    exclusions: ['Assault & Battery sub-limited to $100K', 'Employment Practices excluded from umbrella'],
    paymentOptions: '25% down, 9 monthly installments',
    bindDeadline: '2025-06-01',
    overallScore: 88,
  },
  {
    carrierName: 'Travelers Select',
    amBestRating: 'A++ (XV)',
    totalPremium: 44800,
    coverages: [
      { line: 'General Liability', premium: 13600, deductible: 2500, limit: '$2,000,000', aggregateLimit: '$4,000,000' },
      { line: 'Property', premium: 11200, deductible: 10000, limit: '$8,500,000', sublimits: ['Business Income: $1.5M', 'Equipment Breakdown: $250K'] },
      { line: 'Liquor Liability', premium: 5800, deductible: 5000, limit: '$1,000,000', aggregateLimit: '$2,000,000' },
      { line: 'Workers Compensation', premium: 8700, deductible: 0, limit: 'Statutory' },
      { line: 'Commercial Umbrella', premium: 5500, deductible: 10000, limit: '$5,000,000' },
    ],
    exclusions: ['Assault & Battery excluded', 'Catering away from premises sub-limited to $500K', 'Liquor liability lower limits'],
    paymentOptions: '20% down, 10 monthly installments',
    bindDeadline: '2025-05-28',
    overallScore: 82,
  },
  {
    carrierName: 'CNA Paramount',
    amBestRating: 'A (XV)',
    totalPremium: 51100,
    coverages: [
      { line: 'General Liability', premium: 15200, deductible: 1000, limit: '$3,000,000', aggregateLimit: '$6,000,000' },
      { line: 'Property', premium: 12400, deductible: 2500, limit: '$9,000,000', sublimits: ['Business Income: $3M', 'Equipment Breakdown: $750K'] },
      { line: 'Liquor Liability', premium: 7800, deductible: 1000, limit: '$3,000,000', aggregateLimit: '$6,000,000' },
      { line: 'Workers Compensation', premium: 10200, deductible: 0, limit: 'Statutory' },
      { line: 'Commercial Umbrella', premium: 5500, deductible: 10000, limit: '$10,000,000' },
    ],
    exclusions: ['None — broadest form available'],
    paymentOptions: '30% down, 8 monthly installments or full pay (5% discount)',
    bindDeadline: '2025-06-10',
    overallScore: 91,
  },
  {
    carrierName: 'Liberty Mutual Commercial',
    amBestRating: 'A (XV)',
    totalPremium: 46500,
    coverages: [
      { line: 'General Liability', premium: 14000, deductible: 2500, limit: '$2,000,000', aggregateLimit: '$4,000,000' },
      { line: 'Property', premium: 11600, deductible: 5000, limit: '$8,000,000', sublimits: ['Business Income: $1.5M', 'Equipment Breakdown: $500K'] },
      { line: 'Liquor Liability', premium: 6200, deductible: 2500, limit: '$2,000,000', aggregateLimit: '$4,000,000' },
      { line: 'Workers Compensation', premium: 9500, deductible: 0, limit: 'Statutory' },
      { line: 'Commercial Umbrella', premium: 5200, deductible: 10000, limit: '$5,000,000' },
    ],
    exclusions: ['Catering operations excluded from GL', 'Assault & Battery sub-limited to $50K'],
    paymentOptions: '25% down, 9 monthly installments',
    bindDeadline: '2025-06-05',
    overallScore: 79,
  },
  {
    carrierName: 'Zurich North America',
    amBestRating: 'A+ (XV)',
    totalPremium: 49800,
    coverages: [
      { line: 'General Liability', premium: 14800, deductible: 5000, limit: '$2,000,000', aggregateLimit: '$4,000,000' },
      { line: 'Property', premium: 12600, deductible: 5000, limit: '$9,500,000', sublimits: ['Business Income: $3M', 'Equipment Breakdown: $1M'] },
      { line: 'Liquor Liability', premium: 6800, deductible: 5000, limit: '$2,000,000', aggregateLimit: '$4,000,000' },
      { line: 'Workers Compensation', premium: 10100, deductible: 0, limit: 'Statutory' },
      { line: 'Commercial Umbrella', premium: 5500, deductible: 10000, limit: '$5,000,000' },
    ],
    exclusions: ['Higher deductibles across all lines', 'Employment Practices excluded from umbrella'],
    paymentOptions: 'Quarterly installments or full pay (3% discount)',
    bindDeadline: '2025-06-08',
    overallScore: 84,
  },
];

export const roiMetrics: RoiMetrics = {
  avgTimePerSubmissionBefore: 4.2,
  avgTimePerSubmissionAfter: 0.5,
  submissionsPerMonth: 50,
  brokerCount: 12,
  avgBrokerHourlyCost: 85,
  errorReductionPercent: 73,
  fasterBindingDays: 4,
  additionalPoliciesPerMonth: 8,
  avgCommissionPerPolicy: 2400,
};

// Dashboard Submissions
import { Submission, ExtractedField, UploadedDocument, RequiredDocument } from '@/types';

export const dashboardSubmissions: Submission[] = [
  {
    id: 'sub-001',
    clientName: 'Pacific Coast Dining Group',
    linesOfBusiness: ['GL', 'Property', 'Liquor', 'WC', 'Umbrella'],
    status: 'package-ready',
    progressPercent: 100,
    dateCreated: '2025-03-10',
    assignedBroker: 'Sarah Chen',
    client: sampleClient,
  },
  {
    id: 'sub-002',
    clientName: 'Sunset Manufacturing LLC',
    linesOfBusiness: ['GL', 'Property', 'Auto', 'WC'],
    status: 'forms-review',
    progressPercent: 75,
    dateCreated: '2025-03-14',
    assignedBroker: 'Mike Rodriguez',
  },
  {
    id: 'sub-003',
    clientName: 'TechBridge Consulting Inc',
    linesOfBusiness: ['GL', 'E&O', 'Cyber'],
    status: 'data-extraction',
    progressPercent: 45,
    dateCreated: '2025-03-15',
    assignedBroker: 'Sarah Chen',
  },
  {
    id: 'sub-004',
    clientName: 'Golden Gate Logistics',
    linesOfBusiness: ['GL', 'Auto', 'Cargo', 'WC'],
    status: 'document-collection',
    progressPercent: 20,
    dateCreated: '2025-03-16',
    assignedBroker: 'David Park',
  },
  {
    id: 'sub-005',
    clientName: 'Alpine Construction Group',
    linesOfBusiness: ['GL', 'Property', 'WC', 'Builders Risk'],
    status: 'data-extraction',
    progressPercent: 60,
    dateCreated: '2025-03-17',
    assignedBroker: 'Mike Rodriguez',
  },
];

export const uploadedDocuments: UploadedDocument[] = [
  {
    id: 'doc-001',
    name: 'Loss_Runs_2022-2025.pdf',
    type: 'Loss Runs',
    status: 'extracted',
    uploadedAt: '2025-03-10 09:23 AM',
  },
  {
    id: 'doc-002',
    name: 'Dec_Pages_Current.pdf',
    type: 'Dec Pages',
    status: 'extracted',
    uploadedAt: '2025-03-10 09:24 AM',
  },
  {
    id: 'doc-003',
    name: 'Financial_Statements_2024.pdf',
    type: 'Financials',
    status: 'extracted',
    uploadedAt: '2025-03-10 09:25 AM',
  },
  {
    id: 'doc-004',
    name: 'Property_Schedule.xlsx',
    type: 'Property Schedule',
    status: 'extracted',
    uploadedAt: '2025-03-10 09:26 AM',
  },
];

export const requiredDocuments: RequiredDocument[] = [
  { name: 'Dec Pages (Current Coverage)', status: 'received' },
  { name: 'Loss Runs (5 Years)', status: 'received' },
  { name: 'Financial Statements (Most Recent)', status: 'received' },
  { name: 'Property Schedule (All Locations)', status: 'received' },
  { name: 'Liquor License Copies', status: 'missing' },
  { name: 'Certificate of Occupancy', status: 'missing' },
  { name: 'Fire Suppression System Inspection Reports', status: 'requested', requestedDate: '2025-03-12' },
];

export const extractedFields: ExtractedField[] = [
  // Business Info
  { category: 'Business Info', label: 'Legal Name', value: 'Pacific Coast Dining Group, Inc.', confidence: 98, source: 'Dec Pages' },
  { category: 'Business Info', label: 'DBA', value: 'Pacific Coast Dining', confidence: 95, source: 'Dec Pages' },
  { category: 'Business Info', label: 'FEIN', value: '94-1234567', confidence: 99, source: 'Financial Statements' },
  { category: 'Business Info', label: 'Entity Type', value: 'Corporation', confidence: 100, source: 'Dec Pages' },
  { category: 'Business Info', label: 'NAICS Code', value: '722511', confidence: 97, source: 'Dec Pages' },
  { category: 'Business Info', label: 'Mailing Address', value: '4200 Harbor Boulevard, Suite 300, Costa Mesa, CA 92626', confidence: 99, source: 'Dec Pages' },
  { category: 'Business Info', label: 'Phone', value: '(714) 555-0189', confidence: 100, source: 'Dec Pages' },
  { category: 'Business Info', label: 'Website', value: 'www.pacificcoastdining.com', confidence: 96, source: 'Dec Pages' },
  
  // Operations
  { category: 'Operations', label: 'Years in Business', value: '14', confidence: 99, source: 'Dec Pages' },
  { category: 'Operations', label: 'Annual Revenue', value: '$12,000,000', confidence: 99, source: 'Financial Statements' },
  { category: 'Operations', label: 'Employee Count', value: '180', confidence: 95, source: 'Dec Pages' },
  { category: 'Operations', label: 'Number of Locations', value: '8', confidence: 100, source: 'Property Schedule' },
  { category: 'Operations', label: 'Description', value: 'Full-service restaurant chain operating 8 locations across Southern California...', confidence: 92, source: 'Dec Pages' },
  
  // Coverage History
  { category: 'Coverage History', label: 'Prior Carrier', value: 'Nationwide Commercial', confidence: 100, source: 'Dec Pages' },
  { category: 'Coverage History', label: 'Prior Policy Number', value: 'NW-CGL-2024-88412', confidence: 100, source: 'Dec Pages' },
  { category: 'Coverage History', label: 'Expiration Date', value: '2025-06-15', confidence: 100, source: 'Dec Pages' },
  { category: 'Coverage History', label: 'Prior Premium', value: '$52,400', confidence: 98, source: 'Dec Pages' },
  { category: 'Coverage History', label: 'Years with Prior Carrier', value: '3', confidence: 95, source: 'Dec Pages' },
  
  // Claims (flagged)
  { category: 'Claims History', label: '2024 Claim Count', value: '1', confidence: 100, source: 'Loss Runs' },
  { category: 'Claims History', label: '2024 Total Incurred', value: '$18,500', confidence: 100, source: 'Loss Runs' },
  { category: 'Claims History', label: '2023 Claim Count', value: '2', confidence: 100, source: 'Loss Runs' },
  { category: 'Claims History', label: '2023 Total Incurred', value: '$47,000', confidence: 100, source: 'Loss Runs' },
  { category: 'Claims History', label: '2022 Claim Count', value: '1', confidence: 100, source: 'Loss Runs' },
  { category: 'Claims History', label: '2022 Total Incurred', value: '$8,900', confidence: 100, source: 'Loss Runs' },
  { category: 'Claims History', label: 'Open Claims', value: '0', confidence: 100, source: 'Loss Runs' },
  
  // Property Details (some flagged)
  { category: 'Property Details', label: 'Total Building Value', value: '$8,500,000', confidence: 93, source: 'Property Schedule' },
  { category: 'Property Details', label: 'Total Contents Value', value: '$2,100,000', confidence: 89, source: 'Property Schedule' },
  { category: 'Property Details', label: 'Business Income Limit', value: '$2,000,000', confidence: 82, source: 'Property Schedule' },
  { category: 'Property Details', label: 'Construction Type', value: 'Mixed (4 Frame / 4 Masonry)', confidence: 91, source: 'Property Schedule' },
  { category: 'Property Details', label: 'Protection Class', value: 'Average: Class 4', confidence: 95, source: 'Property Schedule' },
  { category: 'Property Details', label: 'Sprinklered', value: 'Yes - All Locations', confidence: 98, source: 'Property Schedule' },
];

export const submissionPackageFiles = [
  { name: 'Cover Letter.pdf', type: 'file' },
  { name: 'ACORD 125 — Commercial Application.pdf', type: 'file' },
  { name: 'ACORD 126 — General Liability.pdf', type: 'file' },
  { name: 'ACORD 140 — Property Section.pdf', type: 'file' },
  { name: 'ACORD 130 — Workers Compensation.pdf', type: 'file' },
  { name: 'Supporting Documents', type: 'folder', children: [
    { name: 'Loss Runs 2022-2025.pdf', type: 'file' },
    { name: 'Financial Statements 2024.pdf', type: 'file' },
    { name: 'Property Schedule.pdf', type: 'file' },
    { name: 'Dec Pages Current.pdf', type: 'file' },
  ]},
];

export const coverLetterPreview = `Dear Underwriter,

We are pleased to present the commercial insurance submission for Pacific Coast Dining Group, Inc., a well-established restaurant chain operating 8 locations across Southern California.

BUSINESS OVERVIEW:
Pacific Coast Dining Group has been in operation for 14 years, generating $12M in annual revenue with 180 employees. The operation includes full-service dining, takeout, catering services, and private events. All locations serve alcohol under appropriate liquor licenses.

COVERAGE REQUESTED:
- General Liability: $2M per occurrence / $4M aggregate
- Liquor Liability: $2M per occurrence / $4M aggregate  
- Property: $8.5M building / $2.1M contents / $2M business income
- Workers Compensation: Statutory limits
- Commercial Umbrella: $5M

LOSS HISTORY:
The insured maintains a favorable loss history with 4 claims over the past 5 years totaling $74,400. All claims are closed with no outstanding reserves. The loss ratio has been consistently below industry benchmarks.

RISK QUALITY:
- All locations equipped with fire suppression systems
- Active safety program with quarterly training
- Strong management team with deep industry experience
- Modern POS and inventory management systems
- Excellent financial stability (attached statements)

We believe this represents a high-quality risk with strong profitability potential for the right carrier. Please contact me with any questions or to discuss terms.

Best regards,
SubmissionAI Platform`;

// Enhanced cover letter
export const enhancedCoverLetter = `Dear Underwriter,

We are pleased to submit the following new business application on behalf of Pacific Coast Dining Group, Inc., a well-established restaurant chain operating 8 full-service locations across Southern California.

RISK PROFILE:
The insured has been in continuous operation for 14 years with annual revenues of $12,000,000 and employs 180 staff across all locations. Each location offers full-service dining, takeout, catering services, and private event hosting. All locations serve alcohol under proper liquor licenses with trained staff and established service protocols.

The operation demonstrates strong risk management fundamentals:
• All locations equipped with commercial-grade fire suppression systems (inspected annually)
• Active employee safety training program with quarterly sessions
• Modern POS and inventory management systems
• Robust hiring and screening processes
• Strong management team with 50+ combined years in hospitality

LOSS HISTORY:
Pacific Coast Dining Group maintains a favorable loss history with only 4 claims over the past 5 years totaling $74,400. All claims are closed with no outstanding reserves. The loss ratio has consistently remained below industry benchmarks for full-service restaurants. The most significant loss was a contained kitchen fire in 2023 ($34,200) which resulted in equipment upgrades and enhanced fire prevention protocols.

COVERAGE REQUESTED:
• General Liability: $2,000,000 per occurrence / $4,000,000 aggregate
• Liquor Liability: $2,000,000 per occurrence / $4,000,000 aggregate  
• Property: $8,500,000 building / $2,100,000 contents / $2,000,000 business income
• Workers Compensation: Statutory limits (CA)
• Commercial Umbrella: $5,000,000

FINANCIAL STRENGTH:
The insured maintains excellent financial stability with positive cash flow, strong profitability margins, and conservative debt ratios. Most recent financial statements are attached and demonstrate consistent year-over-year growth.

We believe Pacific Coast Dining Group represents a high-quality hospitality risk with strong profitability potential for the right carrier. The combination of established operations, solid management, favorable loss history, and comprehensive risk controls makes this an attractive submission.

Please contact me with any questions or to discuss terms. We appreciate your consideration and look forward to your quote.

Best regards,
Sarah Chen, CPCU
Commercial Lines Broker
Summit Ridge Insurance Group`;

// ACORD form scanning progress
export const documentScanProgress = [
  { doc: 'Dec_Pages_Current.pdf', status: 'Analyzing declarations page...', delay: 800 },
  { doc: 'Loss_Runs_2022-2025.pdf', status: 'Extracting loss history data...', delay: 1200 },
  { doc: 'Financial_Statements_2024.pdf', status: 'Processing financial information...', delay: 900 },
  { doc: 'Property_Schedule.xlsx', status: 'Reading property details...', delay: 700 },
];

// Detailed ACORD form data
export const acordFormData = {
  acord125: {
    agency: {
      name: 'Summit Ridge Insurance Group',
      address: '1500 Commerce Drive, Suite 200',
      city: 'Newport Beach',
      state: 'CA',
      zip: '92660',
      phone: '(949) 555-0123',
      fax: '(949) 555-0124',
      producerCode: 'SRIG-2024',
    },
    namedInsured: {
      name: 'Pacific Coast Dining Group, Inc.',
      dba: 'Pacific Coast Dining',
      mailingAddress: '4200 Harbor Boulevard, Suite 300',
      city: 'Costa Mesa',
      state: 'CA',
      zip: '92626',
      phone: '(714) 555-0189',
      fein: '94-1234567',
      entityType: 'Corporation',
      website: 'www.pacificcoastdining.com',
    },
    businessInfo: {
      naicsCode: '722511',
      naicsDescription: 'Full-Service Restaurants',
      yearsInBusiness: 14,
      yearsWithCurrentAgent: 3,
      totalAnnualRevenue: 12000000,
      totalEmployees: 180,
      totalLocations: 8,
      descriptionOfOperations: 'Full-service restaurant chain operating 8 locations across Southern California. Offers dine-in, takeout, catering, and private event services. Serves alcohol at all locations. Average seating capacity of 120 per location. Annual catering revenue approximately $1.8M. All locations equipped with commercial-grade fire suppression systems.',
    },
    linesRequested: [
      { line: 'General Liability', checked: true },
      { line: 'Property', checked: true },
      { line: 'Liquor Liability', checked: true },
      { line: 'Workers Compensation', checked: true },
      { line: 'Commercial Umbrella', checked: true },
      { line: 'Commercial Auto', checked: false },
      { line: 'Crime', checked: false },
      { line: 'Cyber Liability', checked: false },
    ],
    priorCarrier: {
      name: 'Nationwide Commercial',
      policyNumber: 'NW-CGL-2024-88412',
      expirationDate: '2025-06-15',
      totalPremium: 52400,
      yearsWithCarrier: 3,
      reasonForChange: 'Shopping for better terms and pricing',
    },
    lossHistory: [
      { year: 2024, claimType: 'GL - Slip & Fall', dateOfLoss: '2024-02-15', amountPaid: 18500, amountReserve: 0, status: 'Closed', description: 'Customer slip and fall in restroom. Settled.' },
      { year: 2023, claimType: 'Property - Kitchen Fire', dateOfLoss: '2023-08-22', amountPaid: 34200, amountReserve: 0, status: 'Closed', description: 'Grease fire at Costa Mesa location. Equipment damage and 3-day closure.' },
      { year: 2023, claimType: 'WC - Back Injury', dateOfLoss: '2023-11-10', amountPaid: 12800, amountReserve: 0, status: 'Closed', description: 'Line cook back injury from lifting. Full recovery.' },
      { year: 2022, claimType: 'GL - Food Illness', dateOfLoss: '2022-05-30', amountPaid: 8900, amountReserve: 0, status: 'Closed', description: 'Alleged food poisoning claim. Settled for nuisance value.' },
    ],
  },
  acord126: {
    classification: {
      code: '40133',
      description: 'Restaurants - Full Service',
      grossReceipts: 12000000,
      liquorReceipts: 2400000,
    },
    limitsRequested: {
      eachOccurrence: 2000000,
      damageToRentedPremises: 300000,
      medicalExpense: 10000,
      personalAdvertisingInjury: 2000000,
      generalAggregate: 4000000,
      productsCompletedOpsAggregate: 4000000,
    },
    liquorLiability: {
      included: true,
      eachOccurrence: 2000000,
      aggregate: 4000000,
      liquorSalesPercentage: 20,
    },
    additionalCoverages: [
      'Liquor Liability',
      'Host Liquor Liability',
      'Products Liability - Food Service',
      'Waiver of Subrogation (where required by contract)',
      'Additional Insured - Landlords',
    ],
  },
  acord140: {
    locations: [
      { address: '4200 Harbor Blvd, Costa Mesa, CA', buildingValue: 1200000, contentsValue: 280000, biLimit: 250000, construction: 'Masonry', protectionClass: 4, sprinklered: true },
      { address: '8850 Warner Ave, Fountain Valley, CA', buildingValue: 980000, contentsValue: 240000, biLimit: 220000, construction: 'Masonry', protectionClass: 3, sprinklered: true },
      { address: '1550 Main St, Huntington Beach, CA', buildingValue: 1450000, contentsValue: 310000, biLimit: 280000, construction: 'Masonry', protectionClass: 3, sprinklered: true },
      { address: '2200 Newport Blvd, Newport Beach, CA', buildingValue: 1680000, contentsValue: 350000, biLimit: 320000, construction: 'Masonry', protectionClass: 2, sprinklered: true },
      { address: '5600 Pacific Coast Hwy, Long Beach, CA', buildingValue: 1100000, contentsValue: 260000, biLimit: 240000, construction: 'Frame', protectionClass: 4, sprinklered: true },
      { address: '3300 Bristol St, Costa Mesa, CA', buildingValue: 890000, contentsValue: 220000, biLimit: 200000, construction: 'Frame', protectionClass: 5, sprinklered: true },
      { address: '7200 Edinger Ave, Huntington Beach, CA', buildingValue: 920000, contentsValue: 230000, biLimit: 210000, construction: 'Frame', protectionClass: 4, sprinklered: true },
      { address: '4500 MacArthur Blvd, Newport Beach, CA', buildingValue: 1280000, contentsValue: 310000, biLimit: 280000, construction: 'Masonry', protectionClass: 3, sprinklered: true },
    ],
    totalBuildingValue: 8500000,
    totalContentsValue: 2100000,
    totalBILimit: 2000000,
    deductible: 5000,
    valuation: 'Replacement Cost',
    coinsurance: '90%',
  },
  acord130: {
    state: 'California',
    classificationCodes: [
      { code: '9082', description: 'Restaurant - All Employees', payroll: 4200000, rate: 2.85, premium: 11970 },
      { code: '8742', description: 'Salespersons - Outside', payroll: 180000, rate: 0.68, premium: 122 },
    ],
    totalPayroll: 4380000,
    totalPremium: 12092,
    emr: 0.92,
    deductible: 0,
  },
};
