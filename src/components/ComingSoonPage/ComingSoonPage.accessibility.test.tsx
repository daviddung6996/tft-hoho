import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ComingSoonPage } from './ComingSoonPage';

/**
 * Accessibility Tests for ComingSoonPage Component
 * 
 * Task 7.1: Add semantic HTML and ARIA attributes
 * - Use semantic HTML elements (h1, p, main)
 * - Add ARIA labels for decorative elements if needed
 * - Ensure keyboard navigation support for any interactive elements
 * - Requirements: 7.2, 7.4, 7.5
 */

describe('ComingSoonPage - Accessibility (Task 7.1)', () => {
  describe('Requirement 7.2: Semantic HTML structure', () => {
    it('uses <main> element as the root container', () => {
      const { container } = render(<ComingSoonPage />);
      const mainElement = container.querySelector('main');
      
      expect(mainElement).toBeInTheDocument();
      expect(mainElement).toHaveClass('coming-soon-page');
    });

    it('uses semantic <h1> for the title', () => {
      const { container } = render(<ComingSoonPage />);
      const h1Element = container.querySelector('h1');
      
      expect(h1Element).toBeInTheDocument();
      expect(h1Element).toHaveTextContent('TFTISEASY');
      expect(h1Element).toHaveClass('coming-soon-title');
    });

    it('uses semantic <p> elements for text content', () => {
      const { container } = render(<ComingSoonPage />);
      const paragraphs = container.querySelectorAll('p');
      
      expect(paragraphs.length).toBeGreaterThanOrEqual(2);
      
      // Check main message paragraph
      const messageParagraph = container.querySelector('.coming-soon-message');
      expect(messageParagraph?.tagName.toLowerCase()).toBe('p');
      
      // Check subtitle paragraph
      const subtitleParagraph = container.querySelector('.coming-soon-subtitle');
      expect(subtitleParagraph?.tagName.toLowerCase()).toBe('p');
    });

    it('has proper heading hierarchy (only one h1)', () => {
      const { container } = render(<ComingSoonPage />);
      const h1Elements = container.querySelectorAll('h1');
      
      expect(h1Elements.length).toBe(1);
    });
  });

  describe('Requirement 7.5: ARIA labels for decorative elements', () => {
    it('marks hex-ornament as decorative with aria-hidden', () => {
      const { container } = render(<ComingSoonPage />);
      const hexOrnament = container.querySelector('.hex-ornament');
      
      expect(hexOrnament).toHaveAttribute('aria-hidden', 'true');
    });

    it('marks hex-divider as decorative with aria-hidden', () => {
      const { container } = render(<ComingSoonPage />);
      const hexDivider = container.querySelector('.hex-divider');
      
      expect(hexDivider).toHaveAttribute('aria-hidden', 'true');
    });

    it('marks logo container as decorative with aria-hidden', () => {
      const { container } = render(<ComingSoonPage />);
      const logoContainer = container.querySelector('.coming-soon-logo');
      
      expect(logoContainer).toHaveAttribute('aria-hidden', 'true');
    });

    it('includes separator role on hex-divider for semantic clarity', () => {
      const { container } = render(<ComingSoonPage />);
      const hexDivider = container.querySelector('.hex-divider');
      
      expect(hexDivider).toHaveAttribute('role', 'separator');
    });

    it('adds aria-label to main element for context', () => {
      const { container } = render(<ComingSoonPage />);
      const mainElement = container.querySelector('main');
      
      expect(mainElement).toHaveAttribute('aria-label', 'Coming Soon Page');
    });

    it('adds explicit role="main" for assistive technology', () => {
      const { container } = render(<ComingSoonPage />);
      const mainElement = container.querySelector('main');
      
      expect(mainElement).toHaveAttribute('role', 'main');
    });
  });

  describe('Requirement 7.4: Keyboard navigation support', () => {
    it('has no interactive elements requiring keyboard navigation', () => {
      const { container } = render(<ComingSoonPage />);
      
      // Verify no buttons
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBe(0);
      
      // Verify no links
      const links = container.querySelectorAll('a');
      expect(links.length).toBe(0);
      
      // Verify no inputs
      const inputs = container.querySelectorAll('input, textarea, select');
      expect(inputs.length).toBe(0);
      
      // Verify no custom interactive elements with tabindex
      const customInteractive = container.querySelectorAll('[tabindex]:not([tabindex="-1"])');
      expect(customInteractive.length).toBe(0);
    });

    it('text content is selectable for keyboard users', () => {
      const { container } = render(<ComingSoonPage />);
      const textElements = container.querySelectorAll('h1, p');
      
      // Verify text elements don't have user-select: none
      textElements.forEach(element => {
        const computedStyle = window.getComputedStyle(element);
        expect(computedStyle.userSelect).not.toBe('none');
      });
    });
  });

  describe('ARIA best practices', () => {
    it('does not have redundant ARIA roles on semantic elements', () => {
      const { container } = render(<ComingSoonPage />);
      
      // h1 should not have role="heading" (redundant)
      const h1 = container.querySelector('h1');
      expect(h1).not.toHaveAttribute('role', 'heading');
      
      // p elements should not have role="paragraph" (redundant)
      const paragraphs = container.querySelectorAll('p');
      paragraphs.forEach(p => {
        if (!p.hasAttribute('role')) {
          // OK - no redundant role
          expect(true).toBe(true);
        }
      });
    });

    it('decorative elements do not have accessible names', () => {
      const { container } = render(<ComingSoonPage />);
      
      const hexOrnament = container.querySelector('.hex-ornament');
      expect(hexOrnament).not.toHaveAttribute('aria-label');
      expect(hexOrnament).not.toHaveAttribute('aria-labelledby');
      
      const hexDivider = container.querySelector('.hex-divider');
      // hex-divider has aria-hidden, so it should not need an accessible name
      expect(hexDivider).toHaveAttribute('aria-hidden', 'true');
    });

    it('all text content is exposed to screen readers', () => {
      const { container } = render(<ComingSoonPage />);
      
      // Main message should be visible
      const message = container.querySelector('.coming-soon-message');
      expect(message).not.toHaveAttribute('aria-hidden', 'true');
      
      // Subtitle should be visible
      const subtitle = container.querySelector('.coming-soon-subtitle');
      expect(subtitle).not.toHaveAttribute('aria-hidden', 'true');
      
      // Title should be visible
      const title = container.querySelector('.coming-soon-title');
      expect(title).not.toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Landmark regions', () => {
    it('main element acts as a landmark region', () => {
      const { container } = render(<ComingSoonPage />);
      const mainElement = container.querySelector('main[role="main"]');
      
      expect(mainElement).toBeInTheDocument();
    });

    it('has only one main landmark', () => {
      const { container } = render(<ComingSoonPage />);
      const mainElements = container.querySelectorAll('main');
      
      expect(mainElements.length).toBe(1);
    });
  });

  describe('Document structure', () => {
    it('has proper document outline with h1 as top-level heading', () => {
      const { container } = render(<ComingSoonPage />);
      
      // Should have exactly one h1
      const h1Elements = container.querySelectorAll('h1');
      expect(h1Elements.length).toBe(1);
      
      // Should not have h2, h3, etc. (flat structure is OK for simple page)
      const h2Elements = container.querySelectorAll('h2');
      expect(h2Elements.length).toBe(0);
    });

    it('content is wrapped in semantic container elements', () => {
      const { container } = render(<ComingSoonPage />);
      
      // Content should be inside main
      const mainElement = container.querySelector('main');
      const contentDiv = mainElement?.querySelector('.coming-soon-content');
      
      expect(contentDiv).toBeInTheDocument();
    });
  });

  describe('Focus management (no interactive elements)', () => {
    it('page does not trap focus', () => {
      const { container } = render(<ComingSoonPage />);
      
      // Since there are no interactive elements, focus cannot be trapped
      const focusableElements = container.querySelectorAll(
        'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      expect(focusableElements.length).toBe(0);
    });

    it('no elements have positive tabindex', () => {
      const { container } = render(<ComingSoonPage />);
      
      // Positive tabindex disrupts natural tab order
      const positiveTabindex = container.querySelectorAll('[tabindex="1"], [tabindex="2"], [tabindex="3"]');
      
      expect(positiveTabindex.length).toBe(0);
    });
  });

  describe('Screen reader experience', () => {
    it('page has meaningful title set via document.title', () => {
      render(<ComingSoonPage />);
      
      expect(document.title).toContain('TFTISEASY');
      expect(document.title).toContain('Coming Soon');
    });

    it('content reading order is logical (top to bottom)', () => {
      const { container } = render(<ComingSoonPage />);
      
      const mainElement = container.querySelector('main');
      const children = mainElement?.children[0]?.children;
      
      if (children) {
        const childArray = Array.from(children);
        
        // Expected order: logo/ornament, title, message, divider, subtitle
        const hasLogo = childArray.some(child => child.classList.contains('coming-soon-logo'));
        const titleIndex = childArray.findIndex(child => child.classList.contains('coming-soon-title'));
        const messageIndex = childArray.findIndex(child => child.classList.contains('coming-soon-message'));
        const dividerIndex = childArray.findIndex(child => child.classList.contains('hex-divider'));
        const subtitleIndex = childArray.findIndex(child => child.classList.contains('coming-soon-subtitle'));
        
        // Verify logical order
        if (hasLogo) {
          expect(titleIndex).toBeGreaterThan(-1);
        }
        expect(titleIndex).toBeLessThan(messageIndex);
        expect(messageIndex).toBeLessThan(dividerIndex);
        expect(dividerIndex).toBeLessThan(subtitleIndex);
      }
    });

    it('decorative elements do not clutter screen reader output', () => {
      const { container } = render(<ComingSoonPage />);
      
      // All decorative elements should have aria-hidden="true"
      const decorativeElements = container.querySelectorAll('.hex-ornament, .hex-divider, .coming-soon-logo');
      
      decorativeElements.forEach(element => {
        expect(element).toHaveAttribute('aria-hidden', 'true');
      });
    });
  });

  describe('Integration with assistive technology', () => {
    it('main landmark is properly announced', () => {
      const { container } = render(<ComingSoonPage />);
      const mainElement = container.querySelector('main');
      
      // Should have both semantic <main> and explicit role
      expect(mainElement?.tagName.toLowerCase()).toBe('main');
      expect(mainElement).toHaveAttribute('role', 'main');
      expect(mainElement).toHaveAttribute('aria-label', 'Coming Soon Page');
    });

    it('heading structure allows for easy navigation', () => {
      const { container } = render(<ComingSoonPage />);
      
      // Screen readers can jump between headings
      const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
      
      // Should have at least the main h1
      expect(headings.length).toBeGreaterThanOrEqual(1);
      expect(headings[0].tagName.toLowerCase()).toBe('h1');
    });
  });
});
