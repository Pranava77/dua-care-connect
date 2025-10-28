// Mock data for the application
import { User, UserRole, ROLE_PERMISSIONS } from './rbac';

export interface MockUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: string[];
  isActive: boolean;
  lastLogin?: string;
}

export interface MockResident {
  id: string;
  name: string;
  room_number: string;
  date_of_birth: string;
  emergency_contact: string;
  medical_conditions: string[];
  created_at: string;
}

export interface MockStaff {
  id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  hire_date: string;
  created_at: string;
}

export interface MockMedicalRecord {
  id: string;
  resident_id: string;
  residents: { name: string };
  diagnosis: string;
  treatment: string;
  last_check_date: string;
  doctor: string;
  notes: string;
  created_at: string;
}

export interface MockPrescription {
  id: string;
  resident_id: string;
  residents: { name: string };
  medication: string;
  dosage: string;
  frequency: string;
  refill_date: string;
  prescribing_doctor: string;
  created_at: string;
}

export interface MockLeaveRequest {
  id: string;
  staff_id: string;
  staff: { name: string };
  from_date: string;
  to_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface MockDocument {
  id: string;
  name: string;
  category: 'Admission' | 'KYC' | 'Consent' | 'Contract' | 'Financial' | 'Medical';
  file_type: string;
  file_size: string;
  uploaded_by: string;
  resident_id?: string;
  resident_name?: string;
  status: 'Verified' | 'Pending' | 'Active' | 'Paid' | 'Rejected';
  uploaded_at: string;
  description?: string;
  file_data?: string; // Base64 encoded file data
}

export interface MockInvoice {
  id: string;
  invoice_number: string;
  resident_id: string;
  resident_name: string;
  amount: number;
  currency: string;
  status: 'Paid' | 'Pending' | 'Overdue' | 'Cancelled';
  due_date: string;
  created_at: string;
  paid_at?: string;
  payment_method?: 'UPI' | 'Card' | 'NEFT' | 'Cash' | 'Cheque';
  services: {
    name: string;
    amount: number;
    description?: string;
  }[];
  notes?: string;
}

export interface MockPayment {
  id: string;
  invoice_id: string;
  amount: number;
  payment_method: 'UPI' | 'Card' | 'NEFT' | 'Cash' | 'Cheque';
  transaction_id?: string;
  payment_date: string;
  processed_by: string;
  notes?: string;
}

export interface MockReport {
  id: string;
  name: string;
  category: 'Operational' | 'Financial' | 'Clinical' | 'HR';
  type: string;
  period: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly';
  last_generated: string;
  next_scheduled?: string;
  status: 'Active' | 'Inactive' | 'Pending';
  file_path?: string;
  parameters?: Record<string, any>;
}

// Mock data arrays
export const mockResidents: MockResident[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    room_number: '101',
    date_of_birth: '1945-03-15',
    emergency_contact: 'John Johnson (555) 123-4567',
    medical_conditions: ['Diabetes', 'Hypertension'],
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Robert Smith',
    room_number: '102',
    date_of_birth: '1938-07-22',
    emergency_contact: 'Mary Smith (555) 234-5678',
    medical_conditions: ['Arthritis', 'Heart Disease'],
    created_at: '2024-01-16T10:00:00Z'
  },
  {
    id: '3',
    name: 'Ethel Williams',
    room_number: '103',
    date_of_birth: '1952-11-08',
    emergency_contact: 'David Williams (555) 345-6789',
    medical_conditions: ['Dementia', 'Diabetes'],
    created_at: '2024-01-17T10:00:00Z'
  },
  {
    id: '4',
    name: 'Frank Brown',
    room_number: '201',
    date_of_birth: '1940-05-12',
    emergency_contact: 'Sarah Brown (555) 456-7890',
    medical_conditions: ['Parkinson\'s', 'Depression'],
    created_at: '2024-01-18T10:00:00Z'
  },
  {
    id: '5',
    name: 'Grace Davis',
    room_number: '202',
    date_of_birth: '1948-09-30',
    emergency_contact: 'Michael Davis (555) 567-8901',
    medical_conditions: ['Osteoporosis', 'Hypertension'],
    created_at: '2024-01-19T10:00:00Z'
  }
];

export const mockStaff: MockStaff[] = [
  {
    id: '1',
    name: 'Dr. Sarah Wilson',
    position: 'Medical Director',
    department: 'Medical',
    email: 'sarah.wilson@silversync.com',
    phone: '(555) 111-2222',
    hire_date: '2020-01-15',
    created_at: '2020-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Nurse Jennifer Lee',
    position: 'Head Nurse',
    department: 'Medical',
    email: 'jennifer.lee@silversync.com',
    phone: '(555) 222-3333',
    hire_date: '2019-03-20',
    created_at: '2019-03-20T10:00:00Z'
  },
  {
    id: '3',
    name: 'Mike Rodriguez',
    position: 'Activities Coordinator',
    department: 'Recreation',
    email: 'mike.rodriguez@silversync.com',
    phone: '(555) 333-4444',
    hire_date: '2021-06-10',
    created_at: '2021-06-10T10:00:00Z'
  },
  {
    id: '4',
    name: 'Lisa Chen',
    position: 'Dietitian',
    department: 'Nutrition',
    email: 'lisa.chen@silversync.com',
    phone: '(555) 444-5555',
    hire_date: '2020-09-05',
    created_at: '2020-09-05T10:00:00Z'
  },
  {
    id: '5',
    name: 'Tom Anderson',
    position: 'Maintenance Supervisor',
    department: 'Facilities',
    email: 'tom.anderson@silversync.com',
    phone: '(555) 555-6666',
    hire_date: '2018-11-12',
    created_at: '2018-11-12T10:00:00Z'
  }
];

export const mockMedicalRecords: MockMedicalRecord[] = [
  {
    id: '1',
    resident_id: '1',
    residents: { name: 'Alice Johnson' },
    diagnosis: 'Diabetes Type 2',
    treatment: 'Metformin 500mg twice daily',
    last_check_date: '2024-01-20',
    doctor: 'Dr. Sarah Wilson',
    notes: 'Blood sugar levels stable, continue current treatment',
    created_at: '2024-01-20T10:00:00Z'
  },
  {
    id: '2',
    resident_id: '2',
    residents: { name: 'Robert Smith' },
    diagnosis: 'Heart Disease',
    treatment: 'Lisinopril 10mg daily',
    last_check_date: '2024-01-18',
    doctor: 'Dr. Sarah Wilson',
    notes: 'Blood pressure well controlled',
    created_at: '2024-01-18T10:00:00Z'
  },
  {
    id: '3',
    resident_id: '3',
    residents: { name: 'Ethel Williams' },
    diagnosis: 'Dementia',
    treatment: 'Donepezil 5mg daily',
    last_check_date: '2024-01-15',
    doctor: 'Dr. Sarah Wilson',
    notes: 'Cognitive function stable, family notified of progress',
    created_at: '2024-01-15T10:00:00Z'
  }
];

export const mockPrescriptions: MockPrescription[] = [
  {
    id: '1',
    resident_id: '1',
    residents: { name: 'Alice Johnson' },
    medication: 'Metformin',
    dosage: '500mg',
    frequency: 'Twice daily',
    refill_date: '2024-02-15',
    prescribing_doctor: 'Dr. Sarah Wilson',
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    resident_id: '2',
    residents: { name: 'Robert Smith' },
    medication: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Once daily',
    refill_date: '2024-02-10',
    prescribing_doctor: 'Dr. Sarah Wilson',
    created_at: '2024-01-10T10:00:00Z'
  },
  {
    id: '3',
    resident_id: '3',
    residents: { name: 'Ethel Williams' },
    medication: 'Donepezil',
    dosage: '5mg',
    frequency: 'Once daily',
    refill_date: '2024-02-20',
    prescribing_doctor: 'Dr. Sarah Wilson',
    created_at: '2024-01-20T10:00:00Z'
  }
];

export const mockLeaveRequests: MockLeaveRequest[] = [
  {
    id: '1',
    staff_id: '2',
    staff: { name: 'Nurse Jennifer Lee' },
    from_date: '2024-02-01',
    to_date: '2024-02-03',
    reason: 'Family emergency',
    status: 'approved',
    created_at: '2024-01-25T10:00:00Z'
  },
  {
    id: '2',
    staff_id: '3',
    staff: { name: 'Mike Rodriguez' },
    from_date: '2024-02-10',
    to_date: '2024-02-12',
    reason: 'Vacation',
    status: 'pending',
    created_at: '2024-01-28T10:00:00Z'
  },
  {
    id: '3',
    staff_id: '4',
    staff: { name: 'Lisa Chen' },
    from_date: '2024-02-15',
    to_date: '2024-02-17',
    reason: 'Medical appointment',
    status: 'approved',
    created_at: '2024-01-30T10:00:00Z'
  }
];

export const mockDocuments: MockDocument[] = [
  {
    id: '1',
    name: 'Admission Form - Alice Johnson',
    category: 'Admission',
    file_type: 'PDF',
    file_size: '2.3 MB',
    uploaded_by: 'Dr. Sarah Wilson',
    resident_id: '1',
    resident_name: 'Alice Johnson',
    status: 'Verified',
    uploaded_at: '2024-01-15T10:00:00Z',
    description: 'Complete admission form with medical history'
  },
  {
    id: '2',
    name: 'Aadhaar Card - Robert Smith',
    category: 'KYC',
    file_type: 'PDF',
    file_size: '1.8 MB',
    uploaded_by: 'Nurse Jennifer Lee',
    resident_id: '2',
    resident_name: 'Robert Smith',
    status: 'Verified',
    uploaded_at: '2024-01-16T10:00:00Z',
    description: 'Government ID verification document'
  },
  {
    id: '3',
    name: 'Medical Consent - Ethel Williams',
    category: 'Consent',
    file_type: 'PDF',
    file_size: '1.2 MB',
    uploaded_by: 'Dr. Sarah Wilson',
    resident_id: '3',
    resident_name: 'Ethel Williams',
    status: 'Pending',
    uploaded_at: '2024-01-17T10:00:00Z',
    description: 'Consent for medical procedures'
  },
  {
    id: '4',
    name: 'Service Contract - Frank Brown',
    category: 'Contract',
    file_type: 'PDF',
    file_size: '3.1 MB',
    uploaded_by: 'Tom Anderson',
    resident_id: '4',
    resident_name: 'Frank Brown',
    status: 'Active',
    uploaded_at: '2024-01-18T10:00:00Z',
    description: 'Service agreement and terms'
  },
  {
    id: '5',
    name: 'Payment Receipt - Grace Davis',
    category: 'Financial',
    file_type: 'PDF',
    file_size: '0.8 MB',
    uploaded_by: 'Lisa Chen',
    resident_id: '5',
    resident_name: 'Grace Davis',
    status: 'Paid',
    uploaded_at: '2024-01-19T10:00:00Z',
    description: 'Monthly payment receipt'
  },
  {
    id: '6',
    name: 'Lab Report - Alice Johnson',
    category: 'Medical',
    file_type: 'PDF',
    file_size: '1.5 MB',
    uploaded_by: 'Dr. Sarah Wilson',
    resident_id: '1',
    resident_name: 'Alice Johnson',
    status: 'Verified',
    uploaded_at: '2024-01-20T10:00:00Z',
    description: 'Blood test results'
  }
];

export const mockInvoices: MockInvoice[] = [
  {
    id: '1',
    invoice_number: 'INV-001',
    resident_id: '1',
    resident_name: 'Alice Johnson',
    amount: 15000,
    currency: 'INR',
    status: 'Paid',
    due_date: '2024-01-31',
    created_at: '2024-01-01T10:00:00Z',
    paid_at: '2024-01-15T10:00:00Z',
    payment_method: 'UPI',
    services: [
      { name: 'Room Charges', amount: 10000, description: 'Monthly room rent' },
      { name: 'Nursing Care', amount: 3000, description: '24/7 nursing services' },
      { name: 'Meals', amount: 2000, description: 'Daily meals' }
    ],
    notes: 'Monthly invoice for January 2024'
  },
  {
    id: '2',
    invoice_number: 'INV-002',
    resident_id: '2',
    resident_name: 'Robert Smith',
    amount: 18500,
    currency: 'INR',
    status: 'Pending',
    due_date: '2024-02-15',
    created_at: '2024-01-15T10:00:00Z',
    services: [
      { name: 'Room Charges', amount: 12000, description: 'Monthly room rent' },
      { name: 'Medical Services', amount: 4000, description: 'Doctor consultations' },
      { name: 'Medications', amount: 2500, description: 'Prescribed medications' }
    ],
    notes: 'Monthly invoice for February 2024'
  },
  {
    id: '3',
    invoice_number: 'INV-003',
    resident_id: '3',
    resident_name: 'Ethel Williams',
    amount: 22000,
    currency: 'INR',
    status: 'Overdue',
    due_date: '2024-01-15',
    created_at: '2023-12-15T10:00:00Z',
    services: [
      { name: 'Room Charges', amount: 15000, description: 'Monthly room rent' },
      { name: 'Special Care', amount: 5000, description: 'Dementia care services' },
      { name: 'Therapy', amount: 2000, description: 'Physical therapy sessions' }
    ],
    notes: 'Monthly invoice for December 2023'
  },
  {
    id: '4',
    invoice_number: 'INV-004',
    resident_id: '4',
    resident_name: 'Frank Brown',
    amount: 16000,
    currency: 'INR',
    status: 'Paid',
    due_date: '2024-01-30',
    created_at: '2024-01-01T10:00:00Z',
    paid_at: '2024-01-28T10:00:00Z',
    payment_method: 'Card',
    services: [
      { name: 'Room Charges', amount: 11000, description: 'Monthly room rent' },
      { name: 'Nursing Care', amount: 3000, description: '24/7 nursing services' },
      { name: 'Meals', amount: 2000, description: 'Daily meals' }
    ],
    notes: 'Monthly invoice for January 2024'
  },
  {
    id: '5',
    invoice_number: 'INV-005',
    resident_id: '5',
    resident_name: 'Grace Davis',
    amount: 19500,
    currency: 'INR',
    status: 'Paid',
    due_date: '2024-02-01',
    created_at: '2024-01-15T10:00:00Z',
    paid_at: '2024-01-30T10:00:00Z',
    payment_method: 'NEFT',
    services: [
      { name: 'Room Charges', amount: 13000, description: 'Monthly room rent' },
      { name: 'Nursing Care', amount: 3500, description: '24/7 nursing services' },
      { name: 'Meals', amount: 2000, description: 'Daily meals' },
      { name: 'Medications', amount: 1000, description: 'Prescribed medications' }
    ],
    notes: 'Monthly invoice for February 2024'
  }
];

export const mockPayments: MockPayment[] = [
  {
    id: '1',
    invoice_id: '1',
    amount: 15000,
    payment_method: 'UPI',
    transaction_id: 'TXN123456789',
    payment_date: '2024-01-15T10:00:00Z',
    processed_by: 'Dr. Sarah Wilson',
    notes: 'Payment received via UPI'
  },
  {
    id: '2',
    invoice_id: '4',
    amount: 16000,
    payment_method: 'Card',
    transaction_id: 'TXN987654321',
    payment_date: '2024-01-28T10:00:00Z',
    processed_by: 'Lisa Chen',
    notes: 'Payment received via credit card'
  },
  {
    id: '3',
    invoice_id: '5',
    amount: 19500,
    payment_method: 'NEFT',
    transaction_id: 'NEFT456789123',
    payment_date: '2024-01-30T10:00:00Z',
    processed_by: 'Tom Anderson',
    notes: 'Payment received via NEFT transfer'
  }
];

export const mockReports: MockReport[] = [
  {
    id: '1',
    name: 'Resident Management Report',
    category: 'Operational',
    type: 'residents',
    period: 'Monthly',
    last_generated: '2024-01-01T10:00:00Z',
    next_scheduled: '2024-02-01T10:00:00Z',
    status: 'Active',
    file_path: '/reports/residents-2024-01.pdf',
    parameters: { month: 'January', year: 2024 }
  },
  {
    id: '2',
    name: 'Financial Report',
    category: 'Financial',
    type: 'financial',
    period: 'Monthly',
    last_generated: '2024-01-01T10:00:00Z',
    next_scheduled: '2024-02-01T10:00:00Z',
    status: 'Active',
    file_path: '/reports/financial-2024-01.pdf',
    parameters: { month: 'January', year: 2024 }
  },
  {
    id: '3',
    name: 'Medical Records Report',
    category: 'Clinical',
    type: 'medical',
    period: 'Weekly',
    last_generated: '2024-01-29T10:00:00Z',
    next_scheduled: '2024-02-05T10:00:00Z',
    status: 'Active',
    file_path: '/reports/prescriptions-2024-w05.pdf',
    parameters: { week: 5, year: 2024 }
  },
  {
    id: '4',
    name: 'Attendance Report',
    category: 'HR',
    type: 'Monthly',
    period: 'Monthly',
    last_generated: '2024-01-01T10:00:00Z',
    next_scheduled: '2024-02-01T10:00:00Z',
    status: 'Active',
    file_path: '/reports/attendance-2024-01.pdf',
    parameters: { month: 'January', year: 2024 }
  },
  {
    id: '5',
    name: 'Medical Alerts Report',
    category: 'Clinical',
    type: 'Daily',
    period: 'Daily',
    last_generated: '2024-01-30T10:00:00Z',
    next_scheduled: '2024-01-31T10:00:00Z',
    status: 'Active',
    file_path: '/reports/alerts-2024-01-30.pdf',
    parameters: { date: '2024-01-30' }
  }
];

// Mock API functions that simulate async database calls
export const mockApi = {
  // Authentication
  async signIn(email: string, password: string) {
    // Simple mock - any email/password combination works
    const role: UserRole = email.includes('admin') ? 'admin' : 
                          email.includes('doctor') ? 'doctor' :
                          email.includes('nurse') ? 'nurse' :
                          email.includes('accountant') ? 'accountant' :
                          email.includes('hr') ? 'hr' : 'receptionist';
    
    const user: User = {
      id: 'mock-user-1',
      email: email,
      name: email.split('@')[0],
      role: role,
      permissions: ROLE_PERMISSIONS[role],
      isActive: true,
      lastLogin: new Date().toISOString()
    };
    
    return {
      data: {
        user: user,
        session: {
          access_token: 'mock-token',
          user: user
        }
      },
      error: null
    };
  },

  async signUp(email: string, password: string) {
    const role: UserRole = 'receptionist'; // Default role for new users
    
    const user: User = {
      id: 'mock-user-1',
      email: email,
      name: email.split('@')[0],
      role: role,
      permissions: ROLE_PERMISSIONS[role],
      isActive: true,
      lastLogin: new Date().toISOString()
    };
    
    return {
      data: {
        user: user,
        session: {
          access_token: 'mock-token',
          user: user
        }
      },
      error: null
    };
  },

  async getSession() {
    const session = localStorage.getItem('mock-session');
    return {
      data: {
        session: session ? JSON.parse(session) : null
      },
      error: null
    };
  },

  async signOut() {
    localStorage.removeItem('mock-session');
    return { error: null };
  },

  // Data fetching functions
  async getResidents() {
    return {
      data: mockResidents,
      error: null,
      count: mockResidents.length
    };
  },

  async getStaff() {
    return {
      data: mockStaff,
      error: null,
      count: mockStaff.length
    };
  },

  async getMedicalRecords() {
    return {
      data: mockMedicalRecords,
      error: null,
      count: mockMedicalRecords.length
    };
  },

  async getPrescriptions() {
    return {
      data: mockPrescriptions,
      error: null,
      count: mockPrescriptions.length
    };
  },

  async getLeaveRequests() {
    return {
      data: mockLeaveRequests,
      error: null,
      count: mockLeaveRequests.length
    };
  },

  async getRecentResidents() {
    return {
      data: mockResidents.slice(0, 3),
      error: null
    };
  },

  async getRecentPrescriptions() {
    return {
      data: mockPrescriptions.slice(0, 3),
      error: null
    };
  },

  // Insert functions
  async insertResident(resident: Omit<MockResident, 'id' | 'created_at'>) {
    const newResident: MockResident = {
      ...resident,
      id: (mockResidents.length + 1).toString(),
      created_at: new Date().toISOString()
    };
    mockResidents.push(newResident);
    return {
      data: newResident,
      error: null
    };
  },

  async insertStaff(staff: Omit<MockStaff, 'id' | 'created_at'>) {
    const newStaff: MockStaff = {
      ...staff,
      id: (mockStaff.length + 1).toString(),
      created_at: new Date().toISOString()
    };
    mockStaff.push(newStaff);
    return {
      data: newStaff,
      error: null
    };
  },

  async updateResident(id: string, updates: Partial<MockResident>) {
    const index = mockResidents.findIndex(resident => resident.id === id);
    if (index > -1) {
      mockResidents[index] = { ...mockResidents[index], ...updates };
      return {
        data: mockResidents[index],
        error: null
      };
    }
    return { error: new Error('Resident not found') };
  },

  async deleteResident(id: string) {
    const index = mockResidents.findIndex(resident => resident.id === id);
    if (index > -1) {
      mockResidents.splice(index, 1);
      // Also remove related data
      const medicalIndex = mockMedicalRecords.findIndex(record => record.resident_id === id);
      if (medicalIndex > -1) mockMedicalRecords.splice(medicalIndex, 1);
      
      const prescriptionIndex = mockPrescriptions.findIndex(prescription => prescription.resident_id === id);
      if (prescriptionIndex > -1) mockPrescriptions.splice(prescriptionIndex, 1);
      
      const invoiceIndex = mockInvoices.findIndex(invoice => invoice.resident_id === id);
      if (invoiceIndex > -1) mockInvoices.splice(invoiceIndex, 1);
      
      const documentIndex = mockDocuments.findIndex(doc => doc.resident_id === id);
      if (documentIndex > -1) mockDocuments.splice(documentIndex, 1);
      
      return { error: null };
    }
    return { error: new Error('Resident not found') };
  },

  async updateStaff(id: string, updates: Partial<MockStaff>) {
    const index = mockStaff.findIndex(staff => staff.id === id);
    if (index > -1) {
      mockStaff[index] = { ...mockStaff[index], ...updates };
      return {
        data: mockStaff[index],
        error: null
      };
    }
    return { error: new Error('Staff member not found') };
  },

  async deleteStaff(id: string) {
    const index = mockStaff.findIndex(staff => staff.id === id);
    if (index > -1) {
      mockStaff.splice(index, 1);
      return { error: null };
    }
    return { error: new Error('Staff member not found') };
  },

  // Medical record functions
  async insertMedicalRecord(record: Omit<MockMedicalRecord, 'id' | 'created_at'>) {
    const newRecord: MockMedicalRecord = {
      ...record,
      id: (mockMedicalRecords.length + 1).toString(),
      created_at: new Date().toISOString()
    };
    mockMedicalRecords.push(newRecord);
    return {
      data: newRecord,
      error: null
    };
  },

  async updateMedicalRecord(id: string, updates: Partial<MockMedicalRecord>) {
    const index = mockMedicalRecords.findIndex(record => record.id === id);
    if (index > -1) {
      mockMedicalRecords[index] = { ...mockMedicalRecords[index], ...updates };
      return {
        data: mockMedicalRecords[index],
        error: null
      };
    }
    return { error: new Error('Medical record not found') };
  },

  async deleteMedicalRecord(id: string) {
    const index = mockMedicalRecords.findIndex(record => record.id === id);
    if (index > -1) {
      mockMedicalRecords.splice(index, 1);
      return { error: null };
    }
    return { error: new Error('Medical record not found') };
  },

  // Prescription functions
  async insertPrescription(prescription: Omit<MockPrescription, 'id' | 'created_at'>) {
    const newPrescription: MockPrescription = {
      ...prescription,
      id: (mockPrescriptions.length + 1).toString(),
      created_at: new Date().toISOString()
    };
    mockPrescriptions.push(newPrescription);
    return {
      data: newPrescription,
      error: null
    };
  },

  async updatePrescription(id: string, updates: Partial<MockPrescription>) {
    const index = mockPrescriptions.findIndex(prescription => prescription.id === id);
    if (index > -1) {
      mockPrescriptions[index] = { ...mockPrescriptions[index], ...updates };
      return {
        data: mockPrescriptions[index],
        error: null
      };
    }
    return { error: new Error('Prescription not found') };
  },

  async deletePrescription(id: string) {
    const index = mockPrescriptions.findIndex(prescription => prescription.id === id);
    if (index > -1) {
      mockPrescriptions.splice(index, 1);
      return { error: null };
    }
    return { error: new Error('Prescription not found') };
  },

  // Document functions
  async getDocuments() {
    return {
      data: mockDocuments,
      error: null,
      count: mockDocuments.length
    };
  },

  async uploadDocument(document: Omit<MockDocument, 'id' | 'uploaded_at'>) {
    const newDocument: MockDocument = {
      ...document,
      id: (mockDocuments.length + 1).toString(),
      uploaded_at: new Date().toISOString()
    };
    mockDocuments.push(newDocument);
    return {
      data: newDocument,
      error: null
    };
  },

  async deleteDocument(id: string) {
    const index = mockDocuments.findIndex(doc => doc.id === id);
    if (index > -1) {
      mockDocuments.splice(index, 1);
      return { error: null };
    }
    return { error: new Error('Document not found') };
  },

  // Invoice functions
  async getInvoices() {
    return {
      data: mockInvoices,
      error: null,
      count: mockInvoices.length
    };
  },

  async createInvoice(invoice: Omit<MockInvoice, 'id' | 'created_at'>) {
    const newInvoice: MockInvoice = {
      ...invoice,
      id: (mockInvoices.length + 1).toString(),
      created_at: new Date().toISOString()
    };
    mockInvoices.push(newInvoice);
    return {
      data: newInvoice,
      error: null
    };
  },

  async updateInvoice(id: string, updates: Partial<MockInvoice>) {
    const index = mockInvoices.findIndex(invoice => invoice.id === id);
    if (index > -1) {
      mockInvoices[index] = { ...mockInvoices[index], ...updates };
      return {
        data: mockInvoices[index],
        error: null
      };
    }
    return { error: new Error('Invoice not found') };
  },

  async deleteInvoice(id: string) {
    const index = mockInvoices.findIndex(invoice => invoice.id === id);
    if (index > -1) {
      mockInvoices.splice(index, 1);
      return { error: null };
    }
    return { error: new Error('Invoice not found') };
  },

  async recordPayment(payment: Omit<MockPayment, 'id'>) {
    const newPayment: MockPayment = {
      ...payment,
      id: (mockPayments.length + 1).toString()
    };
    mockPayments.push(newPayment);
    
    // Update invoice status
    const invoice = mockInvoices.find(inv => inv.id === payment.invoice_id);
    if (invoice) {
      invoice.status = 'Paid';
      invoice.paid_at = payment.payment_date;
      invoice.payment_method = payment.payment_method;
    }
    
    return {
      data: newPayment,
      error: null
    };
  },

  async getPayments() {
    return {
      data: mockPayments,
      error: null,
      count: mockPayments.length
    };
  },

  // Report functions
  async getReports() {
    return {
      data: mockReports,
      error: null,
      count: mockReports.length
    };
  },

  async generateReport(reportId: string) {
    const report = mockReports.find(r => r.id === reportId);
    if (report) {
      report.last_generated = new Date().toISOString();
      return {
        data: { ...report, file_path: `/reports/${report.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.pdf` },
        error: null
      };
    }
    return { error: new Error('Report not found') };
  },

  async exportData(type: 'residents' | 'staff' | 'invoices' | 'documents') {
    // Simulate export functionality
    return {
      data: { download_url: `/exports/${type}-${Date.now()}.csv` },
      error: null
    };
  },

  // Financial stats
  async getFinancialStats() {
    const totalRevenue = mockInvoices
      .filter(inv => inv.status === 'Paid')
      .reduce((sum, inv) => sum + inv.amount, 0);
    
    const outstandingDues = mockInvoices
      .filter(inv => inv.status === 'Pending' || inv.status === 'Overdue')
      .reduce((sum, inv) => sum + inv.amount, 0);
    
    const thisMonthRevenue = mockInvoices
      .filter(inv => inv.status === 'Paid' && new Date(inv.paid_at!).getMonth() === new Date().getMonth())
      .reduce((sum, inv) => sum + inv.amount, 0);
    
    const paidToday = mockPayments
      .filter(payment => new Date(payment.payment_date).toDateString() === new Date().toDateString())
      .reduce((sum, payment) => sum + payment.amount, 0);

    return {
      data: {
        totalRevenue,
        outstandingDues,
        thisMonthRevenue,
        paidToday,
        paidTodayCount: mockPayments.filter(payment => 
          new Date(payment.payment_date).toDateString() === new Date().toDateString()
        ).length
      },
      error: null
    };
  },

  // Document stats
  async getDocumentStats() {
    const admissionCount = mockDocuments.filter(doc => doc.category === 'Admission').length;
    const kycCount = mockDocuments.filter(doc => doc.category === 'KYC').length;
    const pendingCount = mockDocuments.filter(doc => doc.status === 'Pending').length;

    return {
      data: {
        admissionCount,
        kycCount,
        pendingCount,
        totalDocuments: mockDocuments.length
      },
      error: null
    };
  }
};
