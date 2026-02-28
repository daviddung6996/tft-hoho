/**
 * T-Coin Event Bus — lightweight custom event system
 * for broadcasting earn/spend events across components.
 */

export type TCoinEvent = {
    amount: number;
    reason: string;
};

type TCoinListener = (event: TCoinEvent) => void;

const listeners: Set<TCoinListener> = new Set();

export const tcoinEvents = {
    /** Subscribe to T-Coin earn events */
    on(listener: TCoinListener): () => void {
        listeners.add(listener);
        return () => { listeners.delete(listener); };
    },

    /** Emit a T-Coin earn event to all listeners */
    emit(event: TCoinEvent) {
        listeners.forEach(fn => fn(event));
    },
};
