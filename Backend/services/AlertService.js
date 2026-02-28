import twilio from "twilio";

let alertInterval = null;

export function stopAlert() {
  if (alertInterval) {
    clearInterval(alertInterval);
    alertInterval = null;
    console.log("Alert stopped by user.");
  }
}

export async function startAlert({ name, heartRate, temperature, phone }) {

  const sid = process.env.TWILIO_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;

  if (!sid || !token) {
    console.error("Twilio credentials missing!");
    return;
  }

  if (!phone) {
    console.error("Phone number missing!");
    return;
  }

  if (alertInterval) return; // already running

  const client = twilio(sid, token);

  const message = `
🚨 CRITICAL HEALTH ALERT 🚨

Patient: ${name}
Heart Rate: ${heartRate} BPM
Temperature: ${temperature} °C

Reply GOT IT to stop alerts.
`;

  const sendMessage = async () => {
    try {
      await client.messages.create({
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: `whatsapp:${phone}`,
        body: message
      });

      console.log("Alert sent to:", phone);
    } catch (error) {
      console.error("WhatsApp error:", error.message);
    }
  };

  // Send immediately
  await sendMessage();

  // Repeat every 6 seconds
  alertInterval = setInterval(sendMessage, 9000);
}