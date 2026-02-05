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
                        <label style={labelStyle}>Name</label>
                        <input
                            style={inputStyle}
                            value={formData.name || ''}
                            onChange={e => handleChange('name', e.target.value)}
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Cost</label>
                        <select
                            style={inputStyle}
                            value={formData.cost || 1}
                            onChange={e => handleChange('cost', parseInt(e.target.value))}
                        >
                            <option value={0}>Cost 0</option>
                            <option value={1}>Cost 1</option>
                            <option value={2}>Cost 2</option>
                            <option value={3}>Cost 3</option>
                            <option value={4}>Cost 4</option>
                            <option value={5}>Cost 5</option>
                            <option value={7}>Cost 7</option>
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}>Avatar URL</label>
                        <input
                            style={inputStyle}
                            value={formData.avatar || ''}
                            onChange={e => handleChange('avatar', e.target.value)}
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Traits (JSON Array)</label>
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
                </>
            );
        }

        // Default / Generic Fields for Traits/Items/Puzzles
        const isTitleField = type === 'puzzles' || type === 'augments';
        const fieldName = isTitleField ? 'title' : 'name';
        const displayLabel = isTitleField ? 'Title' : 'Name';

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
                        <label style={labelStyle}>Description</label>
                        <textarea
                            style={{ ...inputStyle, minHeight: '100px' }}
                            value={formData.description || ''}
                            onChange={e => handleChange('description', e.target.value)}
                        />
                    </div>
                )}
                {/* Icon field for items and augments */}
                {(type === 'items' || type === 'augments') && (
                    <div>
                        <label style={labelStyle}>Icon URL</label>
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
                        <label style={labelStyle}>Tier</label>
                        <select
                            style={inputStyle}
                            value={formData.tier || 1}
                            onChange={e => handleChange('tier', parseInt(e.target.value))}
                        >
                            <option value={1}>Tier 1 (Silver)</option>
                            <option value={2}>Tier 2 (Gold)</option>
                            <option value={3}>Tier 3 (Prismatic)</option>
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
                        Edit {type.slice(0, -1)}
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
                            background: 'transparent',
                            border: '1px solid #c8aa6e',
                            color: '#c8aa6e',
                            padding: '0.5rem 1.5rem',
                            cursor: 'pointer',
                            fontFamily: 'Inter, sans-serif',
                            textTransform: 'uppercase',
                            fontSize: '0.9rem',
                            borderRadius: '2px',
                            opacity: isSaving ? 0.5 : 1,
                            transition: 'all 0.2s'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="edit-form"
                        disabled={isSaving}
                        style={{
                            background: 'linear-gradient(180deg, #00A3FF 0%, #0077CC 100%)',
                            border: '1px solid #00A3FF',
                            color: '#FFFFFF',
                            padding: '0.5rem 1.5rem',
                            cursor: isSaving ? 'wait' : 'pointer',
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            fontSize: '0.9rem',
                            borderRadius: '2px',
                            boxShadow: '0 0 10px rgba(0, 163, 255, 0.4)',
                            opacity: isSaving ? 0.8 : 1,
                            transition: 'all 0.2s'
                        }}
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminEditModal;
