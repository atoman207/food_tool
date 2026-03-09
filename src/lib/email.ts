import nodemailer from "nodemailer";

const CONTACT_TO = process.env.CONTACT_EMAIL_TO || "japan.dev07@gmail.com";

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

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: CONTACT_TO,
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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
