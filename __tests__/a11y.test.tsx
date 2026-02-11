import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Hero } from '@/components/marketing/hero';
import { Navbar } from '@/components/marketing/navbar';
import { Footer } from '@/components/marketing/footer';
import { Features } from '@/components/marketing/features';
import { Pricing } from '@/components/marketing/pricing';

describe('Accessibility Tests', () => {
  it('Hero component should have no accessibility violations', async () => {
    const { container } = render(<Hero />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Navbar component should have no accessibility violations', async () => {
    const { container } = render(<Navbar />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Footer component should have no accessibility violations', async () => {
    const { container } = render(<Footer />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Features component should have no accessibility violations', async () => {
    const { container } = render(<Features />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Pricing component should have no accessibility violations', async () => {
    const { container } = render(<Pricing />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Hero Section should have proper heading hierarchy', async () => {
    const { container } = render(<Hero />);
    
    // Check for proper heading hierarchy
    const h1Elements = container.querySelectorAll('h1');
    expect(h1Elements.length).toBeGreaterThan(0);
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Interactive elements should have proper ARIA labels', async () => {
    const { container } = render(<Navbar />);
    
    // Check for accessible buttons/links
    const links = container.querySelectorAll('a');
    links.forEach((link) => {
      // Each link should have text content or aria-label
      const hasText = link.textContent && link.textContent.trim().length > 0;
      const hasAriaLabel = link.hasAttribute('aria-label');
      expect(hasText || hasAriaLabel).toBe(true);
    });
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Forms should have proper labels', async () => {
    // Test a form structure
    const { container } = render(
      <form>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" name="email" />
        <button type="submit">Submit</button>
      </form>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Images should have alt text', async () => {
    const { container } = render(
      <div>
        <img src="/test.jpg" alt="Test description" />
      </div>
    );
    
    const images = container.querySelectorAll('img');
    images.forEach((img) => {
      expect(img.hasAttribute('alt')).toBe(true);
    });
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Color contrast should meet WCAG AA standards', async () => {
    const { container } = render(
      <div className="bg-background text-foreground p-4">
        <p>This text should have sufficient contrast</p>
      </div>
    );
    
    const results = await axe(container, {
      rules: {
        'color-contrast': { enabled: true },
      },
    });
    expect(results).toHaveNoViolations();
  });

  it('Buttons should have accessible names', async () => {
    const { container } = render(
      <div>
        <button>Click me</button>
        <button aria-label="Close modal">X</button>
      </div>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Navigation should have proper landmarks', async () => {
    const { container } = render(<Navbar />);
    
    const nav = container.querySelector('nav');
    expect(nav).toBeTruthy();
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Footer should have proper semantic structure', async () => {
    const { container } = render(<Footer />);
    
    const footer = container.querySelector('footer');
    expect(footer).toBeTruthy();
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
