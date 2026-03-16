import React from 'react';
import './CoachFab.css';

export type CoachFabVariant = 'ask' | 'return-loading' | 'return-ready';

interface CoachFabProps {
    onClick: () => void;
    label?: string;
    eyebrow?: string;
    variant?: CoachFabVariant;
    isPulsing?: boolean;
    isDimmed?: boolean;
}

const CoachFabInlineDots: React.FC = () => (
    <span className="coach-fab__inline-dots" aria-hidden="true">
        <span>.</span>
        <span>.</span>
        <span>.</span>
    </span>
);

export const CoachFab: React.FC<CoachFabProps> = ({
    onClick,
    label = 'Hỏi Coach',
    eyebrow = 'Coach',
    variant = 'ask',
    isPulsing,
    isDimmed,
}) => {
    const shouldPulse = isPulsing ?? variant === 'return-ready';
    const shouldDim = isDimmed ?? variant === 'return-loading';
    const className = [
        'coach-fab',
        `coach-fab--${variant}`,
        shouldPulse ? 'coach-fab--pulsing' : '',
        shouldDim ? 'coach-fab--dimmed' : '',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <button
            type="button"
            className={className}
            onClick={onClick}
            aria-label={label}
        >
            <span className="coach-fab__glow" aria-hidden="true" />
            <svg
                className="coach-fab__icon"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M4 6.5C4 5.12 5.12 4 6.5 4h11C18.88 4 20 5.12 20 6.5v7C20 14.88 18.88 16 17.5 16H11l-4.5 4v-4H6.5A2.5 2.5 0 014 13.5v-7z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 9.5h8M8 12.5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <span className="coach-fab__text">
                <span className="coach-fab__eyebrow">{eyebrow}</span>
                <span className="coach-fab__label">
                    <span>{label}</span>
                    {variant === 'return-loading' && <CoachFabInlineDots />}
                </span>
            </span>
        </button>
    );
};
