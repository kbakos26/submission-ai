# SubmissionAI — Technical Brief for Development Partner

## Purpose
This document provides a comprehensive breakdown of the commercial insurance brokerage submission workflow, the data involved, and what our system needs to automate. This is everything you need to understand the domain and build the backend.

---

## 1. INDUSTRY CONTEXT

### Who Are Our Users?
**Commercial insurance brokerages and MGAs (Managing General Agents)**

- Brokerages: Intermediaries between businesses that need insurance and insurance carriers (Hartford, Travelers, CNA, etc.). They shop multiple carriers to find the best coverage/price for their clients.
- MGAs: Specialized intermediaries with underwriting authority from carriers. They can bind policies directly for certain risk classes.
- Team structure: Producers (salespeople), Account Managers, CSRs (Customer Service Reps), and sometimes dedicated submission/processing staff.
- AMS (Agency Management System): Their core database — Applied Epic, AMS360, HawkSoft, EZLynx are the major ones.

### The Problem We Solve
A single commercial insurance submission (getting a quote for a business client) takes **4-7 hours of manual work** — mostly data entry, form filling, and document assembly. A mid-size brokerage processes 30-80 submissions per month. That's **200-500+ hours/month of manual work** that our system can reduce to ~10% of that time.

### What We're Automating (MVP Scope)
1. Document intake and data extraction
2. Missing document tracking with automated follow-up
3. AMS data sync
4. ACORD form auto-fill with verification
5. Submission package assembly

### What Stays Manual (For Now)
- Carrier selection (which carriers to submit to)
- Carrier portal submission (actually submitting to carrier websites)
- Underwriter negotiation and follow-up
- Quote comparison and client presentation
- Policy binding

---

## 2. THE COMPLETE WORKFLOW (Current State)

### Phase 1: Client Engagement
1. A business (the "insured") contacts the brokerage for insurance — either a new client or a renewal
2. Broker has a discovery call to understand the business, its risks, and coverage needs
3. Broker requests documents from the client (see Section 3 for complete list)

### Phase 2: Document Collection
4. Client sends documents via email (90% of the time), sometimes fax, sometimes through a client portal if the brokerage has one
5. Documents arrive in different formats: PDF, scanned images, Excel spreadsheets, Word docs, sometimes photos of paper documents
6. Broker must review each document, determine if the submission package is complete, and follow up on anything missing
7. **This chase process can take 1-3 weeks** — multiple follow-up emails/calls for missing items

### Phase 3: Data Entry
8. Once documents are gathered, broker manually enters ALL client data into their AMS
9. This includes: business name, all addresses, contact info, business description, revenue, employee counts, prior coverage details, claims history — everything
10. **This takes 30-60 minutes of pure typing per client**

### Phase 4: Form Completion
11. Broker fills out ACORD forms (standardized industry application forms — see Section 4)
12. ACORD 125 is always required (master application)
13. Additional forms are required based on coverage lines requested
14. Much of the data is re-entered from what's already in the AMS — duplicate effort
15. **This takes 1-2 hours per complete application set**

### Phase 5: Submission Package Assembly
16. Broker assembles the complete package:
    - Completed ACORD forms
    - Cover letter/narrative describing the risk
    - Loss runs
    - Financial documents
    - Property schedules
    - Vehicle schedules (if applicable)
    - Supplemental questionnaires (carrier-specific)
17. Different carriers want different things, so the package may be customized per carrier
18. **This takes 30-60 minutes**

### Phase 6: Carrier Submission (MANUAL — not in our MVP)
19. Broker selects 3-8 carriers based on appetite, relationships, and risk profile
20. Submits package to each carrier via their portal, email, or wholesale broker
21. Each carrier portal has different fields, different UIs, different login credentials
22. **This is another 30-60 minutes PER carrier**

### Phase 7: Quote Receipt & Comparison (MANUAL — not in our MVP)
23. Carriers respond with quotes (2 days to 3 weeks turnaround)
24. Quotes arrive in different formats (PDF proposals, email summaries, portal-generated docs)
25. Broker manually builds a comparison spreadsheet
26. Writes a recommendation narrative
27. Presents to client for decision

### Phase 8: Binding (MANUAL — not in our MVP)
28. Client selects carrier
29. Broker sends bind request
30. Policy is issued, COIs generated, policy entered into AMS

---

## 3. INCOMING DOCUMENTS — What We Need to Parse

### 3.1 Declarations Pages (Dec Pages)
**What it is:** Summary page(s) from the client's CURRENT insurance policy
**Format:** PDF (always), typically 2-5 pages
**Key data to extract:**
- Named insured (business name, exactly as written)
- Policy number
- Policy period (effective date → expiration date)
- Carrier name
- Lines of coverage with limits:
  - General Liability: per occurrence limit, general aggregate
  - Property: building value, contents value, business income limit
  - Workers Comp: statutory limits, experience modification rate (EMR)
  - Commercial Auto: combined single limit, uninsured/underinsured
  - Umbrella/Excess: occurrence limit, aggregate
- Premium per line and total premium
- Deductibles per line
- List of covered locations (addresses)
- Endorsements and exclusions
- Agent/broker of record

### 3.2 Loss Runs (Claims History Reports)
**What it is:** Report from the CURRENT carrier showing all claims filed, typically last 3-5 years
**Format:** PDF, sometimes 1 page (clean history) to 20+ pages (lots of claims)
**Key data to extract:**
- Policy period for each year
- For each claim:
  - Date of loss
  - Claim number
  - Type/line of business (GL, WC, Property, Auto)
  - Claimant name (if applicable)
  - Description of loss
  - Status (Open / Closed)
  - Total paid amount
  - Total reserved amount (money set aside for potential future payment)
  - Total incurred (paid + reserved)
- Summary totals per year
- Loss ratio (total incurred / total premium)
**Why it matters:** Claims history is the #1 factor in whether a carrier will quote and at what price. Bad loss history = higher premiums or declination.
**Challenge:** Every carrier formats loss runs differently. No standard format. Some are tables, some are narrative. OCR quality varies.

### 3.3 Financial Documents
**What it is:** Proof of business revenue and financial health
**Formats:** PDF (tax returns), Excel (internal financials), sometimes CPA letters
**Types:**
- Federal tax returns (most recent 1-2 years)
- Profit & loss statements
- Balance sheets
- Revenue breakdown by location or business segment
**Key data to extract:**
- Total annual revenue (gross)
- Revenue by location (if multi-location)
- Payroll totals (critical for Workers Comp rating)
- Payroll breakdown by state and by job classification
- Cost of goods sold
- Net income

### 3.4 Property Schedules (Statement of Values / SOV)
**What it is:** List of all business locations with property details
**Format:** Excel spreadsheet (most common) or PDF
**Key data to extract per location:**
- Address
- Building value (replacement cost)
- Contents/BPP (Business Personal Property) value
- Business income value (12-month projection)
- Construction type (frame, masonry, fire-resistive, etc.)
- Year built
- Square footage
- Number of stories
- Occupancy type
- Fire protection class
- Sprinkler system (yes/no, % coverage)
- Alarm system (burglar/fire)
- Roof type and year last replaced
- Distance to fire station and fire hydrant

### 3.5 Vehicle Schedules
**What it is:** List of all business vehicles (for commercial auto coverage)
**Format:** Excel or PDF
**Key data to extract per vehicle:**
- Year, make, model
- VIN
- Vehicle type (sedan, pickup, box truck, etc.)
- GVW (Gross Vehicle Weight)
- Use (service, sales, delivery, hauling)
- Garaging address (where it's parked overnight)
- Driver assigned
- Radius of operation (local, intermediate, long-distance)
- Current value / cost new

### 3.6 Employee Census / Payroll Report
**What it is:** Breakdown of employees for Workers Compensation rating
**Format:** Excel or PDF payroll report
**Key data to extract:**
- Total employee count
- Breakdown by:
  - State (WC is state-regulated, rates vary by state)
  - Job classification code (NCCI class codes — e.g., 9082 for restaurant employees, 8810 for clerical)
  - Annual payroll per classification per state
- Experience Modification Rate (EMR/Mod) — usually on a separate document from NCCI or the state rating bureau

### 3.7 Supplemental Questionnaires
**What it is:** Industry-specific questionnaires required by carriers
**Format:** PDF forms (carrier-specific)
**Examples:**
- Restaurant supplement: liquor sales %, hours of operation, entertainment, delivery operations
- Contractor supplement: subcontractor usage %, types of work, largest project size
- Habitational (apartments) supplement: age of buildings, tenant screening process, maintenance program
- Manufacturing supplement: materials used, machinery types, quality control procedures
**Note:** These vary widely by carrier and industry. For MVP, we can generate the most common ones based on NAICS code.

---

## 4. ACORD FORMS — What We Need to Auto-Generate

ACORD (Association for Cooperative Operations Research and Development) forms are the industry standard application forms. Every carrier accepts them. They are the "language" of commercial insurance submissions.

### 4.1 ACORD 125 — Commercial Insurance Application (ALWAYS REQUIRED)
**Pages:** 4
**This is the master application.** Every commercial submission starts here.

**Section-by-section field mapping:**

**Page 1 — Header & Agency Info:**
- Agency name, address, phone, NAIC code
- Agency contact person
- National Producer Number
- State Producer License Number
- Status of transaction (Quote / Bound / Issued)
- Company/carrier name (left blank for new quotes)
- NAIC code of carrier
- Policy number (blank for new, filled for renewal)

**Page 1 — Lines of Business Checkboxes:**
- [ ] Commercial General Liability (→ triggers ACORD 126)
- [ ] Property (→ triggers ACORD 140)
- [ ] Crime
- [ ] Inland Marine (→ triggers ACORD 146)
- [ ] Commercial Auto (→ triggers ACORD 127/137)
- [ ] Garage
- [ ] Workers Compensation (→ triggers ACORD 130)
- [ ] Umbrella/Excess (→ triggers ACORD 131)
- [ ] Professional Liability
- [ ] Other: ___________

**Page 1 — Policy Information:**
- Proposed effective date
- Proposed expiration date
- Billing plan (agency bill / direct bill)
- Payment plan (annual / semi-annual / quarterly / monthly)
- Audit type (annual / monthly / semi-annual)

**Page 1 — Applicant Information:**
- Named Insured (full legal business name)
- DBA (Doing Business As)
- Mailing address (street, city, state, zip+4)
- FEIN (Federal Employer Identification Number)
- Entity type: Corporation / LLC / Partnership / Sole Proprietor / Joint Venture / Subchapter S / Other
- State of incorporation
- Date business started
- SIC code
- NAICS code
- Business phone
- Website

**Page 2 — Contact Information:**
- Contact type (Billing / Insured / Other)
- Contact name, phone, email

**Page 2 — Premises Information (per location):**
- Location/building number
- Street address, city, state, zip
- Inside/outside city limits
- Interest (Owner / Tenant)
- Number of employees at this location
- Annual revenues at this location
- Area occupied (sq ft)
- Area open to public (sq ft)
- Total building area (sq ft)
- Is any part leased to others? (Y/N)
- If yes: number of units leased, annual rental income

**Page 2 — Nature of Business:**
- Business category checkboxes (Apartment / Contractor / Mercantile / Office / Restaurant / etc.)
- Description of operations (free text, usually 2-5 sentences)
- NAICS code
- SIC code

**Page 3 — General Information (15 Yes/No questions):**
1. Any operations ceased or acquired in last 5 years?
2. Any operations anticipated in next 12 months?
3. Is a formal safety program in operation?
4. Any employees leased to or from others?
5. Do any subsidiaries or affiliates need to be covered?
6. Any prior coverage cancelled or non-renewed?
7. Any claims or suits in the last 5 years?
8. Is applicant a subsidiary or affiliate of another entity?
9. Does applicant have foreign operations?
10. Are there any additional Named Insureds?
11. Any work performed underground or above 15 feet?
12. Any work involving hazardous materials?
13. Does applicant use independent contractors/subcontractors?
14. Any watercraft, docks, or floats owned or operated?
15. Any parking facilities owned or rented?

**Page 3 — Prior Carrier Information (per year, typically 3 years):**
- Policy year
- Carrier name
- Policy number
- Premium (broken out by line: Property / GL / Crime / Auto / WC / Umbrella)
- Effective date
- Expiration date

**Page 4 — Loss History:**
- Per claim: date of loss, line of business, amount paid, amount reserved, description, status (open/closed)
- Or checkbox: "No losses in the prior 5 years"

**Page 4 — Signatures:**
- Producer signature and date
- Applicant signature and date

---

### 4.2 ACORD 126 — Commercial General Liability Section
**Triggered when:** GL is checked on ACORD 125
**Pages:** 2

**Key fields:**
- Classification codes (by location): GL class code, class description, premium basis (revenue, payroll, area, units), exposure amount
- Premises/Operations limits:
  - Each Occurrence limit (typically $1M or $2M)
  - General Aggregate limit
  - Products/Completed Operations Aggregate
  - Personal & Advertising Injury limit
  - Fire Damage limit (per fire)
  - Medical Expense limit (per person)
- Deductible (if any)
- Claims-made vs. Occurrence form
- Retroactive date (if claims-made)
- Additional coverages:
  - Liquor liability (very important for restaurants/bars)
  - Employee benefits liability
  - Stop gap coverage
- Designated premises
- Additional insured requirements

---

### 4.3 ACORD 140 — Property Section
**Triggered when:** Property is checked on ACORD 125
**Pages:** 2+

**Key fields per location/building:**
- Location/building number
- Address
- Construction type (frame / joisted masonry / non-combustible / masonry non-combustible / modified fire resistive / fire resistive)
- Year built
- Number of stories
- Total area (sq ft)
- Basement? (Y/N)
- Automatic sprinkler? (Y/N, % of area)
- Fire division? (Y/N)
- Protection class
- Distance to fire station
- Distance to fire hydrant
- Heating type
- Electrical update year
- Roof type and year last replaced
- Occupancy (owner / tenant)
- Coverage section:
  - Building value (replacement cost)
  - Business Personal Property (BPP/contents) value
  - Business Income limit (with or without extra expense)
  - Agreed value / coinsurance percentage
  - Valuation method (replacement cost / actual cash value)
  - Deductible
  - Cause of loss form (Basic / Broad / Special)
  - Equipment breakdown coverage (Y/N)
  - Ordinance or law coverage
  - Flood zone and flood coverage
  - Earthquake coverage

---

### 4.4 ACORD 130 — Workers Compensation Application
**Triggered when:** WC is checked on ACORD 125
**Pages:** 2

**Key fields:**
- States where employees work
- Per state:
  - Class code (NCCI or state-specific)
  - Class description
  - Number of employees in class
  - Annual remuneration (payroll) per class
- Experience Modification Rate (EMR)
- FEIN
- Entity type
- Nature of business
- Prior WC carrier info
- Part 2 — Employer's Liability limits:
  - Bodily Injury by Accident: $_____ each accident
  - Bodily Injury by Disease: $_____ policy limit
  - Bodily Injury by Disease: $_____ each employee
- Any states with monopolistic fund? (OH, WA, WY, ND)
- Wrap-up or OCIP involvement?

---

### 4.5 ACORD 127 / 137 — Commercial Auto Section
**Triggered when:** Commercial Auto is checked on ACORD 125
**Pages:** 2+

**Key fields:**
- ACORD 127 (Auto Section):
  - Liability limits (Combined Single Limit or Split)
  - Uninsured/Underinsured Motorist limits
  - Medical Payments limit
  - Comprehensive deductible
  - Collision deductible
  - Hired auto coverage (Y/N)
  - Non-owned auto coverage (Y/N)
  - Radius of operations
  - Any DOT/ICC filings required?
- ACORD 137 (Vehicle Schedule — per vehicle):
  - Year, make, model, body type
  - VIN
  - GVW (Gross Vehicle Weight)
  - Cost new / actual cash value
  - Vehicle use (service, commercial, retail, hauling)
  - Garaging zip code
  - Comprehensive/collision coverage (Y/N)

---

### 4.6 ACORD 131 — Umbrella/Excess Liability
**Triggered when:** Umbrella is checked on ACORD 125
**Pages:** 1-2

**Key fields:**
- Umbrella vs. Excess (follow form) vs. Stand-alone
- Each Occurrence limit
- Aggregate limit
- Self-Insured Retention (SIR) amount
- Underlying policies schedule:
  - GL: carrier, policy number, limits
  - Auto: carrier, policy number, limits
  - WC/Employer's Liability: carrier, policy number, limits
- Defense coverage (inside or outside limits)

---

## 5. AMS INTEGRATION

### Major AMS Platforms (Market Share)
1. **Applied Epic** (~35% market share) — Enterprise-grade, most large brokerages
2. **AMS360 / Vertafore** (~25%) — Mid-market
3. **HawkSoft** (~15%) — Small to mid-size agencies
4. **EZLynx** (~10%) — Small agencies, strong in personal lines
5. **NowCerts** (~5%) — Cloud-native, newer agencies
6. **QQCatalyst** — Smaller agencies

### Integration Approaches
- **API Integration:** Applied Epic and AMS360 have APIs but they require partnership agreements and can take months to get access. Applied's IVANS network is the main data exchange standard.
- **File-Based Import:** Most AMS platforms support CSV or ACORD XML import. This is the fastest path for MVP.
- **ACORD AL3 / XML:** Industry-standard data format for exchanging insurance data between systems. If we can output in ACORD XML format, virtually any AMS can import it.
- **Recommendation for MVP:** Generate ACORD XML export files + CSV exports that brokers can import into their AMS. API integrations come in Phase 2.

---

## 6. SYSTEM ARCHITECTURE (What We Need to Build)

### 6.1 Document Intake Engine
**Input channels:**
- Email forwarding (broker forwards client emails to our system)
- Upload portal (branded per brokerage, client-facing)
- Direct file upload (broker drags/drops files)
- Fax-to-digital (via a fax API like RingCentral or Twilio)

**Processing pipeline:**
1. Receive document
2. Classify document type (dec page vs. loss run vs. financial vs. property schedule vs. other)
3. OCR if needed (scanned/image PDFs)
4. Extract structured data using AI (GPT-4o or Claude for document understanding)
5. Map extracted data to our internal data model
6. Flag low-confidence extractions for human review
7. Store structured data + original document

**Document classification model needs to recognize:**
- ACORD forms (by form number)
- Dec pages (by carrier — each carrier has a different layout)
- Loss runs (tabular claims data)
- Financial statements (revenue/expense format)
- Property schedules (location/value tables)
- Vehicle schedules (VIN/vehicle tables)
- Employee census/payroll reports
- Supplemental questionnaires
- Certificates of insurance (COIs)
- Photos/inspection reports

### 6.2 Submission Tracker / Missing Document Engine
**For each submission, track:**
- Client name and business type
- Coverage lines requested
- Required documents checklist (auto-generated based on lines of business):
  - GL → Need: ACORD 125, loss runs, revenue info
  - Property → Need: ACORD 140, property schedule/SOV, photos
  - WC → Need: ACORD 130, payroll by class/state, EMR letter, OSHA logs
  - Auto → Need: ACORD 127/137, vehicle schedule, MVRs (Motor Vehicle Reports)
  - Umbrella → Need: ACORD 131, underlying policy info
- Status per document: Not Requested / Requested / Received / Verified
- Automated follow-up rules:
  - Day 1: Initial request email to client with upload portal link
  - Day 3: First follow-up (email)
  - Day 5: Second follow-up (email + text)
  - Day 7: Alert broker to call client directly
  - Day 10: Final notice
- Follow-up messages should be professional, branded per brokerage, and reference specifically what's missing

### 6.3 ACORD Form Auto-Fill Engine
**Process:**
1. Pull all structured data from the intake engine
2. Map data fields to ACORD form fields (see Section 4 for complete field mappings)
3. Auto-populate forms
4. Run verification layer:
   - **Check 1:** Cross-reference extracted data against multiple source documents (e.g., revenue on dec page matches revenue on financials)
   - **Check 2:** Flag any field where AI confidence is below 95%
   - **Check 3:** Business logic validation (e.g., employee count × average salary should roughly equal total payroll)
   - **Check 4:** Completeness check — highlight any required field that couldn't be populated
5. Generate forms as editable PDFs
6. Present to broker for review — show ONLY flagged fields, not the entire form
7. Broker approves or edits
8. Final forms generated

### 6.4 Submission Package Builder
**Output:** A complete, organized submission package ready to send to carriers

**Package contents:**
1. Cover letter (AI-generated narrative describing the risk — customizable template)
2. Completed ACORD 125 (master application)
3. Line-specific ACORD forms (126, 140, 130, 127/137, 131 as applicable)
4. Loss runs (original documents, organized by year)
5. Financial summary (extracted data in clean format)
6. Property schedule (standardized format)
7. Vehicle schedule (if applicable)
8. Supplemental questionnaires (if applicable)
9. Any additional supporting documents

**Format:** Single PDF package or organized ZIP file with folder structure:
```
/Pacific_Coast_Dining_Group_Submission/
  01_Cover_Letter.pdf
  02_ACORD_125_Application.pdf
  03_ACORD_126_GL_Section.pdf
  04_ACORD_140_Property_Section.pdf
  05_ACORD_130_WC_Application.pdf
  06_Loss_Runs/
    GL_Loss_Run_2022-2025.pdf
    WC_Loss_Run_2022-2025.pdf
  07_Financial_Documents/
    Tax_Return_2024.pdf
    PL_Statement_2024.pdf
  08_Property_Schedule.pdf
  09_Supplemental_Restaurant_Questionnaire.pdf
```

### 6.5 AMS Export
**MVP approach:** Generate downloadable files in formats the broker's AMS can import
- ACORD XML (industry standard)
- CSV with mapped fields
- PDF forms (always available as fallback)

---

## 7. DATA MODEL (Core Entities)

### Submission
- submission_id
- brokerage_id
- client_id
- status (intake / documents_pending / ready_for_forms / forms_review / package_ready / submitted / quoted / bound)
- lines_of_business[]
- created_at
- target_effective_date
- assigned_broker
- notes

### Client (Insured)
- client_id
- legal_name
- dba
- fein
- entity_type
- naics_code
- sic_code
- description_of_operations
- website
- phone
- date_established
- annual_revenue
- employee_count

### Location
- location_id
- client_id
- address, city, state, zip
- construction_type
- year_built
- stories
- square_footage
- sprinkler (boolean + percentage)
- alarm_type
- protection_class
- building_value
- contents_value
- business_income_value
- occupancy_type
- roof_type, roof_year

### Claim
- claim_id
- client_id
- policy_year
- date_of_loss
- line_of_business
- claim_number
- claimant_name
- description
- amount_paid
- amount_reserved
- total_incurred
- status (Open / Closed)

### Vehicle
- vehicle_id
- client_id
- year, make, model
- vin
- body_type
- gvw
- cost_new
- use_type
- garaging_address
- radius

### Employee Classification
- classification_id
- client_id
- state
- ncci_class_code
- class_description
- employee_count
- annual_payroll

### Document
- document_id
- submission_id
- document_type (dec_page / loss_run / financial / property_schedule / vehicle_schedule / payroll / supplemental / other)
- original_filename
- file_path
- upload_date
- parsed (boolean)
- parse_confidence_score
- extracted_data (JSON)

### ACORD Form
- form_id
- submission_id
- form_type (125 / 126 / 130 / 131 / 137 / 140)
- status (draft / flagged_for_review / approved / final)
- flagged_fields[] (fields needing human review)
- generated_pdf_path
- approved_by
- approved_at

---

## 8. VERIFICATION & ACCURACY REQUIREMENTS

Insurance is a regulated industry. Errors on applications can result in:
- Claims being denied
- E&O (Errors & Omissions) lawsuits against the brokerage
- Carrier relationships damaged
- Fines from state insurance departments

**Our verification approach (triple-check):**

**Layer 1 — Cross-Document Validation:**
Compare the same data point across multiple source documents. If the dec page says revenue is $12M but the tax return shows $10.5M, flag it.

**Layer 2 — AI Confidence Scoring:**
Every extracted field gets a confidence score (0-100%). Anything below 95% gets flagged for human review. The broker only needs to look at flagged fields, not review the entire form.

**Layer 3 — Business Logic Rules:**
- Employee count × average compensation ≈ total payroll (within 20%)
- Building value ÷ square footage should fall within expected $/sqft range for construction type
- Revenue per location should be reasonable for the business type
- Claims dates should fall within policy periods
- Sum of line premiums should equal total premium on dec page

**Target: 99%+ accuracy on auto-filled fields after verification.**

---

## 9. SECURITY & COMPLIANCE CONSIDERATIONS

- All data is PII (Personally Identifiable Information) and confidential business information
- Must be SOC 2 compliant (or working toward it)
- Data encryption at rest and in transit
- Role-based access control (broker sees their clients only)
- Audit trail for all data access and changes
- HIPAA considerations if handling healthcare-related insurance data
- State insurance department regulations vary — data retention requirements differ by state
- Multi-tenant architecture (each brokerage's data is fully isolated)

---

## 10. COMPETITIVE LANDSCAPE

### Enterprise Solutions (NOT our competitors — different market)
- **Roots.ai** — AI submission intake, targets large carriers/MGAs. $100K+/year contracts.
- **DataCrest** — AI submission automation. Enterprise-focused.
- **CoverForce** — Submission workflow platform for wholesalers.

### Our Market (Underserved)
- Mid-size brokerages (10-100 employees)
- Small commercial brokerages (2-10 employees)
- Regional MGAs
- These firms can't afford $100K/year enterprise solutions and the enterprise vendors won't serve them. They're doing everything manually.

### Existing Tools That Are NOT Competitors
- AMS platforms (Applied Epic, HawkSoft, etc.) — databases, not workflow automation. We complement them.
- Broker Buddha — Smart ACORD forms only, no document parsing or full workflow automation.
- EZLynx Submission Center — Basic submission tracking, no AI extraction.

---

## 11. REVENUE MODEL (For Reference)

**Target pricing:**
- Setup: $2,000 - $5,000 (onboarding, AMS configuration, branding)
- Monthly: $500 - $2,000/month based on submission volume
- Per-submission pricing option: $25 - $75 per submission processed

**ROI for client:**
- 50 submissions/month × 4 hours saved × $60/hour avg cost = $12,000/month in labor savings
- We charge $1,500/month = 8x ROI

---

## 12. PHASE 2 (FUTURE — NOT MVP)

After MVP is validated:
- Direct carrier portal integration (auto-submit to carrier websites)
- Quote parsing and comparison engine
- AI-generated proposal documents
- Renewal automation (auto-start process 90 days before expiration)
- Client self-service portal with digital signature
- Real-time carrier appetite matching
- API integrations with major AMS platforms
- COI (Certificate of Insurance) automation
