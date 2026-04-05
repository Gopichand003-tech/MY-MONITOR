import twilio from "twilio";

const alertMap = new Map(); // deviceId → interval

export function stopAlert(deviceId) {
  const interval = alertMap.get(deviceId);

  if (interval) {
    clearInterval(interval);
    alertMap.delete(deviceId);
    console.log("Alert stopped for:", deviceId);
  }
}

export async function startAlert({
  deviceId,
  name,
  heartRate,
  temperature,
  phone
}) {
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

  // 🚫 Prevent duplicate alerts
  if (alertMap.has(deviceId)) return;

  const client = twilio(sid, token);

  const message = `
🚨 CRITICAL HEALTH ALERT 🚨

Patient: ${name}
Heart Rate: ${heartRate} BPM
Temperature: ${temperature} °C

Immediate attention required!
`;

  let count = 0;
  const MAX_ALERTS = 5; // limit

  const sendMessage = async () => {
    try {
      await client.messages.create({
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: `whatsapp:${phone}`,
        body: message
      });

      console.log("Alert sent to:", phone);

      count++;

      // 🛑 Auto stop after limit
      if (count >= MAX_ALERTS) {
        stopAlert(deviceId);
      }

    } catch (error) {
      console.error("WhatsApp error:", error.message);
    }
  };

  // Send first alert immediately
  await sendMessage();

  // Repeat every 10 sec
  const interval = setInterval(sendMessage, 10000);

  alertMap.set(deviceId, interval);
}