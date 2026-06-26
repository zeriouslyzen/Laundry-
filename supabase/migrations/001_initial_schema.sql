-- Humboldt Laundry MVP Schema

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE user_role AS ENUM ('customer', 'driver', 'admin');
CREATE TYPE driver_status AS ENUM ('pending', 'active', 'suspended', 'rejected');
CREATE TYPE wash_location AS ENUM ('home_machines', 'laundromat', 'both');
CREATE TYPE turnaround_time AS ENUM ('same_day', '24h', '48h');
CREATE TYPE order_status AS ENUM (
  'pending_match',
  'finding_driver',
  'driver_assigned',
  'en_route_pickup',
  'picked_up',
  'washing',
  'ready',
  'en_route_return',
  'awaiting_customer_pickup',
  'completed',
  'cancelled'
);
CREATE TYPE return_method AS ENUM ('driver_delivery', 'customer_pickup');
CREATE TYPE offer_status AS ENUM ('pending', 'accepted', 'declined', 'expired');

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  phone TEXT,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'customer',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Driver profiles
CREATE TABLE driver_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  status driver_status NOT NULL DEFAULT 'pending',
  home_address TEXT,
  home_lat DOUBLE PRECISION,
  home_lng DOUBLE PRECISION,
  available BOOLEAN NOT NULL DEFAULT FALSE,
  wash_location wash_location,
  max_loads_per_day INTEGER DEFAULT 3,
  turnaround turnaround_time DEFAULT '24h',
  provides_soap BOOLEAN DEFAULT FALSE,
  provides_dryer_sheets BOOLEAN DEFAULT FALSE,
  provides_hypoallergenic BOOLEAN DEFAULT FALSE,
  provides_fold BOOLEAN DEFAULT TRUE,
  availability_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5],
  availability_start TIME DEFAULT '08:00',
  availability_end TIME DEFAULT '20:00',
  onboarding_step INTEGER DEFAULT 0,
  rules_accepted_at TIMESTAMPTZ,
  contractor_agreement_at TIMESTAMPTZ,
  background_check_consent_at TIMESTAMPTZ,
  active_orders_count INTEGER DEFAULT 0,
  rating_avg NUMERIC(3,2) DEFAULT 5.0,
  rating_count INTEGER DEFAULT 0,
  current_lat DOUBLE PRECISION,
  current_lng DOUBLE PRECISION,
  location_updated_at TIMESTAMPTZ,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Driver documents
CREATE TABLE driver_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Customer addresses
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label TEXT DEFAULT 'Home',
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'CA',
  zip TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  notes TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Service areas (Humboldt zips)
CREATE TABLE service_areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  zip_codes TEXT[] NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  max_radius_miles NUMERIC(5,2) DEFAULT 25.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pricing rules
CREATE TABLE pricing_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL DEFAULT 'default',
  base_pickup_fee_cents INTEGER NOT NULL DEFAULT 1000,
  per_bag_cents INTEGER NOT NULL DEFAULT 500,
  fold_addon_cents INTEGER NOT NULL DEFAULT 300,
  soap_addon_cents INTEGER NOT NULL DEFAULT 200,
  dryer_sheets_addon_cents INTEGER NOT NULL DEFAULT 150,
  rush_addon_cents INTEGER NOT NULL DEFAULT 500,
  driver_payout_percent NUMERIC(5,2) DEFAULT 75.0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES profiles(id),
  driver_id UUID REFERENCES profiles(id),
  address_id UUID NOT NULL REFERENCES addresses(id),
  status order_status NOT NULL DEFAULT 'pending_match',
  pickup_date DATE NOT NULL,
  pickup_window_start TIME NOT NULL,
  pickup_window_end TIME NOT NULL,
  return_method return_method NOT NULL DEFAULT 'driver_delivery',
  return_date DATE,
  return_window_start TIME,
  return_window_end TIME,
  recurring_day INTEGER,
  addon_soap BOOLEAN DEFAULT FALSE,
  addon_dryer_sheets BOOLEAN DEFAULT FALSE,
  addon_fold BOOLEAN DEFAULT FALSE,
  addon_rush BOOLEAN DEFAULT FALSE,
  bag_count INTEGER DEFAULT 1,
  customer_notes TEXT,
  base_fee_cents INTEGER,
  total_cents INTEGER,
  driver_payout_cents INTEGER,
  stripe_payment_intent_id TEXT,
  payment_status TEXT DEFAULT 'pending',
  assigned_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Order events (audit timeline)
CREATE TABLE order_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status order_status NOT NULL,
  note TEXT,
  actor_id UUID REFERENCES profiles(id),
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Driver offers
CREATE TABLE driver_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES profiles(id),
  status offer_status NOT NULL DEFAULT 'pending',
  distance_miles NUMERIC(6,2),
  payout_cents INTEGER,
  expires_at TIMESTAMPTZ NOT NULL,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Waitlist
CREATE TABLE waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT,
  phone TEXT,
  zip TEXT,
  type TEXT DEFAULT 'customer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_driver ON orders(driver_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_driver_offers_order ON driver_offers(order_id);
CREATE INDEX idx_driver_offers_driver ON driver_offers(driver_id);
CREATE INDEX idx_driver_profiles_available ON driver_profiles(available, status);
CREATE INDEX idx_addresses_user ON addresses(user_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER driver_profiles_updated_at BEFORE UPDATE ON driver_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, phone, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.phone,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Order event on status change
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_events (order_id, status, actor_id)
    VALUES (NEW.id, NEW.status, NEW.driver_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_status_change
  AFTER UPDATE OF status ON orders
  FOR EACH ROW EXECUTE FUNCTION log_order_status_change();

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Helper: is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Profiles policies
CREATE POLICY profiles_select ON profiles FOR SELECT USING (
  id = auth.uid() OR is_admin()
);
CREATE POLICY profiles_update ON profiles FOR UPDATE USING (
  id = auth.uid() OR is_admin()
);

-- Driver profiles policies
CREATE POLICY driver_profiles_select ON driver_profiles FOR SELECT USING (
  user_id = auth.uid() OR is_admin() OR
  (status = 'active' AND available = TRUE)
);
CREATE POLICY driver_profiles_insert ON driver_profiles FOR INSERT WITH CHECK (
  user_id = auth.uid()
);
CREATE POLICY driver_profiles_update ON driver_profiles FOR UPDATE USING (
  user_id = auth.uid() OR is_admin()
);

-- Driver documents
CREATE POLICY driver_docs_select ON driver_documents FOR SELECT USING (
  EXISTS (SELECT 1 FROM driver_profiles dp WHERE dp.id = driver_id AND dp.user_id = auth.uid())
  OR is_admin()
);
CREATE POLICY driver_docs_insert ON driver_documents FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM driver_profiles dp WHERE dp.id = driver_id AND dp.user_id = auth.uid())
);

-- Addresses
CREATE POLICY addresses_all ON addresses FOR ALL USING (
  user_id = auth.uid() OR is_admin()
);

-- Orders
CREATE POLICY orders_select ON orders FOR SELECT USING (
  customer_id = auth.uid() OR driver_id = auth.uid() OR is_admin()
);
CREATE POLICY orders_insert ON orders FOR INSERT WITH CHECK (
  customer_id = auth.uid()
);
CREATE POLICY orders_update ON orders FOR UPDATE USING (
  customer_id = auth.uid() OR driver_id = auth.uid() OR is_admin()
);

-- Order events
CREATE POLICY order_events_select ON order_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND (o.customer_id = auth.uid() OR o.driver_id = auth.uid()))
  OR is_admin()
);

-- Driver offers
CREATE POLICY driver_offers_select ON driver_offers FOR SELECT USING (
  driver_id = auth.uid() OR is_admin() OR
  EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND o.customer_id = auth.uid())
);
CREATE POLICY driver_offers_update ON driver_offers FOR UPDATE USING (
  driver_id = auth.uid() OR is_admin()
);

-- Public read for service areas and pricing
CREATE POLICY service_areas_read ON service_areas FOR SELECT USING (active = TRUE OR is_admin());
CREATE POLICY pricing_rules_read ON pricing_rules FOR SELECT USING (active = TRUE OR is_admin());
CREATE POLICY pricing_rules_admin ON pricing_rules FOR ALL USING (is_admin());

-- Waitlist insert anyone
CREATE POLICY waitlist_insert ON waitlist FOR INSERT WITH CHECK (TRUE);
CREATE POLICY waitlist_admin ON waitlist FOR SELECT USING (is_admin());

-- Seed Humboldt service area and default pricing
INSERT INTO service_areas (name, zip_codes, max_radius_miles) VALUES (
  'Humboldt County',
  ARRAY['95501','95503','95519','95521','95524','95528','95536','95537','95540','95542','95546','95547','95551','95553','95555','95558','95560','95562','95564','95565','95569','95570','95573'],
  25.0
);

INSERT INTO pricing_rules (name, base_pickup_fee_cents, per_bag_cents, fold_addon_cents, soap_addon_cents, dryer_sheets_addon_cents) VALUES (
  'Humboldt Launch',
  1000, 500, 300, 200, 150
);

-- Storage bucket for driver documents (run in Supabase dashboard or via API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('driver-documents', 'driver-documents', false);
