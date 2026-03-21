import { PDFDocument } from 'pdf-lib';

// ============================================================
// ACORD PDF Filler — Uses real ACORD form templates
// Fills actual AcroForm fields in authentic ACORD PDFs
// ============================================================

async function loadTemplate(name: string): Promise<ArrayBuffer> {
  const resp = await fetch(`/templates/${name}`);
  if (!resp.ok) throw new Error(`Failed to load template: ${name}`);
  return resp.arrayBuffer();
}

function setField(form: any, name: string, value: string) {
  try {
    const field = form.getTextField(name);
    field.setText(value || '');
  } catch {
    // Field doesn't exist in this template version — skip silently
  }
}

function setCheck(form: any, name: string, checked: boolean) {
  try {
    const field = form.getCheckBox(name);
    if (checked) field.check(); else field.uncheck();
  } catch {
    // Skip
  }
}

function money(v: any): string {
  const n = Number(v);
  if (!n && n !== 0) return '';
  return n.toLocaleString('en-US');
}

function val(v: any): string {
  if (v === null || v === undefined) return '';
  return String(v);
}

async function fillAndDownload(templateName: string, fillFn: (form: any) => void, outputName: string) {
  const templateBytes = await loadTemplate(templateName);
  const pdfDoc = await PDFDocument.load(templateBytes);
  const form = pdfDoc.getForm();
  
  fillFn(form);
  
  // Flatten so fields show as regular text (optional — comment out to keep editable)
  // form.flatten();
  
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = outputName;
  a.click();
  URL.revokeObjectURL(url);
}

// ===== ACORD 125 — Commercial Insurance Application =====
export async function generateAcord125PDF(data: any): Promise<void> {
  if (!data) return;
  await fillAndDownload('acord-125-template.pdf', (form) => {
    // Date
    setField(form, 'ACORD_CurrentDate', new Date().toLocaleDateString());
    
    // Agency
    setField(form, 'ACORD_AgencyName', val(data.agency?.name));
    setField(form, 'ACORD_CarrierName', val(data.agency?.carrier));
    setField(form, 'ACORD_NAICCode', val(data.agency?.naicCode));
    setField(form, 'ACORD_PolicyNumber', val(data.agency?.policyNumber));
    setField(form, 'ACORD_ProducerContact', val(data.agency?.contact));
    setField(form, 'ACORD_ProducerPhoneNumber', val(data.agency?.phone));
    setField(form, 'ACORD_ProducerFaxNumber', val(data.agency?.fax));
    setField(form, 'ACORD_ProducerEmailAddress', val(data.agency?.email));
    setField(form, 'ACORD_ProducerCode', val(data.agency?.producerCode));
    
    // Transaction status
    setCheck(form, 'ACORD_Transaction_Quote', true);
    
    // Policy info
    setField(form, 'ACORD_Policy_EffectiveDate', val(data.policyInfo?.effectiveDate));
    setField(form, 'ACORD_Policy_ExpirationDate', val(data.policyInfo?.expirationDate));
    setField(form, 'ACORD_Policy_PaymentPlan', val(data.policyInfo?.paymentPlan));
    setField(form, 'ACORD_Policy_PaymentMethod', val(data.policyInfo?.paymentMethod));
    setField(form, 'ACORD_Policy_Audit', val(data.policyInfo?.audit || 'Annual'));
    setField(form, 'ACORD_Policy_Deposit', money(data.policyInfo?.deposit));
    setField(form, 'ACORD_Policy_MinimumPremium', money(data.policyInfo?.minimumPremium));
    setField(form, 'ACORD_Policy_Premium', money(data.policyInfo?.totalPremium || data.priorCarrier?.totalPremium));
    
    // Lines of business
    setCheck(form, 'ACORD_LOB_GL', true);
    setCheck(form, 'ACORD_LOB_Property', true);
    setCheck(form, 'ACORD_LOB_Auto', !!data.linesRequested?.some((l: any) => l.line?.toLowerCase().includes('auto')));
    setCheck(form, 'ACORD_LOB_Umbrella', !!data.linesRequested?.some((l: any) => l.line?.toLowerCase().includes('umbrella')));
    setCheck(form, 'ACORD_LOB_WC', !!data.linesRequested?.some((l: any) => l.line?.toLowerCase().includes('worker')));
    setCheck(form, 'ACORD_LOB_Crime', !!data.linesRequested?.some((l: any) => l.line?.toLowerCase().includes('crime')));
    setCheck(form, 'ACORD_LOB_LiquorLiability', !!data.linesRequested?.some((l: any) => l.line?.toLowerCase().includes('liquor')));
    
    // LOB premiums
    const lobPremiumFields: Record<string, string> = {
      'ACORD_LOB_GL_Premium': 'general liability',
      'ACORD_LOB_Property_Premium': 'property',
      'ACORD_LOB_Auto_Premium': 'auto',
      'ACORD_LOB_Umbrella_Premium': 'umbrella',
      'ACORD_LOB_WC_Premium': 'worker',
      'ACORD_LOB_LiquorLiability_Premium': 'liquor',
    };
    for (const [field, keyword] of Object.entries(lobPremiumFields)) {
      const line = data.linesRequested?.find((l: any) => l.line?.toLowerCase().includes(keyword));
      if (line) setField(form, field, money(line.currentPremium));
    }
    
    // Named Insured (First)
    setField(form, 'ACORD_Insured_Name_1', val(data.namedInsured?.name));
    setField(form, 'ACORD_Insured_MailAddress_1', val(data.namedInsured?.mailingAddress));
    setField(form, 'ACORD_Insured_GLCode_1', val(data.namedInsured?.glCode));
    setField(form, 'ACORD_Insured_SICCode_1', val(data.namedInsured?.sicCode));
    setField(form, 'ACORD_Insured_NAICS_1', val(data.businessInfo?.naicsCode));
    setField(form, 'ACORD_Insured_FEIN_1', val(data.namedInsured?.fein));
    setField(form, 'ACORD_Insured_Phone_1', val(data.namedInsured?.phone));
    setField(form, 'ACORD_Insured_Website_1', val(data.namedInsured?.website));
    
    // Entity type
    const et = val(data.namedInsured?.entityType).toLowerCase();
    setCheck(form, 'ACORD_Insured_Corporation_1', et.includes('corp'));
    setCheck(form, 'ACORD_Insured_LLC_1', et.includes('llc'));
    setCheck(form, 'ACORD_Insured_Partnership_1', et.includes('partner'));
    setCheck(form, 'ACORD_Insured_Individual_1', et.includes('individual') || et.includes('sole'));
    setCheck(form, 'ACORD_Insured_JointVenture_1', et.includes('joint'));
    setCheck(form, 'ACORD_Insured_SubchapterS_1', et.includes('sub'));
    
    // Contact info
    setField(form, 'ACORD_Contact1_Name', val(data.contact?.name || data.namedInsured?.contactName));
    setField(form, 'ACORD_Contact1_Type', val(data.contact?.type || 'Owner'));
    setField(form, 'ACORD_Contact1_PrimaryPhoneNumber', val(data.contact?.phone || data.namedInsured?.phone));
    setField(form, 'ACORD_Contact1_PrimaryEmailAddress', val(data.contact?.email || data.namedInsured?.email));
    
    // Nature of business
    setField(form, 'ACORD_NatureOfBusiness_Description', val(data.businessInfo?.descriptionOfOperations));
    setField(form, 'ACORD_NatureOfBusiness_DateStarted', val(data.businessInfo?.dateStarted));
    setField(form, 'ACORD_NatureOfOperations_OtherOperations', val(data.businessInfo?.natureOfBusiness));
    
    // Premises (Location 1)
    const loc1 = (data.premisesInfo || data.locations || [])[0];
    if (loc1) {
      setField(form, 'ACORD_Premises_1_Address', val(loc1.address || loc1.street));
      setField(form, 'ACORD_Premises_1_City', val(loc1.city));
      setField(form, 'ACORD_Premises_1_State', val(loc1.state));
      setField(form, 'ACORD_Premises_1_Zip', val(loc1.zip));
      setField(form, 'ACORD_Premises_1_FullTimeEmpl', val(loc1.fullTimeEmployees));
      setField(form, 'ACORD_Premises_1_PartTimeEmpl', val(loc1.partTimeEmployees));
      setField(form, 'ACORD_Premises_1_AnnualRevenue', money(loc1.annualRevenues || loc1.revenue));
      setField(form, 'ACORD_Premises_1_TotalArea', val(loc1.sqFootage || loc1.totalArea));
      setField(form, 'ACORD_Premises_1_Description', val(loc1.description || loc1.operations));
    }
    
    // Prior carrier
    setField(form, 'ACORD_PriorCarrier_1_GLCarrier', val(data.priorCarrier?.name));
    setField(form, 'ACORD_PriorCarrier_1_GLPolicyNumber', val(data.priorCarrier?.policyNumber));
    setField(form, 'ACORD_PriorCarrier_1_GLPremium', money(data.priorCarrier?.totalPremium));
    setField(form, 'ACORD_PriorCarrier_1_GLEffectiveDate', val(data.priorCarrier?.effectiveDate));
    setField(form, 'ACORD_PriorCarrier_1_GLExpirationDate', val(data.priorCarrier?.expirationDate));
    
    // Loss history
    const losses = data.lossHistory || [];
    setField(form, 'ACORD_LossHistory_NumberOfYears', '5');
    let totalLosses = 0;
    losses.forEach((l: any, i: number) => {
      if (i >= 5) return; // max 5 loss entries on form
      const idx = i + 1;
      setField(form, `ACORD_LossHistory_${idx}_LOB`, val(l.line));
      setField(form, `ACORD_LossHistory_${idx}_Description`, val(l.description));
      setField(form, `ACORD_LossHistory_${idx}_OccurrenceDate`, val(l.occurrenceDate));
      setField(form, `ACORD_LossHistory_${idx}_ClaimDate`, val(l.claimDate));
      setField(form, `ACORD_LossHistory_${idx}_AmountPaid`, money(l.amountPaid));
      setField(form, `ACORD_LossHistory_${idx}_AmountReserved`, money(l.amountReserved));
      totalLosses += Number(l.totalIncurred || 0);
    });
    setField(form, 'ACORD_LossHistory_TotalLosses', money(totalLosses));
    
    // General info Y/N questions
    setCheck(form, 'ACORD_General_IsSubsidiary_No', true);
    setCheck(form, 'ACORD_General_HasSubsidiaries_No', true);
    setCheck(form, 'ACORD_General_Flammables_No', true);
    setCheck(form, 'ACORD_General_DeclinedCancelled_No', true);
  }, 'ACORD-125-Commercial-Application.pdf');
}

// ===== ACORD 126 — Commercial General Liability =====
export async function generateAcord126PDF(data: any): Promise<void> {
  if (!data) return;
  await fillAndDownload('acord-126-template.pdf', (form) => {
    // Header
    setField(form, 'Form_CompletionDate_A', new Date().toLocaleDateString());
    setField(form, 'Producer_FullName_A', val(data.agency?.name));
    setField(form, 'Insurer_FullName_A', val(data.agency?.carrier));
    setField(form, 'Insurer_NAICCode_A', val(data.agency?.naicCode));
    setField(form, 'Policy_PolicyNumberIdentifier_A', val(data.policyNumber));
    setField(form, 'Policy_EffectiveDate_A', val(data.effectiveDate));
    setField(form, 'NamedInsured_FullName_A', val(data.namedInsured));
    
    // Coverage type
    setCheck(form, 'GeneralLiability_CoverageIndicator_A', true);
    setCheck(form, 'GeneralLiability_OccurrenceIndicator_A', data.coverageType !== 'claims-made');
    setCheck(form, 'GeneralLiability_ClaimsMadeIndicator_A', data.coverageType === 'claims-made');
    
    // Limits
    setField(form, 'GeneralLiability_GeneralAggregate_LimitAmount_A', money(data.limitsRequested?.generalAggregate));
    setField(form, 'GeneralLiability_ProductsAndCompletedOperations_AggregateLimitAmount_A', money(data.limitsRequested?.productsCompletedOpsAggregate));
    setField(form, 'GeneralLiability_PersonalAndAdvertisingInjury_LimitAmount_A', money(data.limitsRequested?.personalAdvertisingInjury));
    setField(form, 'GeneralLiability_EachOccurrence_LimitAmount_A', money(data.limitsRequested?.eachOccurrence));
    setField(form, 'GeneralLiability_FireDamageRentedPremises_EachOccurrenceLimitAmount_A', money(data.limitsRequested?.damageToRentedPremises));
    setField(form, 'GeneralLiability_MedicalExpense_EachPersonLimitAmount_A', money(data.limitsRequested?.medicalExpense));
    setField(form, 'GeneralLiability_EmployeeBenefits_LimitAmount_A', money(data.limitsRequested?.employeeBenefits));
    
    // Aggregate applies per
    setField(form, 'GeneralLiability_GeneralAggregate_LimitAppliesToCode_A', 'Policy');
    
    // Deductibles
    setField(form, 'GeneralLiability_PropertyDamage_DeductibleAmount_A', money(data.deductibles?.propertyDamage));
    setField(form, 'GeneralLiability_BodilyInjury_DeductibleAmount_A', money(data.deductibles?.bodilyInjury));
    
    // Premiums
    setField(form, 'GeneralLiability_PremisesOperations_PremiumAmount_A', money(data.premiums?.premisesOperations));
    setField(form, 'GeneralLiability_Products_PremiumAmount_A', money(data.premiums?.products));
    
    // Classification / Schedule of Hazards
    const cls = data.classifications || (data.classification ? [data.classification] : []);
    if (cls[0]) {
      setField(form, 'GeneralLiability_Hazard_LocationProducerIdentifier_A', '1');
      setField(form, 'GeneralLiability_Hazard_ClassificationDescription_A', val(cls[0].description));
      setField(form, 'GeneralLiability_Hazard_ClassCode_A', val(cls[0].code));
      setField(form, 'GeneralLiability_Hazard_PremiumBasisAmount_A', money(cls[0].grossReceipts || cls[0].exposure));
      setField(form, 'GeneralLiability_Hazard_HazardProducerIdentifier_A', val(cls[0].hazardId || '1'));
    }
    
    // Liquor liability
    if (data.liquorLiability?.included) {
      setField(form, 'GeneralLiability_Liquor_ReceiptsAmount_A', money(data.liquorLiability.liquorReceipts));
    }
  }, 'ACORD-126-General-Liability.pdf');
}

// ===== ACORD 140 — Property Section =====
export async function generateAcord140PDF(data: any): Promise<void> {
  if (!data) return;
  await fillAndDownload('acord-140-template.pdf', (form) => {
    // Header
    setField(form, 'Form_CompletionDate_A', new Date().toLocaleDateString());
    setField(form, 'Producer_FullName_A', val(data.agency?.name));
    setField(form, 'Insurer_FullName_A', val(data.agency?.carrier));
    setField(form, 'Insurer_NAICCode_A', val(data.agency?.naicCode));
    setField(form, 'Policy_PolicyNumberIdentifier_A', val(data.policyNumber));
    setField(form, 'Policy_EffectiveDate_A', val(data.effectiveDate));
    setField(form, 'NamedInsured_FullName_A', val(data.namedInsured));
    
    // Blanket summary
    setField(form, 'CommercialProperty_Summary_BlanketNumberIdentifier_A', '1');
    setField(form, 'CommercialProperty_Summary_BlanketLimitAmount_A', money(data.totalBuildingValue));
    setField(form, 'CommercialCoverage_Summary_BlanketTypeDescription_A', 'Building');
    setField(form, 'CommercialProperty_Summary_BlanketNumberIdentifier_B', '2');
    setField(form, 'CommercialProperty_Summary_BlanketLimitAmount_B', money(data.totalContentsValue));
    setField(form, 'CommercialCoverage_Summary_BlanketTypeDescription_B', 'Contents / BPP');
    
    // Location 1
    const locs = data.locations || [];
    if (locs[0]) {
      const loc = locs[0];
      // Location/Building identifiers
      setField(form, 'CommercialStructure_Location_ProducerIdentifier_A', val(loc.number || '1'));
      setField(form, 'CommercialStructure_Building_ProducerIdentifier_A', '1');
      setField(form, 'CommercialStructure_PhysicalAddress_LineOne_A', val(loc.address));
      
      // Subject of insurance rows (A=Building, B=Contents, C=BI)
      setField(form, 'CommercialProperty_Premises_SubjectOfInsuranceCode_A', 'Building');
      setField(form, 'CommercialProperty_Premises_LimitAmount_A', money(loc.buildingValue));
      setField(form, 'CommercialProperty_Premises_CoinsurancePercent_A', val(loc.coinsurance || data.coinsurance || '80'));
      setField(form, 'CommercialProperty_Premises_ValuationCode_A', val(data.valuation || 'RC'));
      setField(form, 'CommercialProperty_Premises_CauseOfLossCode_A', val(data.causesOfLoss || 'Special'));
      setField(form, 'CommercialProperty_Premises_DeductibleAmount_A', money(data.deductible));
      
      setField(form, 'CommercialProperty_Premises_SubjectOfInsuranceCode_B', 'Contents/BPP');
      setField(form, 'CommercialProperty_Premises_LimitAmount_B', money(loc.contentsValue));
      setField(form, 'CommercialProperty_Premises_CoinsurancePercent_B', val(loc.coinsurance || data.coinsurance || '80'));
      setField(form, 'CommercialProperty_Premises_ValuationCode_B', val(data.valuation || 'RC'));
      setField(form, 'CommercialProperty_Premises_CauseOfLossCode_B', val(data.causesOfLoss || 'Special'));
      setField(form, 'CommercialProperty_Premises_DeductibleAmount_B', money(data.deductible));
      
      setField(form, 'CommercialProperty_Premises_SubjectOfInsuranceCode_C', 'Bus Income');
      setField(form, 'CommercialProperty_Premises_LimitAmount_C', money(loc.biLimit));
      setField(form, 'CommercialProperty_Premises_CoinsurancePercent_C', val(loc.coinsurance || data.coinsurance || '80'));
      
      // Construction details
      setField(form, 'CommercialStructure_ConstructionTypeCode_A', val(loc.construction));
      setField(form, 'CommercialStructure_NumberOfStories_A', val(loc.stories));
      setField(form, 'CommercialStructure_NumberOfBasements_A', val(loc.basements || '0'));
      setField(form, 'CommercialStructure_YearBuilt_A', val(loc.yearBuilt));
      setField(form, 'CommercialStructure_TotalArea_A', val(loc.sqFootage));
      setField(form, 'CommercialStructure_RoofTypeCode_A', val(loc.roofType));
      setField(form, 'CommercialStructure_ProtectionClassCode_A', val(loc.protectionClass));
      setField(form, 'CommercialStructure_SprinklerPercent_A', val(loc.sprinklered ? '100' : loc.sprinklerPercentage || '0'));
      setField(form, 'CommercialStructure_DistanceToHydrant_A', val(loc.distanceToHydrant));
      
      // Building improvements
      setField(form, 'CommercialStructure_WiringYear_A', val(loc.wiringYear));
      setField(form, 'CommercialStructure_PlumbingYear_A', val(loc.plumbingYear));
      setField(form, 'CommercialStructure_RoofingYear_A', val(loc.roofingYear));
      setField(form, 'CommercialStructure_HeatingYear_A', val(loc.heatingYear));
    }
    
    // Location 2
    if (locs[1]) {
      const loc = locs[1];
      setField(form, 'CommercialStructure_Location_ProducerIdentifier_B', val(loc.number || '2'));
      setField(form, 'CommercialStructure_Building_ProducerIdentifier_B', '1');
      setField(form, 'CommercialStructure_PhysicalAddress_LineOne_B', val(loc.address));
      
      // Use G/H/I slots for location 2 subjects (page 2 of form)
      setField(form, 'CommercialProperty_Premises_SubjectOfInsuranceCode_G', 'Building');
      setField(form, 'CommercialProperty_Premises_LimitAmount_G', money(loc.buildingValue));
      setField(form, 'CommercialProperty_Premises_CoinsurancePercent_G', val(loc.coinsurance || data.coinsurance || '80'));
      setField(form, 'CommercialProperty_Premises_ValuationCode_G', val(data.valuation || 'RC'));
      setField(form, 'CommercialProperty_Premises_CauseOfLossCode_G', val(data.causesOfLoss || 'Special'));
      setField(form, 'CommercialProperty_Premises_DeductibleAmount_G', money(data.deductible));
      
      setField(form, 'CommercialProperty_Premises_SubjectOfInsuranceCode_H', 'Contents/BPP');
      setField(form, 'CommercialProperty_Premises_LimitAmount_H', money(loc.contentsValue));
      setField(form, 'CommercialProperty_Premises_CoinsurancePercent_H', val(loc.coinsurance || data.coinsurance || '80'));
      
      setField(form, 'CommercialProperty_Premises_SubjectOfInsuranceCode_I', 'Bus Income');
      setField(form, 'CommercialProperty_Premises_LimitAmount_I', money(loc.biLimit));
      
      setField(form, 'CommercialStructure_ConstructionTypeCode_B', val(loc.construction));
      setField(form, 'CommercialStructure_NumberOfStories_B', val(loc.stories));
      setField(form, 'CommercialStructure_YearBuilt_B', val(loc.yearBuilt));
      setField(form, 'CommercialStructure_TotalArea_B', val(loc.sqFootage));
      setField(form, 'CommercialStructure_ProtectionClassCode_B', val(loc.protectionClass));
      setField(form, 'CommercialStructure_SprinklerPercent_B', val(loc.sprinklered ? '100' : '0'));
    }
  }, 'ACORD-140-Property-Section.pdf');
}

// ===== ACORD 130 — Workers Comp (still jsPDF since no template) =====
export async function generateAcord130PDF(data: any): Promise<void> {
  if (!data) return;
  // Fall back to jsPDF generation for WC since we don't have a template
  const jsPDF = (await import('jspdf')).default;
  const doc = new jsPDF();
  
  doc.setFillColor(30, 30, 30);
  doc.rect(8, 10, 194, 10, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('ACORD 130 — WORKERS COMPENSATION APPLICATION', 105, 17, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  
  let y = 28;
  const addField = (label: string, value: string, x: number, w: number) => {
    doc.setDrawColor(180, 180, 180);
    doc.rect(x, y, w, 10);
    doc.setFontSize(5.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(label, x + 1.5, y + 3.5);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 51, 102);
    doc.text(value || '', x + 1.5, y + 8);
  };
  
  addField('STATE', val(data.state), 8, 64.7);
  addField('TOTAL ANNUAL PAYROLL', '$' + money(data.totalPayroll), 72.7, 64.7);
  addField('EST ANNUAL PREMIUM', '$' + money(data.totalPremium), 137.4, 64.6);
  y += 10;
  addField('EMR', val(data.emr), 8, 64.7);
  addField('DEDUCTIBLE', '$' + money(data.deductible), 72.7, 64.7);
  addField('EL EACH ACCIDENT', '$' + money(data.elEachAccident || 1000000), 137.4, 64.6);
  y += 10;
  
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  
  if (data.classificationCodes?.length) {
    y += 4;
    doc.setFillColor(30, 30, 30);
    doc.rect(8, y, 194, 6, 'F');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('CLASSIFICATION CODES', 10, y + 4.2);
    doc.setTextColor(0, 0, 0);
    y += 8;
    
    for (const cls of data.classificationCodes) {
      addField('CODE', val(cls.code), 8, 25);
      addField('DESCRIPTION', val(cls.description), 33, 70);
      addField('PAYROLL', '$' + money(cls.payroll), 103, 40);
      addField('RATE', val(cls.rate), 143, 25);
      addField('PREMIUM', '$' + money(cls.premium), 168, 34);
      y += 10;
    }
  }
  
  doc.save('ACORD-130-Workers-Compensation.pdf');
}

// ===== Download All =====
export async function generateAllAcordPDFs(formData: any): Promise<void> {
  if (!formData) return;
  if (formData.acord125) await generateAcord125PDF(formData.acord125);
  if (formData.acord126) await generateAcord126PDF(formData.acord126);
  if (formData.acord140) await generateAcord140PDF(formData.acord140);
  if (formData.acord130) await generateAcord130PDF(formData.acord130);
}
