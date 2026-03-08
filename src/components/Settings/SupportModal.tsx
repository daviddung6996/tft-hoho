import { useState } from 'react';
import './SupportModal.css';

interface SupportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const BANK_INFO = {
    bank: 'MB BANK',
    account: '0985960305',
    name: 'ĐỖ TẤN LỰC',
};

const QR_URL = `https://img.vietqr.io/image/${BANK_INFO.bank.replace(/\s+/g, '')}-${BANK_INFO.account}-compact.png?addInfo=Ung%20ho%20TFTISEASY&accountName=${encodeURIComponent(BANK_INFO.name)}`;
const QR_FALLBACK_URL = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${BANK_INFO.account}`;
const COPY_RESET_DELAY_MS = 2000;

async function downloadQrImage(qrUrl: string) {
    const response = await fetch(qrUrl);
    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.style.display = 'none';
    link.href = objectUrl;
    link.download = 'tftiseasy-donate-qr.png';
    document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(objectUrl);
    document.body.removeChild(link);
}

export function SupportModal({ isOpen, onClose }: SupportModalProps) {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const handleCopy = async () => {
        if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
            console.warn('Clipboard API unavailable in SupportModal');
            return;
        }

        try {
            await navigator.clipboard.writeText(BANK_INFO.account);
            setCopied(true);
            window.setTimeout(() => setCopied(false), COPY_RESET_DELAY_MS);
        } catch (error) {
            console.error('Error copying bank account:', error);
        }
    };

    const handleDownload = async () => {
        try {
            await downloadQrImage(QR_URL);
        } catch (error) {
            console.error('Error downloading QR:', error);
            window.open(QR_URL, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div className="support-modal-overlay" onClick={onClose}>
            <div className="support-modal" onClick={e => e.stopPropagation()}>
                <button className="support-modal-close" onClick={onClose}>✕</button>

                <div className="support-modal-header">
                    <span className="support-modal-emoji">☕</span>
                    <h2 className="support-modal-title">Ủng hộ TFTISEASY</h2>
                </div>

                {/* DESKTOP VIEW (Classic layout) */}
                <div className="support-modal-content-desktop">
                    <div className="support-modal-message-desktop">
                        <p>
                            TFTISEASY là dự án do <strong>tftiseasy#00000</strong> phát triển
                            — hoàn toàn miễn phí, không quảng cáo.
                        </p>
                        <p>
                            Dự án sẽ tiếp tục phát triển đến <strong>Set 17</strong> và xa hơn nữa.
                            Mỗi đóng góp nhỏ đều giúp mình duy trì server, cập nhật data,
                            và tạo thêm giá trị mới cho cộng đồng TFT Việt Nam.
                        </p>
                        <p className="support-modal-highlight-desktop">
                            Mọi số tiền đều được trân trọng. Cảm ơn bạn rất nhiều!
                        </p>
                    </div>

                    <div className="support-modal-qr-section-desktop">
                        <div className="support-modal-qr-frame">
                            <img
                                src={QR_URL}
                                alt="QR chuyển khoản"
                                className="support-modal-qr-img-desktop"
                                crossOrigin="anonymous"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = QR_FALLBACK_URL;
                                }}
                            />
                        </div>
                        <span className="support-modal-qr-hint">Quét mã để chuyển khoản</span>
                    </div>

                    <div className="support-modal-bank">
                        <div className="support-modal-bank-row">
                            <span className="support-modal-bank-label">Ngân hàng</span>
                            <span className="support-modal-bank-value">{BANK_INFO.bank}</span>
                        </div>
                        <div className="support-modal-bank-row">
                            <span className="support-modal-bank-label">Số TK</span>
                            <span className="support-modal-bank-value support-modal-bank-account">
                                {BANK_INFO.account}
                            </span>
                        </div>
                        <div className="support-modal-bank-row">
                            <span className="support-modal-bank-label">Chủ TK</span>
                            <span className="support-modal-bank-value">{BANK_INFO.name}</span>
                        </div>
                    </div>

                    <div className="support-modal-footer">
                        <span>Nội dung CK: <strong>[tên bạn] - [thông tin liên hệ] để mình tiện cảm ơn</strong></span>
                    </div>
                </div>

                {/* MOBILE VIEW (Compact horizontal layout) */}
                <div className="support-modal-content-wrapper support-modal-content-mobile">
                    <div className="support-modal-left">
                        <div className="support-modal-message">
                            <p className="support-modal-highlight">Cảm ơn bạn đã đồng hành <br />và ủng hộ dự án!</p>
                        </div>

                        <div className="support-modal-bank">
                            <div className="support-modal-bank-row">
                                <span className="support-modal-bank-label">Ngân hàng</span>
                                <span className="support-modal-bank-value">{BANK_INFO.bank}</span>
                            </div>
                            <div className="support-modal-bank-row">
                                <span className="support-modal-bank-label">Số TK</span>
                                <span className="support-modal-bank-value support-modal-bank-account">
                                    {BANK_INFO.account}
                                </span>
                            </div>
                            <div className="support-modal-bank-row">
                                <span className="support-modal-bank-label">Chủ TK</span>
                                <span className="support-modal-bank-value">{BANK_INFO.name}</span>
                            </div>
                        </div>

                        <div className="support-modal-actions">
                            <button className="support-action-btn copy-btn" onClick={() => { void handleCopy(); }}>
                                {copied ? '✓ Đã Copy' : '📋 Copy STK'}
                            </button>
                            <button className="support-action-btn download-btn" onClick={() => { void handleDownload(); }}>
                                ⬇ Tải QR
                            </button>
                        </div>
                    </div>

                    <div className="support-modal-right">
                        <div className="support-modal-qr-section">
                            <div className="support-modal-qr-frame">
                                <img
                                    src={QR_URL}
                                    alt="QR chuyển khoản"
                                    className="support-modal-qr-img"
                                    crossOrigin="anonymous"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = QR_FALLBACK_URL;
                                    }}
                                />
                            </div>
                            <span className="support-modal-qr-hint">Quét mã để chuyển khoản</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
