import { useMemo } from 'react';
import { FlexCardCanvasRemotion } from '../../../remotion/FlexCard/FlexCardCanvasRemotion';
import { FlexCardCyberRemotion } from '../../../remotion/FlexCard/FlexCardCyberRemotion';
import { FlexCardChampionRemotion } from '../../../remotion/FlexCard/FlexCardChampionRemotion';

const templates = [
    FlexCardCanvasRemotion,
    FlexCardCyberRemotion,
    FlexCardChampionRemotion,
];

export function useRandomFlexCardTemplate() {
    return useMemo(
        () => templates[Math.floor(Math.random() * templates.length)],
        [],
    );
}
