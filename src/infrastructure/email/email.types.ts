export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string | undefined;
}
