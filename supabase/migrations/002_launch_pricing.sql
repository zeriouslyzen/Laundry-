-- Launch pricing v2: per-load services, narrowed service area

ALTER TABLE orders ADD COLUMN IF NOT EXISTS service_type TEXT DEFAULT 'full_service';

UPDATE pricing_rules SET
  name = 'Launch v2 — Eureka/Arcata hub',
  base_pickup_fee_cents = 0,
  per_bag_cents = 2600,
  fold_addon_cents = 0,
  soap_addon_cents = 200,
  dryer_sheets_addon_cents = 150,
  rush_addon_cents = 800
WHERE name = 'Humboldt Launch' OR active = true;

UPDATE service_areas SET
  name = 'Launch — Arcata, Eureka, Loleta, Fields Landing',
  zip_codes = ARRAY['95521','95501','95503','95551','95537'],
  max_radius_miles = 18.0
WHERE name = 'Humboldt County';
