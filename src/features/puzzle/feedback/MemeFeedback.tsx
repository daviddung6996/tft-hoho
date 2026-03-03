import React, { useState, useEffect } from 'react';
import { MemeFeedbackProps, MemeItem } from './meme.types';
import { getRandomMeme } from './memeFeedback.data';
import { fetchMemesByCategory } from './memeService';
import './MemeFeedback.css';

export const MemeFeedback: React.FC<MemeFeedbackProps> = ({
    isCorrect,
}) => {
    const [meme, setMeme] = useState<MemeItem | null>(null);
    const [isWrapperVisible, setIsWrapperVisible] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [isHiding, setIsHiding] = useState(false);

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
            // Step 1: trigger grid expand (height 0 → full) immediately
            const wrapperTimer = setTimeout(() => setIsWrapperVisible(true), 30);
            // Step 2: fade in content slightly after expand starts
            const contentTimer = setTimeout(() => setIsVisible(true), 100);
            // Step 3: after 3.5s of being visible, start fade-out
            const hideContentTimer = setTimeout(() => setIsHiding(true), 3600);
            // Step 4: collapse wrapper after content fade (~500ms later)
            const collapseTimer = setTimeout(() => setIsWrapperVisible(false), 4150);
            return () => {
                clearTimeout(wrapperTimer);
                clearTimeout(contentTimer);
                clearTimeout(hideContentTimer);
                clearTimeout(collapseTimer);
            };
        }
    }, [meme]);

    // Always render wrapper (collapsed at 0fr) so expansion is smooth
    return (
        <div className={`meme-feedback-wrapper ${isWrapperVisible ? 'meme-wrapper-visible' : ''}`}>
            <div className="meme-feedback-inner">
                {meme && (
                    <div className={`meme-feedback ${isCorrect ? 'meme-correct' : 'meme-incorrect'} ${isVisible ? 'meme-visible' : ''} ${isHiding ? 'meme-hiding' : ''}`}>
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
                )}
            </div>
        </div>
    );
};
