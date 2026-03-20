function escapeXml(text: string): string {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function generateAcordXML(formData: any): void {
  const today = new Date().toISOString().split('T')[0];
  const requestId = generateUUID();
  
  // Extract data from form sections
  const acord125 = formData.acord125 || {};
  const acord126 = formData.acord126 || {};
  const acord130 = formData.acord130 || {};
  const acord140 = formData.acord140 || {};
  
  // Helper to get field value
  const getFieldValue = (sections: any[], sectionName: string, fieldLabel: string): string => {
    const section = sections?.find((s: any) => s.name.includes(sectionName));
    const field = section?.fields?.find((f: any) => f.label.includes(fieldLabel));
    return escapeXml(field?.value || '');
  };
  
  // Extract key data
  const agencyName = getFieldValue(acord125.sections, 'Agency', 'Name') || 'Agency Name';
  const agencyAddress = getFieldValue(acord125.sections, 'Agency', 'Address') || 'Address';
  const agencyCity = getFieldValue(acord125.sections, 'Agency', 'City') || 'City';
  const agencyState = getFieldValue(acord125.sections, 'Agency', 'State') || 'ST';
  const agencyZip = getFieldValue(acord125.sections, 'Agency', 'ZIP') || '00000';
  const agencyPhone = getFieldValue(acord125.sections, 'Agency', 'Phone') || '000-000-0000';
  
  const insuredName = getFieldValue(acord125.sections, 'Insured', 'Named Insured') || 'Business Name';
  const insuredAddress = getFieldValue(acord125.sections, 'Insured', 'Address') || 'Address';
  const insuredCity = getFieldValue(acord125.sections, 'Insured', 'City') || 'City';
  const insuredState = getFieldValue(acord125.sections, 'Insured', 'State') || 'ST';
  const insuredZip = getFieldValue(acord125.sections, 'Insured', 'ZIP') || '00000';
  const fein = getFieldValue(acord125.sections, 'Insured', 'FEIN') || '00-0000000';
  
  const naicsCode = getFieldValue(acord125.sections, 'Business', 'NAICS') || '000000';
  const employeeCount = getFieldValue(acord125.sections, 'Business', 'Employees') || '0';
  const revenue = getFieldValue(acord125.sections, 'Business', 'Revenue') || '0';
  const operations = getFieldValue(acord125.sections, 'Business', 'Description') || 'Business operations';
  const yearsInBusiness = getFieldValue(acord125.sections, 'Business', 'Years') || '0';
  
  const effectiveDate = getFieldValue(acord125.sections, 'Coverage', 'Effective Date') || today;
  const expirationDate = getFieldValue(acord125.sections, 'Coverage', 'Expiration Date') || today;
  
  // GL limits
  const eachOccurrence = getFieldValue(acord126.sections, 'Limits', 'Each Occurrence') || '1000000';
  const generalAggregate = getFieldValue(acord126.sections, 'Limits', 'General Aggregate') || '2000000';
  const productsAggregate = getFieldValue(acord126.sections, 'Limits', 'Products') || '2000000';
  const personalInjury = getFieldValue(acord126.sections, 'Limits', 'Personal') || '1000000';
  
  // Property
  const buildingValue = getFieldValue(acord140.sections, 'Summary', 'Building') || '0';
  const contentsValue = getFieldValue(acord140.sections, 'Summary', 'Contents') || '0';
  const biLimit = getFieldValue(acord140.sections, 'Summary', 'Business Income') || '0';
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ACORD>
  <SignonRq>
    <SignonPswd>
      <CustId>
        <CustLoginId>SubmissionAI</CustLoginId>
      </CustId>
    </SignonPswd>
    <ClientDt>${today}</ClientDt>
    <CustLangPref>en-US</CustLangPref>
    <ClientApp>
      <Org>SubmissionAI</Org>
      <Name>SubmissionAI Platform</Name>
      <Version>1.0</Version>
    </ClientApp>
  </SignonRq>
  <InsuranceSvcRq>
    <RqUID>${requestId}</RqUID>
    <SPName>
      <Carrier>
        <CarrierName>Carrier Name</CarrierName>
      </Carrier>
    </SPName>
    <PolicyRq>
      <RqUID>${requestId}-policy</RqUID>
      <TransactionRequestDt>${today}</TransactionRequestDt>
      <TransactionEffectiveDt>${effectiveDate}</TransactionEffectiveDt>
      <CurCd>USD</CurCd>
      <BroadLOBCd>COMM</BroadLOBCd>
      <InsuredOrPrincipal>
        <GeneralPartyInfo>
          <NameInfo>
            <CommlName>
              <CommercialName>${insuredName}</CommercialName>
            </CommlName>
          </NameInfo>
          <Addr>
            <AddrTypeCd>MailingAddress</AddrTypeCd>
            <Addr1>${insuredAddress}</Addr1>
            <City>${insuredCity}</City>
            <StateProvCd>${insuredState}</StateProvCd>
            <PostalCode>${insuredZip}</PostalCode>
            <CountryCd>US</CountryCd>
          </Addr>
          <TaxIdentity>
            <TaxIdTypeCd>FEIN</TaxIdTypeCd>
            <TaxId>${fein}</TaxId>
          </TaxIdentity>
        </GeneralPartyInfo>
        <InsuredOrPrincipalInfo>
          <InsuredOrPrincipalRoleCd>Insured</InsuredOrPrincipalRoleCd>
          <BusinessInfo>
            <OperationsDesc>${operations}</OperationsDesc>
            <NAICSCd>${naicsCode}</NAICSCd>
            <NumEmployees>
              <NumEmployeesFullTime>${employeeCount}</NumEmployeesFullTime>
            </NumEmployees>
            <TotalAnnualRevenue>
              <Amt>${revenue}</Amt>
            </TotalAnnualRevenue>
            <YearsInBusiness>${yearsInBusiness}</YearsInBusiness>
          </BusinessInfo>
        </InsuredOrPrincipalInfo>
      </InsuredOrPrincipal>
      <Producer>
        <GeneralPartyInfo>
          <NameInfo>
            <CommlName>
              <CommercialName>${agencyName}</CommercialName>
            </CommlName>
          </NameInfo>
          <Addr>
            <AddrTypeCd>MailingAddress</AddrTypeCd>
            <Addr1>${agencyAddress}</Addr1>
            <City>${agencyCity}</City>
            <StateProvCd>${agencyState}</StateProvCd>
            <PostalCode>${agencyZip}</PostalCode>
            <CountryCd>US</CountryCd>
          </Addr>
          <Communications>
            <PhoneInfo>
              <PhoneTypeCd>Phone</PhoneTypeCd>
              <PhoneNumber>${agencyPhone}</PhoneNumber>
            </PhoneInfo>
          </Communications>
        </GeneralPartyInfo>
        <ProducerInfo>
          <ContractNumber>PROD-001</ContractNumber>
        </ProducerInfo>
      </Producer>
      <CommlPolicy>
        <PolicyNumber>POLICY-${Date.now()}</PolicyNumber>
        <LOBCd>CGL</LOBCd>
        <ControllingStateProvCd>${insuredState}</ControllingStateProvCd>
        <ContractTerm>
          <EffectiveDt>${effectiveDate}</EffectiveDt>
          <ExpirationDt>${expirationDate}</ExpirationDt>
          <DurationPeriod>
            <NumUnits>12</NumUnits>
            <UnitMeasurementCd>Month</UnitMeasurementCd>
          </DurationPeriod>
        </ContractTerm>
      </CommlPolicy>
      <Location>
        <Addr>
          <AddrTypeCd>RiskLocation</AddrTypeCd>
          <Addr1>${insuredAddress}</Addr1>
          <City>${insuredCity}</City>
          <StateProvCd>${insuredState}</StateProvCd>
          <PostalCode>${insuredZip}</PostalCode>
          <CountryCd>US</CountryCd>
        </Addr>
        <PropertyInfo>
          <ReplacementCostAmt>
            <Amt>${buildingValue}</Amt>
          </ReplacementCostAmt>
          <PersonalPropertyAmt>
            <Amt>${contentsValue}</Amt>
          </PersonalPropertyAmt>
          <BusinessIncomeLimit>
            <Amt>${biLimit}</Amt>
          </BusinessIncomeLimit>
        </PropertyInfo>
      </Location>
      <CommlCoverage>
        <LOBCd>CGL</LOBCd>
        <CoverageCd>GENAG</CoverageCd>
        <CoverageDesc>General Aggregate</CoverageDesc>
        <Limit>
          <LimitAppliesToCd>Aggregate</LimitAppliesToCd>
          <FormatCurrencyAmt>
            <Amt>${generalAggregate}</Amt>
          </FormatCurrencyAmt>
        </Limit>
      </CommlCoverage>
      <CommlCoverage>
        <LOBCd>CGL</LOBCd>
        <CoverageCd>EACHOCC</CoverageCd>
        <CoverageDesc>Each Occurrence</CoverageDesc>
        <Limit>
          <LimitAppliesToCd>PerOccurrence</LimitAppliesToCd>
          <FormatCurrencyAmt>
            <Amt>${eachOccurrence}</Amt>
          </FormatCurrencyAmt>
        </Limit>
      </CommlCoverage>
      <CommlCoverage>
        <LOBCd>CGL</LOBCd>
        <CoverageCd>PRODAGG</CoverageCd>
        <CoverageDesc>Products/Completed Operations Aggregate</CoverageDesc>
        <Limit>
          <LimitAppliesToCd>Aggregate</LimitAppliesToCd>
          <FormatCurrencyAmt>
            <Amt>${productsAggregate}</Amt>
          </FormatCurrencyAmt>
        </Limit>
      </CommlCoverage>
      <CommlCoverage>
        <LOBCd>CGL</LOBCd>
        <CoverageCd>PERSINJ</CoverageCd>
        <CoverageDesc>Personal and Advertising Injury</CoverageDesc>
        <Limit>
          <LimitAppliesToCd>PerOccurrence</LimitAppliesToCd>
          <FormatCurrencyAmt>
            <Amt>${personalInjury}</Amt>
          </FormatCurrencyAmt>
        </Limit>
      </CommlCoverage>
    </PolicyRq>
  </InsuranceSvcRq>
</ACORD>`;
  
  // Create and download XML file
  const blob = new Blob([xml], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ACORD-Submission-${today}.xml`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
