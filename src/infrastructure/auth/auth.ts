import { betterAuth } from "better-auth";
import { expo } from "@better-auth/expo";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../../database";
import { customSession, emailOTP, haveIBeenPwned } from "better-auth/plugins";
import { PasswordService } from "./password";
import { env } from "../../config/env";
import { emailService } from "../email/email";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [
    "movies-app://",
    "exp://",
    "exp://**",
    "exp://192.168.*.*:*/**",
  ],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 32,
    onExistingUserSignUp: async ({ user }, request) => {
      await emailService.sendExistingUserEmail(user.email);
    },
    onPasswordReset: async ({ user }, request) => {},
    revokeSessionsOnPasswordReset: true,
    password: {
      hash: PasswordService.hashPassword,
      verify: PasswordService.verifyPassword,
    },
  },
  socialProviders: {
    google: {
      enabled: true,
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
    facebook: {
      enabled: true,
      clientId: env.FACEBOOK_CLIENT_ID,
      clientSecret: env.FACEBOOK_CLIENT_SECRET,
    },
  },
  session: {
    storeSessionInDatabase: true,
    deferSessionRefresh: true,
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
      strategy: "compact",
    },
  },
  account: {
    storeStateStrategy: "database",
    skipStateCookieCheck: true,
    storeAccountCookie: true,
  },
  advanced: {
    cookiePrefix: "movies-app",
    useSecureCookies: env.NODE_ENV === "production",
    database: {
      generateId: () => crypto.randomUUID(),
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  plugins: [
    expo(),
    haveIBeenPwned(),
    emailOTP({
      otpLength: 6,
      expiresIn: 60 * 10,
      sendVerificationOnSignUp: true,
      overrideDefaultEmailVerification: true,
      disableSignUp: false,
      allowedAttempts: 5,
      storeOTP: "hashed",
      resendStrategy: "rotate",
      rateLimit: {
        window: 60,
        max: 3,
      },
      sendVerificationOTP: async ({ email, otp, type }) => {
        if (type === "change-email") return;
        await emailService.sendOtpEmail(email, otp, type);
      },
    }),
    customSession(async ({ user, session }) => {
      return {
        user,
        session,
      };
    }),
  ],
});
