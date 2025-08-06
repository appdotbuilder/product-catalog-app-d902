
import { type AdminLoginInput, type AdminAuthResponse } from '../schema';
import { randomBytes } from 'crypto';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'mysecurepass';

export async function adminLogin(input: AdminLoginInput): Promise<AdminAuthResponse> {
  try {
    // Validate credentials
    if (input.username !== ADMIN_USERNAME || input.password !== ADMIN_PASSWORD) {
      return {
        success: false,
        message: 'Invalid credentials'
      };
    }

    // Generate session token
    const sessionToken = randomBytes(32).toString('hex');

    return {
      success: true,
      message: 'Login successful',
      sessionToken
    };
  } catch (error) {
    console.error('Admin login failed:', error);
    throw error;
  }
}
