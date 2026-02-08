import { supabase } from '../lib/supabase';
import { CommunityVotes } from '../data/puzzleScenarios';

const SESSION_KEY = 'tft_vote_session_id';

function getSessionId(): string {
    let sessionId = localStorage.getItem(SESSION_KEY);
    if (!sessionId) {
        sessionId = crypto.randomUUID();
        localStorage.setItem(SESSION_KEY, sessionId);
    }
    return sessionId;
}

export const voteService = {
    /**
     * Record a vote for an augment choice (works for guests and authenticated users)
     */
    async recordVote(puzzleId: string, augmentId: string, augmentName: string): Promise<void> {
        const sessionId = getSessionId();

        const { error } = await supabase
            .from('puzzle_votes')
            .upsert({
                puzzle_id: puzzleId,
                augment_id: augmentId,
                augment_name: augmentName,
                session_id: sessionId,
            }, { onConflict: 'puzzle_id, session_id' });

        if (error) {
            console.error('Error recording vote:', error);
        }
    },

    /**
     * Get aggregated community votes for a puzzle
     * Returns { [augmentName]: voteCount }
     */
    async getVotes(puzzleId: string): Promise<CommunityVotes> {
        const { data, error } = await supabase
            .from('puzzle_votes')
            .select('augment_name')
            .eq('puzzle_id', puzzleId);

        if (error || !data) {
            console.error('Error fetching votes:', error);
            return {};
        }

        const votes: CommunityVotes = {};
        for (const row of data) {
            votes[row.augment_name] = (votes[row.augment_name] || 0) + 1;
        }
        return votes;
    },
};
