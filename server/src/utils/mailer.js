import nodemailer from "nodemailer";
import logger from "./logger.js";

let transporter = null;

async function getTransporter() {
  if (transporter) return transporter;
  const account = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: { user: account.user, pass: account.pass },
  });
  logger.info(`Ethereal email ready — inbox: https://ethereal.email/messages`);
  return transporter;
}

export async function sendBookingConfirmation({ to, booking, payment, concert, session, seats }) {
  const transport = await getTransporter();

  const seatList = seats.map((s) => `${s.seat_no} (${s.type})`).join(", ");

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#111">
      <div style="background:linear-gradient(135deg,#7c3aed,#ec4899);padding:28px;border-radius:12px 12px 0 0;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:22px">♪ EventBok</h1>
        <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:13px">Concert Ticket Booking</p>
      </div>
      <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:28px;border-radius:0 0 12px 12px">
        <h2 style="margin:0 0 6px;color:#16a34a;font-size:18px">✓ Booking Confirmed!</h2>
        <p style="color:#6b7280;font-size:13px;margin:0 0 24px">Your seats have been reserved. Please complete payment within 10 minutes.</p>

        <table style="width:100%;border-collapse:collapse;font-size:13px">
          ${row("Booking ID", `#${booking.booking_id}`)}
          ${row("Concert", concert)}
          ${row("Session", `${session.session_name} · ${session.show_date} ${session.start_time}`)}
          ${row("Seats", seatList)}
          ${row("Total Amount", `$${payment.total_price}`)}
          ${row("Payment Method", payment.payment_method.replace("_", " "))}
          ${row("Transaction ID", payment.transaction_id)}
          ${row("Status", "Pending payment")}
        </table>

        <div style="background:#fef9c3;border-radius:8px;padding:12px 16px;margin-top:20px;font-size:12px;color:#a16207">
          ⚠️ Please complete your payment within <strong>10 minutes</strong> or this booking will be automatically cancelled.
        </div>

        <p style="color:#9ca3af;font-size:11px;margin-top:24px;text-align:center">
          EventBok · Concert Ticket Booking System
        </p>
      </div>
    </div>
  `;

  const info = await transport.sendMail({
    from: '"EventBok" <noreply@eventbok.com>',
    to,
    subject: `Booking Confirmed — ${concert}`,
    html,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  logger.info(`Booking email sent → ${previewUrl}`);
  return previewUrl;
}

function row(label, value) {
  return `<tr>
    <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;width:40%">${label}</td>
    <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-weight:600">${value}</td>
  </tr>`;
}
