import React, { useState } from 'react';
import type { VisianMessage as VisianMessageType } from '../visianCoach.types';
import './VisianMessage.css';

interface VisianMessageProps {
    message: VisianMessageType;
}

export const VisianMessage: React.FC<VisianMessageProps> = ({ message }) => {
    const [showContext, setShowContext] = useState(false);
    const isUser = message.role === 'user';

    return (
        <div className={`visian-msg ${isUser ? 'visian-msg--user' : 'visian-msg--visian'}`}>
            <div className="visian-msg__bubble">
                <div className="visian-msg__content">{message.content}</div>
                {message.gameContext && (
                    <button
                        className="visian-msg__context-toggle"
                        onClick={() => setShowContext(v => !v)}
                    >
                        {showContext ? 'Ẩn context' : 'Xem game context'}
                    </button>
                )}
                {showContext && message.gameContext && (
                    <div className="visian-msg__context">
                        <div>Stage: {message.gameContext.stage}</div>
                        <div>Gold: {message.gameContext.gold} | Lv: {message.gameContext.level} | HP: {message.gameContext.hp}</div>
                        {message.gameContext.augments.length > 0 && (
                            <div>Augments: {message.gameContext.augments.join(', ')}</div>
                        )}
                        {message.gameContext.synergies.length > 0 && (
                            <div>Synergies: {message.gameContext.synergies.join(', ')}</div>
                        )}
                        {message.gameContext.boardChampions.length > 0 && (
                            <div>Board: {message.gameContext.boardChampions.join(', ')}</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
