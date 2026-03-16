import React, { useState, useRef, useEffect } from 'react';
import type { VisianGameContext } from '../visianCoach.types';
import { useVisianChat } from '../hooks/useVisianChat';
import { VisianMessage } from './VisianMessage';
import './VisianChatPanel.css';

interface VisianChatPanelProps {
    gameContext: VisianGameContext | null;
    onClose: () => void;
}

export const VisianChatPanel: React.FC<VisianChatPanelProps> = ({ gameContext, onClose }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Pro supporter — currently all users are pro (proSupporterService.isProSupporter returns true)
    const isProSupporter = true;

    const {
        messages,
        isLoading,
        sendMessage,
        clearChat,
        getRemainingQuestions,
        isRateLimited,
    } = useVisianChat(gameContext, isProSupporter);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        sendMessage(input);
        setInput('');
    };

    const remaining = getRemainingQuestions();
    const limited = isRateLimited();

    return (
        <div className="visian-panel">
            <div className="visian-panel__header">
                <div className="visian-panel__title">
                    <span className="visian-panel__title-name">Visian</span>
                    <span className="visian-panel__title-sub">TFT Coach</span>
                </div>
                <div className="visian-panel__header-actions">
                    <button className="visian-panel__clear" onClick={clearChat} title="Xóa chat">
                        <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
                            <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                    <button className="visian-panel__close" onClick={onClose} title="Đóng">
                        <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="visian-panel__messages">
                {messages.map(msg => (
                    <VisianMessage key={msg.id} message={msg} />
                ))}
                {isLoading && (
                    <div className="visian-panel__typing">
                        <span className="visian-panel__typing-dot" />
                        <span className="visian-panel__typing-dot" />
                        <span className="visian-panel__typing-dot" />
                        <span className="visian-panel__typing-text">Visian đang suy nghĩ...</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {limited && (
                <div className="visian-panel__limit-warning">
                    Bạn đã hết lượt hỏi trong giờ này. Thử lại sau nhé!
                </div>
            )}

            <form className="visian-panel__input-area" onSubmit={handleSubmit}>
                <input
                    ref={inputRef}
                    className="visian-panel__input"
                    type="text"
                    placeholder={limited ? 'Hết lượt hỏi...' : 'Hỏi về meta, comp, augment...'}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    disabled={limited || isLoading}
                    maxLength={500}
                />
                <button
                    className="visian-panel__send"
                    type="submit"
                    disabled={!input.trim() || isLoading || limited}
                    title="Gửi"
                >
                    <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </form>

            {!isProSupporter && !limited && remaining < Infinity && (
                <div className="visian-panel__remaining">
                    Còn {remaining} lượt hỏi trong giờ này
                </div>
            )}
        </div>
    );
};
