
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { type AdminLoginInput } from '../schema';
import { adminLogin } from '../handlers/admin_login';

describe('adminLogin', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should authenticate admin with correct credentials', async () => {
    const input: AdminLoginInput = {
      username: 'admin',
      password: 'mysecurepass'
    };

    const result = await adminLogin(input);

    expect(result.success).toBe(true);
    expect(result.message).toEqual('Login successful');
    expect(result.sessionToken).toBeDefined();
    expect(typeof result.sessionToken).toBe('string');
    expect(result.sessionToken!.length).toBeGreaterThan(0);
  });

  it('should reject invalid username', async () => {
    const input: AdminLoginInput = {
      username: 'wronguser',
      password: 'mysecurepass'
    };

    const result = await adminLogin(input);

    expect(result.success).toBe(false);
    expect(result.message).toEqual('Invalid credentials');
    expect(result.sessionToken).toBeUndefined();
  });

  it('should reject invalid password', async () => {
    const input: AdminLoginInput = {
      username: 'admin',
      password: 'wrongpassword'
    };

    const result = await adminLogin(input);

    expect(result.success).toBe(false);
    expect(result.message).toEqual('Invalid credentials');
    expect(result.sessionToken).toBeUndefined();
  });

  it('should generate unique session tokens for valid logins', async () => {
    const input: AdminLoginInput = {
      username: 'admin',
      password: 'mysecurepass'
    };

    const result1 = await adminLogin(input);
    const result2 = await adminLogin(input);

    expect(result1.success).toBe(true);
    expect(result2.success).toBe(true);
    expect(result1.sessionToken).toBeDefined();
    expect(result2.sessionToken).toBeDefined();
    expect(result1.sessionToken).not.toEqual(result2.sessionToken);
  });

  it('should return proper response structure for failed login', async () => {
    const input: AdminLoginInput = {
      username: 'admin',
      password: 'wrong'
    };

    const result = await adminLogin(input);

    expect(result).toEqual({
      success: false,
      message: 'Invalid credentials'
    });
    expect(result.sessionToken).toBeUndefined();
  });
});
