
import { db } from '../db';
import { sql } from 'drizzle-orm';

export async function verifyAdminSession(sessionToken: string): Promise<{ isValid: boolean }> {
  try {
    // Get current timestamp for expiration check
    const now = new Date();
    
    // Query using raw SQL with the actual table name that should exist
    const result = await db.execute(sql`
      SELECT * FROM admin_sessions 
      WHERE id = ${sessionToken} 
      AND expires_at > ${now}
    `);

    // Check if session exists and is not expired
    return { isValid: result.rows && result.rows.length > 0 };
  } catch (error) {
    console.error('Session verification failed:', error);
    return { isValid: false };
  }
}
