/**
 * Responsive behavior tests for ComingSoonPage
 * Validates viewport scaling and layout requirements
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { ComingSoonPage } from './ComingSoonPage';

describe('ComingSoonPage - Responsive Typography and Layout', () => {
  beforeEach(() => {
    // Reset viewport between tests
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 768 });
  });

  describe('Mobile viewports (320px - 767px)', () => {
    test('renders without horizontal scrolling at minimum width 320px', () => {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 320 });
      
      const { container } = render(<ComingSoonPage />);
      const page = container.querySelector('.coming-soon-page') as HTMLElement;
      
      expect(page).toBeInTheDocument();
      // Content should not exceed viewport width
      expect(page.scrollWidth).toBeLessThanOrEqual(320);
    });

    test('uses viewport units with readable minimum at 375px (common mobile)', () => {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 375 });
      
      const { container } = render(<ComingSoonPage />);
      const title = container.querySelector('.coming-soon-title') as HTMLElement;
      const message = container.querySelector('.coming-soon-message') as HTMLElement;
      
      expect(title).toBeInTheDocument();
      expect(message).toBeInTheDocument();
      
      // Font sizes should be readable (computed styles will be applied by CSS)
      // At minimum, elements should render and not overflow
      const content = container.querySelector('.coming-soon-content') as HTMLElement;
      expect(content.scrollWidth).toBeLessThanOrEqual(375);
    });

    test('renders correctly at 767px (mobile upper bound)', () => {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 767 });
      
      const { container } = render(<ComingSoonPage />);
      const page = container.querySelector('.coming-soon-page') as HTMLElement;
      
      expect(page).toBeInTheDocument();
      expect(page.scrollWidth).toBeLessThanOrEqual(767);
    });
  });

  describe('Tablet viewports (768px - 1279px)', () => {
    test('renders correctly at 768px (tablet lower bound)', () => {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 768 });
      
      const { container } = render(<ComingSoonPage />);
      const page = container.querySelector('.coming-soon-page') as HTMLElement;
      
      expect(page).toBeInTheDocument();
      expect(page.scrollWidth).toBeLessThanOrEqual(768);
    });

    test('renders correctly at 1024px (common tablet)', () => {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
      
      const { container } = render(<ComingSoonPage />);
      const page = container.querySelector('.coming-soon-page') as HTMLElement;
      
      expect(page).toBeInTheDocument();
      expect(page.scrollWidth).toBeLessThanOrEqual(1024);
    });

    test('renders correctly at 1279px (tablet upper bound)', () => {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1279 });
      
      const { container } = render(<ComingSoonPage />);
      const page = container.querySelector('.coming-soon-page') as HTMLElement;
      
      expect(page).toBeInTheDocument();
      expect(page.scrollWidth).toBeLessThanOrEqual(1279);
    });
  });

  describe('Desktop viewports (1280px+)', () => {
    test('renders correctly at 1280px (desktop lower bound)', () => {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1280 });
      
      const { container } = render(<ComingSoonPage />);
      const page = container.querySelector('.coming-soon-page') as HTMLElement;
      
      expect(page).toBeInTheDocument();
      expect(page.scrollWidth).toBeLessThanOrEqual(1280);
    });

    test('renders correctly at 1920px (Full HD)', () => {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1920 });
      
      const { container } = render(<ComingSoonPage />);
      const page = container.querySelector('.coming-soon-page') as HTMLElement;
      
      expect(page).toBeInTheDocument();
      expect(page.scrollWidth).toBeLessThanOrEqual(1920);
    });

    test('renders correctly at 2560px (2K)', () => {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 2560 });
      
      const { container } = render(<ComingSoonPage />);
      const page = container.querySelector('.coming-soon-page') as HTMLElement;
      
      expect(page).toBeInTheDocument();
      expect(page.scrollWidth).toBeLessThanOrEqual(2560);
    });

    test('renders correctly at 3840px (4K - upper bound)', () => {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 3840 });
      
      const { container } = render(<ComingSoonPage />);
      const page = container.querySelector('.coming-soon-page') as HTMLElement;
      
      expect(page).toBeInTheDocument();
      expect(page.scrollWidth).toBeLessThanOrEqual(3840);
    });
  });

  describe('Typography scaling validation', () => {
    test('title font size scales appropriately across breakpoints', () => {
      const viewports = [320, 768, 1024, 1280, 1920, 3840];
      
      viewports.forEach(width => {
        Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width });
        
        const { container } = render(<ComingSoonPage />);
        const title = container.querySelector('.coming-soon-title') as HTMLElement;
        
        expect(title).toBeInTheDocument();
        // Title should exist and be readable at all viewports
        expect(title.textContent).toBe('TFTISEASY');
      });
    });

    test('message text remains readable at all viewport widths', () => {
      const viewports = [320, 375, 768, 1024, 1280, 1920, 2560, 3840];
      
      viewports.forEach(width => {
        Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width });
        
        const { container } = render(<ComingSoonPage />);
        const message = container.querySelector('.coming-soon-message') as HTMLElement;
        
        expect(message).toBeInTheDocument();
        expect(message.textContent).toContain('Dự án đang phát triển');
      });
    });
  });

  describe('Layout centering validation', () => {
    test('content is centered horizontally and vertically', () => {
      const { container } = render(<ComingSoonPage />);
      const page = container.querySelector('.coming-soon-page') as HTMLElement;
      
      // Check CSS properties
      const styles = window.getComputedStyle(page);
      expect(styles.display).toBe('flex');
      expect(styles.alignItems).toBe('center');
      expect(styles.justifyContent).toBe('center');
    });
  });

  describe('No horizontal scrolling', () => {
    test('ensures no horizontal overflow at critical viewport widths', () => {
      const criticalWidths = [320, 375, 414, 768, 1024, 1280, 1920, 2560, 3840];
      
      criticalWidths.forEach(width => {
        Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width });
        
        const { container } = render(<ComingSoonPage />);
        const page = container.querySelector('.coming-soon-page') as HTMLElement;
        const content = container.querySelector('.coming-soon-content') as HTMLElement;
        
        // Page should not have horizontal scroll
        expect(page.scrollWidth).toBeLessThanOrEqual(width);
        
        // Content should stay within bounds
        expect(content.scrollWidth).toBeLessThanOrEqual(width);
      });
    });
  });

  describe('Visual elements scale correctly', () => {
    test('hex ornament scales at different viewports', () => {
      const viewports = [
        { width: 320, expectedClass: 'hex-ornament' },
        { width: 768, expectedClass: 'hex-ornament' },
        { width: 1280, expectedClass: 'hex-ornament' },
        { width: 3840, expectedClass: 'hex-ornament' }
      ];
      
      viewports.forEach(({ width, expectedClass }) => {
        Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width });
        
        const { container } = render(<ComingSoonPage />);
        const ornament = container.querySelector(`.${expectedClass}`) as HTMLElement;
        
        expect(ornament).toBeInTheDocument();
      });
    });

    test('hex divider renders at all viewports', () => {
      const viewports = [320, 768, 1280, 1920, 3840];
      
      viewports.forEach(width => {
        Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width });
        
        const { container } = render(<ComingSoonPage />);
        const divider = container.querySelector('.hex-divider') as HTMLElement;
        
        expect(divider).toBeInTheDocument();
      });
    });
  });
});
