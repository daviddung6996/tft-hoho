import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { FlexCardData } from '../../features/share/share.types';
import { getUserIqRankColor } from '../../features/user-iq/userIqCalculator';

export const FlexCardCyberRemotion: React.FC<{ data: FlexCardData }> = ({ data }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const rankColor = getUserIqRankColor(data.iqRank);

    const scanlineY = interpolate(frame, [0, 150], [0, 1920], { extrapolateRight: 'clamp' });
    const glitch = Math.sin(frame * 0.8) * 2;
    const titleOpacity = interpolate(frame, [5, 25], [0, 1], { extrapolateRight: 'clamp' });
    const scoreScale = spring({ frame: frame - 15, fps, config: { damping: 10 } });
    const rankOpacity = interpolate(frame, [35, 55], [0, 1], { extrapolateRight: 'clamp' });

    return (
        <AbsoluteFill style={{
            background: '#010a13',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Inter', sans-serif",
            overflow: 'hidden',
        }}>
            {/* Scanline */}
            <div style={{
                position: 'absolute', top: scanlineY, left: 0, right: 0,
                height: 3, background: `${rankColor}44`,
            }} />

            {/* Grid overlay */}
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: `linear-gradient(${rankColor}08 1px, transparent 1px), linear-gradient(90deg, ${rankColor}08 1px, transparent 1px)`,
                backgroundSize: '60px 60px',
            }} />

            <div style={{
                opacity: titleOpacity,
                fontSize: 44,
                color: rankColor,
                letterSpacing: 10,
                fontWeight: 800,
                marginBottom: 50,
                textShadow: `0 0 20px ${rankColor}88`,
                transform: `translateX(${glitch}px)`,
            }}>
                TFT IQ
            </div>

            <div style={{
                transform: `scale(${scoreScale}) translateX(${-glitch}px)`,
                fontSize: 200,
                fontWeight: 900,
                color: '#fff',
                textShadow: `0 0 80px ${rankColor}, 0 0 40px ${rankColor}88`,
                lineHeight: 1,
            }}>
                {data.iqScore}
            </div>

            <div style={{
                opacity: rankOpacity,
                fontSize: 52,
                fontWeight: 700,
                color: rankColor,
                marginTop: 40,
                letterSpacing: 6,
                textTransform: 'uppercase',
                textShadow: `0 0 30px ${rankColor}66`,
            }}>
                {data.iqRank}
            </div>

            <div style={{
                opacity: rankOpacity,
                fontSize: 30,
                color: '#a09b8c',
                marginTop: 24,
            }}>
                {data.username} • Top {data.topPercent}%
            </div>
        </AbsoluteFill>
    );
};
