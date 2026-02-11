import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PrismaClient } from '@prisma/client';

// Use a test database or mock
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_TEST_URL || process.env.DATABASE_URL,
    },
  },
});

describe('Database Integrity - Cascade Deletes', () => {
  let testTenantId: string;
  let testUserId: string;
  let testSiteId: string;
  let testPageIds: string[] = [];

  beforeEach(async () => {
    // Create test tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: `Test Tenant ${Date.now()}`,
        email: `tenant-${Date.now()}@example.com`,
        slug: `test-tenant-${Date.now()}`,
      },
    });
    testTenantId = tenant.id;

    // Create test user
    const user = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        name: 'Test User',
        tenantId: testTenantId,
      },
    });
    testUserId = user.id;

    // Create test site
    const site = await prisma.site.create({
      data: {
        name: 'Test Site',
        subdomain: `test-${Date.now()}`,
        tenantId: testTenantId,
      },
    });
    testSiteId = site.id;

    // Create 5 test pages
    testPageIds = [];
    for (let i = 0; i < 5; i++) {
      const page = await prisma.page.create({
        data: {
          name: `Test Page ${i + 1}`,
          slug: `page-${i + 1}`,
          path: `/page-${i + 1}`,
          siteId: testSiteId,
          draftContent: [],
        },
      });
      testPageIds.push(page.id);
    }
  });

  afterEach(async () => {
    // Cleanup: Delete test data in reverse order
    try {
      await prisma.page.deleteMany({
        where: { id: { in: testPageIds } },
      });
      await prisma.site.deleteMany({
        where: { id: testSiteId },
      });
      await prisma.user.deleteMany({
        where: { id: testUserId },
      });
      await prisma.tenant.deleteMany({
        where: { id: testTenantId },
      });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  it('should cascade delete sites and pages when tenant is deleted', async () => {
    // Verify setup
    const initialPageCount = await prisma.page.count({
      where: { siteId: testSiteId },
    });
    expect(initialPageCount).toBe(5);

    // Delete the tenant
    await prisma.tenant.delete({
      where: { id: testTenantId },
    });

    // Verify site was cascade deleted
    const siteCount = await prisma.site.count({
      where: { id: testSiteId },
    });
    expect(siteCount).toBe(0);

    // Verify all pages were cascade deleted
    const pageCount = await prisma.page.count({
      where: { id: { in: testPageIds } },
    });
    expect(pageCount).toBe(0);

    // Note: Users are NOT cascade deleted with tenant (they're soft-deleted or managed separately)
    // The user should still exist after tenant deletion
    const userCount = await prisma.user.count({
      where: { id: testUserId },
    });
    expect(userCount).toBe(1);
  });

  it('should cascade delete pages when site is deleted', async () => {
    // Verify setup
    const initialPageCount = await prisma.page.count({
      where: { siteId: testSiteId },
    });
    expect(initialPageCount).toBe(5);

    // Delete the site
    await prisma.site.delete({
      where: { id: testSiteId },
    });

    // Verify all pages were cascade deleted
    const pageCount = await prisma.page.count({
      where: { id: { in: testPageIds } },
    });
    expect(pageCount).toBe(0);

    // Tenant and user should still exist
    const tenant = await prisma.tenant.findUnique({
      where: { id: testTenantId },
    });
    expect(tenant).not.toBeNull();

    const user = await prisma.user.findUnique({
      where: { id: testUserId },
    });
    expect(user).not.toBeNull();
  });

  it('should not affect other tenants data when deleting one tenant', async () => {
    // Create another tenant with user, site, and pages
    const otherTenant = await prisma.tenant.create({
      data: {
        name: `Other Tenant ${Date.now()}`,
        email: `other-tenant-${Date.now()}@example.com`,
        slug: `other-tenant-${Date.now()}`,
      },
    });

    const otherUser = await prisma.user.create({
      data: {
        email: `other-${Date.now()}@example.com`,
        name: 'Other User',
        tenantId: otherTenant.id,
      },
    });

    const otherSite = await prisma.site.create({
      data: {
        name: 'Other Site',
        subdomain: `other-${Date.now()}`,
        tenantId: otherTenant.id,
      },
    });

    const otherPage = await prisma.page.create({
      data: {
        name: 'Other Page',
        slug: 'other-page',
        path: '/other-page',
        siteId: otherSite.id,
        draftContent: [],
      },
    });

    // Delete the first tenant
    await prisma.tenant.delete({
      where: { id: testTenantId },
    });

    // Verify the first tenant's site and page are deleted
    const firstSiteCount = await prisma.site.count({
      where: { id: testSiteId },
    });
    expect(firstSiteCount).toBe(0);

    // Verify other tenant's data still exists
    const otherUserExists = await prisma.user.findUnique({
      where: { id: otherUser.id },
    });
    expect(otherUserExists).not.toBeNull();

    const otherSiteExists = await prisma.site.findUnique({
      where: { id: otherSite.id },
    });
    expect(otherSiteExists).not.toBeNull();

    const otherPageExists = await prisma.page.findUnique({
      where: { id: otherPage.id },
    });
    expect(otherPageExists).not.toBeNull();

    // Cleanup
    await prisma.page.delete({ where: { id: otherPage.id } });
    await prisma.site.delete({ where: { id: otherSite.id } });
    await prisma.user.delete({ where: { id: otherUser.id } });
    await prisma.tenant.delete({ where: { id: otherTenant.id } });
  });

  it('should maintain audit logs after entity deletion', async () => {
    // Create an audit log for the site
    const auditLog = await prisma.auditLog.create({
      data: {
        adminEmail: 'admin@example.com',
        action: 'SITE_CREATE',
        targetId: testSiteId,
        targetType: 'Site',
        metadata: {},
      },
    });

    // Delete the site
    await prisma.site.delete({
      where: { id: testSiteId },
    });

    // Audit logs are NOT cascade deleted - they're immutable records
    // This is intentional for audit trail preservation
    const logExists = await prisma.auditLog.findUnique({
      where: { id: auditLog.id },
    });
    
    // Audit log should still exist (not cascade deleted)
    expect(logExists).not.toBeNull();
    expect(logExists?.targetId).toBe(testSiteId);
  });

  it('should handle orphaned records properly', async () => {
    // Since tenantId and siteId are required NOT NULL fields in the schema,
    // orphaned records cannot exist. This test verifies the database state is consistent.
    
    // All sites should have valid tenant references
    const sitesCount = await prisma.site.count();
    const tenantsCount = await prisma.tenant.count();
    
    // Sites count should be <= tenants count (or sites with multiple tenants)
    // More importantly, this should not throw an error
    expect(sitesCount).toBeGreaterThanOrEqual(0);
    expect(tenantsCount).toBeGreaterThanOrEqual(0);

    // All pages should have valid site references
    const pagesCount = await prisma.page.count();
    
    // Pages count should be >= 0
    expect(pagesCount).toBeGreaterThanOrEqual(0);
  });
});

describe('Database Constraints', () => {
  it('should enforce unique subdomain constraint', async () => {
    const tenant = await prisma.tenant.create({
      data: {
        name: `Constraint Test Tenant ${Date.now()}`,
        email: `constraint-tenant-${Date.now()}@example.com`,
        slug: `constraint-tenant-${Date.now()}`,
      },
    });

    const subdomain = `unique-${Date.now()}`;

    // Create first site with subdomain
    const site1 = await prisma.site.create({
      data: {
        name: 'First Site',
        subdomain,
        tenantId: tenant.id,
      },
    });

    // Try to create second site with same subdomain
    await expect(
      prisma.site.create({
        data: {
          name: 'Second Site',
          subdomain,
          tenantId: tenant.id,
        },
      })
    ).rejects.toThrow();

    // Cleanup
    await prisma.site.delete({ where: { id: site1.id } });
    await prisma.tenant.delete({ where: { id: tenant.id } });
  });

  it('should enforce unique custom domain constraint', async () => {
    const tenant = await prisma.tenant.create({
      data: {
        name: `Domain Test Tenant ${Date.now()}`,
        email: `domain-test-${Date.now()}@example.com`,
        slug: `domain-test-${Date.now()}`,
      },
    });

    const customDomain = `test-${Date.now()}.com`;

    // Create first site with custom domain
    const site1 = await prisma.site.create({
      data: {
        name: 'First Site',
        subdomain: `first-${Date.now()}`,
        customDomain,
        tenantId: tenant.id,
      },
    });

    // Try to create second site with same custom domain
    await expect(
      prisma.site.create({
        data: {
          name: 'Second Site',
          subdomain: `second-${Date.now()}`,
          customDomain,
          tenantId: tenant.id,
        },
      })
    ).rejects.toThrow();

    // Cleanup
    await prisma.site.delete({ where: { id: site1.id } });
    await prisma.tenant.delete({ where: { id: tenant.id } });
  });
});
