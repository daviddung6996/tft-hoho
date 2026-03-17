import { useEffect, useCallback, useState } from 'react';
import './RightClickEffect.css';

interface ClickRipple {
    id: number;
    x: number;
    y: number;
}

let rippleId = 0;

export function RightClickEffect() {
    const [ripples, setRipples] = useState<ClickRipple[]>([]);

    const handleContextMenu = useCallback((e: MouseEvent) => {
        e.preventDefault();
        const id = ++rippleId;
        setRipples(prev => [...prev, { id, x: e.clientX, y: e.clientY }]);
        setTimeout(() => {
            setRipples(prev => prev.filter(r => r.id !== id));
        }, 600);
    }, []);

    useEffect(() => {
        window.addEventListener('contextmenu', handleContextMenu);
        return () => window.removeEventListener('contextmenu', handleContextMenu);
    }, [handleContextMenu]);

    return (
        <div className="right-click-effect-layer">
            {ripples.map(r => (
                <div
                    key={r.id}
                    className="lol-click-ripple"
                    style={{ left: r.x, top: r.y }}
                >
                    <div className="lol-click-ring" />
                    <div className="lol-click-arrow" />
                </div>
            ))}
        </div>
    );
}
