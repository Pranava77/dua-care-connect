-- Create enum types
CREATE TYPE resident_status AS ENUM ('active', 'medical_care', 'discharged');
CREATE TYPE staff_status AS ENUM ('present', 'leave', 'absent');
CREATE TYPE leave_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high');

-- Create residents table
CREATE TABLE public.residents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  age integer NOT NULL CHECK (age >= 0),
  room text NOT NULL,
  status resident_status NOT NULL DEFAULT 'active',
  join_date date NOT NULL DEFAULT CURRENT_DATE,
  contact_number text,
  emergency_contact text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Create staff table
CREATE TABLE public.staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL,
  department text NOT NULL,
  status staff_status NOT NULL DEFAULT 'present',
  shift text NOT NULL,
  contact_number text,
  salary numeric(10,2),
  hire_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Create medical_records table
CREATE TABLE public.medical_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id uuid REFERENCES public.residents(id) ON DELETE CASCADE NOT NULL,
  condition text NOT NULL,
  priority priority_level NOT NULL DEFAULT 'medium',
  last_check_date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Create prescriptions table
CREATE TABLE public.prescriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id uuid REFERENCES public.residents(id) ON DELETE CASCADE NOT NULL,
  medication text NOT NULL,
  dosage text NOT NULL,
  refill_date date NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Create leave_requests table
CREATE TABLE public.leave_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid REFERENCES public.staff(id) ON DELETE CASCADE NOT NULL,
  leave_type text NOT NULL,
  from_date date NOT NULL,
  to_date date NOT NULL,
  status leave_status NOT NULL DEFAULT 'pending',
  reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for residents
CREATE POLICY "Users can view their own residents" ON public.residents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own residents" ON public.residents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own residents" ON public.residents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own residents" ON public.residents
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for staff
CREATE POLICY "Users can view their own staff" ON public.staff
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own staff" ON public.staff
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own staff" ON public.staff
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own staff" ON public.staff
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for medical_records
CREATE POLICY "Users can view their own medical records" ON public.medical_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own medical records" ON public.medical_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medical records" ON public.medical_records
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medical records" ON public.medical_records
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for prescriptions
CREATE POLICY "Users can view their own prescriptions" ON public.prescriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own prescriptions" ON public.prescriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prescriptions" ON public.prescriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prescriptions" ON public.prescriptions
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for leave_requests
CREATE POLICY "Users can view their own leave requests" ON public.leave_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own leave requests" ON public.leave_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own leave requests" ON public.leave_requests
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own leave requests" ON public.leave_requests
  FOR DELETE USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_residents_updated_at
  BEFORE UPDATE ON public.residents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_staff_updated_at
  BEFORE UPDATE ON public.staff
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medical_records_updated_at
  BEFORE UPDATE ON public.medical_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at
  BEFORE UPDATE ON public.prescriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leave_requests_updated_at
  BEFORE UPDATE ON public.leave_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();