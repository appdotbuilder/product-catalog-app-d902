
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { verifyAdminSession } from '../handlers/verify_admin_session';
import { sql } from 'drizzle-orm';

describe('verifyAdminSession', () => {
  beforeEach(async () => {
    await createDB();
    // Create the admin_sessions table manually since it might not be in the schema migration
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS admin_sessions (
        id TEXT PRIMARY KEY,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL
      )
    `);
  });
  
  afterEach(resetDB);

  it('should return valid for unexpired session', async () => {
    // Create a session that expires in 1 hour
    const sessionToken = 'test-session-token-123';
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Insert using raw SQL
    await db.execute(sql`
      INSERT INTO admin_sessions (id, expires_at) 
      VALUES (${sessionToken}, ${expiresAt})
    `);

    const result = await verifyAdminSession(sessionToken);

    expect(result.isValid).toBe(true);
  });

  it('should return invalid for expired session', async () => {
    // Create a session that expired 1 hour ago
    const sessionToken = 'expired-session-token';
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() - 1);

    await db.execute(sql`
      INSERT INTO admin_sessions (id, expires_at) 
      VALUES (${sessionToken}, ${expiresAt})
    `);

    const result = await verifyAdminSession(sessionToken);

    expect(result.isValid).toBe(false);
  });

  it('should return invalid for non-existent session', async () => {
    const result = await verifyAdminSession('non-existent-token');

    expect(result.isValid).toBe(false);
  });

  it('should return invalid for empty session token', async () => {
    const result = await verifyAdminSession('');

    expect(result.isValid).toBe(false);
  });

  it('should handle session exactly at expiration time', async () => {
    // Create a session that expires exactly now
    const sessionToken = 'exactly-expired-token';
    const expiresAt = new Date();

    await db.execute(sql`
      INSERT INTO admin_sessions (id, expires_at) 
      VALUES (${sessionToken}, ${expiresAt})
    `);

    // Wait a tiny bit to ensure we're past expiration
    await new Promise(resolve => setTimeout(resolve, 10));

    const result = await verifyAdminSession(sessionToken);

    expect(result.isValid).toBe(false);
  });

  it('should verify multiple sessions independently', async () => {
    // Create one valid and one expired session
    const validToken = 'valid-token';
    const expiredToken = 'expired-token';
    
    const futureDate = new Date();
    futureDate.setHours(futureDate.getHours() + 1);
    
    const pastDate = new Date();
    pastDate.setHours(pastDate.getHours() - 1);

    await db.execute(sql`
      INSERT INTO admin_sessions (id, expires_at) 
      VALUES (${validToken}, ${futureDate})
    `);
    
    await db.execute(sql`
      INSERT INTO admin_sessions (id, expires_at) 
      VALUES (${expiredToken}, ${pastDate})
    `);

    const validResult = await verifyAdminSession(validToken);
    const expiredResult = await verifyAdminSession(expiredToken);

    expect(validResult.isValid).toBe(true);
    expect(expiredResult.isValid).toBe(false);
  });
});
