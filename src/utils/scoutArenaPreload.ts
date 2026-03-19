import { getAllAssetUrls } from './assetUrlBuilder';
import { getLocalUrl } from './localAssetUrl';

type ScoutArenaPlayer = {
    arenaId?: string | null;
};

type ScoutVisualUnit = {
    image?: string | null;
    items?: string[] | null;
};

type ScoutVisualAugment = {
    icon?: string | null;
};

type ScoutVisualPlayer = {
    units?: ScoutVisualUnit[] | null;
    bench?: ScoutVisualUnit[] | null;
    augments?: ScoutVisualAugment[] | null;
};

type BuildScoutArenaPreloadUrlsOptions<TPlayer extends ScoutArenaPlayer> = {
    opponents: TPlayer[];
    activeOpponentIndex: number;
    resolveArenaUrl: (arenaId?: string | null) => string | undefined;
};

export function buildScoutArenaPreloadUrls<TPlayer extends ScoutArenaPlayer>({
    opponents,
    activeOpponentIndex,
    resolveArenaUrl,
}: BuildScoutArenaPreloadUrlsOptions<TPlayer>): string[] {
    if (opponents.length === 0) {
        return [];
    }

    const prioritizedOpponents = [
        activeOpponentIndex >= 0 ? opponents[(activeOpponentIndex + 1) % opponents.length] : opponents[0],
        activeOpponentIndex >= 0 ? opponents[(activeOpponentIndex - 1 + opponents.length) % opponents.length] : opponents[1],
    ].filter((player): player is TPlayer => Boolean(player));

    return Array.from(
        new Set(
            [...prioritizedOpponents, ...opponents]
                .map(player => resolveArenaUrl(player.arenaId))
                .filter((url): url is string => Boolean(url))
        )
    );
}

function getPrimaryItemAssetUrl(itemName?: string | null): string | null {
    if (!itemName) {
        return null;
    }

    const primaryUrl = getAllAssetUrls({ type: 'item', name: itemName })[0];
    return getLocalUrl(primaryUrl);
}

function getUnitVisualUrls(units?: ScoutVisualUnit[] | null): string[] {
    if (!units || units.length === 0) {
        return [];
    }

    return units.flatMap((unit) => [
        unit.image,
        ...(unit.items ?? []).map(getPrimaryItemAssetUrl),
    ]).filter((url): url is string => Boolean(url));
}

export function buildScoutVisualPreloadUrls<TPlayer extends ScoutVisualPlayer>(opponents: TPlayer[]): string[] {
    return Array.from(
        new Set(
            opponents.flatMap((player) => [
                ...getUnitVisualUrls(player.units),
                ...getUnitVisualUrls(player.bench),
                ...(player.augments ?? []).map((augment) => augment.icon).filter((url): url is string => Boolean(url)),
            ])
        )
    );
}
