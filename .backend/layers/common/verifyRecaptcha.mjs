
/**
 * This module provides a function to verify reCAPTCHA tokens using Google's reCAPTCHA verification endpoint.
 * It checks for the presence of the reCAPTCHA secret key and token, and handles various error scenarios that may arise during the verification process.
 * The function returns appropriate HTTP status codes and messages based on the outcome of the verification.
 */

const SITE_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

/**
 * Verifies a reCAPTCHA token by sending a request to Google's reCAPTCHA verification endpoint.
 * @param {string} token - The reCAPTCHA token to verify.
 * @returns {Promise<{ok: boolean, statusCode: number, message: string}>} - The result of the verification.
 */
export const verifyRecaptcha = async (token) => {
  // Verify the reCAPTCHA token
  try {
    // Get the reCAPTCHA secret key from environment variables
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;

    // Verify that the reCAPTCHA secret key exists
    if (!recaptchaSecret) {
      console.error('reCAPTCHA secret key is not set in environment variables');
      return { ok: false, statusCode: 500, message: 'Server configuration error. Please contact the administrator.' };
    }

    // Verify that the reCAPTCHA token exists
    if (!token) {
      return { ok: false, statusCode: 400, message: 'reCAPTCHA token is missing. Please complete the reCAPTCHA challenge and try again.' };
    }

    // Make request to Google's reCAPTCHA verification endpoint
    const recaptchaResponse = await fetch(SITE_VERIFY_URL, {
      method: 'POST',
      body: new URLSearchParams({
        secret: recaptchaSecret,
        response: token,
      })
    });

    // Check if the request to the reCAPTCHA verification endpoint was successful
    if (!recaptchaResponse.ok) {
      console.error('Error response from reCAPTCHA verification endpoint:', recaptchaResponse.status);
      return { ok: false, statusCode: 502, message: 'Error verifying reCAPTCHA. Please try again later.' };
    }

    // Parse the response from the reCAPTCHA verification endpoint
    const recaptchaResult = await recaptchaResponse.json();

    // reCAPTCHA verification returned invalid
    const allowedHosts = (process.env.RECAPTCHA_ALLOWED_HOSTS || '').split(',').map(h => h.trim()).filter(Boolean);

    if (!recaptchaResult.success || (allowedHosts.length && !allowedHosts.includes(recaptchaResult.hostname))) {
      // Return http 403 to signal that the request was understood, but the server is refusing to fulfill it due to failed reCAPTCHA verification
      console.warn('reCAPTCHA verification failed:', recaptchaResult['error-codes']);
      return { ok: false, statusCode: 403, message: 'reCAPTCHA verification failed. Please try again.' };
    }

    // Successful verification
    return { ok: true, statusCode: 200, message: 'reCAPTCHA verification succeeded.' };
  }
  catch (error) {
    // Return http 502 to signal that there was an error with the request, which could be due to a variety of reasons such as network issues, invalid reCAPTCHA secret key, or issues with the reCAPTCHA service itself
    console.error('Error verifying reCAPTCHA:', error);
    return { ok: false, statusCode: 502, message: 'Error verifying reCAPTCHA. Please try again later.' };
  }
};