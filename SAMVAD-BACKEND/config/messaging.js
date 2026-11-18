// Console mode is opt-in and never allowed in production. No real messages
// are sent during local development unless Twilio mode is explicitly enabled.
const mode = process.env.MESSAGING_MODE || "twilio";
if (!["console", "twilio"].includes(mode)) {
  throw new Error("MESSAGING_MODE must be console or twilio");
}
if (mode === "console" && process.env.NODE_ENV === "production") {
  throw new Error("Console messaging/OTP mode must not be used in production");
}

let client;
const sendWhatsApp = async (mobileNumber, body) => {
  if (mode === "console") return;
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_NUMBER) {
    throw new Error("Twilio is not configured. Set credentials or use MESSAGING_MODE=console locally.");
  }
  client ||= require("twilio")(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  return client.messages.create({
    body,
    from: `whatsapp:${TWILIO_WHATSAPP_NUMBER}`,
    to: `whatsapp:+91${mobileNumber}`,
  });
};

module.exports = { sendWhatsApp, isConsoleMode: mode === "console" };
