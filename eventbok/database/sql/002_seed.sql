-- Seed Data for EventBok

-- ─── Organizers ────────────────────────────────────────────────────────────────
INSERT INTO organizers (organizer_name, contact_email, phone_number) VALUES
  ('The Rockers Ent.',     'contact@therockers.com',      '081-000-0001'),
  ('Smooth Quartet Co.',   'hello@smoothquartet.com',     '081-000-0002'),
  ('StarStage Productions','info@starstage.com',          '081-000-0003'),
  ('National Orchestra',   'admin@nationalorchestra.com', '081-000-0004');

-- ─── Venues ────────────────────────────────────────────────────────────────────
INSERT INTO venues (venue_name, location, capacity, capacity_template) VALUES
  ('Grand Arena',   'Bangkok, Thailand',    5000, 5000),
  ('Blue Note Hall','Chiang Mai, Thailand',  500,  500),
  ('City Stadium',  'Pattaya, Thailand',    5000, 5000),
  ('Concert Hall',  'Bangkok, Thailand',    2000, 2000);

-- ─── Customers ─────────────────────────────────────────────────────────────────
INSERT INTO customers (firstname, lastname, email, phone, date_of_birth) VALUES
  ('John',   'Smith',    'john@example.com',   '081-111-0001', '1990-01-15'),
  ('Sarah',  'Johnson',  'sarah@example.com',  '081-111-0002', '1992-03-22'),
  ('Mike',   'Brown',    'mike@example.com',   '081-111-0003', '1988-07-10'),
  ('Emily',  'Davis',    'emily@example.com',  '081-111-0004', '1995-11-05'),
  ('David',  'Wilson',   'david@example.com',  '081-111-0005', '1985-09-30'),
  ('Lisa',   'Anderson', 'lisa@example.com',   '081-111-0006', '1993-06-18'),
  ('Robert', 'Taylor',   'robert@example.com', '081-111-0007', '1991-02-28');
