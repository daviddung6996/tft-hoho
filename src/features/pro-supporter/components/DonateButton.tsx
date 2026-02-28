
import './DonateButton.css';

interface DonateButtonProps {
    onClick?: () => void;
}

export function DonateButton({ onClick }: DonateButtonProps) {
    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            // Default: open placeholder donate page
            window.open('https://ko-fi.com/tftiseasy', '_blank');
        }
    };

    return (
        <button className="donate-button" onClick={handleClick} title="Ủng hộ tftiseasy">
            <span className="donate-button-icon">☕</span>
            <span className="donate-button-text">Ủng hộ</span>
        </button>
    );
}
