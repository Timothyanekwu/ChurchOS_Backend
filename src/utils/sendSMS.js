const sendSMS = async (options) => {
  // In a real implementation with Twilio:
  // const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  // await client.messages.create({ ... });

  console.log('--- MOCK SMS SENT ---');
  console.log(`To: ${options.to}`);
  console.log(`Message: ${options.message}`);
  console.log('---------------------');

  // If specific env vars are present, we could try a real send
  // For now, always success in mock mode
  return { success: true, messageId: 'mock-sms-id' };
};

export default sendSMS;
