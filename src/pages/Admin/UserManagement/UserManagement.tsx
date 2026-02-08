import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { getAllUsers, updateUserRole, deleteUser, UserWithMeta, UserRole } from '../../../services/userService';
import './UserManagement.css';

interface UserDetailModalProps {
    user: UserWithMeta;
    onClose: () => void;
    onSave: (updates: Partial<UserWithMeta>) => Promise<void>;
    onDelete: () => void;
    canEdit: boolean;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, onClose, onSave, onDelete, canEdit }) => {
    const [displayName, setDisplayName] = useState(user.display_name || '');
    const [role, setRole] = useState<UserRole>(user.role);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave({ display_name: displayName, role });
            onClose();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to save');
        } finally {
            setIsSaving(false);
        }
    };

    const formatDateTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="um-modal-overlay" onClick={onClose}>
            <div className="um-modal" onClick={e => e.stopPropagation()}>
                <div className="um-modal-header">
                    <h3>CHI TIẾT USER</h3>
                    <button className="um-modal-close" onClick={onClose}>×</button>
                </div>

                <div className="um-modal-body">
                    {/* Avatar */}
                    <div className="um-detail-avatar">
                        {(user.display_name || user.email)[0].toUpperCase()}
                    </div>

                    {/* Info Grid */}
                    <div className="um-detail-grid">
                        <div className="um-detail-row">
                            <label>ID</label>
                            <span className="um-detail-value um-id">{user.id}</span>
                        </div>

                        <div className="um-detail-row">
                            <label>Email</label>
                            <span className="um-detail-value">{user.email}</span>
                        </div>

                        <div className="um-detail-row">
                            <label>Tên hiển thị</label>
                            {canEdit && user.role !== 'admin' ? (
                                <input
                                    type="text"
                                    className="um-detail-input"
                                    value={displayName}
                                    onChange={e => setDisplayName(e.target.value)}
                                    placeholder="Nhập tên..."
                                />
                            ) : (
                                <span className="um-detail-value">{user.display_name || 'Chưa đặt tên'}</span>
                            )}
                        </div>

                        <div className="um-detail-row">
                            <label>Vai trò</label>
                            {canEdit && user.role !== 'admin' ? (
                                <select
                                    className="um-detail-select"
                                    value={role}
                                    onChange={e => setRole(e.target.value as UserRole)}
                                >
                                    <option value="user">User</option>
                                    <option value="mod">Mod</option>
                                    <option value="admin">Admin</option>
                                </select>
                            ) : (
                                <span className={`um-detail-value role-badge role-${user.role}`}>
                                    {user.role.toUpperCase()}
                                </span>
                            )}
                        </div>

                        <div className="um-detail-row">
                            <label>Ngày tham gia</label>
                            <span className="um-detail-value">{formatDateTime(user.created_at)}</span>
                        </div>

                        <div className="um-detail-row">
                            <label>Cập nhật lần cuối</label>
                            <span className="um-detail-value">{formatDateTime(user.updated_at)}</span>
                        </div>
                    </div>
                </div>

                <div className="um-modal-footer">
                    {canEdit && user.role !== 'admin' && (
                        <>
                            <button
                                className="um-btn um-btn-danger"
                                onClick={onDelete}
                            >
                                Xóa User
                            </button>
                            <button
                                className="um-btn um-btn-primary"
                                onClick={handleSave}
                                disabled={isSaving}
                            >
                                {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                        </>
                    )}
                    <button className="um-btn" onClick={onClose}>Đóng</button>
                </div>
            </div>
        </div>
    );
};

export const UserManagement: React.FC = () => {
    const { canManageUsers, user: currentUser } = useAuth();
    const [users, setUsers] = useState<UserWithMeta[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterRole, setFilterRole] = useState<UserRole | 'all'>('all');
    const [selectedUser, setSelectedUser] = useState<UserWithMeta | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getAllUsers();
            setUsers(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveUser = async (userId: string, updates: Partial<UserWithMeta>) => {
        if (!canManageUsers) return;

        if (updates.role) {
            await updateUserRole(userId, updates.role);
        }

        // Update local state
        setUsers(prev => prev.map(u =>
            u.id === userId ? { ...u, ...updates } : u
        ));
    };

    const handleDelete = async (userId: string, email: string) => {
        if (!canManageUsers) return;

        if (!confirm(`Bạn có chắc muốn xóa user ${email}? Hành động này không thể hoàn tác.`)) return;

        try {
            await deleteUser(userId);
            setUsers(prev => prev.filter(u => u.id !== userId));
            setSelectedUser(null);
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to delete user');
        }
    };

    // Filter and search
    const filteredUsers = users.filter(u => {
        const matchRole = filterRole === 'all' || u.role === filterRole;
        const matchSearch = !searchTerm ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.display_name?.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchRole && matchSearch;
    });

    const getRoleBadgeClass = (role: UserRole) => {
        switch (role) {
            case 'admin': return 'role-badge role-admin';
            case 'mod': return 'role-badge role-mod';
            default: return 'role-badge role-user';
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    if (loading) {
        return <div className="um-loading">Đang tải...</div>;
    }

    if (error) {
        return <div className="um-error">{error}</div>;
    }

    return (
        <div className="user-management">
            {/* Header */}
            <div className="um-header">
                <h3 className="um-title">QUẢN LÝ USERS</h3>
                <div className="um-stats">
                    <span className="stat-item">
                        <strong>{users.length}</strong> users
                    </span>
                    <span className="stat-item">
                        <strong>{users.filter(u => u.role === 'admin').length}</strong> admin
                    </span>
                    <span className="stat-item">
                        <strong>{users.filter(u => u.role === 'mod').length}</strong> mod
                    </span>
                </div>
            </div>

            {/* Toolbar */}
            <div className="um-toolbar">
                <input
                    type="text"
                    className="um-search"
                    placeholder="Tìm theo email hoặc tên..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <select
                    className="um-filter-select"
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value as UserRole | 'all')}
                >
                    <option value="all">Tất cả roles</option>
                    <option value="admin">Admin</option>
                    <option value="mod">Mod</option>
                    <option value="user">User</option>
                </select>
            </div>

            {/* User List */}
            <div className="um-list">
                {filteredUsers.length === 0 ? (
                    <div className="um-empty">
                        {searchTerm ? `Không tìm thấy "${searchTerm}"` : 'Không có user nào'}
                    </div>
                ) : (
                    filteredUsers.map(user => (
                        <div
                            key={user.id}
                            className={`um-user-card ${user.id === currentUser?.id ? 'um-current' : ''}`}
                            onClick={() => setSelectedUser(user)}
                        >
                            <div className="um-user-info">
                                <div className="um-user-avatar">
                                    {(user.display_name || user.email)[0].toUpperCase()}
                                </div>
                                <div className="um-user-details">
                                    <div className="um-user-name">
                                        {user.display_name || 'Chưa đặt tên'}
                                        {user.id === currentUser?.id && <span className="um-you-badge">Bạn</span>}
                                    </div>
                                    <div className="um-user-email">{user.email}</div>
                                    <div className="um-user-date">
                                        Tham gia: {formatDate(user.created_at)}
                                    </div>
                                </div>
                            </div>

                            <div className="um-user-actions">
                                <span className={getRoleBadgeClass(user.role)}>
                                    {user.role.toUpperCase()}
                                </span>

                                <button
                                    className="um-view-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedUser(user);
                                    }}
                                    title="Xem chi tiết"
                                >
                                    ⋯
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Detail Modal */}
            {selectedUser && (
                <UserDetailModal
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                    onSave={(updates) => handleSaveUser(selectedUser.id, updates)}
                    onDelete={() => handleDelete(selectedUser.id, selectedUser.email)}
                    canEdit={canManageUsers}
                />
            )}
        </div>
    );
};
