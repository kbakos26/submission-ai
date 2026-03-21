import { PDFDocument } from 'pdf-lib';

// ============================================================
// ACORD PDF Filler — Fills real ACORD form templates
// Supports: 125, 126, 127, 130, 131, 140
// ============================================================

// Line of business → required forms mapping
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

// Get unique forms needed for selected lines
export function getRequiredForms(selectedLines: string[]): string[] {
  const forms = new Set<string>();
  selectedLines.forEach(line => {
    LINE_OF_BUSINESS_FORMS[line]?.forms.forEach(f => forms.add(f));
  });
  return Array.from(forms).sort();
}

// Form metadata
export const FORM_INFO: Record<string, { title: string; pages: number }> = {
  '125': { title: 'Commercial Insurance Application', pages: 4 },
  '126': { title: 'Commercial General Liability Section', pages: 4 },
  '127': { title: 'Business Auto Section', pages: 3 },
  '130': { title: 'Workers Compensation Application', pages: 4 },
  '131': { title: 'Umbrella / Excess Liability', pages: 5 },
  '140': { title: 'Property Section', pages: 3 },
};

// ---- Utilities ----

async function loadTemplate(formNum: string): Promise<ArrayBuffer> {
  const resp = await fetch(`/templates/acord-${formNum}-template.pdf`);
  if (!resp.ok) throw new Error(`Template not found: acord-${formNum}-template.pdf`);
  return resp.arrayBuffer();
}

function sf(form: any, name: string, value: string) {
  try { form.getTextField(name).setText(value || ''); } catch {}
}

function sc(form: any, name: string, checked: boolean) {
  try { if (checked) form.getCheckBox(name).check(); else form.getCheckBox(name).uncheck(); } catch {}
}

function m(v: any): string {
  const n = Number(v);
  return (!n && n !== 0) ? '' : n.toLocaleString('en-US');
}

function v(val: any): string {
  return val === null || val === undefined ? '' : String(val);
}

async function fillAndDownload(formNum: string, fillFn: (form: any) => void, outputName: string) {
  const bytes = await loadTemplate(formNum);
  const pdfDoc = await PDFDocument.load(bytes);
  const form = pdfDoc.getForm();
  fillFn(form);
  const out = await pdfDoc.save();
  const blob = new Blob([out as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = outputName; a.click();
  URL.revokeObjectURL(url);
}

// ===== ACORD 125 =====
export async function generateAcord125PDF(data: any): Promise<void> {
  if (!data) return;
  await fillAndDownload('125', (form) => {
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
    sc(form, 'ACORD_Transaction_Quote', true);
    sf(form, 'ACORD_Policy_EffectiveDate', v(data.policyInfo?.effectiveDate));
    sf(form, 'ACORD_Policy_ExpirationDate', v(data.policyInfo?.expirationDate));
    sf(form, 'ACORD_Policy_PaymentPlan', v(data.policyInfo?.paymentPlan));
    sf(form, 'ACORD_Policy_Audit', v(data.policyInfo?.audit || 'Annual'));
    sf(form, 'ACORD_Policy_Premium', m(data.policyInfo?.totalPremium || data.priorCarrier?.totalPremium));
    sf(form, 'ACORD_Insured_Name_1', v(data.namedInsured?.name));
    sf(form, 'ACORD_Insured_MailAddress_1', v(data.namedInsured?.mailingAddress));
    sf(form, 'ACORD_Insured_GLCode_1', v(data.namedInsured?.glCode));
    sf(form, 'ACORD_Insured_NAICS_1', v(data.businessInfo?.naicsCode));
    sf(form, 'ACORD_Insured_FEIN_1', v(data.namedInsured?.fein));
    sf(form, 'ACORD_Insured_Phone_1', v(data.namedInsured?.phone));
    sf(form, 'ACORD_Insured_Website_1', v(data.namedInsured?.website));
    const et = v(data.namedInsured?.entityType).toLowerCase();
    sc(form, 'ACORD_Insured_Corporation_1', et.includes('corp'));
    sc(form, 'ACORD_Insured_LLC_1', et.includes('llc'));
    sc(form, 'ACORD_Insured_Partnership_1', et.includes('partner'));
    sc(form, 'ACORD_Insured_Individual_1', et.includes('individual') || et.includes('sole'));
    sf(form, 'ACORD_Contact1_Name', v(data.contact?.name || data.namedInsured?.contactName));
    sf(form, 'ACORD_Contact1_PrimaryPhoneNumber', v(data.contact?.phone || data.namedInsured?.phone));
    sf(form, 'ACORD_Contact1_PrimaryEmailAddress', v(data.contact?.email || data.namedInsured?.email));
    sf(form, 'ACORD_NatureOfBusiness_Description', v(data.businessInfo?.descriptionOfOperations));
    sf(form, 'ACORD_NatureOfBusiness_DateStarted', v(data.businessInfo?.dateStarted));
    const loc1 = (data.premisesInfo || data.locations || [])[0];
    if (loc1) {
      sf(form, 'ACORD_Premises_1_Address', v(loc1.address || loc1.street));
      sf(form, 'ACORD_Premises_1_City', v(loc1.city));
      sf(form, 'ACORD_Premises_1_State', v(loc1.state));
      sf(form, 'ACORD_Premises_1_Zip', v(loc1.zip));
      sf(form, 'ACORD_Premises_1_FullTimeEmpl', v(loc1.fullTimeEmployees));
      sf(form, 'ACORD_Premises_1_PartTimeEmpl', v(loc1.partTimeEmployees));
      sf(form, 'ACORD_Premises_1_AnnualRevenue', m(loc1.annualRevenues || loc1.revenue));
      sf(form, 'ACORD_Premises_1_TotalArea', v(loc1.sqFootage || loc1.totalArea));
    }
    sf(form, 'ACORD_PriorCarrier_1_GLCarrier', v(data.priorCarrier?.name));
    sf(form, 'ACORD_PriorCarrier_1_GLPolicyNumber', v(data.priorCarrier?.policyNumber));
    sf(form, 'ACORD_PriorCarrier_1_GLPremium', m(data.priorCarrier?.totalPremium));
    sf(form, 'ACORD_PriorCarrier_1_GLEffectiveDate', v(data.priorCarrier?.effectiveDate));
    sf(form, 'ACORD_PriorCarrier_1_GLExpirationDate', v(data.priorCarrier?.expirationDate));
    const losses = data.lossHistory || [];
    sf(form, 'ACORD_LossHistory_NumberOfYears', '5');
    losses.forEach((l: any, i: number) => {
      if (i >= 5) return;
      sf(form, `ACORD_LossHistory_${i+1}_LOB`, v(l.line));
      sf(form, `ACORD_LossHistory_${i+1}_Description`, v(l.description));
      sf(form, `ACORD_LossHistory_${i+1}_AmountPaid`, m(l.amountPaid));
      sf(form, `ACORD_LossHistory_${i+1}_AmountReserved`, m(l.amountReserved));
    });
  }, 'ACORD-125-Commercial-Application.pdf');
}

// ===== ACORD 126 (GL) =====
export async function generateAcord126PDF(data: any): Promise<void> {
  if (!data) return;
  await fillAndDownload('126', (form) => {
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
      sf(form, 'GeneralLiability_Hazard_ClassificationDescription_A', v(cls[0].description));
      sf(form, 'GeneralLiability_Hazard_ClassCode_A', v(cls[0].code));
      sf(form, 'GeneralLiability_Hazard_PremiumBasisAmount_A', m(cls[0].grossReceipts || cls[0].exposure));
    }
  }, 'ACORD-126-General-Liability.pdf');
}

// ===== ACORD 127 (Business Auto) =====
export async function generateAcord127PDF(data: any): Promise<void> {
  if (!data) return;
  await fillAndDownload('127', (form) => {
    const p = 'F[0].P1[0].';
    sf(form, p+'Form_CompletionDate_A[0]', new Date().toLocaleDateString());
    sf(form, p+'Producer_FullName_A[0]', v(data.agency?.name));
    sf(form, p+'Insurer_FullName_A[0]', v(data.agency?.carrier));
    sf(form, p+'Insurer_NAICCode_A[0]', v(data.agency?.naicCode));
    sf(form, p+'Policy_PolicyNumberIdentifier_A[0]', v(data.policyNumber));
    sf(form, p+'Policy_EffectiveDate_A[0]', v(data.effectiveDate));
    sf(form, p+'NamedInsured_FullName_A[0]', v(data.namedInsured));
    // Limits
    sf(form, p+'Vehicle_BodilyInjury_PerPersonLimitAmount_A[0]', m(data.limits?.biPerPerson || 1000000));
    sf(form, p+'Vehicle_BodilyInjury_PerAccidentLimitAmount_A[0]', m(data.limits?.biPerAccident || 1000000));
    sf(form, p+'Vehicle_PropertyDamage_PerAccidentLimitAmount_A[0]', m(data.limits?.pdPerAccident || 1000000));
    sf(form, p+'Vehicle_MedicalPayments_PerPersonLimitAmount_A[0]', m(data.limits?.medPay || 5000));
    sf(form, p+'Vehicle_UninsuredMotorists_BodilyInjuryPerPersonLimitAmount_A[0]', m(data.limits?.umPerPerson || 1000000));
    sf(form, p+'Vehicle_UninsuredMotorists_BodilyInjuryPerAccidentLimitAmount_A[0]', m(data.limits?.umPerAccident || 1000000));
    // Vehicle schedule
    const vehicles = data.vehicles || [];
    vehicles.forEach((veh: any, i: number) => {
      const suffix = i === 0 ? '_A[0]' : `_${String.fromCharCode(66+i-1)}[0]`;
      const vp = `F[0].P2[0].Vehicle_`;
      sf(form, vp+'Year'+suffix, v(veh.year));
      sf(form, vp+'Make'+suffix, v(veh.make));
      sf(form, vp+'Model'+suffix, v(veh.model));
      sf(form, vp+'VIN'+suffix, v(veh.vin));
    });
  }, 'ACORD-127-Business-Auto.pdf');
}

// ===== ACORD 130 (Workers Comp) =====
export async function generateAcord130PDF(data: any): Promise<void> {
  if (!data) return;
  await fillAndDownload('130', (form) => {
    const p = 'F[0].P1[0].';
    sf(form, p+'Text1[0]', new Date().toLocaleDateString());  // Date
    sf(form, p+'Text2[0]', v(data.agency?.name));  // Agency
    sf(form, p+'Text17[0]', v(data.agency?.carrier));  // Company (in WC header)
    sf(form, p+'Text18[0]', v(data.agency?.carrier));  // Company
    sf(form, p+'Text19[0]', v(data.agency?.underwriter));  // Underwriter
    sf(form, p+'Text20[0]', v(data.namedInsured?.name));  // Applicant Name
    sf(form, p+'Text22[0]', v(data.namedInsured?.mailingAddress));  // Mailing Address
    sf(form, p+'Text27[0]', v(data.namedInsured?.phone));  // Phone
    sf(form, p+'Text28[0]', v(data.businessInfo?.yearsInBusiness));  // Yrs in Bus
    sf(form, p+'Text29[0]', v(data.businessInfo?.sicCode));  // SIC
    sf(form, p+'Text30[0]', v(data.businessInfo?.naicsCode));  // NAICS
    sf(form, p+'Text31[0]', v(data.namedInsured?.website));  // Website
    // Entity type checkboxes
    const et = v(data.namedInsured?.entityType).toLowerCase();
    sc(form, p+'Check4[0]', et.includes('sole'));
    sc(form, p+'Check5[0]', et.includes('partner'));
    sc(form, p+'Check6[0]', et.includes('corp'));
    sc(form, p+'Check7[0]', et.includes('llc'));
    // Classification codes (page 1, bottom section)
    const codes = data.classificationCodes || [];
    codes.forEach((cls: any, i: number) => {
      const base = i * 6;
      sf(form, p+`Text${40 + base}[0]`, v(cls.code));
      sf(form, p+`Text${41 + base}[0]`, v(cls.description));
      sf(form, p+`Text${42 + base}[0]`, v(cls.location || '1'));
      sf(form, p+`Text${43 + base}[0]`, m(cls.payroll));
      sf(form, p+`Text${44 + base}[0]`, v(cls.rate));
      sf(form, p+`Text${45 + base}[0]`, m(cls.premium));
    });
  }, 'ACORD-130-Workers-Compensation.pdf');
}

// ===== ACORD 131 (Umbrella/Excess) =====
export async function generateAcord131PDF(data: any): Promise<void> {
  if (!data) return;
  await fillAndDownload('131', (form) => {
    const p = 'F[0].P1[0].';
    sf(form, p+'Form_CompletionDate_A[0]', new Date().toLocaleDateString());
    sf(form, p+'Producer_FullName_A[0]', v(data.agency?.name));
    sf(form, p+'Insurer_FullName_A[0]', v(data.agency?.carrier));
    sf(form, p+'Insurer_NAICCode_A[0]', v(data.agency?.naicCode));
    sf(form, p+'Policy_PolicyNumberIdentifier_A[0]', v(data.policyNumber));
    sf(form, p+'Policy_EffectiveDate_A[0]', v(data.effectiveDate));
    sf(form, p+'NamedInsured_FullName_A[0]', v(data.namedInsured));
    // Limits
    sf(form, p+'ExcessUmbrella_Umbrella_EachOccurrenceAmount_A[0]', m(data.limits?.eachOccurrence || 5000000));
    sf(form, p+'ExcessUmbrella_Umbrella_AggregateAmount_A[0]', m(data.limits?.aggregate || 5000000));
    sf(form, p+'ExcessUmbrella_Umbrella_DeductibleOrRetentionAmount_A[0]', m(data.limits?.retention || 10000));
    sf(form, p+'ExcessUmbrella_EmployeeBenefits_EachEmployeeLimitAmount_A[0]', m(data.limits?.ebEachEmployee));
    sf(form, p+'ExcessUmbrella_EmployeeBenefits_AggregateLimitAmount_A[0]', m(data.limits?.ebAggregate));
    // Locations
    const locs = data.locations || [];
    if (locs[0]) {
      sf(form, p+'CommercialStructure_Location_ProducerIdentifier_A[0]', '1');
      sf(form, p+'CommercialStructure_PhysicalAddress_LineOne_A[0]', v(locs[0].address));
      sf(form, p+'CommercialStructure_PhysicalAddress_CityName_A[0]', v(locs[0].city));
      sf(form, p+'CommercialStructure_PhysicalAddress_StateOrProvinceCode_A[0]', v(locs[0].state));
      sf(form, p+'CommercialStructure_PhysicalAddress_PostalCode_A[0]', v(locs[0].zip));
      sf(form, p+'BusinessInformation_OperationsDescription_A[0]', v(locs[0].operations || data.businessInfo?.descriptionOfOperations));
    }
    // Underlying insurance
    if (data.underlying?.gl) {
      sf(form, p+'PriorCoverage_PolicyNumberIdentifier_A[0]', v(data.underlying.gl.policyNumber));
    }
  }, 'ACORD-131-Umbrella-Excess.pdf');
}

// ===== ACORD 140 (Property) =====
export async function generateAcord140PDF(data: any): Promise<void> {
  if (!data) return;
  await fillAndDownload('140', (form) => {
    sf(form, 'Form_CompletionDate_A', new Date().toLocaleDateString());
    sf(form, 'Producer_FullName_A', v(data.agency?.name));
    sf(form, 'Insurer_FullName_A', v(data.agency?.carrier));
    sf(form, 'Insurer_NAICCode_A', v(data.agency?.naicCode));
    sf(form, 'Policy_PolicyNumberIdentifier_A', v(data.policyNumber));
    sf(form, 'Policy_EffectiveDate_A', v(data.effectiveDate));
    sf(form, 'NamedInsured_FullName_A', v(data.namedInsured));
    // Blanket summary
    sf(form, 'CommercialProperty_Summary_BlanketNumberIdentifier_A', '1');
    sf(form, 'CommercialProperty_Summary_BlanketLimitAmount_A', m(data.totalBuildingValue));
    sf(form, 'CommercialCoverage_Summary_BlanketTypeDescription_A', 'Building');
    sf(form, 'CommercialProperty_Summary_BlanketNumberIdentifier_B', '2');
    sf(form, 'CommercialProperty_Summary_BlanketLimitAmount_B', m(data.totalContentsValue));
    sf(form, 'CommercialCoverage_Summary_BlanketTypeDescription_B', 'Contents / BPP');
    // Location 1
    const locs = data.locations || [];
    if (locs[0]) {
      const loc = locs[0];
      sf(form, 'CommercialStructure_Location_ProducerIdentifier_A', v(loc.number || '1'));
      sf(form, 'CommercialStructure_Building_ProducerIdentifier_A', '1');
      sf(form, 'CommercialStructure_PhysicalAddress_LineOne_A', v(loc.address));
      sf(form, 'CommercialProperty_Premises_SubjectOfInsuranceCode_A', 'Building');
      sf(form, 'CommercialProperty_Premises_LimitAmount_A', m(loc.buildingValue));
      sf(form, 'CommercialProperty_Premises_CoinsurancePercent_A', v(loc.coinsurance || data.coinsurance || '80'));
      sf(form, 'CommercialProperty_Premises_ValuationCode_A', v(data.valuation || 'RC'));
      sf(form, 'CommercialProperty_Premises_CauseOfLossCode_A', v(data.causesOfLoss || 'Special'));
      sf(form, 'CommercialProperty_Premises_DeductibleAmount_A', m(data.deductible));
      sf(form, 'CommercialProperty_Premises_SubjectOfInsuranceCode_B', 'Contents/BPP');
      sf(form, 'CommercialProperty_Premises_LimitAmount_B', m(loc.contentsValue));
      sf(form, 'CommercialProperty_Premises_CoinsurancePercent_B', v(loc.coinsurance || data.coinsurance || '80'));
      sf(form, 'CommercialProperty_Premises_DeductibleAmount_B', m(data.deductible));
      sf(form, 'CommercialProperty_Premises_SubjectOfInsuranceCode_C', 'Bus Income');
      sf(form, 'CommercialProperty_Premises_LimitAmount_C', m(loc.biLimit));
      sf(form, 'CommercialStructure_ConstructionTypeCode_A', v(loc.construction));
      sf(form, 'CommercialStructure_NumberOfStories_A', v(loc.stories));
      sf(form, 'CommercialStructure_NumberOfBasements_A', v(loc.basements || '0'));
      sf(form, 'CommercialStructure_YearBuilt_A', v(loc.yearBuilt));
      sf(form, 'CommercialStructure_TotalArea_A', v(loc.sqFootage));
      sf(form, 'CommercialStructure_RoofTypeCode_A', v(loc.roofType));
      sf(form, 'CommercialStructure_ProtectionClassCode_A', v(loc.protectionClass));
      sf(form, 'CommercialStructure_SprinklerPercent_A', v(loc.sprinklered ? '100' : loc.sprinklerPercentage || '0'));
    }
    // Location 2
    if (locs[1]) {
      const loc = locs[1];
      sf(form, 'CommercialStructure_Location_ProducerIdentifier_B', v(loc.number || '2'));
      sf(form, 'CommercialStructure_PhysicalAddress_LineOne_B', v(loc.address));
      sf(form, 'CommercialProperty_Premises_SubjectOfInsuranceCode_G', 'Building');
      sf(form, 'CommercialProperty_Premises_LimitAmount_G', m(loc.buildingValue));
      sf(form, 'CommercialProperty_Premises_SubjectOfInsuranceCode_H', 'Contents/BPP');
      sf(form, 'CommercialProperty_Premises_LimitAmount_H', m(loc.contentsValue));
      sf(form, 'CommercialProperty_Premises_SubjectOfInsuranceCode_I', 'Bus Income');
      sf(form, 'CommercialProperty_Premises_LimitAmount_I', m(loc.biLimit));
      sf(form, 'CommercialStructure_ConstructionTypeCode_B', v(loc.construction));
      sf(form, 'CommercialStructure_YearBuilt_B', v(loc.yearBuilt));
      sf(form, 'CommercialStructure_TotalArea_B', v(loc.sqFootage));
    }
  }, 'ACORD-140-Property-Section.pdf');
}

// ===== Generate by form number =====
export async function generateFormPDF(formNum: string, data: any): Promise<void> {
  switch (formNum) {
    case '125': return generateAcord125PDF(data?.acord125 || data);
    case '126': return generateAcord126PDF(data?.acord126 || data);
    case '127': return generateAcord127PDF(data?.acord127 || data);
    case '130': return generateAcord130PDF(data?.acord130 || data);
    case '131': return generateAcord131PDF(data?.acord131 || data);
    case '140': return generateAcord140PDF(data?.acord140 || data);
  }
}

// ===== Download all selected forms =====
export async function generateAllAcordPDFs(formData: any, selectedForms?: string[]): Promise<void> {
  if (!formData) return;
  const forms = selectedForms || Object.keys(FORM_INFO);
  for (const f of forms) {
    await generateFormPDF(f, formData);
  }
}
