const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';

const EXTRACTION_PROMPT = `You are an expert at extracting structured data from commercial insurance documents.

Classify the document type: dec_page, loss_run, financial, property_schedule, vehicle_schedule, payroll, supplemental, or other

Extract ALL relevant fields with confidence scores (0-100).

Return valid JSON:
{
  "documentType": "dec_page|loss_run|property_schedule|other",
  "documentLabel": "Human-readable label",
  "extractedFields": [
    {
      "category": "Business Info|Coverage|Claims|Property|Financial",
      "fieldName": "named_insured",
      "label": "Named Insured",
      "value": "The extracted value AS A STRING - never return objects here",
      "confidence": 98,
      "source": "Page 1, section name"
    }
  ]
}

IMPORTANT: Every "value" MUST be a plain string. For coverage lines, format as: "$2,000,000 / $4,000,000 limit, $1,000 deductible, $18,400 premium". Never return objects or arrays as values.`;

export async function analyzeDocumentText(text: string, fileName: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: EXTRACTION_PROMPT },
        { role: 'user', content: `Extract all structured data from this insurance document (${fileName}):\n\n${text}` },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'OpenAI API error');
  }

  const data = await response.json();
  const result = JSON.parse(data.choices[0].message.content || '{}');

  return {
    documentType: result.documentType || 'other',
    documentLabel: result.documentLabel || fileName,
    extractedFields: (result.extractedFields || []).map((f: any) => ({
      ...f,
      value: typeof f.value === 'object' ? JSON.stringify(f.value) : String(f.value ?? ''),
    })),
    fieldCount: result.extractedFields?.length || 0,
  };
}

export async function generateAcordForms(extractedFields: any[]) {
  // Build a flat map of field values for the AI to reference
  const fieldMap: Record<string, string> = {};
  extractedFields.forEach(f => {
    fieldMap[f.label || f.fieldName || ''] = String(f.value ?? '');
  });

  const prompt = `You are an expert at populating ACORD insurance forms from extracted field data.

Given the extracted fields below, populate the ACORD forms. Return JSON matching this EXACT structure:

{
  "acord125": {
    "agency": {
      "name": "agency name",
      "address": "street address",
      "city": "city",
      "state": "ST",
      "zip": "12345",
      "phone": "(555) 555-0000",
      "producerCode": "code"
    },
    "namedInsured": {
      "name": "business legal name",
      "dba": "doing business as",
      "mailingAddress": "street address",
      "city": "city",
      "state": "ST",
      "zip": "12345",
      "phone": "(555) 555-0000",
      "fein": "XX-XXXXXXX",
      "entityType": "LLC/Corp/etc",
      "autoFilled": true
    },
    "businessInfo": {
      "naicsCode": "code",
      "naicsDescription": "description",
      "yearsInBusiness": 10,
      "totalLocations": 3,
      "totalEmployees": 50,
      "totalAnnualRevenue": 5000000,
      "descriptionOfOperations": "what they do",
      "autoFilled": true
    },
    "priorCarrier": {
      "name": "carrier name",
      "policyNumber": "number",
      "expirationDate": "date",
      "totalPremium": 50000,
      "yearsWithCarrier": 3,
      "reasonForChange": "reason",
      "autoFilled": true
    },
    "linesRequested": [
      {"line": "Commercial General Liability", "currentPremium": 18000, "requested": true},
      {"line": "Commercial Property", "currentPremium": 12000, "requested": true}
    ],
    "lossHistory": [
      {"year": 2024, "line": "GL", "claims": 1, "totalIncurred": 15000, "description": "slip and fall"}
    ]
  },
  "acord126": {
    "classification": {
      "code": "SIC/NAICS code",
      "description": "classification description",
      "grossReceipts": 5000000,
      "liquorReceipts": 1000000
    },
    "limitsRequested": {
      "eachOccurrence": "$2,000,000",
      "generalAggregate": "$4,000,000",
      "productsCompletedOpsAggregate": "$2,000,000",
      "personalAdvertisingInjury": "$2,000,000",
      "damageToRentedPremises": "$300,000",
      "medicalExpense": "$10,000"
    },
    "liquorLiability": {
      "included": true,
      "eachOccurrence": "$1,000,000",
      "aggregate": "$2,000,000",
      "liquorSalesPercentage": "35%"
    },
    "additionalCoverages": [
      {"name": "Hired & Non-Owned Auto", "limit": "$1,000,000", "included": true}
    ]
  },
  "acord140": {
    "locations": [
      {
        "number": 1,
        "address": "full address",
        "buildingValue": 1500000,
        "contentsValue": 500000,
        "biValue": 200000,
        "constructionType": "Masonry",
        "yearBuilt": 2005,
        "sqFootage": 8000,
        "stories": 1,
        "sprinklered": true,
        "protectionClass": "3"
      }
    ],
    "totalBuildingValue": 4000000,
    "totalContentsValue": 1500000,
    "totalBILimit": 600000,
    "valuation": "Replacement Cost",
    "coinsurance": "80%",
    "deductible": 2500
  },
  "acord130": {
    "state": "OR",
    "totalPayroll": 3500000,
    "totalPremium": 45000,
    "emr": 0.95,
    "deductible": 1000,
    "classificationCodes": [
      {"code": "2003", "description": "Brewing", "payroll": 2000000, "rate": 1.25, "premium": 25000},
      {"code": "9079", "description": "Restaurant", "payroll": 1500000, "rate": 1.35, "premium": 20000}
    ]
  }
}

Fill in real values from the extracted data. If a value wasn't extracted, make a reasonable inference or leave empty string. Set autoFilled: true on sections populated from extracted data.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: `Populate ACORD forms from this extracted data:\n\n${JSON.stringify(fieldMap, null, 2)}` },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'OpenAI API error');
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content || '{}');
}

export async function generateCoverLetter(extractedFields: any[]): Promise<string> {
  const prompt = `You are an expert commercial insurance broker writing submission cover letters.

Write a professional 3-paragraph cover letter for this commercial insurance submission:
- Paragraph 1: Introduce the insured, their operations, and coverage needs
- Paragraph 2: Highlight key risk characteristics and positive attributes  
- Paragraph 3: Summarize coverage needs and request quotes

Use professional insurance broker language. Be specific. Under 300 words. Return ONLY the letter text.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: `Write a cover letter using this data:\n\n${JSON.stringify(extractedFields.slice(0, 50), null, 2)}` },
      ],
      temperature: 0.7,
      max_tokens: 800,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'OpenAI API error');
  }

  const data = await response.json();
  return data.choices[0].message.content || '';
}
