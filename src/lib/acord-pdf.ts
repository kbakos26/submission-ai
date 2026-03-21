import { PDFDocument } from 'pdf-lib';

// ============================================================
// ACORD PDF Filler — Uses full master template (11 pages)
// Pages 1-4: ACORD 125, Pages 5-8: ACORD 126, Pages 9-11: ACORD 140
// ============================================================

export const LINE_OF_BUSINESS_FORMS: Record<string, { label: string; forms: string[]; description: string }> = {
  gl: { label: 'General Liability', forms: ['125', '126'], description: 'Bodily injury, property damage, personal/advertising injury' },
  property: { label: 'Commercial Property', forms: ['125', '140'], description: 'Buildings, contents, business income, equipment' },
  wc: { label: 'Workers Compensation', forms: ['125', '130'], description: 'Employee injuries, employers liability' },
  auto: { label: 'Business Auto', forms: ['125', '127'], description: 'Commercial vehicles, hired/non-owned auto' },
  umbrella: { label: 'Umbrella / Excess', forms: ['125', '131'], description: 'Additional liability limits above underlying policies' },
  bop: { label: 'Business Owners (BOP)', forms: ['125'], description: 'Combined GL + Property for small businesses' },
  crime: { label: 'Commercial Crime', forms: ['125'], description: 'Employee theft, forgery, computer fraud' },
  cyber: { label: 'Cyber Liability', forms: ['125'], description: 'Data breach, network security, privacy liability' },
  epli: { label: 'Employment Practices', forms: ['125'], description: 'Discrimination, wrongful termination, harassment' },
  pl: { label: 'Professional Liability / E&O', forms: ['125'], description: 'Errors & omissions, professional negligence' },
};

export function getRequiredForms(selectedLines: string[]): string[] {
  const forms = new Set<string>();
  selectedLines.forEach(line => { LINE_OF_BUSINESS_FORMS[line]?.forms.forEach(f => forms.add(f)); });
  return Array.from(forms).sort();
}

export const FORM_INFO: Record<string, { title: string; pages: number }> = {
  '125': { title: 'Commercial Insurance Application', pages: 4 },
  '126': { title: 'Commercial General Liability Section', pages: 4 },
  '127': { title: 'Business Auto Section', pages: 3 },
  '130': { title: 'Workers Compensation Application', pages: 4 },
  '131': { title: 'Umbrella / Excess Liability', pages: 5 },
  '140': { title: 'Property Section', pages: 3 },
};

// Page ranges in master template
const FORM_PAGES: Record<string, number[]> = {
  '125': [0, 1, 2, 3],
  '126': [4, 5, 6, 7],
  '140': [8, 9, 10],
};

let _fillCount = 0;
let _failCount = 0;
function sf(form: any, name: string, value: string) {
  try { 
    form.getTextField(name).setText(value || ''); 
    if (value) _fillCount++;
  } catch { _failCount++; }
}
function sc(form: any, name: string, checked: boolean) {
  try { if (checked) form.getCheckBox(name).check(); else form.getCheckBox(name).uncheck(); } catch {}
}
function m(v: any): string {
  const n = Number(v); return (!n && n !== 0) ? '' : n.toLocaleString('en-US');
}
function v(val: any): string {
  return val === null || val === undefined ? '' : String(val);
}

async function loadMaster(): Promise<ArrayBuffer> {
  console.log('[ACORD PDF] Fetching master template...');
  const resp = await fetch('/templates/acord-master-template.pdf');
  console.log('[ACORD PDF] Response:', resp.status, resp.headers.get('content-type'));
  if (!resp.ok) throw new Error('Master template not found: ' + resp.status);
  const buf = await resp.arrayBuffer();
  console.log('[ACORD PDF] Template loaded:', buf.byteLength, 'bytes');
  return buf;
}

function downloadBlob(bytes: Uint8Array, name: string) {
  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

function fillAcord125(form: any, data: any) {
  if (!data) return;
  // Date & Agency
  sf(form, 'ACORD_CurrentDate', new Date().toLocaleDateString());
  sf(form, 'ACORD_AgencyName', v(data.agency?.name));
  sf(form, 'ACORD_CarrierName', v(data.agency?.carrier));
  sf(form, 'ACORD_NAICCode', v(data.agency?.naicCode));
  sf(form, 'ACORD_PolicyNumber', v(data.agency?.policyNumber));
  sf(form, 'ACORD_ProducerContact', v(data.agency?.contact));
  sf(form, 'ACORD_ProducerPhoneNumber', v(data.agency?.phone));
  sf(form, 'ACORD_ProducerFaxNumber', v(data.agency?.fax));
  sf(form, 'ACORD_ProducerEmailAddress', v(data.agency?.email));
  sf(form, 'ACORD_ProducerCode', v(data.agency?.producerCode));
  sf(form, 'ACORD_Underwriter', v(data.agency?.underwriter));
  sc(form, 'ACORD_Transaction_Quote', true);
  
  // Policy
  sf(form, 'ACORD_Policy_EffectiveDate', v(data.policyInfo?.effectiveDate));
  sf(form, 'ACORD_Policy_ExpirationDate', v(data.policyInfo?.expirationDate));
  sf(form, 'ACORD_Policy_PaymentPlan', v(data.policyInfo?.paymentPlan));
  sf(form, 'ACORD_Policy_PaymentMethod', v(data.policyInfo?.paymentMethod));
  sf(form, 'ACORD_Policy_Audit', v(data.policyInfo?.audit || 'Annual'));
  sf(form, 'ACORD_Policy_PolicyPremium', m(data.policyInfo?.totalPremium || data.priorCarrier?.totalPremium));
  sf(form, 'ACORD_Policy_DepositAmount', m(data.policyInfo?.deposit));
  sf(form, 'ACORD_Policy_MinimumPremium', m(data.policyInfo?.minimumPremium));
  
  // Named Insured #1
  sf(form, 'ACORD_Policy_Insured1_Name', v(data.namedInsured?.name));
  const addr = data.namedInsured;
  const fullAddr = addr?.mailingAddress || [addr?.address, addr?.city, addr?.state, addr?.zip].filter(Boolean).join(', ');
  sf(form, 'ACORD_Policy_Insured1_MailingAddress', v(fullAddr));
  sf(form, 'ACORD_Policy_Insured1_GLCode', v(data.namedInsured?.glCode));
  sf(form, 'ACORD_Policy_Insured1_SIC', v(data.businessInfo?.sicCode));
  sf(form, 'ACORD_Policy_Insured1_NAICS', v(data.businessInfo?.naicsCode));
  sf(form, 'ACORD_Policy_Insured1_FEINSSN', v(data.namedInsured?.fein));
  sf(form, 'ACORD_Policy_Insured1_PhoneNumber', v(data.namedInsured?.phone));
  sf(form, 'ACORD_Policy_Insured1_Website', v(data.namedInsured?.website || data.businessInfo?.website));
  
  // Entity type
  const et = v(data.namedInsured?.entityType).toLowerCase();
  sc(form, 'ACORD_Policy_Insured1_Type_Corporation', et.includes('corp') && !et.includes('sub'));
  sc(form, 'ACORD_Policy_Insured1_Type_SCorp', et.includes('sub') || et.includes('s corp'));
  sc(form, 'ACORD_Policy_Insured1_Type_LLC', et.includes('llc'));
  sc(form, 'ACORD_Policy_Insured1_Type_Partnership', et.includes('partner'));
  sc(form, 'ACORD_Policy_Insured1_Type_Individual', et.includes('individual') || et.includes('sole'));
  sc(form, 'ACORD_Policy_Insured1_Type_JointVenture', et.includes('joint'));
  sc(form, 'ACORD_Policy_Insured1_Type_NotForProfit', et.includes('non') || et.includes('not for'));
  sc(form, 'ACORD_Policy_Insured1_Type_Trust', et.includes('trust'));
  
  // Contact info (page 2)
  sf(form, 'ACORD_Contact1_Name', v(data.contact?.name || data.namedInsured?.contactName));
  sf(form, 'ACORD_Contact1_Type', v(data.contact?.type || 'Owner'));
  sf(form, 'ACORD_Contact1_PrimaryPhoneNumber', v(data.contact?.phone || data.namedInsured?.phone));
  sf(form, 'ACORD_Contact1_PrimaryEmailAddress', v(data.contact?.email || data.namedInsured?.email));
  
  // Nature of business (page 2)
  sf(form, 'ACORD_NatureOfBusiness_Description', v(data.businessInfo?.descriptionOfOperations));
  sf(form, 'ACORD_NatureOfBusiness_StartDate', v(data.businessInfo?.dateStarted));
  sf(form, 'ACORD_NatureOfOperations_OtherOperations', v(data.businessInfo?.natureOfBusiness));
  
  // Page 2 — Premises / Locations (up to 4)
  const locs = data.premisesInfo || data.locations || [];
  for (let i = 0; i < Math.min(locs.length, 4); i++) {
    const loc = locs[i];
    const n = i + 1;
    sf(form, `ACORD_Location${n}_LocationNumber`, v(loc.number || n));
    sf(form, `ACORD_Location${n}_BuildingNumber`, v(loc.buildingNumber || '1'));
    sf(form, `ACORD_Location${n}_Street`, v(loc.address || loc.street));
    sf(form, `ACORD_Location${n}_City`, v(loc.city));
    sf(form, `ACORD_Location${n}_State`, v(loc.state));
    sf(form, `ACORD_Location${n}_ZIP`, v(loc.zip));
    sf(form, `ACORD_Location${n}_County`, v(loc.county));
    sf(form, `ACORD_Location${n}_Employees_FullTime`, v(loc.fullTimeEmployees));
    sf(form, `ACORD_Location${n}_Employees_PartTime`, v(loc.partTimeEmployees));
    sf(form, `ACORD_Location${n}_AnnualRevenue`, m(loc.annualRevenues || loc.revenue));
    sf(form, `ACORD_Location${n}_BuildingArea`, v(loc.sqFootage || loc.totalArea || loc.buildingArea));
    sf(form, `ACORD_Location${n}_Description`, v(loc.description));
  }
  
  // Prior carrier (page 3-4)
  sf(form, 'ACORD_PriorCarrier_1_AutoCarrier', v(data.priorCarrier?.name));
  sf(form, 'ACORD_PriorCarrier_1_AutoPolicyNumber', v(data.priorCarrier?.policyNumber));
  sf(form, 'ACORD_PriorCarrier_1_AutoPremium', m(data.priorCarrier?.totalPremium));
  sf(form, 'ACORD_PriorCarrier_1_AutoEffectiveDate', v(data.priorCarrier?.effectiveDate));
  sf(form, 'ACORD_PriorCarrier_1_AutoExpirationDate', v(data.priorCarrier?.expirationDate));
  
  // Loss history (page 4)
  const losses = data.lossHistory || [];
  sf(form, 'ACORD_LossHistory_NumberOfYears', '5');
  losses.forEach((l: any, i: number) => {
    if (i >= 5) return;
    sf(form, `ACORD_LossHistory_${i+1}_LOB`, v(l.line));
    sf(form, `ACORD_LossHistory_${i+1}_Description`, v(l.description));
    sf(form, `ACORD_LossHistory_${i+1}_AmountPaid`, m(l.amountPaid));
    sf(form, `ACORD_LossHistory_${i+1}_AmountReserved`, m(l.amountReserved));
    sf(form, `ACORD_LossHistory_${i+1}_OccurrenceDate`, v(l.occurrenceDate));
    sf(form, `ACORD_LossHistory_${i+1}_ClaimDate`, v(l.claimDate));
  });
  let totalLosses = 0;
  losses.forEach((l: any) => { totalLosses += Number(l.totalIncurred || 0); });
  sf(form, 'ACORD_LossHistory_TotalLosses', m(totalLosses));

  // Page 3 — Remarks
  sf(form, 'ACORD_General_Remarks', v(data.remarks || data.generalRemarks));

  // Page 4 — Signatures
  sf(form, 'ACORD_Signatures_Applicant_Date', new Date().toLocaleDateString());
}

function fillAcord126(form: any, data: any) {
  if (!data) return;
  sf(form, 'Form_CompletionDate_A', new Date().toLocaleDateString());
  sf(form, 'Producer_FullName_A', v(data.agency?.name));
  sf(form, 'Insurer_FullName_A', v(data.agency?.carrier));
  sf(form, 'Insurer_NAICCode_A', v(data.agency?.naicCode));
  sf(form, 'Policy_PolicyNumberIdentifier_A', v(data.policyNumber));
  sf(form, 'Policy_EffectiveDate_A', v(data.effectiveDate));
  sf(form, 'NamedInsured_FullName_A', v(data.namedInsured));
  
  sc(form, 'GeneralLiability_CoverageIndicator_A', true);
  sc(form, 'GeneralLiability_OccurrenceIndicator_A', data.coverageType !== 'claims-made');
  sc(form, 'GeneralLiability_ClaimsMadeIndicator_A', data.coverageType === 'claims-made');
  
  sf(form, 'GeneralLiability_GeneralAggregate_LimitAmount_A', m(data.limitsRequested?.generalAggregate));
  sf(form, 'GeneralLiability_ProductsAndCompletedOperations_AggregateLimitAmount_A', m(data.limitsRequested?.productsCompletedOpsAggregate));
  sf(form, 'GeneralLiability_PersonalAndAdvertisingInjury_LimitAmount_A', m(data.limitsRequested?.personalAdvertisingInjury));
  sf(form, 'GeneralLiability_EachOccurrence_LimitAmount_A', m(data.limitsRequested?.eachOccurrence));
  sf(form, 'GeneralLiability_FireDamageRentedPremises_EachOccurrenceLimitAmount_A', m(data.limitsRequested?.damageToRentedPremises));
  sf(form, 'GeneralLiability_MedicalExpense_EachPersonLimitAmount_A', m(data.limitsRequested?.medicalExpense));
  sf(form, 'GeneralLiability_EmployeeBenefits_LimitAmount_A', m(data.limitsRequested?.employeeBenefits));
  sf(form, 'GeneralLiability_GeneralAggregate_LimitAppliesToCode_A', 'Policy');
  sf(form, 'GeneralLiability_PropertyDamage_DeductibleAmount_A', m(data.deductibles?.propertyDamage));
  sf(form, 'GeneralLiability_BodilyInjury_DeductibleAmount_A', m(data.deductibles?.bodilyInjury));
  sf(form, 'GeneralLiability_PremisesOperations_PremiumAmount_A', m(data.premiums?.premisesOperations));
  sf(form, 'GeneralLiability_Products_PremiumAmount_A', m(data.premiums?.products));
  
  const cls = data.classifications || (data.classification ? [data.classification] : []);
  if (cls[0]) {
    sf(form, 'GeneralLiability_Hazard_LocationProducerIdentifier_A', '1');
    sf(form, 'GeneralLiability_Hazard_Classification_A', v(cls[0].description));
    sf(form, 'GeneralLiability_Hazard_ClassCode_A', v(cls[0].code));
    sf(form, 'GeneralLiability_Hazard_PremisesOperationsPremiumAmount_A', m(cls[0].grossReceipts || cls[0].exposure));
  }
}

function fillAcord140(form: any, data: any) {
  if (!data) return;
  sf(form, 'Form_CompletionDate_A', new Date().toLocaleDateString());
  sf(form, 'Producer_FullName_A', v(data.agency?.name));
  sf(form, 'Insurer_FullName_A', v(data.agency?.carrier));
  sf(form, 'Insurer_NAICCode_A', v(data.agency?.naicCode));
  sf(form, 'Policy_PolicyNumberIdentifier_A', v(data.policyNumber));
  sf(form, 'Policy_EffectiveDate_A', v(data.effectiveDate));
  sf(form, 'NamedInsured_FullName_A', v(data.namedInsured));
  
  sf(form, 'CommercialProperty_Summary_BlanketNumberIdentifier_A', '1');
  sf(form, 'CommercialProperty_Summary_BlanketLimitAmount_A', m(data.totalBuildingValue));
  sf(form, 'CommercialCoverage_Summary_BlanketTypeDescription_A', 'Building');
  sf(form, 'CommercialProperty_Summary_BlanketNumberIdentifier_B', '2');
  sf(form, 'CommercialProperty_Summary_BlanketLimitAmount_B', m(data.totalContentsValue));
  sf(form, 'CommercialCoverage_Summary_BlanketTypeDescription_B', 'Contents / BPP');
  
  const locs = data.locations || [];
  if (locs[0]) {
    sf(form, 'CommercialStructure_Location_ProducerIdentifier_A', v(locs[0].number || '1'));
    sf(form, 'CommercialStructure_Building_ProducerIdentifier_A', '1');
    sf(form, 'CommercialStructure_PhysicalAddress_LineOne_A', v(locs[0].address));
    sf(form, 'CommercialProperty_Premises_SubjectOfInsuranceCode_A', 'Building');
    sf(form, 'CommercialProperty_Premises_LimitAmount_A', m(locs[0].buildingValue));
    sf(form, 'CommercialProperty_Premises_CoinsurancePercent_A', v(locs[0].coinsurance || data.coinsurance || '80'));
    sf(form, 'CommercialProperty_Premises_ValuationCode_A', v(data.valuation || 'RC'));
    sf(form, 'CommercialProperty_Premises_CauseOfLossCode_A', v(data.causesOfLoss || 'Special'));
    sf(form, 'CommercialProperty_Premises_DeductibleAmount_A', m(data.deductible));
    sf(form, 'CommercialProperty_Premises_SubjectOfInsuranceCode_B', 'Contents/BPP');
    sf(form, 'CommercialProperty_Premises_LimitAmount_B', m(locs[0].contentsValue));
    sf(form, 'CommercialProperty_Premises_CoinsurancePercent_B', v(locs[0].coinsurance || data.coinsurance || '80'));
    sf(form, 'CommercialProperty_Premises_DeductibleAmount_B', m(data.deductible));
    sf(form, 'CommercialProperty_Premises_SubjectOfInsuranceCode_C', 'Bus Income');
    sf(form, 'CommercialProperty_Premises_LimitAmount_C', m(locs[0].biLimit));
    sf(form, 'Construction_ConstructionCode_A', v(locs[0].construction));
    sf(form, 'Construction_StoreyCount_A', v(locs[0].stories));
    sf(form, 'Construction_BasementCount_A', v(locs[0].basements || '0'));
    sf(form, 'CommercialStructure_BuiltYear_A', v(locs[0].yearBuilt));
    sf(form, 'Construction_BuildingArea_A', v(locs[0].sqFootage));
    sf(form, 'Construction_RoofMaterialCode_A', v(locs[0].roofType));
    sf(form, 'BuildingFireProtection_ProtectionClassCode_A', v(locs[0].protectionClass));
    sf(form, 'BuildingFireProtection_Alarm_SprinklerPercent_A', v(locs[0].sprinklered ? '100' : locs[0].sprinklerPercentage || '0'));
  }
  if (locs[1]) {
    sf(form, 'CommercialStructure_Location_ProducerIdentifier_B', v(locs[1].number || '2'));
    sf(form, 'CommercialStructure_PhysicalAddress_LineOne_B', v(locs[1].address));
    sf(form, 'CommercialProperty_Premises_SubjectOfInsuranceCode_G', 'Building');
    sf(form, 'CommercialProperty_Premises_LimitAmount_G', m(locs[1].buildingValue));
    sf(form, 'CommercialProperty_Premises_SubjectOfInsuranceCode_H', 'Contents/BPP');
    sf(form, 'CommercialProperty_Premises_LimitAmount_H', m(locs[1].contentsValue));
    sf(form, 'Construction_ConstructionCode_B', v(locs[1].construction));
    sf(form, 'CommercialStructure_BuiltYear_B', v(locs[1].yearBuilt));
    sf(form, 'Construction_BuildingArea_B', v(locs[1].sqFootage));
  }
}

// ===== Individual form downloads (extract pages from filled master) =====
async function fillMasterAndExtract(formData: any, pageIndices: number[], outputName: string) {
  const masterBytes = await loadMaster();
  const masterDoc = await PDFDocument.load(masterBytes);
  const form = masterDoc.getForm();
  
  // Fill all forms
  _fillCount = 0; _failCount = 0;
  console.log('[ACORD PDF] formData keys:', Object.keys(formData || {}));
  console.log('[ACORD PDF] acord125 data:', formData?.acord125 ? Object.keys(formData.acord125) : 'MISSING');
  console.log('[ACORD PDF] namedInsured:', formData?.acord125?.namedInsured);
  fillAcord125(form, formData?.acord125);
  fillAcord126(form, formData?.acord126);
  fillAcord140(form, formData?.acord140);
  console.log('[ACORD PDF] Fields filled:', _fillCount, 'Failed:', _failCount);
  
  // Save with form fields intact (not flattened) so values show in PDF viewer
  const outBytes = await masterDoc.save();
  downloadBlob(outBytes, outputName);
}

export async function generateAcord125PDF(data: any): Promise<void> {
  await fillMasterAndExtract({ acord125: data }, FORM_PAGES['125']!, 'ACORD-125-Commercial-Application.pdf');
}

export async function generateAcord126PDF(data: any): Promise<void> {
  await fillMasterAndExtract({ acord126: data }, FORM_PAGES['126']!, 'ACORD-126-General-Liability.pdf');
}

export async function generateAcord140PDF(data: any): Promise<void> {
  await fillMasterAndExtract({ acord140: data }, FORM_PAGES['140']!, 'ACORD-140-Property-Section.pdf');
}

// For 127/130/131 we use their own templates (these preserved fields)
async function fillFromTemplate(templateName: string, fillFn: (form: any) => void, outputName: string) {
  const resp = await fetch(`/templates/${templateName}`);
  if (!resp.ok) throw new Error(`Template ${templateName} not found`);
  const bytes = await resp.arrayBuffer();
  const doc = await PDFDocument.load(bytes);
  const form = doc.getForm();
  fillFn(form);
  const out = await doc.save();
  downloadBlob(out, outputName);
}

export async function generateAcord127PDF(data: any): Promise<void> {
  if (!data) return;
  await fillFromTemplate('acord-127-template.pdf', (form) => {
    const p = 'F[0].P1[0].';
    sf(form, p+'Form_CompletionDate_A[0]', new Date().toLocaleDateString());
    sf(form, p+'Producer_FullName_A[0]', v(data.agency?.name));
    sf(form, p+'Insurer_FullName_A[0]', v(data.agency?.carrier));
    sf(form, p+'NamedInsured_FullName_A[0]', v(data.namedInsured));
    sf(form, p+'Policy_PolicyNumberIdentifier_A[0]', v(data.policyNumber));
    sf(form, p+'Policy_EffectiveDate_A[0]', v(data.effectiveDate));
    sf(form, p+'Vehicle_BodilyInjury_PerPersonLimitAmount_A[0]', m(data.limits?.biPerPerson || 1000000));
    sf(form, p+'Vehicle_BodilyInjury_PerAccidentLimitAmount_A[0]', m(data.limits?.biPerAccident || 1000000));
    sf(form, p+'Vehicle_PropertyDamage_PerAccidentLimitAmount_A[0]', m(data.limits?.pdPerAccident || 1000000));
  }, 'ACORD-127-Business-Auto.pdf');
}

export async function generateAcord130PDF(data: any): Promise<void> {
  if (!data) return;
  await fillFromTemplate('acord-130-template.pdf', (form) => {
    const p = 'F[0].P1[0].';
    sf(form, p+'Text1[0]', new Date().toLocaleDateString());
    sf(form, p+'Text2[0]', v(data.agency?.name));
    sf(form, p+'Text18[0]', v(data.agency?.carrier));
    sf(form, p+'Text20[0]', v(data.namedInsured?.name));
    sf(form, p+'Text22[0]', v(data.namedInsured?.mailingAddress));
    sf(form, p+'Text27[0]', v(data.namedInsured?.phone));
    sf(form, p+'Text28[0]', v(data.businessInfo?.yearsInBusiness));
    sf(form, p+'Text30[0]', v(data.businessInfo?.naicsCode));
    const codes = data.classificationCodes || [];
    codes.forEach((cls: any, i: number) => {
      const base = i * 6;
      sf(form, p+`Text${40+base}[0]`, v(cls.code));
      sf(form, p+`Text${41+base}[0]`, v(cls.description));
      sf(form, p+`Text${43+base}[0]`, m(cls.payroll));
      sf(form, p+`Text${44+base}[0]`, v(cls.rate));
      sf(form, p+`Text${45+base}[0]`, m(cls.premium));
    });
  }, 'ACORD-130-Workers-Compensation.pdf');
}

export async function generateAcord131PDF(data: any): Promise<void> {
  if (!data) return;
  await fillFromTemplate('acord-131-template.pdf', (form) => {
    const p = 'F[0].P1[0].';
    sf(form, p+'Form_CompletionDate_A[0]', new Date().toLocaleDateString());
    sf(form, p+'Producer_FullName_A[0]', v(data.agency?.name));
    sf(form, p+'Insurer_FullName_A[0]', v(data.agency?.carrier));
    sf(form, p+'NamedInsured_FullName_A[0]', v(data.namedInsured));
    sf(form, p+'ExcessUmbrella_Umbrella_EachOccurrenceAmount_A[0]', m(data.limits?.eachOccurrence || 5000000));
    sf(form, p+'ExcessUmbrella_Umbrella_AggregateAmount_A[0]', m(data.limits?.aggregate || 5000000));
    sf(form, p+'ExcessUmbrella_Umbrella_DeductibleOrRetentionAmount_A[0]', m(data.limits?.retention || 10000));
  }, 'ACORD-131-Umbrella-Excess.pdf');
}

export async function generateFormPDF(formNum: string, data: any): Promise<void> {
  console.log('[ACORD PDF] generateFormPDF called:', formNum, 'data keys:', Object.keys(data || {}));
  switch (formNum) {
    case '125': return generateAcord125PDF(data?.acord125 || data);
    case '126': return generateAcord126PDF(data?.acord126 || data);
    case '127': return generateAcord127PDF(data?.acord127 || data);
    case '130': return generateAcord130PDF(data?.acord130 || data);
    case '131': return generateAcord131PDF(data?.acord131 || data);
    case '140': return generateAcord140PDF(data?.acord140 || data);
  }
}

export async function generateAllAcordPDFs(formData: any, selectedForms?: string[]): Promise<void> {
  if (!formData) return;
  // For 125/126/140 — use master template (fill once, extract all)
  const masterForms = ['125', '126', '140'];
  const forms = selectedForms || Object.keys(FORM_INFO);
  const needMaster = forms.some(f => masterForms.includes(f));
  
  if (needMaster) {
    const masterBytes = await loadMaster();
    const masterDoc = await PDFDocument.load(masterBytes);
    const form = masterDoc.getForm();
    fillAcord125(form, formData?.acord125);
    fillAcord126(form, formData?.acord126);
    fillAcord140(form, formData?.acord140);
    form.flatten();
    
    for (const f of forms.filter(f => masterForms.includes(f))) {
      const outDoc = await PDFDocument.create();
      const pages = await outDoc.copyPages(masterDoc, FORM_PAGES[f]!);
      pages.forEach(p => outDoc.addPage(p));
      const outBytes = await outDoc.save();
      downloadBlob(outBytes, `ACORD-${f}-${FORM_INFO[f]?.title?.replace(/\s+/g, '-') || 'Form'}.pdf`);
    }
  }
  
  // Other forms use individual templates
  for (const f of forms.filter(f => !masterForms.includes(f))) {
    await generateFormPDF(f, formData);
  }
}
