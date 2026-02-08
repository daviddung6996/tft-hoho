import React, { useState, useEffect } from 'react';

interface AdminEditModalProps {
    item: any;
    type: 'champions' | 'traits' | 'items' | 'augments' | 'puzzles';
    isSaving?: boolean;
    onSave: (updates: any) => void;
    onClose: () => void;
}

const AdminEditModal: React.FC<AdminEditModalProps> = ({ item, type, isSaving, onSave, onClose }) => {
    // Initialize form data
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        if (item) {
            setFormData({ ...item });
        }
    }, [item]);

    const handleChange = (field: string, value: any) => {
        setFormData((prev: any) => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!item) return null;

    const renderFields = () => {
        // Hextech Input Style
        const inputStyle = {
            width: '100%',
            background: '#05080F', // Deepest dark for inputs
            border: '1px solid #1E293B', // Slate border
            color: '#F0F6FC', // Bright text
            fontFamily: 'Inter, sans-serif',
            padding: '0.5rem',
            marginBottom: '1rem',
            borderRadius: '4px',
            outline: 'none'
        };

        const labelStyle = {
            display: 'block',
            color: '#c8aa6e', // Hextech Gold
            marginBottom: '0.5rem',
            fontSize: '0.85rem',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.05em'
        };

        // Fields specific to Champions
        if (type === 'champions') {
            return (
                <>
                    <div>
                        <label style={labelStyle}>Tên</label>
                        <input
                            style={inputStyle}
                            value={formData.name || ''}
                            onChange={e => handleChange('name', e.target.value)}
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>$</label>
                        <select
                            style={inputStyle}
                            value={formData.cost || 1}
                            onChange={e => handleChange('cost', parseInt(e.target.value))}
                        >
                            <option value={0}>$ 0</option>
                            <option value={1}>$ 1</option>
                            <option value={2}>$ 2</option>
                            <option value={3}>$ 3</option>
                            <option value={4}>$ 4</option>
                            <option value={5}>$ 5</option>
                            <option value={7}>$ 7</option>
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}>URL Ảnh đại diện</label>
                        <input
                            style={inputStyle}
                            value={formData.avatar || ''}
                            onChange={e => handleChange('avatar', e.target.value)}
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Tộc/Hệ (JSON Array)</label>
                        <textarea
                            style={{ ...inputStyle, minHeight: '60px', fontFamily: 'monospace' }}
                            value={Array.isArray(formData.traits) ? JSON.stringify(formData.traits) : formData.traits}
                            onChange={e => {
                                try {
                                    handleChange('traits', JSON.parse(e.target.value));
                                } catch (err) {
                                    // Allow typing invalid json momentarily
                                }
                            }}
                            placeholder='["Trait1", "Trait2"]'
                        />
                    </div>
                    {/* Ability Fields */}
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(200, 170, 110, 0.3)' }}>
                        <label style={{ ...labelStyle, color: '#00A3FF' }}>Kỹ Năng</label>
                    </div>
                    <div>
                        <label style={labelStyle}>Tên Kỹ Năng (Tiếng Việt)</label>
                        <input
                            style={inputStyle}
                            value={formData.ability_name || ''}
                            onChange={e => handleChange('ability_name', e.target.value)}
                            placeholder="Ví dụ: Tê Cóng"
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Mô Tả Kỹ Năng</label>
                        <textarea
                            style={{ ...inputStyle, minHeight: '80px' }}
                            value={formData.ability_description || ''}
                            onChange={e => handleChange('ability_description', e.target.value)}
                            placeholder="Mô tả kỹ năng của tướng..."
                        />
                    </div>
                    {/* Stats Fields */}
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(200, 170, 110, 0.3)' }}>
                        <label style={{ ...labelStyle, color: '#c8aa6e' }}>Stats Cơ Bản (JSON)</label>
                        <textarea
                            style={{ ...inputStyle, minHeight: '100px', fontFamily: 'monospace', fontSize: '0.8rem' }}
                            value={formData.stats ? JSON.stringify(formData.stats, null, 2) : ''}
                            onChange={e => {
                                try {
                                    handleChange('stats', JSON.parse(e.target.value));
                                } catch (err) {
                                    // Allow typing invalid json momentarily
                                }
                            }}
                            placeholder={`{
  "hp": [600, 1080, 1944],
  "ad": [50, 90, 162],
  "as": 0.75,
  "armor": 30,
  "mr": 30,
  "mana": {"min": 0, "max": 100},
  "range": 1,
  "dps": [38, 68, 122]
}`}
                        />
                    </div>
                </>
            );
        }

        // Default / Generic Fields for Traits/Items/Puzzles
        const isTitleField = type === 'puzzles' || type === 'augments';
        const fieldName = isTitleField ? 'title' : 'name';
        const displayLabel = isTitleField ? 'Tiêu đề' : 'Tên';

        return (
            <>
                <div>
                    <label style={labelStyle}>{displayLabel}</label>
                    <input
                        style={inputStyle}
                        value={formData[fieldName] || ''}
                        onChange={e => handleChange(fieldName, e.target.value)}
                        autoFocus
                    />
                </div>
                {formData.description !== undefined && (
                    <div>
                        <label style={labelStyle}>Mô tả</label>
                        <textarea
                            style={{ ...inputStyle, minHeight: '100px' }}
                            value={formData.description || ''}
                            onChange={e => handleChange('description', e.target.value)}
                        />
                    </div>
                )}
                {/* Vietnamese description field for augments, traits, and items */}
                {(type === 'augments' || type === 'traits' || type === 'items') && (
                    <div>
                        <label style={labelStyle}>Mô tả tiếng Việt</label>
                        <textarea
                            style={{ ...inputStyle, minHeight: '80px' }}
                            value={formData.description_vi || ''}
                            onChange={e => handleChange('description_vi', e.target.value)}
                            placeholder={`Mô tả ${type === 'augments' ? 'augment' : type === 'traits' ? 'tộc/hệ' : 'trang bị'} bằng tiếng Việt...`}
                        />
                    </div>
                )}
                {/* Icon field for items and augments */}
                {(type === 'items' || type === 'augments') && (
                    <div>
                        <label style={labelStyle}>URL Biểu tượng</label>
                        <input
                            style={inputStyle}
                            value={formData.icon || ''}
                            onChange={e => handleChange('icon', e.target.value)}
                            placeholder="https://... or /assets/..."
                        />
                    </div>
                )}
                {/* Tier field for augments */}
                {type === 'augments' && (
                    <div>
                        <label style={labelStyle}>Cấp</label>
                        <select
                            style={inputStyle}
                            value={formData.tier || 1}
                            onChange={e => handleChange('tier', parseInt(e.target.value))}
                        >
                            <option value={1}>Cấp 1 (Bạc)</option>
                            <option value={2}>Cấp 2 (Vàng)</option>
                            <option value={3}>Cấp 3 (Lăng kính)</option>
                        </select>
                    </div>
                )}
            </>
        );
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000,
            backdropFilter: 'blur(2px)'
        }}>
            <div className="hex-panel" style={{
                width: '500px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid #c8aa6e', // Hextech Gold Border
                background: 'linear-gradient(180deg, #153a3e 0%, #051c1e 100%)', // Hextech Gradient
                boxShadow: '0 0 20px rgba(200, 170, 110, 0.25)', // Gold Glow
                borderRadius: '4px',
                overflow: 'hidden'
            }}>
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid rgba(200, 170, 110, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <h3 style={{
                        margin: 0,
                        color: '#c8aa6e',
                        fontFamily: 'Spectral, serif',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontSize: '1.25rem'
                    }}>
                        Chỉnh sửa {type === 'champions' ? 'tướng' : type === 'traits' ? 'tộc/hệ' : type === 'items' ? 'trang bị' : type === 'augments' ? 'Augments' : 'Puzzles'}
                    </h3>
                </div>

                <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
                    <form id="edit-form" onSubmit={handleSubmit}>
                        {renderFields()}
                    </form>
                </div>

                <div style={{
                    padding: '1.5rem',
                    borderTop: '1px solid rgba(200, 170, 110, 0.3)',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '1rem',
                    background: 'rgba(0, 0, 0, 0.2)'
                }}>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSaving}
                        style={{
                            background: 'rgba(0, 0, 0, 0.3)',
                            border: '1px solid #c8aa6e',
                            color: '#F0E6D2',
                            padding: '0.5rem 1.5rem',
                            cursor: 'pointer',
                            fontFamily: 'Inter, sans-serif',
                            textTransform: 'uppercase',
                            fontSize: '0.9rem',
                            borderRadius: '2px',
                            opacity: isSaving ? 0.5 : 1,
                            transition: 'none'
                        }}
                    >
                        Huỷ
                    </button>
                    <button
                        type="submit"
                        form="edit-form"
                        disabled={isSaving}
                        style={{
                            background: 'linear-gradient(180deg, rgba(21, 58, 62, 0.6) 0%, rgba(5, 28, 30, 0.6) 100%)',
                            border: '1px solid #c8aa6e',
                            color: '#F0E6D2',
                            padding: '0.5rem 1.5rem',
                            cursor: isSaving ? 'wait' : 'pointer',
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            fontSize: '0.9rem',
                            borderRadius: '2px',
                            boxShadow: '0 0 10px rgba(200, 170, 110, 0.25)',
                            opacity: isSaving ? 0.8 : 1,
                            transition: 'none'
                        }}
                    >
                        {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminEditModal;
