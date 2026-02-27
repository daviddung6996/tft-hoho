import React from 'react';
import { UserIqRank } from '../userIq.types';

interface IqRankIconProps {
    rank: UserIqRank;
    className?: string;
}

export const IqRankIcon: React.FC<IqRankIconProps> = ({ rank, className = '' }) => {
    // Shared wrapper for all SVGs to keep sizing consistent
    const SVGWrapper = ({ children, viewBox = "0 0 24 24" }: { children: React.ReactNode, viewBox?: string }) => (
        <svg
            className={className}
            viewBox={viewBox}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: '1em', height: '1em', display: 'inline-block' }}
        >
            {children}
        </svg>
    );

    switch (rank) {
        case 'Iron':
            return (
                <SVGWrapper>
                    <polygon points="12,2 22,8 22,16 12,22 2,16 2,8" stroke="currentColor" strokeWidth="2" fill="transparent" strokeLinejoin="round" />
                </SVGWrapper>
            );
        case 'Bronze':
            return (
                <SVGWrapper>
                    <polygon points="12,2 22,8 22,16 12,22 2,16 2,8" stroke="currentColor" strokeWidth="2" fill="transparent" strokeLinejoin="round" />
                    <circle cx="12" cy="12" r="3" fill="currentColor" />
                </SVGWrapper>
            );
        case 'Silver':
            return (
                <SVGWrapper>
                    <polygon points="12,2 22,8 22,16 12,22 2,16 2,8" stroke="currentColor" strokeWidth="2" fill="transparent" strokeLinejoin="round" />
                    <polygon points="12,6 17.5,9 17.5,15 12,18 6.5,15 6.5,9" stroke="currentColor" strokeWidth="1.5" fill="transparent" />
                </SVGWrapper>
            );
        case 'Gold':
            return (
                <SVGWrapper>
                    <polygon points="12,2 22,8 22,16 12,22 2,16 2,8" stroke="currentColor" strokeWidth="2" fill="transparent" strokeLinejoin="round" />
                    <polygon points="12,5 18,8.5 18,15.5 12,19 6,15.5 6,8.5" fill="currentColor" opacity="0.4" />
                    <polygon points="12,7 16,9.5 16,14.5 12,17 8,14.5 8,9.5" fill="currentColor" />
                </SVGWrapper>
            );
        case 'Platinum':
            return (
                <SVGWrapper>
                    <polygon points="12,2 22,8 22,16 12,22 2,16 2,8" stroke="currentColor" strokeWidth="2" fill="transparent" strokeLinejoin="round" />
                    <path d="M12 4L18 12L12 20L6 12L12 4Z" stroke="currentColor" strokeWidth="1.5" fill="transparent" />
                    <circle cx="12" cy="12" r="2.5" fill="currentColor" />
                </SVGWrapper>
            );
        case 'Diamond':
            return (
                <SVGWrapper>
                    <polygon points="12,1 23,7 23,17 12,23 1,17 1,7" stroke="currentColor" strokeWidth="1.5" fill="transparent" strokeLinejoin="round" />
                    <path d="M12 4L19 12L12 20L5 12L12 4Z" fill="currentColor" opacity="0.3" />
                    <path d="M12 6L16 12L12 18L8 12L12 6Z" fill="currentColor" />
                    <path d="M12 2V22" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
                    <path d="M2 12H22" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
                </SVGWrapper>
            );
        case 'Master':
            return (
                <SVGWrapper>
                    <polygon points="12,2 22,8 22,16 12,22 2,16 2,8" stroke="currentColor" strokeWidth="2" fill="transparent" strokeLinejoin="round" />
                    <path d="M7 10L12 5L17 10" stroke="currentColor" strokeWidth="2" fill="transparent" strokeLinejoin="round" strokeLinecap="round" />
                    <path d="M7 14L12 9L17 14" stroke="currentColor" strokeWidth="2" fill="transparent" strokeLinejoin="round" strokeLinecap="round" />
                    <path d="M7 18L12 13L17 18" stroke="currentColor" strokeWidth="2" fill="transparent" strokeLinejoin="round" strokeLinecap="round" />
                </SVGWrapper>
            );
        case 'Grandmaster':
            return (
                <SVGWrapper>
                    <polygon points="12,2 22,8 22,16 12,22 2,16 2,8" stroke="currentColor" strokeWidth="2" fill="transparent" strokeLinejoin="round" />
                    <path d="M12 4L14.5 9.5L20 10.5L16 14.5L17 20L12 17.5L7 20L8 14.5L4 10.5L9.5 9.5L12 4Z" fill="currentColor" opacity="0.8" />
                    <circle cx="12" cy="12" r="2" fill="#051c1e" />
                </SVGWrapper>
            );
        case 'Challenger':
            return (
                <SVGWrapper viewBox="0 0 24 24">
                    <path d="M12 2L2 8V16L12 22L22 16V8L12 2Z" fill="currentColor" opacity="0.2" />
                    <path d="M12 2L2 8V16L12 22L22 16V8L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M6 15L7 8L10 11L12 6L14 11L17 8L18 15H6Z" fill="currentColor" />
                    <circle cx="7" cy="6" r="1.5" fill="currentColor" />
                    <circle cx="12" cy="4" r="1.5" fill="currentColor" />
                    <circle cx="17" cy="6" r="1.5" fill="currentColor" />
                </SVGWrapper>
            );
        default:
            return (
                <SVGWrapper>
                    <polygon points="12,2 22,8 22,16 12,22 2,16 2,8" stroke="currentColor" strokeWidth="2" fill="transparent" strokeLinejoin="round" />
                </SVGWrapper>
            );
    }
};
