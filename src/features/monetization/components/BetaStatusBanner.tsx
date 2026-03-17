import type { MonetizationMode } from '../monetization.types';

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
        year: 'numeric',
        timeZone: 'UTC',
    }).format(date);
}

export function BetaStatusBanner({ mode, betaEndsAt }: BetaStatusBannerProps) {
    const formattedBetaEndsAt = formatBetaEndsAt(betaEndsAt);

    if (mode === 'beta') {
        return (
            <section aria-label="Beta access status" data-testid="beta-status-banner">
                <p>Beta access is active</p>
                <p>All puzzle lanes stay open during beta through {formattedBetaEndsAt}.</p>
            </section>
        );
    }

    return (
        <section aria-label="Free and Pro status" data-testid="beta-status-banner">
            <p>Beta has ended</p>
            <p>Free remains available while Hard and Pro move into Pro after {formattedBetaEndsAt}.</p>
        </section>
    );
}
