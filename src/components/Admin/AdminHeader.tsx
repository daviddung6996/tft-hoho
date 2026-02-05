import React from 'react';
import './AdminHeader.css';

export interface AdminTab {
    key: string;
    label: string;
}

interface AdminHeaderProps {
    title: string;
    tabs: AdminTab[];
    activeTab: string;
    onTabChange: (key: any) => void;
    actions?: React.ReactNode;
    onClose?: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({
    title,
    tabs,
    activeTab,
    onTabChange,
    actions,
    onClose
}) => {
    return (
        <div className="admin-header-container">
            <div className="admin-header-left">
                <h2 className="admin-header-title">{title}</h2>
                <nav className="admin-tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            className={`admin-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                            onClick={() => onTabChange(tab.key)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="admin-header-actions">
                {actions}
                {onClose && (
                    <button onClick={onClose} className="admin-close-btn" aria-label="Close">
                        ✕
                    </button>
                )}
            </div>
        </div>
    );
};

export default AdminHeader;
