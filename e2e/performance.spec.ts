import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Performance Tests', () => {
  test('Landing page should meet Core Web Vitals thresholds', async ({ page }) => {
    // Navigate and wait for load
    await page.goto('/', { waitUntil: 'networkidle' });

    // Measure performance metrics
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        // Wait for all performance entries
        setTimeout(() => {
          const perfData = performance.getEntriesByType('navigation')[0] as any;
          const paintEntries = performance.getEntriesByType('paint');
          
          const fcp = paintEntries.find(
            (entry) => entry.name === 'first-contentful-paint'
          )?.startTime || 0;

          resolve({
            // Time to First Byte
            ttfb: perfData?.responseStart || 0,
            // First Contentful Paint
            fcp,
            // DOM Content Loaded
            domContentLoaded: perfData?.domContentLoadedEventEnd || 0,
            // Load Complete
            loadComplete: perfData?.loadEventEnd || 0,
          });
        }, 2000);
      });
    });

    const perf = metrics as any;
    
    console.log('Performance Metrics:');
    console.log(`  TTFB: ${perf.ttfb}ms`);
    console.log(`  FCP: ${perf.fcp}ms`);
    console.log(`  DOM Content Loaded: ${perf.domContentLoaded}ms`);
    console.log(`  Load Complete: ${perf.loadComplete}ms`);

    // Core Web Vitals thresholds
    expect(perf.ttfb).toBeLessThan(800); // TTFB < 800ms
    expect(perf.fcp).toBeLessThan(1800); // FCP < 1.8s (good)
    expect(perf.domContentLoaded).toBeLessThan(3000); // DCL < 3s
    expect(perf.loadComplete).toBeLessThan(5000); // Load < 5s
  });

  test('Landing page should have acceptable Cumulative Layout Shift', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to stabilize
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Measure CLS
    const cls = await page.evaluate(() => {
      return new Promise((resolve) => {
        let clsValue = 0;

        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const layoutShift = entry as any;
            if (!layoutShift.hadRecentInput) {
              clsValue += layoutShift.value;
            }
          }
        });

        observer.observe({ type: 'layout-shift', buffered: true });

        setTimeout(() => {
          observer.disconnect();
          resolve(clsValue);
        }, 3000);
      });
    });

    console.log(`Cumulative Layout Shift: ${cls}`);

    // CLS should be under 0.1 for good performance
    expect(cls).toBeLessThan(0.1);
  });

  test('Hero section images should load quickly', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    
    // Wait for hero images to load
    await page.waitForSelector('img', { state: 'visible', timeout: 3000 });
    
    const loadTime = Date.now() - startTime;
    
    console.log(`Hero images loaded in: ${loadTime}ms`);
    
    // Images should load in under 2 seconds
    expect(loadTime).toBeLessThan(2000);
  });

  test('Navigation should be responsive', async ({ page }) => {
    await page.goto('/');
    
    // Measure time to interact with navigation
    const startTime = Date.now();
    
    await page.click('nav a:first-child');
    
    const clickTime = Date.now() - startTime;
    
    console.log(`Navigation click response: ${clickTime}ms`);
    
    // Should respond in under 100ms (perceptually instant)
    expect(clickTime).toBeLessThan(100);
  });

  test('Marketing pages should have fast navigation transitions', async ({ page }) => {
    await page.goto('/');
    
    const pages = ['/terms', '/privacy'];
    
    for (const pagePath of pages) {
      const startTime = Date.now();
      
      await page.goto(pagePath);
      await page.waitForLoadState('domcontentloaded');
      
      const loadTime = Date.now() - startTime;
      
      console.log(`${pagePath} loaded in: ${loadTime}ms`);
      
      // Should load in under 1 second
      expect(loadTime).toBeLessThan(1000);
    }
  });

  test('Should not have long tasks blocking main thread', async ({ page }) => {
    await page.goto('/');

    // Measure Total Blocking Time
    const tbt = await page.evaluate(() => {
      return new Promise((resolve) => {
        let totalBlockingTime = 0;

        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const duration = entry.duration;
            if (duration > 50) {
              totalBlockingTime += duration - 50;
            }
          }
        });

        observer.observe({ type: 'longtask', buffered: true });

        setTimeout(() => {
          observer.disconnect();
          resolve(totalBlockingTime);
        }, 5000);
      });
    });

    console.log(`Total Blocking Time: ${tbt}ms`);

    // TBT should be under 300ms for good performance
    expect(tbt).toBeLessThan(300);
  });

  test('Page should be interactive quickly (TTI)', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    
    // Wait for network to be idle (approximates TTI)
    await page.waitForLoadState('networkidle');
    
    // Try to interact with a button
    await page.click('text=Start Building for Free');
    
    const tti = Date.now() - startTime;
    
    console.log(`Time to Interactive: ${tti}ms`);
    
    // TTI should be under 3.8s (good)
    expect(tti).toBeLessThan(3800);
  });

  test('Mobile performance should be acceptable', async ({ page, context }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    console.log(`Mobile load time: ${loadTime}ms`);
    
    // Mobile should load in under 4 seconds
    expect(loadTime).toBeLessThan(4000);
  });

  test('Resources should be properly cached', async ({ page }) => {
    // First visit
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Second visit (should use cache)
    const startTime = Date.now();
    await page.goto('/');
    const secondLoadTime = Date.now() - startTime;
    
    console.log(`Cached load time: ${secondLoadTime}ms`);
    
    // Cached load should be under 500ms
    expect(secondLoadTime).toBeLessThan(500);
  });

  test('JavaScript bundle size should be reasonable', async ({ page }) => {
    const jsResources: number[] = [];
    
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('.js') && !url.includes('node_modules')) {
        const size = (await response.body()).length;
        jsResources.push(size);
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const totalJs = jsResources.reduce((sum, size) => sum + size, 0);
    const totalKb = (totalJs / 1024).toFixed(2);
    
    console.log(`Total JS size: ${totalKb} KB`);
    console.log(`Number of JS files: ${jsResources.length}`);
    
    // Total JS should be under 500KB (gzipped would be ~1/3)
    expect(totalJs).toBeLessThan(500 * 1024);
  });
});

test.describe('Accessibility Performance', () => {
  test('Pages should have no accessibility violations and load fast', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    
    // Check accessibility with axe
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    const loadTime = Date.now() - startTime;
    
    // Should have no violations
    expect(accessibilityScanResults.violations).toEqual([]);
    
    console.log(`Accessible page loaded in: ${loadTime}ms`);
    
    // Should load and be accessible in under 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('Hero section should be keyboard navigable without delay', async ({ page }) => {
    await page.goto('/');
    
    const startTime = Date.now();
    
    // Try to tab through hero section
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    const tabTime = Date.now() - startTime;
    
    console.log(`Keyboard navigation time: ${tabTime}ms`);
    
    // Should be instant (under 50ms)
    expect(tabTime).toBeLessThan(50);
  });
});

test.describe('Image Performance', () => {
  test('Images should use appropriate formats and sizes', async ({ page }) => {
    const imageDetails: any[] = [];
    
    page.on('response', async (response) => {
      const url = response.url();
      if (url.match(/\.(jpg|jpeg|png|webp|avif)$/i)) {
        const size = (await response.body()).length;
        imageDetails.push({
          url: url.split('/').pop(),
          size,
          type: response.headers()['content-type'],
        });
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    console.log('Image Details:');
    imageDetails.forEach((img) => {
      const sizeKb = (img.size / 1024).toFixed(2);
      console.log(`  ${img.url}: ${sizeKb} KB (${img.type})`);
    });
    
    // Each image should be under 200KB
    imageDetails.forEach((img) => {
      expect(img.size).toBeLessThan(200 * 1024);
    });
  });

  test('Images should have proper lazy loading', async ({ page }) => {
    await page.goto('/');
    
    // Check if images below fold have loading="lazy"
    const lazyImages = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      const viewportHeight = window.innerHeight;
      
      return images
        .filter((img) => {
          const rect = img.getBoundingClientRect();
          return rect.top > viewportHeight;
        })
        .map((img) => ({
          hasLazyLoading: img.loading === 'lazy',
          src: img.src,
        }));
    });
    
    console.log(`Images below fold: ${lazyImages.length}`);
    
    // Most images below fold should have lazy loading
    const lazyCount = lazyImages.filter((img) => img.hasLazyLoading).length;
    expect(lazyCount / lazyImages.length).toBeGreaterThan(0.5);
  });
});
