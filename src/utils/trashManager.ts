// Trash Manager - Local Storage based Recycle Bin
// Stores deleted items with metadata for restoration

interface TrashItem {
    id: string;
    type: 'champions' | 'traits' | 'items' | 'augments' | 'puzzles';
    data: any;
    deletedAt: string;
    deletedBy?: string;
}

const TRASH_STORAGE_KEY = 'tft_admin_trash';

export class TrashManager {
    static getAll(): TrashItem[] {
        try {
            const stored = localStorage.getItem(TRASH_STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Failed to load trash:', error);
            return [];
        }
    }

    static add(type: TrashItem['type'], items: any[]): void {
        const trash = this.getAll();
        const newItems: TrashItem[] = items.map(item => ({
            id: `${type}_${item.id}_${Date.now()}`,
            type,
            data: item,
            deletedAt: new Date().toISOString()
        }));

        const updated = [...trash, ...newItems];
        localStorage.setItem(TRASH_STORAGE_KEY, JSON.stringify(updated));
    }

    static remove(trashIds: string[]): void {
        const trash = this.getAll();
        const filtered = trash.filter(item => !trashIds.includes(item.id));
        localStorage.setItem(TRASH_STORAGE_KEY, JSON.stringify(filtered));
    }

    static getByType(type: TrashItem['type']): TrashItem[] {
        return this.getAll().filter(item => item.type === type);
    }

    static empty(): void {
        localStorage.removeItem(TRASH_STORAGE_KEY);
    }

    static emptyByType(type: TrashItem['type']): void {
        const trash = this.getAll();
        const filtered = trash.filter(item => item.type !== type);
        localStorage.setItem(TRASH_STORAGE_KEY, JSON.stringify(filtered));
    }

    // Auto-cleanup items older than 30 days
    static cleanup(daysToKeep: number = 30): number {
        const trash = this.getAll();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

        const kept = trash.filter(item => {
            const deletedDate = new Date(item.deletedAt);
            return deletedDate > cutoffDate;
        });

        const removedCount = trash.length - kept.length;
        localStorage.setItem(TRASH_STORAGE_KEY, JSON.stringify(kept));
        return removedCount;
    }
}

export type { TrashItem };
