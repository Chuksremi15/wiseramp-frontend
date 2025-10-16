/**
 * Utility functions for authentication and token management
 */

/**
 * Checks if a JWT token is expired
 * @param token The JWT token to check
 * @returns boolean indicating if the token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  if (!token) return true;

  try {
    // JWT tokens consist of three parts: header.payload.signature
    const payload = token.split(".")[1];

    // Decode the base64 payload
    const decodedPayload = JSON.parse(atob(payload));

    // Check if the token has an expiration claim
    if (!decodedPayload.exp) return false;

    // Get current time in seconds (JWT exp is in seconds)
    const currentTime = Math.floor(Date.now() / 1000);

    // Compare expiration time with current time
    return decodedPayload.exp < currentTime;
  } catch (error) {
    console.error("Error checking token expiration:", error);
    // If we can't decode the token, consider it expired for safety
    return true;
  }
};

/**
 * Gets the remaining time in seconds before token expiration
 * @param token The JWT token to check
 * @returns number of seconds until expiration, or 0 if expired/invalid
 */
export const getTokenRemainingTime = (token: string): number => {
  if (!token) return 0;

  try {
    const payload = token.split(".")[1];
    const decodedPayload = JSON.parse(atob(payload));

    if (!decodedPayload.exp) return 0;

    const currentTime = Math.floor(Date.now() / 1000);
    const timeRemaining = decodedPayload.exp - currentTime;

    return timeRemaining > 0 ? timeRemaining : 0;
  } catch (error) {
    console.error("Error calculating token remaining time:", error);
    return 0;
  }
};
