import type { MonetizationMode } from '../monetization.types';
import './BetaStatusBanner.css';

interface BetaStatusBannerProps {
    mode: MonetizationMode;
    betaEndsAt: string;
}

function formatBetaEndsAt(betaEndsAt: string): string {
    const date = new Date(betaEndsAt);

    if (Number.isNaN(date.getTime())) {
        return betaEndsAt;
    }

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
    }).format(date);
}

const HourglassIcon = () => (
    <svg className="beta-chip-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 2h12v2H6V2z" fill="#c8aa6e" />
        <path d="M6 20h12v2H6v-2z" fill="#c8aa6e" />
        <path d="M7 4v3c0 2.5 2 4.5 4 5.5v-1C9.5 10.5 8 9 8 7V4h8v3c0 2-1.5 3.5-3 4.5v1c2-1 4-3 4-5.5V4" stroke="#c8aa6e" strokeWidth="1.2" fill="none" />
        <path d="M7 20v-3c0-2.5 2-4.5 4-5.5v1c-1.5 1-3 2.5-3 4.5v3h8v-3c0-2 1.5-3.5 3-4.5v-1c-2 1-4 3-4 5.5v3" stroke="#c8aa6e" strokeWidth="1.2" fill="none" />
        <circle cx="12" cy="12" r="1.5" fill="#c8aa6e" opacity="0.6" />
    </svg>
);

export function BetaStatusBanner({ mode, betaEndsAt }: BetaStatusBannerProps) {
    const formattedBetaEndsAt = formatBetaEndsAt(betaEndsAt);

    if (mode === 'beta') {
        return (
            <div
                className="beta-chip"
                aria-label="Beta access status"
                data-testid="beta-status-banner"
                title={`Open beta through ${formattedBetaEndsAt}`}
            >
                <HourglassIcon />
                <span className="beta-chip-label">Open Beta</span>
            </div>
        );
    }

    return null;
}
