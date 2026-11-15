import { env } from "../../config/env";
import nodemailer from "nodemailer";
import type { SendEmailOptions } from "./email.types";
import { otpEmailTemplate, existingUserEmailTemplate } from "./email.templates";

const smtpHost = env.SMTP_HOST;
const smtpPort = env.SMTP_PORT;
const smtpSecure = env.SMTP_SECURE;
const smtpUser = env.SMTP_USER;
const smtpPass = env.SMTP_PASSWORD;

function resolveMailFrom(
  mailFromEnv: string,
  smtpUser: string,
  smtpHost: string,
): string {
  if (!mailFromEnv) {
    return smtpUser
      ? `"Movies App" <${smtpUser}>`
      : `"Movies App" <no-reply@${smtpHost || "localhost"}>`;
  }

  if (mailFromEnv.includes("@")) {
    return mailFromEnv.includes("<")
      ? mailFromEnv
      : `"Movies App" <${mailFromEnv}>`;
  }

  const displayName = mailFromEnv.replace(/["']/g, "").trim();
  const address = smtpUser || `no-reply@${smtpHost || "localhost"}`;
  return `"${displayName}" <${address}>`;
}

const mailFrom = resolveMailFrom(env.MAIL_FROM, env.SMTP_USER, env.SMTP_HOST);

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
});

export class EmailService {
  public async sendEmail(options: SendEmailOptions): Promise<void> {
    await transporter.sendMail({
      from: mailFrom,
      to: options.to,
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo,
    });
  }

  public async sendOtpEmail(
    to: string,
    otp: string,
    type: "email-verification" | "forget-password" | "sign-in",
  ): Promise<void> {
    const subjects: Record<typeof type, string> = {
      "email-verification": "Your Movies App verification code",
      "forget-password": "Your Movies App password reset code",
      "sign-in": "Your Movies App sign-in code",
    };

    await this.sendEmail({
      to,
      subject: subjects[type],
      html: otpEmailTemplate(otp, type),
    });
  }

  public async sendExistingUserEmail(to: string): Promise<void> {
    await this.sendEmail({
      to,
      subject: "Sign-up attempt on your Movies App account",
      html: existingUserEmailTemplate(),
    });
  }
}

export const emailService = new EmailService();
