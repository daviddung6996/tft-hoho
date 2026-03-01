
import React, { useState, useRef, useEffect } from 'react';
import { PuzzleTier, TCOIN_SPEND_COSTS } from '../../features/tcoin/tcoin.types';
import { TierIcon, TIER_META } from './TierIcon';
import { TCoinIcon } from '../../features/tcoin/components/TCoinIcon';
import './TierSelect.css';

interface TierSelectProps {
    value: PuzzleTier;
    onChange: (tier: PuzzleTier) => void;
    className?: string;
}

const TIERS: PuzzleTier[] = ['free', 'advanced', 'rare'];

function getCost(tier: PuzzleTier): number | null {
    if (tier === 'free') return null;
    return tier === 'advanced'
        ? TCOIN_SPEND_COSTS.unlock_advanced
        : TCOIN_SPEND_COSTS.unlock_rare;
}

export const TierSelect: React.FC<TierSelectProps> = ({ value, onChange, className }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const meta = TIER_META[value];
    const cost = getCost(value);

    return (
        <div
            ref={ref}
            className={`tier-select ${className ?? ''} ${open ? 'tier-select--open' : ''}`}
            role="combobox"
            aria-expanded={open}
            aria-haspopup="listbox"
        >
            {/* Trigger */}
            <button
                type="button"
                className="tier-select__trigger"
                onClick={() => setOpen(o => !o)}
                aria-label={`Puzzle Tier: ${meta.label}`}
            >
                <TierIcon tier={value} size={14} />
                <span className="tier-select__label" style={{ color: meta.color }}>
                    {meta.label}
                </span>
                {cost !== null && (
                    <span className="tier-select__cost">
                        <TCoinIcon size={12} />
                        <span>{cost}</span>
                    </span>
                )}
                <svg
                    className="tier-select__chevron"
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                >
                    <path d="M2 3.5L5 6.5L8 3.5" stroke="#c8aa6e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            {/* Dropdown */}
            {open && (
                <ul className="tier-select__dropdown" role="listbox" aria-label="Chọn tier">
                    {TIERS.map(tier => {
                        const m = TIER_META[tier];
                        const cost = getCost(tier);
                        const isActive = tier === value;
                        return (
                            <li
                                key={tier}
                                role="option"
                                aria-selected={isActive}
                                className={`tier-select__option ${isActive ? 'tier-select__option--active' : ''}`}
                                onClick={() => {
                                    onChange(tier);
                                    setOpen(false);
                                }}
                            >
                                <TierIcon tier={tier} size={14} />
                                <span className="tier-select__option-label" style={{ color: m.color }}>
                                    {m.label}
                                </span>
                                {cost !== null && (
                                    <span className="tier-select__option-cost">
                                        <TCoinIcon size={11} />
                                        <span>{cost}</span>
                                    </span>
                                )}
                                {isActive && (
                                    <svg className="tier-select__check" width="10" height="10" viewBox="0 0 10 10" fill="none">
                                        <path d="M1.5 5L4 7.5L8.5 2.5" stroke="#c8aa6e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default TierSelect;
