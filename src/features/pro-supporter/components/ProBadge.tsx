
import { ProSupporterIcon } from '../../../components/common/ProSupporterIcon';
import './ProBadge.css';

interface ProBadgeProps {
    size?: 'sm' | 'md';
}

export function ProBadge({ size = 'sm' }: ProBadgeProps) {
    return (
        <span className={`pro-badge pro-badge--${size}`}>
            <ProSupporterIcon size={14} style={{ verticalAlign: 'middle' }} />
            <span className="pro-badge-text">Pro Supporter</span>
            <span className="pro-badge-check">✓</span>
        </span>
    );
}
