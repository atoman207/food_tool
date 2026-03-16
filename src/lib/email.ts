import nodemailer from "nodemailer";

const CONTACT_TO = process.env.CONTACT_EMAIL_TO || "japan.dev07@gmail.com";
/** Contact form emails are always sent to CONTACT_TO and also forwarded here. */
const CONTACT_FORWARD_TO = "tkcsg2026@gmail.com";
const ADMIN_NOTIFY_FROM = process.env.ADMIN_NOTIFY_FROM || "tkcsg2026@gmail.com";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;

  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const secure = process.env.SMTP_SECURE === "true";

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

export async function sendContactEmail(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) return false;

  const { name, email, subject, message } = data;

  // Send to primary recipient and always forward a copy to tkcsg2026@gmail.com
  const toAddresses = [...new Set([CONTACT_TO, CONTACT_FORWARD_TO])];

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: toAddresses,
    replyTo: email,
    subject: `[Contact Form] ${subject}`,
    text: [
      `Name: ${name}`,
      `Email: ${email}`,
      `Subject: ${subject}`,
      ``,
      `Message:`,
      message,
    ].join("\n"),
    html: [
      `<p><strong>Name:</strong> ${escapeHtml(name)}</p>`,
      `<p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>`,
      `<p><strong>Subject:</strong> ${escapeHtml(subject)}</p>`,
      `<hr/>`,
      `<p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>`,
    ].join("\n"),
  });

  return true;
}

export async function sendAdminActionEmail(data: {
  action: "ban" | "unban" | "delete";
  userName: string;
  userEmail: string;
}): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) return false;

  const { action, userName, userEmail } = data;

  const subjects: Record<typeof action, string> = {
    ban: "Your account has been suspended",
    unban: "Your account has been reinstated",
    delete: "Your account has been deleted",
  };

  const bodies: Record<typeof action, string> = {
    ban: `Dear ${escapeHtml(userName)},<br/><br/>Your account on Singapore F&amp;B Portal has been <strong>suspended</strong> by an administrator.<br/>If you believe this is a mistake, please contact us.`,
    unban: `Dear ${escapeHtml(userName)},<br/><br/>Your account on Singapore F&amp;B Portal has been <strong>reinstated</strong>. You may log in again.`,
    delete: `Dear ${escapeHtml(userName)},<br/><br/>Your account on Singapore F&amp;B Portal has been <strong>permanently deleted</strong> by an administrator.<br/>If you believe this is a mistake, please contact us.`,
  };

  await transporter.sendMail({
    from: ADMIN_NOTIFY_FROM,
    to: userEmail,
    subject: subjects[action],
    html: `<p>${bodies[action]}</p>`,
    text: bodies[action].replace(/<[^>]+>/g, ""),
  });

  return true;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
