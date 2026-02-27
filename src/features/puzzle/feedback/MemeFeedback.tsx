import React, { useState, useEffect } from 'react';
import { MemeFeedbackProps, MemeItem } from './meme.types';
import { getRandomMeme } from './memeFeedback.data';
import { fetchMemesByCategory } from './memeService';
import './MemeFeedback.css';

export const MemeFeedback: React.FC<MemeFeedbackProps> = ({
    isCorrect,
}) => {
    const [meme, setMeme] = useState<MemeItem | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const category = isCorrect ? 'correct' : 'incorrect';

        (async () => {
            try {
                const dbMemes = await fetchMemesByCategory(category);
                if (!cancelled) {
                    setMeme(getRandomMeme(category, dbMemes));
                }
            } catch {
                if (!cancelled) {
                    setMeme(getRandomMeme(category));
                }
            }
        })();

        return () => { cancelled = true; };
    }, [isCorrect]);

    useEffect(() => {
        if (meme) {
            const timer = setTimeout(() => setIsVisible(true), 50);
            return () => clearTimeout(timer);
        }
    }, [meme]);

    if (!meme) return null;

    return (
        <div className={`meme-feedback ${isCorrect ? 'meme-correct' : 'meme-incorrect'} ${isVisible ? 'meme-visible' : ''}`}>
            <div className={`meme-content ${meme.imageUrl ? 'has-image' : ''}`}>
                {meme.imageUrl && (
                    <div className="meme-image-wrapper">
                        <img
                            src={meme.imageUrl}
                            alt={meme.text}
                            className="meme-image"
                            loading="eager"
                        />
                    </div>
                )}
                <div className="meme-body">
                    <div className="meme-text-section">
                        <span className="meme-emoji">{meme.emoji}</span>
                        <span className="meme-text">{meme.text}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
