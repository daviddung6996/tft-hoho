import { useState } from 'react';
import './SupportModal.css';

interface SupportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SupportModal({ isOpen, onClose }: SupportModalProps) {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const bankInfo = {
        bank: 'MB Bank',
        account: '0382022869',
        name: 'DUNG MINH DUC',
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(bankInfo.account);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="support-modal-overlay" onClick={onClose}>
            <div className="support-modal" onClick={e => e.stopPropagation()}>
                {/* Close button */}
                <button className="support-modal-close" onClick={onClose}>✕</button>

                {/* Header */}
                <div className="support-modal-header">
                    <span className="support-modal-emoji">☕</span>
                    <h2 className="support-modal-title">Ủng hộ TFTISEASY</h2>
                </div>

                {/* Message - gentle, humble */}
                <div className="support-modal-message">
                    <p>
                        TFTISEASY là dự án cá nhân do <strong>tftiseasy#00000</strong> phát triển
                        — hoàn toàn miễn phí, không quảng cáo.
                    </p>
                    <p>
                        Dự án sẽ tiếp tục phát triển đến <strong>Set 17</strong> và xa hơn nữa.
                        Mỗi đóng góp nhỏ giúp mình duy trì server, cập nhật data,
                        và tạo thêm puzzle mới cho cộng đồng TFT Việt Nam.
                    </p>
                    <p className="support-modal-highlight">
                        Mọi số tiền đều được trân trọng. Cảm ơn bạn rất nhiều! 🙏
                    </p>
                </div>

                {/* QR Code Section */}
                <div className="support-modal-qr-section">
                    <div className="support-modal-qr-frame">
                        <img
                            src={`https://img.vietqr.io/image/${bankInfo.bank}-${bankInfo.account}-compact.png?addInfo=Ung%20ho%20TFTISEASY&accountName=${encodeURIComponent(bankInfo.name)}`}
                            alt="QR chuyển khoản"
                            className="support-modal-qr-img"
                            onError={(e) => {
                                // Fallback if VietQR fails
                                (e.target as HTMLImageElement).src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${bankInfo.account}`;
                            }}
                        />
                    </div>
                    <span className="support-modal-qr-hint">Quét mã để chuyển khoản</span>
                </div>

                {/* Bank Info */}
                <div className="support-modal-bank">
                    <div className="support-modal-bank-row">
                        <span className="support-modal-bank-label">Ngân hàng</span>
                        <span className="support-modal-bank-value">{bankInfo.bank}</span>
                    </div>
                    <div className="support-modal-bank-row">
                        <span className="support-modal-bank-label">Số TK</span>
                        <span className="support-modal-bank-value support-modal-bank-account">
                            {bankInfo.account}
                            <button className="support-modal-copy-btn" onClick={handleCopy}>
                                {copied ? '✓' : '📋'}
                            </button>
                        </span>
                    </div>
                    <div className="support-modal-bank-row">
                        <span className="support-modal-bank-label">Chủ TK</span>
                        <span className="support-modal-bank-value">{bankInfo.name}</span>
                    </div>
                </div>

                {/* Footer note */}
                <div className="support-modal-footer">
                    <span>Nội dung CK: <strong>TFTISEASY [tên bạn]</strong></span>
                </div>
            </div>
        </div>
    );
}
