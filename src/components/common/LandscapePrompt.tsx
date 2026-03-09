import React from 'react';
import './LandscapePrompt.css';

/**
 * LandscapePrompt — Fullscreen overlay for mobile portrait orientation.
 * Prompts user to rotate device to landscape for optimal gameplay.
 * Auto-hides on landscape or desktop via CSS media queries.
 */
export const LandscapePrompt: React.FC = () => {
    return (
        <div className="landscape-prompt-overlay">
            {/* Rotating phone SVG icon */}
            <svg
                className="landscape-prompt-icon"
                viewBox="0 0 80 80"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Phone body */}
                <rect
                    x="22" y="8" width="36" height="64"
                    rx="6" ry="6"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    fill="rgba(200, 170, 110, 0.08)"
                />
                {/* Screen area */}
                <rect
                    x="26" y="16" width="28" height="44"
                    rx="2" ry="2"
                    fill="rgba(200, 170, 110, 0.12)"
                />
                {/* Home button / notch indicator */}
                <circle cx="40" cy="66" r="2.5" fill="currentColor" opacity="0.4" />
                {/* Rotation arrow */}
                <path
                    d="M62 22 C72 22, 76 32, 76 40 C76 48, 72 58, 62 58"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.7"
                />
                <path
                    d="M62 58 L66 52 L58 54 Z"
                    fill="currentColor"
                    opacity="0.7"
                />
            </svg>

            <h2 className="landscape-prompt-title">Xoay ngang điện thoại</h2>
            <hr className="landscape-prompt-accent" />
            <p className="landscape-prompt-subtitle">
                Trải nghiệm game tốt nhất ở chế độ ngang. Xoay điện thoại rồi chạm màn hình để game tự vào toàn màn hình.
            </p>
        </div>
    );
};
