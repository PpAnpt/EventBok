import pool from "../db/pool.js";

export async function getSummary() {
  const [bookings, concerts, revenue, customers] = await Promise.all([
    pool.query(`SELECT COUNT(*) AS total FROM bookings`),
    pool.query(`SELECT COUNT(*) AS total FROM concerts WHERE status IN ('upcoming','ongoing')`),
    pool.query(`SELECT COALESCE(SUM(total_price),0) AS total FROM payments WHERE payment_status='completed'`),
    pool.query(`SELECT COUNT(*) AS total FROM customers`),
  ]);
  return {
    total_bookings: parseInt(bookings.rows[0].total),
    active_concerts: parseInt(concerts.rows[0].total),
    revenue: parseFloat(revenue.rows[0].total),
    total_customers: parseInt(customers.rows[0].total),
  };
}

export async function getRevenue({ months = 6 } = {}) {
  const { rows } = await pool.query(
    `SELECT TO_CHAR(payment_date, 'Mon') AS month,
            DATE_TRUNC('month', payment_date) AS month_date,
            SUM(total_price) AS revenue
     FROM payments
     WHERE payment_status = 'completed'
       AND payment_date >= NOW() - ($1 || ' months')::INTERVAL
     GROUP BY month, month_date
     ORDER BY month_date`,
    [months]
  );
  return { data: rows };
}

export async function getBookingStats({ months = 6 } = {}) {
  const { rows } = await pool.query(
    `SELECT TO_CHAR(booking_date, 'Mon') AS month,
            DATE_TRUNC('month', booking_date) AS month_date,
            COUNT(*) AS bookings
     FROM bookings
     WHERE booking_date >= NOW() - ($1 || ' months')::INTERVAL
     GROUP BY month, month_date
     ORDER BY month_date`,
    [months]
  );
  return { data: rows };
}

export async function getTopConcerts() {
  const { rows } = await pool.query(
    `SELECT co.concert_name, o.organizer_name, v.venue_name,
            COUNT(DISTINCT s.session_id) AS sessions,
            COUNT(DISTINCT b.booking_id) AS bookings,
            COALESCE(SUM(p.total_price), 0) AS revenue
     FROM concerts co
     LEFT JOIN organizers o ON co.organizer_id = o.organizer_id
     LEFT JOIN venues v ON co.venue_id = v.venue_id
     LEFT JOIN sessions s ON s.concert_id = co.concert_id
     LEFT JOIN bookings b ON b.session_id = s.session_id AND b.status = 'confirmed'
     LEFT JOIN payments p ON p.booking_id = b.booking_id AND p.payment_status = 'completed'
     GROUP BY co.concert_id, co.concert_name, o.organizer_name, v.venue_name
     ORDER BY revenue DESC
     LIMIT 10`
  );
  return { data: rows };
}

export async function getVenuePerformance() {
  const { rows } = await pool.query(
    `SELECT v.venue_name AS venue,
            COALESCE(SUM(p.total_price), 0) AS revenue
     FROM venues v
     LEFT JOIN sessions s ON s.venue_id = v.venue_id
     LEFT JOIN bookings b ON b.session_id = s.session_id AND b.status = 'confirmed'
     LEFT JOIN payments p ON p.booking_id = b.booking_id AND p.payment_status = 'completed'
     GROUP BY v.venue_id, v.venue_name
     ORDER BY revenue DESC`
  );
  return { data: rows };
}
