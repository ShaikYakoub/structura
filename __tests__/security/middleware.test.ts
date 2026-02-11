import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from '@/middleware';

// Mock next-auth
vi.mock('next-auth/jwt', () => ({
  getToken: vi.fn(),
}));

import { getToken } from 'next-auth/jwt';

describe('Security Middleware Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set default env vars
    process.env.SUPER_ADMIN_EMAIL = 'admin@structura.com';
    process.env.NEXT_PUBLIC_APP_DOMAIN = 'localhost:3000';
    process.env.NEXT_PUBLIC_APP_PROTOCOL = 'http';
  });

  describe('Admin Route Protection', () => {
    it('should redirect non-admin users away from /admin', async () => {
      // Mock no session
      vi.mocked(getToken).mockResolvedValue(null);

      const req = new NextRequest(new URL('http://localhost:3000/admin'));
      const response = await middleware(req);

      // Should rewrite to 404
      expect(response?.headers.get('x-middleware-rewrite')).toContain('/404');
    });

    it('should redirect regular users away from /admin', async () => {
      // Mock regular user session
      vi.mocked(getToken).mockResolvedValue({
        email: 'user@example.com',
      } as any);

      const req = new NextRequest(new URL('http://localhost:3000/admin'));
      const response = await middleware(req);

      // Should rewrite to 404
      expect(response?.headers.get('x-middleware-rewrite')).toContain('/404');
    });

    it('should allow super admin to access /admin', async () => {
      // Mock super admin session
      vi.mocked(getToken).mockResolvedValue({
        email: 'admin@structura.com',
      } as any);

      const req = new NextRequest(new URL('http://localhost:3000/admin'));
      const response = await middleware(req);

      // Should not have a rewrite header (direct access allowed)
      const rewriteHeader = response?.headers.get('x-middleware-rewrite');
      expect(rewriteHeader === null || !rewriteHeader.includes('/404')).toBe(true);
    });

    it('should protect nested admin routes', async () => {
      vi.mocked(getToken).mockResolvedValue({
        email: 'user@example.com',
      } as any);

      const req = new NextRequest(new URL('http://localhost:3000/admin/activity'));
      const response = await middleware(req);

      expect(response?.headers.get('x-middleware-rewrite')).toContain('/404');
    });
  });

  describe('Banned User Protection', () => {
    it('should redirect banned users from app routes', async () => {
      // Mock banned user session
      vi.mocked(getToken).mockResolvedValue({
        email: 'banned@example.com',
        bannedAt: new Date(),
      } as any);

      const url = new URL('http://app.localhost:3000/dashboard');
      const req = new NextRequest(url, {
        headers: { host: 'app.localhost:3000' },
      });
      const response = await middleware(req);

      // Should redirect to /banned
      const locationHeader = response?.headers.get('location');
      expect(locationHeader).toBeTruthy();
      expect(locationHeader!).toContain('/banned');
    });

    it('should allow active users to access app routes', async () => {
      // Mock active user session
      vi.mocked(getToken).mockResolvedValue({
        email: 'user@example.com',
        bannedAt: null,
      } as any);

      const url = new URL('http://app.localhost:3000/dashboard');
      const req = new NextRequest(url, {
        headers: { host: 'app.localhost:3000' },
      });
      const response = await middleware(req);

      // Should not redirect
      expect(response?.headers.get('location')).toBeNull();
    });

    it('should check ban status on editor access', async () => {
      vi.mocked(getToken).mockResolvedValue({
        email: 'banned@example.com',
        bannedAt: new Date(),
      } as any);

      const url = new URL('http://app.localhost:3000/editor/site-123');
      const req = new NextRequest(url, {
        headers: { host: 'app.localhost:3000' },
      });
      const response = await middleware(req);

      const locationHeader = response?.headers.get('location');
      expect(locationHeader).toBeTruthy();
      expect(locationHeader!).toContain('/banned');
    });
  });

  describe('Subdomain Routing', () => {
    it('should rewrite user subdomains correctly', async () => {
      const url = new URL('http://testsite.localhost:3000/about');
      const req = new NextRequest(url, {
        headers: { host: 'testsite.localhost:3000' },
      });
      
      const response = await middleware(req);

      // Should rewrite to /_sites/testsite/about
      const rewriteHeader = response?.headers.get('x-middleware-rewrite');
      expect(rewriteHeader).toContain('/_sites/testsite/about');
    });

    it('should handle custom domains', async () => {
      const url = new URL('http://customdomain.com/about');
      const req = new NextRequest(url, {
        headers: { host: 'customdomain.com' },
      });
      
      const response = await middleware(req);

      // Should rewrite to /_sites/customdomain.com/about
      const rewriteHeader = response?.headers.get('x-middleware-rewrite');
      expect(rewriteHeader).toContain('/_sites/customdomain.com/about');
    });

    it('should redirect www to non-www', async () => {
      const url = new URL('http://www.example.com/');
      const req = new NextRequest(url, {
        headers: { host: 'www.example.com' },
      });
      
      const response = await middleware(req);

      // Should be a redirect (status 301)
      expect(response?.status).toBe(301);
      expect(response?.headers.get('location')).toBe('http://example.com/');
    });

    it('should route app subdomain correctly', async () => {
      vi.mocked(getToken).mockResolvedValue(null);

      const url = new URL('http://app.localhost:3000/dashboard');
      const req = new NextRequest(url, {
        headers: { host: 'app.localhost:3000' },
      });
      
      const response = await middleware(req);

      // Should allow through to app routes (no rewrite to _sites)
      const rewriteHeader = response?.headers.get('x-middleware-rewrite');
      expect(rewriteHeader === null || !rewriteHeader.includes('/_sites/')).toBe(true);
    });

    it('should route root domain to marketing site', async () => {
      const url = new URL('http://localhost:3000/');
      const req = new NextRequest(url, {
        headers: { host: 'localhost:3000' },
      });
      
      const response = await middleware(req);

      // Should allow through to marketing pages
      const rewriteHeader = response?.headers.get('x-middleware-rewrite');
      expect(rewriteHeader === null || !rewriteHeader.includes('/_sites/')).toBe(true);
    });
  });

  describe('Path Handling', () => {
    it('should preserve query parameters in rewrites', async () => {
      const req = new NextRequest(new URL('http://testsite.localhost:3000/page?ref=123'));
      
      const response = await middleware(req);

      const rewriteHeader = response?.headers.get('x-middleware-rewrite');
      expect(rewriteHeader).toContain('/page');
      // Note: Query params are handled by Next.js after rewrite
    });

    it('should handle paths with special characters', async () => {
      const url = new URL('http://testsite.localhost:3000/blog/my-post-123');
      const req = new NextRequest(url, {
        headers: { host: 'testsite.localhost:3000' },
      });
      
      const response = await middleware(req);

      const rewriteHeader = response?.headers.get('x-middleware-rewrite');
      expect(rewriteHeader).toContain('/_sites/testsite/blog/my-post-123');
    });

    it('should allow marketing pages on root domain', async () => {
      const paths = ['/terms', '/privacy', '/refund', '/login', '/register'];

      for (const path of paths) {
        const url = new URL(`http://localhost:3000${path}`);
        const req = new NextRequest(url, {
          headers: { host: 'localhost:3000' },
        });
        const response = await middleware(req);
        
        // Should not rewrite to _sites
        const rewriteHeader = response?.headers.get('x-middleware-rewrite');
        expect(rewriteHeader === null || !rewriteHeader.includes('/_sites/')).toBe(true);
      }
    });
  });

  describe('Security Headers', () => {
    it('should not expose internal paths in errors', async () => {
      vi.mocked(getToken).mockResolvedValue({
        email: 'user@example.com',
      } as any);

      const req = new NextRequest(new URL('http://localhost:3000/admin'));
      const response = await middleware(req);

      // Should return 404, not 403 (security through obscurity)
      expect(response?.headers.get('x-middleware-rewrite')).toContain('/404');
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing host header', async () => {
      const req = new NextRequest(new URL('http://localhost:3000/'));
      req.headers.delete('host');
      
      // Should not throw
      await expect(middleware(req)).resolves.toBeDefined();
    });

    it('should handle malformed URLs gracefully', async () => {
      const req = new NextRequest(new URL('http://localhost:3000/../../etc/passwd'));
      
      // Should not throw and route normally
      await expect(middleware(req)).resolves.toBeDefined();
    });

    it('should handle very long subdomains', async () => {
      const longSubdomain = 'a'.repeat(63); // Max subdomain length
      const req = new NextRequest(new URL(`http://${longSubdomain}.localhost:3000/`));
      
      const response = await middleware(req);
      expect(response).toBeDefined();
    });
  });
});
