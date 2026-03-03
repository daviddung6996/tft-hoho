
import { ProSupporterIcon } from '../../../components/common/ProSupporterIcon';
import { PRO_SUPPORTER_PRICING } from '../proSupporter.types';
import './ProSupporterBanner.css';

interface ProSupporterBannerProps {
    onLearnMore?: () => void;
}

export function ProSupporterBanner({ onLearnMore }: ProSupporterBannerProps) {
    return (
        <div className="pro-supporter-banner">
            <div className="pro-supporter-banner-glow" />
            <div className="pro-supporter-banner-content">
                <div className="pro-supporter-banner-badge">
                    <ProSupporterIcon size={16} style={{ verticalAlign: 'middle', marginRight: '0.4em' }} />
                    PRO SUPPORTER
                </div>
                <h3 className="pro-supporter-banner-title">
                    Mở khóa tất cả puzzle + Giải thích từ tftiseasy#00000
                </h3>
                <p className="pro-supporter-banner-desc">
                    Bypass T-Coin, Early access, Hint miễn phí, Badge trên Flex Card
                </p>
                <div className="pro-supporter-banner-pricing">
                    <span className="pro-supporter-banner-price">
                        {(PRO_SUPPORTER_PRICING.monthly / 1000).toFixed(0)}k<small>/tháng</small>
                    </span>
                    <span className="pro-supporter-banner-divider">hoặc</span>
                    <span className="pro-supporter-banner-price pro-supporter-banner-price--lifetime">
                        {(PRO_SUPPORTER_PRICING.lifetime / 1000).toFixed(0)}k<small> trọn đời</small>
                    </span>
                </div>
                <button className="pro-supporter-banner-cta" onClick={onLearnMore}>
                    <span className="pro-supporter-banner-cta-text">Trở thành Pro Supporter</span>
                    <span className="pro-supporter-banner-cta-sweep" />
                </button>
            </div>
        </div>
    );
}
