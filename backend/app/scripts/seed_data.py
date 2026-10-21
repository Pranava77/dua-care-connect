"""Demo data ported from the original frontend mock (src/lib/mockData.ts)."""

RESIDENTS = [
    dict(id="1", name="Alice Johnson", room_number="101", date_of_birth="1945-03-15",
         emergency_contact="John Johnson (555) 123-4567", medical_conditions=["Diabetes", "Hypertension"],
         created_at="2024-01-15T10:00:00Z"),
    dict(id="2", name="Robert Smith", room_number="102", date_of_birth="1938-07-22",
         emergency_contact="Mary Smith (555) 234-5678", medical_conditions=["Arthritis", "Heart Disease"],
         created_at="2024-01-16T10:00:00Z"),
    dict(id="3", name="Ethel Williams", room_number="103", date_of_birth="1952-11-08",
         emergency_contact="David Williams (555) 345-6789", medical_conditions=["Dementia", "Diabetes"],
         created_at="2024-01-17T10:00:00Z"),
    dict(id="4", name="Frank Brown", room_number="201", date_of_birth="1940-05-12",
         emergency_contact="Sarah Brown (555) 456-7890", medical_conditions=["Parkinson's", "Depression"],
         created_at="2024-01-18T10:00:00Z"),
    dict(id="5", name="Grace Davis", room_number="202", date_of_birth="1948-09-30",
         emergency_contact="Michael Davis (555) 567-8901", medical_conditions=["Osteoporosis", "Hypertension"],
         created_at="2024-01-19T10:00:00Z"),
]

STAFF = [
    dict(id="1", name="Dr. Sarah Wilson", position="Medical Director", department="Medical",
         email="sarah.wilson@silversync.com", phone="(555) 111-2222", hire_date="2020-01-15", salary=95000, status="active", created_at="2020-01-15T10:00:00Z"),
    dict(id="2", name="Nurse Jennifer Lee", position="Head Nurse", department="Medical",
         email="jennifer.lee@silversync.com", phone="(555) 222-3333", hire_date="2019-03-20", salary=52000, status="active", created_at="2019-03-20T10:00:00Z"),
    dict(id="3", name="Mike Rodriguez", position="Activities Coordinator", department="Recreation",
         email="mike.rodriguez@silversync.com", phone="(555) 333-4444", hire_date="2021-06-10", salary=31000, status="active", created_at="2021-06-10T10:00:00Z"),
    dict(id="4", name="Lisa Chen", position="Dietitian", department="Nutrition",
         email="lisa.chen@silversync.com", phone="(555) 444-5555", hire_date="2020-09-05", salary=38000, status="active", created_at="2020-09-05T10:00:00Z"),
    dict(id="5", name="Tom Anderson", position="Maintenance Supervisor", department="Facilities",
         email="tom.anderson@silversync.com", phone="(555) 555-6666", hire_date="2018-11-12", salary=34000, status="active", created_at="2018-11-12T10:00:00Z"),
]

MEDICAL_RECORDS = [
    dict(id="1", resident_id="1", diagnosis="Diabetes Type 2", treatment="Metformin 500mg twice daily",
         last_check_date="2024-01-20", doctor="Dr. Sarah Wilson",
         notes="Blood sugar levels stable, continue current treatment", created_at="2024-01-20T10:00:00Z"),
    dict(id="2", resident_id="2", diagnosis="Heart Disease", treatment="Lisinopril 10mg daily",
         last_check_date="2024-01-18", doctor="Dr. Sarah Wilson", notes="Blood pressure well controlled",
         created_at="2024-01-18T10:00:00Z"),
    dict(id="3", resident_id="3", diagnosis="Dementia", treatment="Donepezil 5mg daily",
         last_check_date="2024-01-15", doctor="Dr. Sarah Wilson",
         notes="Cognitive function stable, family notified of progress", created_at="2024-01-15T10:00:00Z"),
]

PRESCRIPTIONS = [
    dict(id="1", resident_id="1", medication="Metformin", dosage="500mg", frequency="Twice daily",
         refill_date="2024-02-15", prescribing_doctor="Dr. Sarah Wilson", created_at="2024-01-15T10:00:00Z"),
    dict(id="2", resident_id="2", medication="Lisinopril", dosage="10mg", frequency="Once daily",
         refill_date="2024-02-10", prescribing_doctor="Dr. Sarah Wilson", created_at="2024-01-10T10:00:00Z"),
    dict(id="3", resident_id="3", medication="Donepezil", dosage="5mg", frequency="Once daily",
         refill_date="2024-02-20", prescribing_doctor="Dr. Sarah Wilson", created_at="2024-01-20T10:00:00Z"),
]

LEAVE_REQUESTS = [
    dict(id="1", staff_id="2", from_date="2024-02-01", to_date="2024-02-03", reason="Family emergency",
         status="approved", created_at="2024-01-25T10:00:00Z"),
    dict(id="2", staff_id="3", from_date="2024-02-10", to_date="2024-02-12", reason="Vacation",
         status="pending", created_at="2024-01-28T10:00:00Z"),
    dict(id="3", staff_id="4", from_date="2024-02-15", to_date="2024-02-17", reason="Medical appointment",
         status="approved", created_at="2024-01-30T10:00:00Z"),
]

# Text bodies give the document Q&A something to read. They are fictional demo content.
DOCUMENT_TEXT = {
    "1": """ADMISSION FORM — SilverSync Residential Care
Resident: Alice Johnson   Date of birth: 15 March 1945   Room: 101   Admitted: 15 January 2024
Next of kin: John Johnson (son), (555) 123-4567
Reason for admission: increasing difficulty managing diabetes independently following a fall at home.
Medical history: Type 2 diabetes (diagnosed 2009), hypertension, cataract surgery (2019).
Allergies: penicillin (rash).
Mobility: walks with a frame; requires assistance on stairs. Falls risk: medium.
Diet: diabetic diet, no added sugar. Prefers vegetarian meals on weekdays.
Care preferences: likes morning showers, enjoys gardening and crossword puzzles.
GP: Dr. Patel, Riverside Surgery.""",
    "3": """CONSENT FORM — Medical Procedures
Resident: Ethel Williams   Room: 103
Procedure: seasonal influenza vaccination and routine blood tests (HbA1c, renal function) every 3 months.
Because the resident has a diagnosis of dementia, consent is sought from the holder of Lasting Power of
Attorney for health and welfare: David Williams (son).
Status: awaiting signature from David Williams. Form sent by post on 17 January 2024.
Please return the signed form before 1 February 2024 so the vaccination can be scheduled.""",
    "4": """SERVICE AGREEMENT
Between SilverSync Residential Care ("the Home") and Frank Brown ("the Resident"), represented by Sarah Brown.
Start date: 18 January 2024. Room: 201 (single, ensuite).
Weekly fee: £3,700, invoiced monthly in advance and payable within 30 days.
Included: accommodation, meals, laundry, 24-hour nursing care, activities programme.
Not included: hairdressing, chiropody, private physiotherapy, newspapers.
Notice period: 28 days written notice by either party. Fees are reviewed annually each April.
Signed: Sarah Brown (daughter, attorney) and Tom Anderson on behalf of the Home.""",
    "6": """LABORATORY REPORT — Riverside Pathology
Patient: Alice Johnson   DOB: 15/03/1945   Sample date: 19 January 2024   Requested by: Dr. Sarah Wilson
HbA1c: 58 mmol/mol (7.5%)  [target < 53]  — slightly above target
Fasting glucose: 7.8 mmol/L  [3.9–5.5]  — high
eGFR: 62 mL/min/1.73m²  [> 60]  — normal
Total cholesterol: 4.6 mmol/L  [< 5.0]  — normal
Potassium: 4.3 mmol/L  [3.5–5.3]  — normal
Comment: glycaemic control slightly above target. Suggest review of diabetes management at next visit
and repeat HbA1c in 3 months.""",
}

DOCUMENTS = [
    dict(id="1", name="Admission Form - Alice Johnson", category="Admission", file_type="TXT", file_size="0.8 KB",
         uploaded_by="Dr. Sarah Wilson", resident_id="1", status="Verified", uploaded_at="2024-01-15T10:00:00Z",
         description="Complete admission form with medical history"),
    dict(id="2", name="Aadhaar Card - Robert Smith", category="KYC", file_type="PDF", file_size="1.8 MB",
         uploaded_by="Nurse Jennifer Lee", resident_id="2", status="Verified", uploaded_at="2024-01-16T10:00:00Z",
         description="Government ID verification document"),
    dict(id="3", name="Medical Consent - Ethel Williams", category="Consent", file_type="TXT", file_size="0.5 KB",
         uploaded_by="Dr. Sarah Wilson", resident_id="3", status="Pending", uploaded_at="2024-01-17T10:00:00Z",
         description="Consent for medical procedures"),
    dict(id="4", name="Service Contract - Frank Brown", category="Contract", file_type="TXT", file_size="0.7 KB",
         uploaded_by="Tom Anderson", resident_id="4", status="Active", uploaded_at="2024-01-18T10:00:00Z",
         description="Service agreement and terms"),
    dict(id="5", name="Payment Receipt - Grace Davis", category="Financial", file_type="PDF", file_size="0.8 MB",
         uploaded_by="Lisa Chen", resident_id="5", status="Paid", uploaded_at="2024-01-19T10:00:00Z",
         description="Monthly payment receipt"),
    dict(id="6", name="Lab Report - Alice Johnson", category="Medical", file_type="TXT", file_size="0.6 KB",
         uploaded_by="Dr. Sarah Wilson", resident_id="1", status="Verified", uploaded_at="2024-01-20T10:00:00Z",
         description="Blood test results"),
]

INVOICES = [
    dict(id="1", invoice_number="INV-001", resident_id="1", amount=15000, currency="GBP", status="Paid",
         due_date="2024-01-31", created_at="2024-01-01T10:00:00Z", paid_at="2024-01-15T10:00:00Z", payment_method="UPI",
         services=[{"name": "Room Charges", "amount": 10000, "description": "Monthly room rent"},
                   {"name": "Nursing Care", "amount": 3000, "description": "24/7 nursing services"},
                   {"name": "Meals", "amount": 2000, "description": "Daily meals"}],
         notes="Monthly invoice for January 2024"),
    dict(id="2", invoice_number="INV-002", resident_id="2", amount=18500, currency="GBP", status="Pending",
         due_date="2024-02-15", created_at="2024-01-15T10:00:00Z",
         services=[{"name": "Room Charges", "amount": 12000, "description": "Monthly room rent"},
                   {"name": "Medical Services", "amount": 4000, "description": "Doctor consultations"},
                   {"name": "Medications", "amount": 2500, "description": "Prescribed medications"}],
         notes="Monthly invoice for February 2024"),
    dict(id="3", invoice_number="INV-003", resident_id="3", amount=22000, currency="GBP", status="Overdue",
         due_date="2024-01-15", created_at="2023-12-15T10:00:00Z",
         services=[{"name": "Room Charges", "amount": 15000, "description": "Monthly room rent"},
                   {"name": "Special Care", "amount": 5000, "description": "Dementia care services"},
                   {"name": "Therapy", "amount": 2000, "description": "Physical therapy sessions"}],
         notes="Monthly invoice for December 2023"),
    dict(id="4", invoice_number="INV-004", resident_id="4", amount=16000, currency="GBP", status="Paid",
         due_date="2024-01-30", created_at="2024-01-01T10:00:00Z", paid_at="2024-01-28T10:00:00Z", payment_method="Card",
         services=[{"name": "Room Charges", "amount": 11000, "description": "Monthly room rent"},
                   {"name": "Nursing Care", "amount": 3000, "description": "24/7 nursing services"},
                   {"name": "Meals", "amount": 2000, "description": "Daily meals"}],
         notes="Monthly invoice for January 2024"),
    dict(id="5", invoice_number="INV-005", resident_id="5", amount=19500, currency="GBP", status="Paid",
         due_date="2024-02-01", created_at="2024-01-15T10:00:00Z", paid_at="2024-01-30T10:00:00Z", payment_method="NEFT",
         services=[{"name": "Room Charges", "amount": 13000, "description": "Monthly room rent"},
                   {"name": "Nursing Care", "amount": 3500, "description": "24/7 nursing services"},
                   {"name": "Meals", "amount": 2000, "description": "Daily meals"},
                   {"name": "Medications", "amount": 1000, "description": "Prescribed medications"}],
         notes="Monthly invoice for February 2024"),
]

PAYMENTS = [
    dict(id="1", invoice_id="1", amount=15000, payment_method="UPI", transaction_id="TXN123456789",
         payment_date="2024-01-15T10:00:00Z", processed_by="Dr. Sarah Wilson", notes="Payment received via UPI"),
    dict(id="2", invoice_id="4", amount=16000, payment_method="Card", transaction_id="TXN987654321",
         payment_date="2024-01-28T10:00:00Z", processed_by="Lisa Chen", notes="Payment received via credit card"),
    dict(id="3", invoice_id="5", amount=19500, payment_method="NEFT", transaction_id="NEFT456789123",
         payment_date="2024-01-30T10:00:00Z", processed_by="Tom Anderson", notes="Payment received via NEFT transfer"),
]

REPORTS = [
    dict(id="1", name="Resident Management Report", category="Operational", type="residents", period="Monthly",
         last_generated="2024-01-01T10:00:00Z", next_scheduled="2024-02-01T10:00:00Z", status="Active",
         file_path="/reports/residents-2024-01.pdf", parameters={"month": "January", "year": 2024}),
    dict(id="2", name="Financial Report", category="Financial", type="financial", period="Monthly",
         last_generated="2024-01-01T10:00:00Z", next_scheduled="2024-02-01T10:00:00Z", status="Active",
         file_path="/reports/financial-2024-01.pdf", parameters={"month": "January", "year": 2024}),
    dict(id="3", name="Medical Records Report", category="Clinical", type="medical", period="Weekly",
         last_generated="2024-01-29T10:00:00Z", next_scheduled="2024-02-05T10:00:00Z", status="Active",
         file_path="/reports/prescriptions-2024-w05.pdf", parameters={"week": 5, "year": 2024}),
    dict(id="4", name="Attendance Report", category="HR", type="Monthly", period="Monthly",
         last_generated="2024-01-01T10:00:00Z", next_scheduled="2024-02-01T10:00:00Z", status="Active",
         file_path="/reports/attendance-2024-01.pdf", parameters={"month": "January", "year": 2024}),
    dict(id="5", name="Medical Alerts Report", category="Clinical", type="Daily", period="Daily",
         last_generated="2024-01-30T10:00:00Z", next_scheduled="2024-01-31T10:00:00Z", status="Active",
         file_path="/reports/alerts-2024-01-30.pdf", parameters={"date": "2024-01-30"}),
]

# One login per role. Emails contain the role, matching how the old mock login picked roles.
USERS = [
    dict(email="admin@silversync.com", name="Admin User", role="admin"),
    dict(email="doctor@silversync.com", name="Dr. Sarah Wilson", role="doctor"),
    dict(email="nurse@silversync.com", name="Nurse Jennifer Lee", role="nurse"),
    dict(email="accountant@silversync.com", name="Lisa Accounts", role="accountant"),
    dict(email="hr@silversync.com", name="Hannah HR", role="hr"),
    dict(email="receptionist@silversync.com", name="Rita Reception", role="receptionist"),
]
