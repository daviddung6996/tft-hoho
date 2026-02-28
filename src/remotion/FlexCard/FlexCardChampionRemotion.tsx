import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { FlexCardData } from '../../features/share/share.types';

const H = {
    bg: "#0a2830", bgLight: "#1a4a50",
    gold: "#e8c252", goldBright: "#fff4d6", goldDark: "#a07820", goldHot: "#ffe44d",
    teal: "#18eed8", tealBright: "#60fff0", tealDark: "#0c3a3e", tealDeep: "#0a3035",
    dark: "#061820", text: "#FFF8EC", textDim: "#c0b898",
    border: "rgba(232,194,82,0.3)", glow: "rgba(232,194,82,0.4)",
};

const RANKS: Record<string, { color: string; glow: string }> = {
    Iron: { color: "#8a8a8a", glow: "#6a6a6a" },
    Bronze: { color: "#c07838", glow: "#d08840" },
    Silver: { color: "#a8c0d0", glow: "#b8d0e0" },
    Gold: { color: "#e8c252", glow: "#ffd860" },
    Platinum: { color: "#60f0d0", glow: "#40e8c0" },
    Emerald: { color: "#28c870", glow: "#40f090" },
    Diamond: { color: "#7088ee", glow: "#8098ff" },
    Master: { color: "#b868f0", glow: "#c880ff" },
    Grandmaster: { color: "#ff5858", glow: "#ff7878" },
    Challenger: { color: "#ffd870", glow: "#ffe898" },
};

function getRank(iq: number) {
    if (iq >= 2000) return "Challenger";
    if (iq >= 1800) return "Grandmaster";
    if (iq >= 1600) return "Master";
    if (iq >= 1400) return "Diamond";
    if (iq >= 1200) return "Emerald";
    if (iq >= 1000) return "Platinum";
    if (iq >= 800) return "Gold";
    if (iq >= 500) return "Silver";
    if (iq >= 300) return "Bronze";
    return "Iron";
}

function getDramaQuote(iq: number) {
    if (iq >= 2000) return "Đỉnh cao vắng lặng, chờ đối thủ xứng tầm!";
    if (iq >= 1600) return "Học thầy không tày học tôi nè!";
    if (iq >= 1200) return "Chỉ là đang giấu bài thôi, cẩn thận tôi lật kèo!";
    if (iq >= 800) return "Nhân phẩm tùy lúc, nhưng IQ thì luôn có thừa!";
    if (iq >= 500) return "Thất bại là mẹ thành công, mà sao cay quá!!";
    return "Hôm nay Sắt thôi, ngày mai tôi sẽ khác!";
}


const PROS = [
    { name: "Dishsoap", iq: 1750, region: "NA" },
    { name: "k3soju", iq: 1900, region: "NA" },
    { name: "Bebe872", iq: 1950, region: "TW" },
    { name: "Setsuko", iq: 2050, region: "EUW" },
];

const Embers: React.FC<{ count?: number, bright?: boolean, frame: number }> = ({ count = 35, bright = false, frame }) => (
    <>
        {Array.from({ length: count }, (_, i) => {
            const r1 = Math.sin(i * 12.9898) * 43758.5453;
            const rand1Pos = r1 - Math.floor(r1);

            const r3 = Math.sin(i * 45.123) * 43758.5453;
            const rand3Pos = r3 - Math.floor(r3);

            const size = Math.round((bright ? 1.5 + rand1Pos * 3 : 1 + rand1Pos * 2.5) * 3.5);

            const durFrames = 150; // Perfect loop duration for 150 frame video!
            const offset = Math.round(rand3Pos * 150);

            const localFrame = (frame + offset) % durFrames;
            const progress = localFrame / durFrames;

            let opacity = 0;
            // Smooth fade in and out so particles don't pop when looping
            if (progress < 0.15) opacity = progress / 0.15 * 0.7;
            else if (progress < 0.85) opacity = 0.7;
            else opacity = 0.7 - ((progress - 0.85) / 0.15 * 0.7);

            const dx = progress * 1170;
            const dy = progress * (-90 + rand3Pos * 180);

            const color = rand1Pos > 0.4 ? H.goldHot : (rand1Pos > 0.5 ? H.tealBright : H.gold);

            return (
                <div key={i} style={{
                    position: "absolute", left: -30, top: `${rand1Pos * 100}%`,
                    width: size, height: size, borderRadius: "50%",
                    background: color,
                    opacity: opacity,
                    transform: `translate(${dx}px, ${dy}px)`
                }} />
            );
        })}
    </>
);

const Wings = () => (
    <svg width="510" height="345" viewBox="0 0 200 140" style={{ overflow: "visible" }}>
        <defs>
            <linearGradient id="wG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fff4c0" />
                <stop offset="40%" stopColor="#e8c252" />
                <stop offset="100%" stopColor="#a07820" />
            </linearGradient>
            <linearGradient id="wT" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#18eed8" />
                <stop offset="50%" stopColor="#10c8b8" />
                <stop offset="100%" stopColor="#18eed8" />
            </linearGradient>
            <filter id="wF">
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="wBright">
                <feGaussianBlur stdDeviation="1.5" result="b" />
                <feComposite in="SourceGraphic" in2="b" operator="over" />
            </filter>
        </defs>
        <path d="M95 70 Q60 30 20 20 Q10 50 30 60 Q15 55 8 40 Q5 70 25 78 Q10 72 5 58 Q8 90 35 90 Q50 88 70 78 Z"
            fill="url(#wT)" opacity="0.75" filter="url(#wF)" />
        <path d="M105 70 Q140 30 180 20 Q190 50 170 60 Q185 55 192 40 Q195 70 175 78 Q190 72 195 58 Q192 90 165 90 Q150 88 130 78 Z"
            fill="url(#wT)" opacity="0.75" filter="url(#wF)" />
        <path d="M96 68 Q65 35 28 28 Q22 52 38 58 Q25 55 18 44 Q16 72 35 80 Q55 85 75 75 Z" fill="url(#wG)" filter="url(#wBright)" />
        <path d="M104 68 Q135 35 172 28 Q178 52 162 58 Q175 55 182 44 Q184 72 165 80 Q145 85 125 75 Z" fill="url(#wG)" filter="url(#wBright)" />
        <path d="M90 75 L100 30 L110 75 L100 90 Z" fill="url(#wG)" />
        <path d="M92 72 L100 38 L108 72 L100 84 Z" fill="#c89830" opacity="0.5" />
        <path d="M96 42 L100 26 L104 42 L100 48 Z" fill="#18eed8" filter="url(#wF)" />
        <path d="M97.5 37 L100 30 L102.5 37 L100 42 Z" fill="#a0fff0" />
        <line x1="75" y1="55" x2="38" y2="38" stroke="#fff4c0" strokeWidth="0.5" opacity="0.35" />
        <line x1="125" y1="55" x2="162" y2="38" stroke="#fff4c0" strokeWidth="0.5" opacity="0.35" />
        <line x1="80" y1="63" x2="48" y2="50" stroke="#fff4c0" strokeWidth="0.3" opacity="0.2" />
        <line x1="120" y1="63" x2="152" y2="50" stroke="#fff4c0" strokeWidth="0.3" opacity="0.2" />
        <circle cx="52" cy="46" r="2.5" fill="#18eed8" opacity="0.7" />
        <circle cx="148" cy="46" r="2.5" fill="#18eed8" opacity="0.7" />
        <circle cx="38" cy="54" r="1.5" fill="#60fff0" opacity="0.4" />
        <circle cx="162" cy="54" r="1.5" fill="#60fff0" opacity="0.4" />
    </svg>
);

function DRow({ tag, tagC, name, rg, val, valC, o = 1 }: any) {
    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", opacity: o }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <span style={{
                    fontFamily: "'Inter', sans-serif", fontSize: 27,
                    color: tagC, fontWeight: 700, letterSpacing: 3, minWidth: 96,
                }}>{tag}</span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 36, color: H.text, fontWeight: 600 }}>{name}</span>
                <span style={{
                    fontFamily: "'Inter', sans-serif", fontSize: 24, color: H.textDim,
                    padding: "2px 12px", border: `3px solid ${H.border}`, background: "rgba(0,0,0,0.3)",
                }}>{rg}</span>
            </div>
            <span style={{ fontFamily: "'Spectral', serif", fontSize: 36, color: valC, fontWeight: 700 }}>{val}</span>
        </div>
    );
}

export const FlexCardChampionRemotion: React.FC<{ data: FlexCardData }> = ({ data }) => {
    const frame = useCurrentFrame();

    const rank = data.iqRank || getRank(data.iqScore);
    const rs = RANKS[rank] || RANKS.Iron;

    // Sort logic to make sure PROS are actually correctly filtering.
    // Ensure PROS are sorted by iq asc
    const sortedPros = [...PROS].sort((a, b) => a.iq - b.iq);
    const beaten = sortedPros.filter((x) => data.iqScore >= x.iq);
    const next = sortedPros.find((x) => x.iq > data.iqScore);
    const topB = beaten[beaten.length - 1];

    const bg = 1;
    const avatar = 1;
    const wings = 1;
    const iq = 1;
    const info = 1;
    const drama = 1;
    const cta = 1;
    const glow = 1;

    const dispIQ = data.iqScore;

    const pulseG = Math.sin((frame / 75) * Math.PI * 2);
    const pulseG_scale = 1 + ((pulseG + 1) / 2) * 0.03;
    const pulseG_opacity = 0.5 + ((pulseG + 1) / 2) * 0.5;

    const floatY = Math.sin((frame / 75) * Math.PI * 2) * 9;

    const wGlowVal = (pulseG + 1) / 2;

    return (
        <AbsoluteFill style={{
            background: `linear-gradient(170deg, ${H.bgLight} 0%, ${H.bg} 35%, ${H.dark} 100%)`,
            overflow: "hidden",
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* === BG LAYERS === */}
            <div style={{
                position: "absolute", top: -150, left: "50%", transform: "translateX(-50%)",
                width: 1200, height: 900, borderRadius: "50%",
                background: `radial-gradient(ellipse, ${H.teal}12 0%, transparent 60%)`,
                opacity: bg,
            }} />

            <div style={{
                position: "absolute", top: "30%", left: "50%",
                transform: `translate(-50%,-50%) scale(${glow > 0.5 ? pulseG_scale : 1})`,
                width: 1050, height: 840, borderRadius: "50%",
                background: `radial-gradient(ellipse, ${H.goldHot}10 0%, ${rs.glow}05 40%, transparent 65%)`,
                opacity: (bg * 0.6 + glow * 0.4) * (glow > 0.5 ? pulseG_opacity : 1),
            }} />

            <div style={{
                position: "absolute", top: 0, left: 0, width: "250%", height: 3,
                background: `linear-gradient(90deg, transparent 5%, ${H.gold}50 25%, ${H.goldHot}60 50%, ${H.gold}50 75%, transparent 95%)`,
                transform: "rotate(15deg) translateY(870px)",
                transformOrigin: "left center", opacity: bg * 0.35,
            }} />

            <div style={{
                position: "absolute", top: 0, left: 0, width: "250%", height: 3,
                background: `linear-gradient(90deg, transparent 10%, ${H.gold}25 35%, ${H.gold}10 65%, transparent 90%)`,
                transform: "rotate(15deg) translateY(885px)",
                transformOrigin: "left center", opacity: bg * 0.2,
            }} />

            <div style={{
                position: "absolute", inset: 0, opacity: bg * 0.04,
                backgroundImage: `
              repeating-linear-gradient(60deg, ${H.goldHot} 0px, ${H.goldHot} 3px, transparent 3px, transparent 108px),
              repeating-linear-gradient(-60deg, ${H.goldHot} 0px, ${H.goldHot} 3px, transparent 3px, transparent 108px)`,
            }} />

            <div style={{
                position: "absolute", inset: 0, opacity: 0.025,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
                backgroundSize: "384px",
            }} />

            <div style={{
                position: "absolute", left: 0, right: 0, height: 3,
                background: `linear-gradient(90deg, transparent, ${H.tealBright}25, transparent)`,
                transform: `translateY(${-300 + (frame % 150) / 150 * 2500}px)`,
                zIndex: 5,
            }} />

            <div style={{ position: "absolute", inset: 0, opacity: bg }}>
                <Embers count={28} frame={frame} />
            </div>
            {glow > 0 && (
                <div style={{ position: "absolute", inset: 0, opacity: glow * 0.7 }}>
                    <Embers count={20} bright frame={frame} />
                </div>
            )}

            <div style={{
                position: "absolute", top: 150, left: 0, width: 6, height: 600,
                background: `linear-gradient(180deg, transparent, ${H.goldHot}50, ${H.gold}70, ${H.goldHot}50, transparent)`,
                opacity: bg * 0.6,
            }} />

            <div style={{
                position: "absolute", top: 900, right: 0, width: 3, height: 450,
                background: `linear-gradient(180deg, transparent, ${H.teal}30, transparent)`,
                opacity: bg * 0.4,
            }} />

            {/* === OUTER FRAME: corner accents only === */}
            {[
                { t: 24, l: 24, bT: true, bL: true },
                { t: 24, r: 24, bT: true, bR: true },
                { b: 24, l: 24, bB: true, bL: true },
                { b: 24, r: 24, bB: true, bR: true },
            ].map((c, i) => (
                <div key={i} style={{
                    position: "absolute", width: 72, height: 72, zIndex: 10, opacity: bg,
                    ...(c.t !== undefined && { top: c.t }), ...(c.b !== undefined && { bottom: c.b }),
                    ...(c.l !== undefined && { left: c.l }), ...(c.r !== undefined && { right: c.r }),
                    borderTop: c.bT ? `3px solid ${H.gold}90` : "none",
                    borderBottom: c.bB ? `3px solid ${H.gold}90` : "none",
                    borderLeft: c.bL ? `3px solid ${H.gold}90` : "none",
                    borderRight: c.bR ? `3px solid ${H.gold}90` : "none",
                }} />
            ))}

            {/* ===== AVATAR ===== */}
            <div style={{
                position: "absolute", top: 120, left: "50%",
                transform: `translate(-50%,0) scale(${0.4 + avatar * 0.6})`,
                opacity: avatar,
            }}>
                <div style={{
                    position: "absolute", inset: -24,
                    clipPath: "polygon(50% 0%,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%)",
                    background: `linear-gradient(90deg,${H.gold}30,${H.goldHot}aa,${H.gold}30)`,
                    backgroundSize: "200% 100%",
                    backgroundPosition: `${(frame % 150) / 150 * 200}% 50%`,
                    opacity: 0.3 + glow * 0.7,
                    filter: `blur(${6 + glow * 12}px)`,
                }} />
                <div style={{
                    position: "absolute", inset: -7.5,
                    clipPath: "polygon(50% 0%,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%)",
                    background: `linear-gradient(180deg,${H.goldBright},${H.gold},${H.goldDark})`,
                }} />
                <div style={{
                    width: 216, height: 249,
                    clipPath: "polygon(50% 0%,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%)",
                    background: `linear-gradient(180deg,${H.tealDark},${H.dark})`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    overflow: "hidden", position: "relative",
                }}>
                    {false ? (
                        <img src={""} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                        <span style={{
                            fontSize: 84, color: H.goldHot,
                            fontFamily: "'Spectral', serif", fontWeight: 700,
                            textShadow: `0 0 36px ${H.goldHot}50`,
                        }}>{(data.username || "P").charAt(0)}</span>
                    )}
                    {glow > 0 && (
                        <div style={{
                            position: "absolute", inset: 0,
                            background: `linear-gradient(110deg,transparent 25%,${H.goldHot}15 50%,transparent 75%)`,
                            backgroundSize: "200% 100%",
                            backgroundPosition: `${-200 + (frame % 150) / 150 * 400}% 0`
                        }} />
                    )}
                </div>
            </div>

            {/* ===== RANK WINGS ===== */}
            <div style={{
                position: "absolute", top: 435, left: "50%",
                transform: `translate(-50%,0) scale(${0.2 + wings * 0.8})`,
                opacity: wings,
                filter: glow > 0.5 ?
                    `drop-shadow(0 0 ${wGlowVal * 30 + 36}px ${H.goldHot}50) drop-shadow(0 0 ${wGlowVal * 48 + 72}px ${H.teal}40)`
                    : `drop-shadow(0 0 ${18 + glow * 45}px ${rs.glow}45)`,
            }}>
                <Wings />
            </div>

            <div style={{
                position: "absolute", top: 774, left: 0, right: 0, textAlign: "center",
                opacity: wings,
            }}>
                <span style={{
                    fontFamily: "'Inter', sans-serif", fontSize: 30, fontWeight: 700,
                    color: rs.color, letterSpacing: 24,
                    textShadow: `0 0 30px ${rs.glow}50`,
                }}>{rank.toUpperCase()}</span>
            </div>

            {/* ===== IQ ===== */}
            <div style={{
                position: "absolute", top: 810, left: 0, right: 0,
                display: "flex", flexDirection: "column", alignItems: "center",
                opacity: iq,
            }}>
                <div style={{ position: "relative", display: "inline-block" }}>
                    <div style={{
                        fontFamily: "'Spectral', serif", fontSize: 320, fontWeight: 900,
                        color: H.goldBright, lineHeight: 1, letterSpacing: 6,
                        textShadow: `
                  0 0 75px ${H.goldHot}45,
                  0 0 150px ${rs.glow}20,
                  0 6px 12px rgba(0,0,0,0.7)
                `,
                    }}>{dispIQ.toLocaleString()}</div>
                    {/* TFT IQ — unified label, anchored to right edge of number */}
                    <div style={{
                        position: "absolute",
                        left: "100%", top: "50%",
                        transform: "translateY(-80%)",
                        marginLeft: 8,
                        whiteSpace: "nowrap",
                    }}>
                        <span style={{
                            fontFamily: "'Inter', sans-serif", fontSize: 48, fontWeight: 800,
                            color: H.gold, letterSpacing: 3,
                            textShadow: `0 0 24px ${H.goldHot}50`,
                        }}>TFT IQ</span>
                    </div>
                </div>
            </div>

            <div style={{
                position: "absolute", top: 1116, left: "50%", transform: "translateX(-50%)",
                width: 135, height: 3,
                background: `linear-gradient(90deg, transparent, ${H.goldHot}, transparent)`,
                opacity: info * 0.6,
            }} />

            {/* ===== NAME + TOP% ===== */}
            <div style={{
                position: "absolute", top: 1152, left: 0, right: 0, textAlign: "center",
                opacity: info, transform: `translateY(${(1 - info) * 18}px)`,
            }}>
                <div style={{
                    fontFamily: "'Spectral', serif", fontSize: 54, fontWeight: 700,
                    color: H.text, letterSpacing: 6,
                }}>{data.username || "Player"}</div>
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 24, marginTop: 15,
                }}>
                    <div style={{ width: 60, height: 3, background: `linear-gradient(90deg,transparent,${H.goldHot}60)` }} />
                    <span style={{
                        fontFamily: "'Inter', sans-serif", fontSize: 39, fontWeight: 700,
                        color: H.goldBright, letterSpacing: 6,
                        textShadow: `0 0 18px ${H.goldHot}80`,
                    }}>TOP {data.topPercent || 0.1}% {data.region || "VN"}</span>
                    <div style={{ width: 60, height: 3, background: `linear-gradient(90deg,${H.goldHot}60,transparent)` }} />
                </div>
            </div>

            {/* ===== DRAMA ===== */}
            <div style={{
                position: "absolute", top: 1326, left: 90, right: 90,
                opacity: drama, transform: `translateY(${(1 - drama) * 24}px)`,
            }}>
                <div style={{
                    height: 3, marginBottom: 30,
                    background: `linear-gradient(90deg,transparent,${H.gold}20,transparent)`,
                }} />

                {topB && <DRow tag="VƯỢT" tagC={H.teal} name={topB.name} rg={topB.region}
                    val={topB.iq} valC={RANKS[getRank(topB.iq)].color} o={0.5} />}

                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "15px 24px", margin: "18px 0",
                    background: `linear-gradient(90deg,${H.goldHot}10,transparent)`,
                    borderLeft: `6px solid ${H.goldHot}`,
                }}>
                    <span style={{
                        fontFamily: "'Inter', sans-serif", fontSize: 39,
                        color: H.goldBright, fontWeight: 700,
                    }}>{data.username || "Player"}</span>
                    <span style={{
                        fontFamily: "'Spectral', serif", fontSize: 45,
                        color: H.goldBright, fontWeight: 900,
                        textShadow: `0 0 24px ${H.goldHot}30`,
                    }}>{dispIQ.toLocaleString()}</span>
                </div>

                {next && (
                    <DRow tag="TIẾP" tagC="#f05050" name={next.name} rg={next.region}
                        val={next.iq} valC={RANKS[getRank(next.iq)].color} o={0.4} />
                )}

                <div style={{
                    textAlign: "center", marginTop: 72,
                    fontFamily: "'Inter', sans-serif", fontSize: 40, fontStyle: "italic",
                    fontWeight: 600, color: H.goldBright, letterSpacing: 1.5,
                    textShadow: `0 0 24px ${H.goldHot}90, 0 0 12px ${H.gold}80`,
                }}>"{getDramaQuote(data.iqScore)}"</div>
            </div>

            {/* ===== CTA ===== */}
            <div style={{
                position: "absolute", top: 1780, left: 0, right: 0, textAlign: "center",
                opacity: cta,
            }}>
                <div style={{
                    fontFamily: "'Inter', sans-serif", fontSize: 36,
                    color: H.gold, letterSpacing: 9, fontWeight: 500,
                    opacity: 0.6,
                    transform: cta >= 1 ? `translateY(${floatY * 0.5}px)` : 'none',
                }}>tftiseasy.com</div>
            </div>

            {/* Inner vignette — no border, just shadow */}
            <div style={{
                position: 'absolute',
                inset: 0,
                boxShadow: `inset 0 0 150px rgba(0,0,0,0.7)`,
                pointerEvents: 'none',
            }} />
        </AbsoluteFill>
    );
};
