
import './ProBadge.css';

interface ProBadgeProps {
    size?: 'sm' | 'md';
}

export function ProBadge({ size = 'sm' }: ProBadgeProps) {
    return (
        <span className={`pro-badge pro-badge--${size}`}>
            <span className="pro-badge-star">⭐</span>
            <span className="pro-badge-text">Pro Supporter</span>
            <span className="pro-badge-check">✓</span>
        </span>
    );
}
