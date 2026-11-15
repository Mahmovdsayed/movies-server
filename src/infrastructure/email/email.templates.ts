export function otpEmailTemplate(
  otp: string,
  type: "email-verification" | "forget-password" | "sign-in",
): string {
  const configs = {
    "email-verification": {
      title: "Verify your email",
      subtitle: "Your cinematic universe awaits",
      heading: "Confirm your email address",
      body: "Enter the code below in the app to verify your email address and activate your account.",
      warning: null,
      headerGradient: "linear-gradient(135deg, #e50914 0%, #b81d24 100%)",
      headerBorder: "none",
      warningType: "alert" as const,
    },
    "forget-password": {
      title: "Reset your password",
      subtitle: "Account security",
      heading: "Password reset code",
      body: "Enter the code below in the app to reset your Movies App password.",
      warning:
        "If you didn't request a password reset, ignore this email — your account remains secure.",
      headerGradient: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
      headerBorder: "2px solid #e50914",
      warningType: "alert" as const,
    },
    "sign-in": {
      title: "Sign-in code",
      subtitle: "One-time password",
      heading: "Your sign-in code",
      body: "Enter the code below in the app to sign in to your Movies App account.",
      warning:
        "If you didn't request this code, someone may be trying to access your account.",
      headerGradient: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
      headerBorder: "2px solid #3b82f6",
      warningType: "info" as const,
    },
  };

  const c = configs[type];
  const year = new Date().getFullYear();
  const otpDigits = otp
    .split("")
    .map((d) => `<span class="digit">${d}</span>`)
    .join("");

  const warningHtml = c.warning
    ? c.warningType === "info"
      ? `<div class="info-box">${c.warning}</div>`
      : `<div class="alert-box">${c.warning}</div>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${c.title}</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { background-color: #0f0f0f; font-family: 'Segoe UI', Helvetica, Arial, sans-serif; color: #e5e5e5; }
      .wrapper { max-width: 580px; margin: 48px auto; background-color: #1a1a1a; border-radius: 12px; overflow: hidden; border: 1px solid #2a2a2a; }
      .header { background: ${c.headerGradient}; padding: 36px 40px; text-align: center; border-bottom: ${c.headerBorder}; }
      .header h1 { font-size: 26px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px; }
      .header p { font-size: 13px; color: rgba(255,255,255,0.7); margin-top: 6px; }
      .body { padding: 40px; }
      .body h2 { font-size: 20px; font-weight: 600; color: #ffffff; margin-bottom: 12px; }
      .body p { font-size: 15px; line-height: 1.65; color: #a0a0a0; margin-bottom: 28px; }
      .otp-box { display: flex; justify-content: center; gap: 10px; margin-bottom: 24px; }
      .digit { display: inline-block; width: 52px; height: 60px; background-color: #111; border: 1px solid #333; border-radius: 10px; font-size: 28px; font-weight: 700; color: #ffffff; text-align: center; line-height: 60px; font-family: 'Courier New', monospace; }
      .expiry { text-align: center; font-size: 13px; color: #666; margin-bottom: 28px; }
      .expiry strong { color: #a0a0a0; }
      .alert-box { border-left: 4px solid #e50914; background-color: #1f1a1a; border-radius: 6px; padding: 14px 18px; font-size: 13px; color: #c0a0a0; line-height: 1.6; }
      .info-box { border-left: 4px solid #3b82f6; background-color: #161f2e; border-radius: 6px; padding: 14px 18px; font-size: 13px; color: #90aacc; line-height: 1.6; }
      .footer { background-color: #111; padding: 24px 40px; text-align: center; }
      .footer p { font-size: 12px; color: #555; line-height: 1.6; }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="header">
        <h1>🎬 Movies App</h1>
        <p>${c.subtitle}</p>
      </div>
      <div class="body">
        <h2>${c.heading}</h2>
        <p>${c.body}</p>
        <div class="otp-box">${otpDigits}</div>
        <p class="expiry">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
        ${warningHtml}
      </div>
      <div class="footer">
        <p>© ${year} Movies App. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>`;
}

export function existingUserEmailTemplate(): string {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sign-in Attempt Notice</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { background-color: #0f0f0f; font-family: 'Segoe UI', Helvetica, Arial, sans-serif; color: #e5e5e5; }
      .wrapper { max-width: 580px; margin: 48px auto; background-color: #1a1a1a; border-radius: 12px; overflow: hidden; border: 1px solid #2a2a2a; }
      .header { background: linear-gradient(135deg, #1a1a1a 0%, #222 100%); padding: 36px 40px; text-align: center; border-bottom: 2px solid #333; }
      .header h1 { font-size: 26px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px; }
      .header p { font-size: 13px; color: rgba(255,255,255,0.5); margin-top: 6px; }
      .body { padding: 40px; }
      .body h2 { font-size: 20px; font-weight: 600; color: #ffffff; margin-bottom: 12px; }
      .body p { font-size: 15px; line-height: 1.65; color: #a0a0a0; margin-bottom: 24px; }
      .info-box { background-color: #161f2e; border-left: 4px solid #3b82f6; border-radius: 6px; padding: 14px 18px; margin-bottom: 28px; font-size: 13px; color: #90aacc; line-height: 1.6; }
      .footer { background-color: #111; padding: 24px 40px; text-align: center; }
      .footer p { font-size: 12px; color: #555; line-height: 1.6; }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="header">
        <h1>🎬 Movies App</h1>
        <p>Security notification</p>
      </div>
      <div class="body">
        <h2>Sign-up attempt on your account</h2>
        <p>Someone tried to create a new Movies App account using your email address. Since you already have an account, no new account was created.</p>
        <div class="info-box">If this was you, simply sign in to your existing account. If you don't remember your password, you can reset it from the app.</div>
        <p style="font-size:13px;color:#666;">If this wasn't you, no action is needed. Your account is safe and no changes were made.</p>
      </div>
      <div class="footer">
        <p>© ${year} Movies App. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>`;
}
