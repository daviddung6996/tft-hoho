import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { FlexCardData } from '../../features/share/share.types';
import { getUserIqRankColor } from '../../features/user-iq/userIqCalculator';

export const FlexCardCanvasRemotion: React.FC<{ data: FlexCardData }> = ({ data }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const rankColor = getUserIqRankColor(data.iqRank);

    const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
    const scoreScale = spring({ frame: frame - 10, fps, config: { damping: 12 } });
    const rankOpacity = interpolate(frame, [30, 50], [0, 1], { extrapolateRight: 'clamp' });

    return (
        <AbsoluteFill style={{
            background: 'linear-gradient(180deg, #010a13 0%, #0d2e30 50%, #010a13 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Inter', sans-serif",
        }}>
            <div style={{
                opacity: titleOpacity,
                fontSize: 48,
                color: '#c8aa6e',
                letterSpacing: 6,
                fontWeight: 700,
                marginBottom: 40,
            }}>
                TFT IQ
            </div>

            <div style={{
                transform: `scale(${scoreScale})`,
                fontSize: 180,
                fontWeight: 900,
                color: rankColor,
                textShadow: `0 0 60px ${rankColor}55`,
                lineHeight: 1,
            }}>
                {data.iqScore}
            </div>

            <div style={{
                opacity: rankOpacity,
                fontSize: 56,
                fontWeight: 700,
                color: rankColor,
                marginTop: 30,
                letterSpacing: 4,
                textTransform: 'uppercase',
            }}>
                {data.iqRank}
            </div>

            <div style={{
                opacity: rankOpacity,
                fontSize: 32,
                color: '#a09b8c',
                marginTop: 20,
            }}>
                {data.username} • Top {data.topPercent}%
            </div>
        </AbsoluteFill>
    );
};
