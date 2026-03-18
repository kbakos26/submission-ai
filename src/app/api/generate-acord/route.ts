import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientData, extractedFields } = body;

    if (!clientData && !extractedFields) {
      return NextResponse.json(
        { error: 'Client data or extracted fields are required' },
        { status: 400 }
      );
    }

    // Helper function to find field value from extracted data
    const getFieldValue = (fieldName: string, defaultValue: any = '') => {
      if (extractedFields) {
        const field = extractedFields.find((f: any) => 
          f.fieldName === fieldName || f.label === fieldName
        );
        return field?.value || defaultValue;
      }
      return clientData?.[fieldName] || defaultValue;
    };

    const getFieldConfidence = (fieldName: string) => {
      if (extractedFields) {
        const field = extractedFields.find((f: any) => 
          f.fieldName === fieldName || f.label === fieldName
        );
        return field?.confidence || 100;
      }
      return 100;
    };

    // ACORD 125 - Commercial Application
    const acord125 = {
      agency: {
        name: getFieldValue('agency_name', 'Summit Ridge Insurance Group'),
        address: getFieldValue('agency_address', '1500 Commerce Drive, Suite 200'),
        city: getFieldValue('agency_city', 'Newport Beach'),
        state: getFieldValue('agency_state', 'CA'),
        zip: getFieldValue('agency_zip', '92660'),
        phone: getFieldValue('agency_phone', '(949) 555-0123'),
        producerCode: getFieldValue('producer_code', 'SRIG-2024'),
      },
      namedInsured: {
        name: getFieldValue('named_insured', clientData?.businessName || ''),
        dba: getFieldValue('dba', clientData?.dba || ''),
        mailingAddress: getFieldValue('mailing_address', clientData?.mailingAddress || ''),
        city: getFieldValue('city', clientData?.city || ''),
        state: getFieldValue('state', clientData?.state || ''),
        zip: getFieldValue('zip', clientData?.zip || ''),
        phone: getFieldValue('phone', clientData?.phone || ''),
        fein: getFieldValue('fein', ''),
        entityType: getFieldValue('entity_type', clientData?.entityType || 'Corporation'),
        website: getFieldValue('website', clientData?.website || ''),
        autoFilled: getFieldConfidence('named_insured') > 85,
      },
      businessInfo: {
        naicsCode: getFieldValue('naics_code', clientData?.naicsCode || ''),
        naicsDescription: getFieldValue('naics_description', ''),
        yearsInBusiness: getFieldValue('years_in_business', clientData?.yearsInBusiness || 0),
        yearsWithCurrentAgent: getFieldValue('years_with_agent', 0),
        totalAnnualRevenue: getFieldValue('annual_revenue', clientData?.annualRevenue || 0),
        totalEmployees: getFieldValue('employee_count', clientData?.employeeCount || 0),
        totalLocations: getFieldValue('location_count', clientData?.locationCount || 1),
        descriptionOfOperations: getFieldValue('description_of_operations', clientData?.descriptionOfOperations || ''),
        autoFilled: getFieldConfidence('naics_code') > 85,
      },
      linesRequested: [
        { line: 'General Liability', checked: clientData?.linesOfBusiness?.includes('General Liability') || false },
        { line: 'Property', checked: clientData?.linesOfBusiness?.includes('Property') || false },
        { line: 'Liquor Liability', checked: clientData?.linesOfBusiness?.includes('Liquor Liability') || false },
        { line: 'Workers Compensation', checked: clientData?.linesOfBusiness?.includes('Workers Compensation') || false },
        { line: 'Commercial Umbrella', checked: clientData?.linesOfBusiness?.includes('Commercial Umbrella') || false },
        { line: 'Commercial Auto', checked: clientData?.linesOfBusiness?.includes('Commercial Auto') || false },
        { line: 'Crime', checked: clientData?.linesOfBusiness?.includes('Crime') || false },
        { line: 'Cyber Liability', checked: clientData?.linesOfBusiness?.includes('Cyber Liability') || false },
      ],
      priorCarrier: {
        name: getFieldValue('prior_carrier', clientData?.priorCarrier || ''),
        policyNumber: getFieldValue('prior_policy_number', clientData?.priorPolicyNumber || ''),
        expirationDate: getFieldValue('expiration_date', clientData?.priorExpirationDate || ''),
        totalPremium: getFieldValue('prior_premium', clientData?.priorPremium || 0),
        yearsWithCarrier: getFieldValue('years_with_carrier', 0),
        reasonForChange: 'Shopping for better terms and pricing',
        autoFilled: getFieldConfidence('prior_carrier') > 85,
      },
      lossHistory: clientData?.claimsHistory?.map((claim: any) => ({
        year: claim.year,
        claimType: claim.type,
        dateOfLoss: claim.dateOfLoss || `${claim.year}-01-01`,
        amountPaid: claim.amount || 0,
        amountReserve: 0,
        status: claim.status || 'Closed',
        description: claim.description || '',
      })) || [],
    };

    // ACORD 126 - General Liability
    const acord126 = {
      classification: {
        code: getFieldValue('gl_class_code', ''),
        description: getFieldValue('gl_class_description', ''),
        grossReceipts: getFieldValue('gross_receipts', clientData?.annualRevenue || 0),
        liquorReceipts: getFieldValue('liquor_receipts', 0),
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
        included: clientData?.linesOfBusiness?.includes('Liquor Liability') || false,
        eachOccurrence: 2000000,
        aggregate: 4000000,
        liquorSalesPercentage: 20,
      },
      additionalCoverages: [
        'Products Liability',
        'Waiver of Subrogation (where required by contract)',
        'Additional Insured - Landlords',
      ],
    };

    // ACORD 140 - Property
    const acord140 = {
      locations: [],
      totalBuildingValue: getFieldValue('total_building_value', 0),
      totalContentsValue: getFieldValue('total_contents_value', 0),
      totalBILimit: getFieldValue('business_income_limit', 0),
      deductible: 5000,
      valuation: 'Replacement Cost',
      coinsurance: '90%',
    };

    // ACORD 130 - Workers Compensation
    const acord130 = {
      state: getFieldValue('state', clientData?.state || 'CA'),
      classificationCodes: [],
      totalPayroll: getFieldValue('total_payroll', 0),
      totalPremium: 0,
      emr: getFieldValue('emr', 1.0),
      deductible: 0,
    };

    return NextResponse.json({
      success: true,
      acordForms: {
        acord125,
        acord126,
        acord140,
        acord130,
      },
    });
  } catch (error: any) {
    console.error('Generate ACORD error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
