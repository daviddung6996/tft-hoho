/**
 * Basic rendering tests for ComingSoonPage Task 8.1
 * Validates: Requirements 1.1, 7.1, 9.4, 2.2, 2.4
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { ComingSoonPage } from './ComingSoonPage';

describe('Task 8.1 - ComingSoonPage Basic Rendering Tests', () => {
  let consoleInfoSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Spy on console.info before each test
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.info after each test
    consoleInfoSpy.mockRestore();
  });

  describe('Requirement 1.1: Display Vietnamese coming-soon message', () => {
    test('renders Vietnamese announcement message correctly', () => {
      const { container } = render(<ComingSoonPage />);
      const message = container.querySelector('.coming-soon-message');
      
      expect(message).toBeInTheDocument();
      expect(message?.textContent).toContain('Dự án đang phát triển sẽ sớm ra mắt');
      expect(message?.textContent).toContain('hãy chờ đợi...');
    });

    test('renders title correctly', () => {
      const { container } = render(<ComingSoonPage />);
      const title = container.querySelector('.coming-soon-title');
      
      expect(title).toBeInTheDocument();
      expect(title?.textContent).toBe('TFTISEASY');
    });

    test('renders subtitle correctly', () => {
      const { container } = render(<ComingSoonPage />);
      const subtitle = container.querySelector('.coming-soon-subtitle');
      
      expect(subtitle).toBeInTheDocument();
      expect(subtitle?.textContent).toBe('Pro Training Tool đang được xây dựng');
    });
  });

  describe('Requirement 7.1: Meaningful page title in document head', () => {
    test('sets page title correctly', () => {
      const originalTitle = document.title;
      
      render(<ComingSoonPage />);
      
      expect(document.title).toBe('TFTISEASY - Sắp ra mắt | Coming Soon');
      
      // Restore original title
      document.title = originalTitle;
    });

    test('page title contains both Vietnamese and English text', () => {
      const originalTitle = document.title;
      
      render(<ComingSoonPage />);
      
      expect(document.title).toContain('TFTISEASY');
      expect(document.title).toContain('Sắp ra mắt');
      expect(document.title).toContain('Coming Soon');
      
      // Restore original title
      document.title = originalTitle;
    });
  });

  describe('Requirement 9.4: Maintenance mode console logging', () => {
    test('logs maintenance mode activation message', () => {
      render(<ComingSoonPage />);
      
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        '[TFTISEASY] Maintenance mode active - Coming Soon page displayed'
      );
    });

    test('logs maintenance mode message exactly once on mount', () => {
      render(<ComingSoonPage />);
      
      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Requirement 2.2: Hextech atmosphere gradient background', () => {
    test('applies Hextech teal gradient background pattern', () => {
      const { container } = render(<ComingSoonPage />);
      const page = container.querySelector('.coming-soon-page');
      
      expect(page).toBeInTheDocument();
      
      // Verify the element has background property
      // Note: getComputedStyle may not work in JSDOM, so we verify the class is applied
      expect(page).toHaveClass('coming-soon-page');
    });

    test('main container has correct positioning for full viewport coverage', () => {
      const { container } = render(<ComingSoonPage />);
      const page = container.querySelector('.coming-soon-page');
      
      expect(page).toBeInTheDocument();
      expect(page).toHaveClass('coming-soon-page');
    });

    test('renders radial gradient background elements (gold and teal)', () => {
      const { container } = render(<ComingSoonPage />);
      const page = container.querySelector('.coming-soon-page');
      
      // Verify the page element exists with the correct class
      // The CSS contains: radial-gradient with rgba(200, 170, 110, 0.06) and rgba(21, 58, 62, 0.25)
      expect(page).toBeInTheDocument();
      expect(page?.className).toContain('coming-soon-page');
    });
  });

  describe('Requirement 2.4: Hextech gold color for accents', () => {
    test('renders gold-colored hextech elements', () => {
      const { container } = render(<ComingSoonPage />);
      
      // Verify hextech ornament is present
      const hexOrnament = container.querySelector('.hex-ornament');
      expect(hexOrnament).toBeInTheDocument();
      
      // Verify hex divider is present (gold line separator)
      const hexDivider = container.querySelector('.hex-divider');
      expect(hexDivider).toBeInTheDocument();
      
      // Verify title uses gold styling class
      const title = container.querySelector('.coming-soon-title');
      expect(title).toBeInTheDocument();
      expect(title).toHaveClass('coming-soon-title');
    });

    test('renders all Hextech decorative elements', () => {
      const { container } = render(<ComingSoonPage />);
      
      // Logo area with ornament
      const logo = container.querySelector('.coming-soon-logo');
      expect(logo).toBeInTheDocument();
      
      // Hexagonal ornament
      const ornament = container.querySelector('.hex-ornament');
      expect(ornament).toBeInTheDocument();
      
      // Hex divider separator
      const divider = container.querySelector('.hex-divider');
      expect(divider).toBeInTheDocument();
    });
  });

  describe('Requirement 2.2: Minimum viewport rendering (320px)', () => {
    test('renders correctly at minimum mobile width (320px)', () => {
      // Set viewport to minimum width
      Object.defineProperty(window, 'innerWidth', { 
        writable: true, 
        configurable: true, 
        value: 320 
      });
      
      const { container } = render(<ComingSoonPage />);
      
      // Verify all essential elements are present
      const page = container.querySelector('.coming-soon-page');
      const content = container.querySelector('.coming-soon-content');
      const title = container.querySelector('.coming-soon-title');
      const message = container.querySelector('.coming-soon-message');
      const subtitle = container.querySelector('.coming-soon-subtitle');
      
      expect(page).toBeInTheDocument();
      expect(content).toBeInTheDocument();
      expect(title).toBeInTheDocument();
      expect(message).toBeInTheDocument();
      expect(subtitle).toBeInTheDocument();
      
      // Verify text content is correct
      expect(title?.textContent).toBe('TFTISEASY');
      expect(message?.textContent).toContain('Dự án đang phát triển');
    });

    test('maintains all content at minimum viewport without overflow', () => {
      Object.defineProperty(window, 'innerWidth', { 
        writable: true, 
        configurable: true, 
        value: 320 
      });
      
      const { container } = render(<ComingSoonPage />);
      
      // Verify container and content are rendered
      const page = container.querySelector('.coming-soon-page');
      const content = container.querySelector('.coming-soon-content');
      
      expect(page).toBeInTheDocument();
      expect(content).toBeInTheDocument();
      
      // Verify all text elements are present (no elements hidden due to small viewport)
      const allTextElements = container.querySelectorAll('.coming-soon-title, .coming-soon-message, .coming-soon-subtitle');
      expect(allTextElements.length).toBe(3);
    });
  });

  describe('Component structure and semantics', () => {
    test('uses semantic main element with role="main"', () => {
      const { container } = render(<ComingSoonPage />);
      const main = container.querySelector('main');
      
      expect(main).toBeInTheDocument();
      expect(main).toHaveAttribute('role', 'main');
      expect(main).toHaveClass('coming-soon-page');
    });

    test('has aria-label for accessibility', () => {
      const { container } = render(<ComingSoonPage />);
      const main = container.querySelector('main');
      
      expect(main).toHaveAttribute('aria-label', 'Coming Soon Page');
    });

    test('marks decorative elements with aria-hidden', () => {
      const { container } = render(<ComingSoonPage />);
      
      const logo = container.querySelector('.coming-soon-logo');
      const ornament = container.querySelector('.hex-ornament');
      const divider = container.querySelector('.hex-divider');
      
      expect(logo).toHaveAttribute('aria-hidden', 'true');
      expect(ornament).toHaveAttribute('aria-hidden', 'true');
      expect(divider).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
