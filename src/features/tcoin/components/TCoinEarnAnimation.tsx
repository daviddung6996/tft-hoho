import { useState, useEffect, useCallback } from 'react';
import { TCoinIcon } from './TCoinIcon';
import { tcoinEvents, TCoinEvent } from '../tcoinEvents';
import './TCoinEarnAnimation.css';

interface FloatingSpark {
    id: number;
    driftX: number;
    driftY: number;
    delay: number;
}

interface EarnPopup {
    id: number;
    amount: number;
}

/**
 * TCoinEarnAnimation — spawns gentle golden sparks and an elegant +N text
 * next to the T-Coin widget, fitting the Hextech aesthetic.
 */
export function TCoinEarnAnimation() {
    const [flyingCoins, setFlyingCoins] = useState<FloatingSpark[]>([]);
    const [popups, setPopups] = useState<EarnPopup[]>([]);

    const spawnCoins = useCallback((event: TCoinEvent) => {
        if (event.amount <= 0) return;

        const maxSparks = 6;
        const sparkCount = Math.min(Math.max(event.amount, 2), maxSparks);
        const timestamp = Date.now();

        // Sparks that gently drift upward and slightly outward
        const newSparks: FloatingSpark[] = Array.from({ length: sparkCount }, (_, i) => {
            return {
                id: timestamp + i,
                driftX: (Math.random() - 0.5) * 45, // Spread -22px to +22px laterally
                driftY: -(30 + Math.random() * 40), // Drift upward 30-70px
                delay: i * 150 + Math.random() * 100, // Very slow, staggered spawn
            };
        });

        setFlyingCoins(prev => [...prev, ...newSparks]);

        // Show +N popup concurrently with an elegant fade
        const popupId = Date.now();
        setTimeout(() => {
            setPopups(prev => [...prev, { id: popupId, amount: event.amount }]);
            setTimeout(() => {
                setPopups(prev => prev.filter(p => p.id !== popupId));
            }, 2500); // Popup lasts longer (2.5s)
        }, 100);

        // Cleanup sparks after longest animation
        const longestDuration = sparkCount * 150 + 2000;
        setTimeout(() => {
            setFlyingCoins(prev => prev.filter(c => !newSparks.find(nc => nc.id === c.id)));
        }, longestDuration + 500);
    }, []);

    useEffect(() => {
        const unsubscribe = tcoinEvents.on(spawnCoins);
        return unsubscribe;
    }, [spawnCoins]);

    return (
        <div className="tcoin-earn-container">
            {/* Elegant floating sparks / coin icons */}
            {flyingCoins.map(coin => (
                <div
                    key={coin.id}
                    className="tcoin-floating-spark"
                    style={{
                        '--drift-x': `${coin.driftX}px`,
                        '--drift-y': `${coin.driftY}px`,
                        animationDelay: `${coin.delay}ms`,
                    } as React.CSSProperties}
                >
                    <TCoinIcon size={16} />
                </div>
            ))}

            {/* +N elegant text popup */}
            {popups.map(popup => (
                <div key={popup.id} className="tcoin-earn-popup">
                    <span className="tcoin-earn-popup-text">+{popup.amount}</span>
                </div>
            ))}
        </div>
    );
}
