-- Seed Data for EventBok

-- Organizers
INSERT INTO organizers (organizer_name, contact_email, phone_number) VALUES
  ('The Rockers Ent.',    'contact@therockers.com',   '081-000-0001'),
  ('Smooth Quartet Co.',  'hello@smoothquartet.com',  '081-000-0002'),
  ('StarStage Productions','info@starstage.com',      '081-000-0003'),
  ('National Orchestra',  'admin@nationalorchestra.com','081-000-0004');

-- Venues
INSERT INTO venues (venue_name, location, capacity) VALUES
  ('Grand Arena',   'Bangkok, Thailand',     5000),
  ('Blue Note Hall','Chiang Mai, Thailand',   800),
  ('City Stadium',  'Pattaya, Thailand',    10000),
  ('Concert Hall',  'Bangkok, Thailand',     1200);

-- Concerts
INSERT INTO concerts (concert_name, artist_name, description, organizer_id, venue_id, status) VALUES
  ('Rock Night 2026',    'The Rockers',        'The biggest rock night of the year',   1, 1, 'upcoming'),
  ('Jazz Evening',       'Smooth Quartet',     'An intimate jazz evening experience',  2, 2, 'upcoming'),
  ('Pop Fest',           'Various Artists',    'Multi-day pop music festival',         3, 3, 'upcoming'),
  ('Classical Symphony', 'National Orchestra', 'A grand classical symphony evening',   4, 4, 'completed');

-- Seatmaps (one per venue)
INSERT INTO seatmaps (map_name, template, venue_id) VALUES
  ('Grand Arena Map',   'concert_hall',  1),
  ('Blue Note Map',     'concert_hall',  2),
  ('City Stadium Map',  'arena_stadium', 3),
  ('Concert Hall Map',  'concert_hall',  4);

-- Zones for Grand Arena (seatmap_id=1)
INSERT INTO zones (zone_name, type, color, price, capacity, rows, seatmap_id) VALUES
  ('VIP Zone',     'vip',     '#a855f7', 350.00, 24, ARRAY['A','B'],       1),
  ('Premium Zone', 'premium', '#ec4899', 200.00, 24, ARRAY['C','D'],       1),
  ('Regular Zone', 'regular', '#22c55e',  80.00, 48, ARRAY['E','F','G','H'],1);

-- Sessions
INSERT INTO sessions (session_name, show_date, start_time, end_time, concert_id, venue_id) VALUES
  ('Night 1',       '2026-04-15', '19:00', '22:00', 1, 1),
  ('Night 2',       '2026-04-16', '19:00', '22:00', 1, 1),
  ('Opening Night', '2026-04-20', '20:00', '23:00', 2, 2),
  ('Day 1 - AM',    '2026-05-01', '18:00', '21:00', 3, 3),
  ('Day 1 - PM',    '2026-05-01', '21:00', '23:59', 3, 3),
  ('Day 2',         '2026-05-02', '18:00', '22:00', 3, 3),
  ('Gala Night',    '2026-03-10', '19:30', '22:00', 4, 4);

-- Seats for Grand Arena (seatmap_id=1, zone_id=1 VIP, 2 Premium, 3 Regular)
INSERT INTO seats (seat_no, zone_id)
  SELECT 'A' || n, 1 FROM generate_series(1,12) n UNION ALL
  SELECT 'B' || n, 1 FROM generate_series(1,12) n UNION ALL
  SELECT 'C' || n, 2 FROM generate_series(1,12) n UNION ALL
  SELECT 'D' || n, 2 FROM generate_series(1,12) n UNION ALL
  SELECT 'E' || n, 3 FROM generate_series(1,12) n UNION ALL
  SELECT 'F' || n, 3 FROM generate_series(1,12) n UNION ALL
  SELECT 'G' || n, 3 FROM generate_series(1,12) n UNION ALL
  SELECT 'H' || n, 3 FROM generate_series(1,12) n;

-- Customers
INSERT INTO customers (firstname, lastname, email, phone, date_of_birth) VALUES
  ('John',    'Smith',    'john@example.com',    '081-111-0001', '1990-01-15'),
  ('Sarah',   'Johnson',  'sarah@example.com',   '081-111-0002', '1992-03-22'),
  ('Mike',    'Brown',    'mike@example.com',    '081-111-0003', '1988-07-10'),
  ('Emily',   'Davis',    'emily@example.com',   '081-111-0004', '1995-11-05'),
  ('David',   'Wilson',   'david@example.com',   '081-111-0005', '1985-09-30'),
  ('Lisa',    'Anderson', 'lisa@example.com',    '081-111-0006', '1993-06-18'),
  ('Robert',  'Taylor',   'robert@example.com',  '081-111-0007', '1991-02-28');

-- Bookings
INSERT INTO bookings (booking_date, status, customer_id, session_id) VALUES
  (NOW(), 'confirmed', 1, 1),
  (NOW(), 'confirmed', 2, 3),
  (NOW(), 'pending',   3, 5),
  (NOW(), 'confirmed', 4, 7),
  (NOW(), 'cancelled', 5, 2),
  (NOW(), 'confirmed', 6, 3),
  (NOW(), 'pending',   7, 6);

-- Payments
INSERT INTO payments (payment_date, total_price, payment_method, payment_status, transaction_id, booking_id) VALUES
  (NOW(), 700.00, 'credit_card',  'completed', 'TXN789456123', 1),
  (NOW(), 200.00, 'qr_code',      'completed', 'TXN789456124', 2),
  (NOW(), 240.00, 'debit_card',   'pending',   'TXN789456125', 3),
  (NOW(), 700.00, 'credit_card',  'completed', 'TXN789456126', 4),
  (NOW(),  80.00, 'bank_transfer','refunded',  'TXN789456127', 5),
  (NOW(), 700.00, 'credit_card',  'completed', 'TXN789456128', 6),
  (NOW(),  80.00, 'qr_code',      'pending',   'TXN789456129', 7);
