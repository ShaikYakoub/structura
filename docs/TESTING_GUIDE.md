# Testing Guide for Structura

## Overview

Structura uses a comprehensive testing suite that includes:
- **Unit Tests**: Testing individual components in isolation
- **Integration Tests**: Testing how different parts work together
- **E2E Tests**: Testing complete user flows

## Testing Stack

### Unit & Integration Tests (Vitest)
- **Vitest**: Fast unit test framework
- **React Testing Library**: Component testing utilities
- **@testing-library/jest-dom**: Custom Jest matchers

### E2E Tests (Playwright)
- **Playwright**: Cross-browser testing framework
- **Multiple browsers**: Chromium, Firefox, WebKit
- **Mobile testing**: Device emulation

## Running Tests

### Unit & Integration Tests

```bash
# Run all unit tests
npm run test

# Run tests in watch mode (auto-rerun on file changes)
npm run test -- --watch

# Run tests with UI (interactive mode)
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI (interactive mode)
npm run test:e2e:ui

# Debug E2E tests (step through tests)
npm run test:e2e:debug

# View last E2E test report
npm run test:e2e:report

# Run tests in specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Test Structure

### Unit Tests

Unit tests are located next to the components they test:

```
components/
├── sections/
│   ├── hero-section.tsx
│   ├── hero-section.test.tsx  ← Unit test
│   ├── features-section.tsx
│   └── features-section.test.tsx
```

**Example Unit Test:**

```typescript
import { render, screen } from '@testing-library/react';
import { HeroSection } from './hero-section';

describe('HeroSection', () => {
  it('renders the title', () => {
    render(<HeroSection title="Welcome" />);
    expect(screen.getByText('Welcome')).toBeInTheDocument();
  });
});
```

### Integration Tests

Integration tests are in the `__tests__` directory:

```
__tests__/
├── actions/
│   └── sites.test.ts  ← Integration test
```

**Example Integration Test:**

```typescript
import { createSite } from '@/app/actions/sites';

describe('Site Actions', () => {
  it('creates a site successfully', async () => {
    const result = await createSite('user-123', {
      name: 'Test Site',
      subdomain: 'test',
    });
    expect(result.success).toBe(true);
  });
});
```

### E2E Tests

E2E tests are in the `e2e` directory:

```
e2e/
├── landing-page.spec.ts  ← Landing page tests
├── auth.spec.ts          ← Authentication tests
└── navigation.spec.ts    ← Navigation tests
```

**Example E2E Test:**

```typescript
import { test, expect } from '@playwright/test';

test('should load homepage', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Structura/);
});
```

## Writing Tests

### Unit Test Best Practices

1. **Test User Behavior, Not Implementation**

```typescript
// ✅ Good - Tests what user sees
expect(screen.getByText('Welcome')).toBeInTheDocument();

// ❌ Bad - Tests implementation details
expect(component.state.title).toBe('Welcome');
```

2. **Use Testing Library Queries**

```typescript
// Prefer in this order:
screen.getByRole('button', { name: /submit/i })
screen.getByLabelText('Email')
screen.getByPlaceholderText('Enter email')
screen.getByText('Welcome')
```

3. **Test Accessibility**

```typescript
it('has accessible form', () => {
  render(<LoginForm />);
  
  // Labels should be properly associated
  const emailInput = screen.getByLabelText('Email');
  expect(emailInput).toHaveAttribute('type', 'email');
  
  // Buttons should have accessible names
  const submitButton = screen.getByRole('button', { name: /sign in/i });
  expect(submitButton).toBeEnabled();
});
```

### E2E Test Best Practices

1. **Use Page Object Pattern**

```typescript
// Create reusable page objects
class LoginPage {
  constructor(private page: Page) {}
  
  async login(email: string, password: string) {
    await this.page.fill('[name="email"]', email);
    await this.page.fill('[name="password"]', password);
    await this.page.click('button[type="submit"]');
  }
}
```

2. **Wait for Network Idle**

```typescript
await page.goto('/', { waitUntil: 'networkidle' });
```

3. **Use Soft Assertions for Non-Critical Checks**

```typescript
// Continue test even if this fails
await expect.soft(page.locator('.badge')).toBeVisible();

// This will still run even if above fails
await expect(page.locator('.title')).toBeVisible();
```

## Continuous Integration

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
      - run: npm ci
      - run: npm run test:coverage

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```

## Debugging Tests

### Unit Tests

```bash
# Run specific test file
npm run test hero-section.test.tsx

# Run tests matching pattern
npm run test -- -t "renders the title"

# Debug mode (opens debugger)
node --inspect-brk node_modules/.bin/vitest
```

### E2E Tests

```bash
# Run with headed browser (see what's happening)
npx playwright test --headed

# Run specific test file
npx playwright test e2e/auth.spec.ts

# Run specific test
npx playwright test -g "should login successfully"

# Debug with Playwright Inspector
npm run test:e2e:debug
```

## Test Coverage

### Viewing Coverage

```bash
# Generate coverage report
npm run test:coverage

# Open coverage report in browser
open coverage/index.html  # macOS
start coverage/index.html # Windows
```

### Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

## Mocking

### Mocking Prisma

```typescript
vi.mock('@/lib/prisma', () => ({
  prisma: {
    site: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));
```

### Mocking Next.js Router

```typescript
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
  }),
}));
```

### Mocking API Routes in E2E

```typescript
await page.route('**/api/sites', async (route) => {
  await route.fulfill({
    status: 200,
    body: JSON.stringify({ success: true }),
  });
});
```

## Common Issues

### Issue: Tests timeout in CI

**Solution**: Increase timeout in playwright.config.ts

```typescript
timeout: 60 * 1000, // 60 seconds
```

### Issue: Flaky E2E tests

**Solutions**:
1. Wait for network idle: `waitUntil: 'networkidle'`
2. Use explicit waits: `await page.waitForSelector('.element')`
3. Increase retries: `retries: 2`

### Issue: Component not found in tests

**Solution**: Use proper queries and wait for elements

```typescript
// Wait for element to appear
await screen.findByText('Welcome');

// Check if element exists without throwing
const element = screen.queryByText('Optional');
expect(element).toBeInTheDocument();
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Next Steps

1. Add more component tests for all sections
2. Add integration tests for server actions
3. Add E2E tests for complete user flows
4. Set up CI/CD pipeline with automated tests
5. Add visual regression testing with Playwright
6. Monitor test coverage and improve it over time
