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
      value: typeof f.value === 'object' ? Object.entries(f.value).map(([k, v]) => `${k}: ${v}`).join(' | ') : String(f.value ?? ''),
    })),
    fieldCount: result.extractedFields?.length || 0,
  };
}

export async function generateAcordForms(extractedFields: any[]) {
  const fieldMap: Record<string, string> = {};
  extractedFields.forEach(f => {
    fieldMap[f.label || f.fieldName || ''] = String(f.value ?? '');
  });

  const prompt = `You are an expert at populating ACORD insurance forms. Given extracted insurance data, populate the forms.

CRITICAL: All dollar amounts and numeric values MUST be plain numbers (not strings). Examples:
- totalAnnualRevenue: 5000000 (NOT "$5,000,000")
- eachOccurrence: 2000000 (NOT "$2,000,000")  
- buildingValue: 1500000 (NOT "$1.5M")
- grossReceipts: 12000000 (NOT "$12M")
- totalPremium: 59600 (NOT "$59,600")
- liquorSalesPercentage: 35 (NOT "35%")

Strings are ONLY for: names, addresses, descriptions, dates, codes, entity types.

Return JSON matching this EXACT structure:

{
  "acord125": {
    "agency": {
      "name": "string",
      "address": "string",
      "city": "string",
      "state": "ST",
      "zip": "string",
      "phone": "string",
      "producerCode": "string"
    },
    "namedInsured": {
      "name": "string",
      "dba": "string",
      "mailingAddress": "string",
      "city": "string",
      "state": "ST",
      "zip": "string",
      "phone": "string",
      "fein": "string",
      "entityType": "string",
      "autoFilled": true
    },
    "businessInfo": {
      "naicsCode": "string",
      "naicsDescription": "string",
      "yearsInBusiness": NUMBER,
      "totalLocations": NUMBER,
      "totalEmployees": NUMBER,
      "totalAnnualRevenue": NUMBER,
      "descriptionOfOperations": "string",
      "autoFilled": true
    },
    "priorCarrier": {
      "name": "string",
      "policyNumber": "string",
      "expirationDate": "string",
      "totalPremium": NUMBER,
      "yearsWithCarrier": NUMBER,
      "reasonForChange": "string",
      "autoFilled": true
    },
    "linesRequested": [
      {"line": "Coverage Name", "currentPremium": NUMBER, "requested": true}
    ],
    "lossHistory": [
      {"year": NUMBER, "line": "string", "claims": NUMBER, "totalIncurred": NUMBER, "description": "string"}
    ]
  },
  "acord126": {
    "classification": {
      "code": "string",
      "description": "string",
      "grossReceipts": NUMBER,
      "liquorReceipts": NUMBER
    },
    "limitsRequested": {
      "eachOccurrence": NUMBER,
      "generalAggregate": NUMBER,
      "productsCompletedOpsAggregate": NUMBER,
      "personalAdvertisingInjury": NUMBER,
      "damageToRentedPremises": NUMBER,
      "medicalExpense": NUMBER
    },
    "liquorLiability": {
      "included": BOOLEAN,
      "eachOccurrence": NUMBER,
      "aggregate": NUMBER,
      "liquorSalesPercentage": NUMBER
    },
    "additionalCoverages": ["Coverage Name 1", "Coverage Name 2"]
  },
  "acord140": {
    "locations": [
      {
        "number": NUMBER,
        "address": "string",
        "buildingValue": NUMBER,
        "contentsValue": NUMBER,
        "biLimit": NUMBER,
        "construction": "string",
        "yearBuilt": NUMBER,
        "sqFootage": NUMBER,
        "stories": NUMBER,
        "sprinklered": BOOLEAN,
        "protectionClass": "string"
      }
    ],
    "totalBuildingValue": NUMBER,
    "totalContentsValue": NUMBER,
    "totalBILimit": NUMBER,
    "valuation": "string",
    "coinsurance": "string",
    "deductible": NUMBER
  },
  "acord130": {
    "state": "ST",
    "totalPayroll": NUMBER,
    "totalPremium": NUMBER,
    "emr": NUMBER (decimal like 0.95),
    "deductible": NUMBER,
    "classificationCodes": [
      {"code": "string", "description": "string", "payroll": NUMBER, "rate": NUMBER, "premium": NUMBER}
    ]
  }
}

IMPORTANT RULES:
1. ALL dollar values must be plain numbers without $ signs or commas
2. additionalCoverages must be an array of STRINGS (coverage names), not objects
3. Location field names: "biLimit" (not biValue), "construction" (not constructionType)
4. Fill in every field you can from the data. If not available, use 0 for numbers and "" for strings.
5. Set autoFilled: true on sections populated from real data.`;

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
        { role: 'user', content: `Populate ACORD forms from this extracted insurance data:\n\n${JSON.stringify(fieldMap, null, 2)}` },
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
