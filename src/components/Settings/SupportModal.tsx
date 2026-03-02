import './SupportModal.css';

interface SupportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SupportModal({ isOpen, onClose }: SupportModalProps) {
    if (!isOpen) return null;

    const bankInfo = {
        bank: 'MB BANK',
        account: '0985960305',
        name: 'ĐỖ TẤN LỰC',
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
                    <p>TFTISEASY là dự án cá nhân do <strong>tftiseasy#00000</strong> phát triển<br />— hoàn toàn miễn phí, không quảng cáo.</p>
                    <p>Dự án sẽ tiếp tục phát triển đến <strong>Set 17</strong> và xa hơn nữa.<br />Mỗi đóng góp nhỏ đều giúp mình duy trì dự án<br />và tạo thêm giá trị mới cho cộng đồng TFT Việt Nam.</p>
                    <p className="support-modal-highlight">Mọi số tiền đều được trân trọng.<br />Cảm ơn bạn rất nhiều!</p>
                </div>

                {/* QR Code Section */}
                <div className="support-modal-qr-section">
                    <div className="support-modal-qr-frame">
                        <img
                            src={`https://img.vietqr.io/image/${bankInfo.bank.replace(/\s+/g, '')}-${bankInfo.account}-compact.png?addInfo=Ung%20ho%20TFTISEASY&accountName=${encodeURIComponent(bankInfo.name)}`}
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
                        </span>
                    </div>
                    <div className="support-modal-bank-row">
                        <span className="support-modal-bank-label">Chủ TK</span>
                        <span className="support-modal-bank-value">{bankInfo.name}</span>
                    </div>
                </div>

                {/* Footer note */}
                <div className="support-modal-footer">
                    <span>Nội dung CK: <strong> thông tin liên hệ để mình cám ơn.</strong></span>
                    <p style={{ marginTop: '0.75rem', marginBottom: 0 }}>Nếu không chê thì mình sẽ free coaching<br />cho bạn 1 session ~ 1h.</p>
                </div>
            </div>
        </div>
    );
}
