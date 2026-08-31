export const SESSION_COOKIE = "fincontrol_token";
export const BACKEND_URL = process.env.BACKEND_API_URL ?? "http://localhost:8080";

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24, // 24h — mantenha alinhado a JWT_EXPIRATION_MINUTES no backend
};
