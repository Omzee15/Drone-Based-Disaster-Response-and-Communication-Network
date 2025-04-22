
import { TwilioResponse } from '@/types/sensor';

// Configuration for Twilio
const TWILIO_ACCOUNT_SID = import.meta.env.VITE_TWILIO_ACCOUNT_SID || '';
const TWILIO_AUTH_TOKEN = import.meta.env.VITE_TWILIO_AUTH_TOKEN || '';
const TWILIO_PHONE_NUMBER = import.meta.env.VITE_TWILIO_PHONE_NUMBER || '';

// Azure Function endpoint for Twilio API
const TWILIO_ENDPOINT = 'https://twiliosending.azurewebsites.net/api/sendSMS';

export const sendSmsMessage = async (to: string, body: string): Promise<TwilioResponse> => {
  try {
    const response = await fetch(TWILIO_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        body,
        accountSid: TWILIO_ACCOUNT_SID,
        authToken: TWILIO_AUTH_TOKEN,
        fromNumber: TWILIO_PHONE_NUMBER,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data: TwilioResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending SMS:', error);
    return {
      success: false,
      message: 'Failed to send SMS',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

export const sendBulkSmsMessages = async (
  numbers: string[], 
  message: string
): Promise<{ success: string[], failed: string[] }> => {
  const results = {
    success: [] as string[],
    failed: [] as string[]
  };

  for (const number of numbers) {
    try {
      const response = await sendSmsMessage(number, message);
      if (response.success) {
        results.success.push(number);
      } else {
        results.failed.push(number);
      }
    } catch (error) {
      console.error(`Failed to send to ${number}:`, error);
      results.failed.push(number);
    }
  }

  return results;
};
