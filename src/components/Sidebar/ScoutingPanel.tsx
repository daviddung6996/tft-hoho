import React from 'react';
import './ScoutingPanel.css';
import { PlayerData } from '../../data/mockPlayers';

export const ScoutingPanel: React.FC<{
    activePlayerId: string;
    players: PlayerData[];
    onPlayerSelect: (id: string) => void;
}> = ({ activePlayerId, players, onPlayerSelect }) => {

    return (
        <div className="scouting-panel-container">
            {players.map((player) => {
                const isScouting = activePlayerId === player.id;

                return (
                    <div
                        key={player.id}
                        className={`player-row ${player.isMe ? 'is-me' : ''} ${player.status === 'eliminated' ? 'eliminated' : ''} ${isScouting ? 'scouting' : ''}`}
                        onClick={() => onPlayerSelect(player.id)}
                    >
                        {/* Info Pill (Text) - Tucked under avatar */}
                        {player.isMe ? (
                            <div className="player-pill-border">
                                <div className="player-pill">
                                    <span className="player-name">{player.name}</span>
                                    <span className="player-health">{player.hp}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="player-pill">
                                <span className="player-name">{player.name}</span>
                                <span className="player-health">{player.hp}</span>
                            </div>
                        )}

                        {/* Avatar Wrapper - On top */}
                        <div className="player-avatar-wrapper">
                            <div className="avatar-ring"></div>
                            <img src={player.avatar} alt={player.name} className="player-avatar-img" />

                            {/* Status Icons on the ring */}
                            {player.status !== 'eliminated' && (
                                <>
                                    {player.inCombat && (
                                        <div className="status-icon status-bottom-right">◈</div>
                                    )}
                                    {player.isGhost && (
                                        <div className="status-icon status-top-right">!</div>
                                    )}
                                </>
                            )}
                            {player.status === 'eliminated' && (
                                <div className="status-icon status-bottom-right" style={{ background: 'black' }}>◆</div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
