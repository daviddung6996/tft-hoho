export const BOARD_CONFIG = {
    ROWS: 4,
    COLS: 7,
    HEX: {
        // Standard hex size from AGENTS.md to fit background slots
        WIDTH: 5.0,  // cqw
        HEIGHT: 5.2, // cqw - Slightly perspective-flattened as per design
        GAP: 0.8,    // cqw - Wider gap as per AGENTS.md
    },
    OPPONENT_HEX: {
        // Slightly smaller to match opponent bench perspective
        WIDTH: 4.6,
        HEIGHT: 4.2,
        GAP: 0.8,
    },
    BENCH: {
        SLOTS: 9,
        // Standard hex dimensions as per AGENTS.md
        WIDTH: 5.0,
        HEIGHT: 5.2,
    },
    OPPONENT_BENCH: {
        SLOTS: 9,
        // Smaller hex to fit inside stone slots
        WIDTH: 4.2,
        HEIGHT: 3.8,
    }
};
