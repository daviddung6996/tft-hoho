
import { useState, useEffect, useCallback } from 'react';
import { useTCoin } from '../hooks/useTCoin';
import { TCoinIcon } from './TCoinIcon';
import { tcoinEvents, TCoinEvent } from '../tcoinEvents';
import './TCoinBalance.css';

export function TCoinBalance() {
    const { balance, refresh } = useTCoin();
    const [isEarning, setIsEarning] = useState(false);
    const [displayBalance, setDisplayBalance] = useState(balance);

    // Sync display balance with actual balance
    useEffect(() => {
        setDisplayBalance(balance);
    }, [balance]);

    // Listen for earn events → pulse animation + refresh balance
    const handleEarn = useCallback((event: TCoinEvent) => {
        setIsEarning(true);

        // Animate the number counting up
        const startBalance = displayBalance;
        const targetBalance = startBalance + event.amount;
        const duration = 600;
        const startTime = Date.now();

        const tick = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayBalance(Math.round(startBalance + (targetBalance - startBalance) * eased));

            if (progress < 1) {
                requestAnimationFrame(tick);
            } else {
                // Refresh actual balance from DB
                refresh();
            }
        };
        requestAnimationFrame(tick);

        // Remove pulse class after animation
        setTimeout(() => setIsEarning(false), 800);
    }, [displayBalance, refresh]);

    useEffect(() => {
        const unsubscribe = tcoinEvents.on(handleEarn);
        return unsubscribe;
    }, [handleEarn]);

    // Only show loading state on initial load when balance is entirely unknown
    if (displayBalance === undefined || displayBalance === null) {
        return (
            <div className="tcoin-balance tcoin-balance--loading">
                <TCoinIcon size={22} />
                <span className="tcoin-amount">--</span>
            </div>
        );
    }

    return (
        <div className={`tcoin-balance ${isEarning ? 'tcoin-balance--earning tcoin-balance--glow' : ''}`}>
            <TCoinIcon size={22} />
            <span className="tcoin-amount">{displayBalance.toLocaleString()}</span>
        </div>
    );
}
