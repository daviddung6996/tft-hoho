import type { MonetizationMode } from '../monetization.types';

interface PremiumLaneCalloutProps {
    mode: MonetizationMode;
    isProEntitled: boolean;
    onUpgradeClick: () => void;
}

export function PremiumLaneCallout({ mode, isProEntitled, onUpgradeClick }: PremiumLaneCalloutProps) {
    if (mode === 'beta' || isProEntitled) {
        return null;
    }

    return (
        <section aria-label="Premium lane upgrade" data-testid="premium-lane-callout">
            <p>Hard and Pro puzzle lanes require a Pro subscription.</p>
            <button type="button" onClick={onUpgradeClick}>
                Upgrade to Pro
            </button>
        </section>
    );
}
