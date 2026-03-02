import React from 'react';
import Toast from '../../../components/common/Toast';

interface VideoUnlockToastProps {
    videoTitle: string;
    onViewLibrary: () => void;
    onClose: () => void;
}

export const VideoUnlockToast: React.FC<VideoUnlockToastProps> = ({
    onViewLibrary,
    onClose,
}) => {
    return (
        <Toast
            message={`Video đã lưu vào Kho Pro Analysis`}
            type="success"
            onClose={onClose}
            duration={6000}
            actionLabel="Xem ngay"
            onAction={onViewLibrary}
        />
    );
};
