export type MemeCategory = 'correct' | 'incorrect';

export interface MemeItem {
    id: string;
    text: string;
    emoji: string;
    imageUrl?: string;
    category: MemeCategory;
    insight?: string;
    isActive: boolean;
}

export interface MemeFeedbackProps {
    isCorrect: boolean;
}
