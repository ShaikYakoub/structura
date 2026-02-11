# Comprehensive Testing Guide for Structura

## Overview

This testing suite provides comprehensive coverage across multiple dimensions:

1. **Unit Tests**: Component and function testing in isolation
2. **Integration Tests**: Database integrity and cascade behavior
3. **Accessibility Tests**: WCAG compliance and a11y validation
4. **Security Tests**: Middleware protection and authentication
5. **E2E Tests**: Complete user flows and interactions
6. **Performance Tests**: Core Web Vitals and load times

## Quick Start

```bash
# Install all dependencies
npm install

# Run unit tests (fast)
npm run test

# Run unit tests in watch mode
npm run test:watch

# Run all E2E tests
npm run test:e2e

# Run everything
npm run test:all
```

## Test Organization

```
structura/
├── __tests__/
│   ├── a11y.test.tsx                    # Accessibility tests (13 tests)
│   ├── actions/
│   │   └── sites.test.ts                # Site CRUD tests
│   ├── integration/
│   │   └── cascade-delete.test.ts       # Database integrity (7 tests)
│   └── security/
│       └── middleware.test.ts           # Security tests (20+ tests)
├── components/
│   └── sections/
│       ├── hero-section.test.tsx        # Hero component tests
│       └── features-section.test.tsx    # Features component tests
├── e2e/
│   ├── auth.spec.ts                     # Authentication flows
│   ├── landing-page.spec.ts            # Landing page tests
│   ├── navigation.spec.ts              # Navigation tests
│   └── performance.spec.ts             # Performance tests (15+ tests)
└── vitest.config.ts                     # Unit test configuration
```

## Running Tests

### Unit & Integration Tests

```bash
# Run all unit/integration tests
npm run test

# Run in watch mode (re-run on file changes)
npm run test:watch

# Run with UI (interactive mode)
npm run test:ui

# Run with coverage report
npm run test:coverage

# Run specific test suites
npm run test:a11y              # Accessibility only
npm run test:integration       # Database integrity only
npm run test:security          # Security middleware only
```

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI (interactive mode)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run specific test file
npx playwright test e2e/auth.spec.ts

# Run performance tests only
npm run test:e2e:performance

# Debug a specific test
npm run test:e2e:debug

# View last test report
npm run test:e2e:report
```

## Test Categories

### 1. Accessibility Tests (`__tests__/a11y.test.tsx`)

**Purpose**: Ensure WCAG 2.1 AA compliance

**Coverage**:
- ✅ No accessibility violations (using axe-core)
- ✅ Proper heading hierarchy
- ✅ ARIA labels on interactive elements
- ✅ Form labels properly associated
- ✅ Images have alt text
- ✅ Color contrast meets standards
- ✅ Buttons have accessible names
- ✅ Proper semantic landmarks (nav, footer)

**Example**:
```typescript
it('Hero component should have no accessibility violations', async () => {
  const { container } = render(<Hero />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

**Running**:
```bash
npm run test:a11y
```

### 2. Database Integrity Tests (`__tests__/integration/cascade-delete.test.ts`)

**Purpose**: Verify database relationships and cascade behavior

**Coverage**:
- ✅ Cascade delete: User → Sites → Pages
- ✅ Cascade delete: Site → Pages
- ✅ Isolation: Deleting one user doesn't affect others
- ✅ Audit log cascade behavior
- ✅ No orphaned records
- ✅ Unique constraints (subdomain, custom domain)

**Setup**:
1. Create `.env.test.local`:
   ```bash
   DATABASE_TEST_URL=postgresql://user:pass@localhost:5432/structura_test
   ```

2. Create test database:
   ```bash
   createdb structura_test
   npx prisma migrate deploy
   ```

**Example**:
```typescript
it('should cascade delete site and pages when user is deleted', async () => {
  await prisma.user.delete({ where: { id: testUserId } });
  
  const siteCount = await prisma.site.count({ where: { id: testSiteId } });
  expect(siteCount).toBe(0);
});
```

**Running**:
```bash
npm run test:integration
```

**Important**: These tests modify the database. Always use a separate test database!

### 3. Security Tests (`__tests__/security/middleware.test.ts`)

**Purpose**: Validate authentication, authorization, and routing security

**Coverage**:
- ✅ Admin route protection (non-admins get 404)
- ✅ Super admin access
- ✅ Banned user redirection
- ✅ Subdomain routing
- ✅ Custom domain handling
- ✅ www → non-www redirect
- ✅ Query parameter preservation
- ✅ Special character handling
- ✅ Security through obscurity (404 instead of 403)

**Example**:
```typescript
it('should redirect non-admin users away from /admin', async () => {
  vi.mocked(getToken).mockResolvedValue(null);
  
  const req = new NextRequest(new URL('http://localhost:3000/admin'));
  const response = await middleware(req);
  
  expect(response?.headers.get('x-middleware-rewrite')).toContain('/404');
});
```

**Running**:
```bash
npm run test:security
```

### 4. Performance Tests (`e2e/performance.spec.ts`)

**Purpose**: Measure Core Web Vitals and load performance

**Coverage**:
- ✅ Time to First Byte (TTFB < 800ms)
- ✅ First Contentful Paint (FCP < 1.8s)
- ✅ Cumulative Layout Shift (CLS < 0.1)
- ✅ Total Blocking Time (TBT < 300ms)
- ✅ Time to Interactive (TTI < 3.8s)
- ✅ Image optimization (< 200KB each)
- ✅ Lazy loading implementation
- ✅ JavaScript bundle size (< 500KB)
- ✅ Cache effectiveness
- ✅ Mobile performance

**Example**:
```typescript
test('Landing page should meet Core Web Vitals thresholds', async ({ page }) => {
  await page.goto('/');
  const metrics = await page.evaluate(() => /* measure performance */);
  
  expect(metrics.ttfb).toBeLessThan(800);
  expect(metrics.fcp).toBeLessThan(1800);
});
```

**Running**:
```bash
npm run test:e2e:performance
```

**Thresholds**:
- **Good**: Meets all thresholds
- **Needs Improvement**: Some metrics exceed thresholds
- **Poor**: Multiple metrics fail

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
      - run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Coverage Goals

Target coverage metrics:

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

View coverage:
```bash
npm run test:coverage
# Open coverage/index.html in browser
```

## Debugging Tests

### Unit Tests

```bash
# Run specific test file
npm run test hero-section.test.tsx

# Run tests matching pattern
npm run test -- -t "renders the title"

# Debug with VS Code
# Add breakpoint and use "JavaScript Debug Terminal"
```

### E2E Tests

```bash
# Run in headed mode (see browser)
npm run test:e2e:headed

# Debug mode with Playwright Inspector
npm run test:e2e:debug

# Run specific test
npx playwright test -g "should login successfully"

# Run on specific browser
npx playwright test --project=chromium
```

## Best Practices

### 1. Test Naming

```typescript
// ✅ Good - Describes behavior
it('should redirect banned users to /banned page', async () => {});

// ❌ Bad - Too vague
it('test banned users', async () => {});
```

### 2. Arrange-Act-Assert Pattern

```typescript
it('should create a new site', async () => {
  // Arrange
  const user = await createTestUser();
  
  // Act
  const site = await createSite(user.id, { name: 'Test' });
  
  // Assert
  expect(site.name).toBe('Test');
});
```

### 3. Isolation

```typescript
// Each test should be independent
beforeEach(async () => {
  // Reset state
  await cleanupTestData();
});

afterEach(async () => {
  // Cleanup
  await cleanupTestData();
});
```

### 4. Meaningful Assertions

```typescript
// ✅ Good - Tests user behavior
expect(screen.getByRole('button', { name: /submit/i })).toBeEnabled();

// ❌ Bad - Tests implementation
expect(component.state.isEnabled).toBe(true);
```

## Troubleshooting

### Issue: Tests timeout

**Solution**: Increase timeout in config

```typescript
// vitest.config.ts
test: {
  testTimeout: 10000, // 10 seconds
}

// playwright.config.ts
timeout: 60 * 1000, // 60 seconds
```

### Issue: Flaky E2E tests

**Solutions**:
1. Wait for network idle: `waitUntil: 'networkidle'`
2. Use explicit waits: `await page.waitForSelector('.element')`
3. Increase retries: `retries: 2`
4. Check for race conditions

### Issue: Database tests fail

**Solutions**:
1. Ensure test database exists
2. Run migrations: `npx prisma migrate deploy`
3. Check connection string in `.env.test`
4. Verify cleanup in `afterEach`

### Issue: Accessibility tests fail

**Solutions**:
1. Check axe violations output
2. Verify ARIA labels exist
3. Ensure proper heading hierarchy
4. Test color contrast manually
5. Use browser DevTools accessibility panel

## Performance Budgets

Set performance budgets in your tests:

```typescript
// e2e/performance.spec.ts
const PERFORMANCE_BUDGETS = {
  TTFB: 800,      // Time to First Byte
  FCP: 1800,      // First Contentful Paint
  LCP: 2500,      // Largest Contentful Paint
  CLS: 0.1,       // Cumulative Layout Shift
  TBT: 300,       // Total Blocking Time
  TTI: 3800,      // Time to Interactive
};
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [jest-axe](https://github.com/nickcolley/jest-axe)
- [Web Vitals](https://web.dev/vitals/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## Next Steps

1. ✅ Run all tests: `npm run test:all`
2. ✅ Check coverage: `npm run test:coverage`
3. ✅ Fix any failing tests
4. ✅ Set up CI/CD pipeline
5. ✅ Monitor test results in CI
6. ✅ Add more tests as features grow
