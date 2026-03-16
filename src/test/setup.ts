import '@testing-library/jest-dom';

// Set viewport dimensions for jsdom to properly compute CSS grid
Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 1200,
});

Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: 900,
});

// Trigger resize event to apply dimensions
window.dispatchEvent(new Event('resize'));
