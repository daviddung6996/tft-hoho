import { getItemIconUrl } from './assetUrlBuilder';
import { getLocalUrl } from './localAssetUrl';

type ScoutAssetUnit = {
    image?: string | null;
    items?: string[] | null;
};

type ScoutAssetAugment = {
    icon?: string | null;
};

type ScoutAssetPlayer = {
    units?: ScoutAssetUnit[] | null;
    bench?: ScoutAssetUnit[] | null;
    augments?: ScoutAssetAugment[] | null;
};

export function buildScoutImagePreloadUrls(players: ScoutAssetPlayer[]): string[] {
    return Array.from(
        new Set(
            players.flatMap((player) => {
                const unitUrls = [...(player.units ?? []), ...(player.bench ?? [])]
                    .flatMap((unit) => {
                        const urls = [getLocalUrl(unit.image)];

                        for (const itemName of unit.items ?? []) {
                            urls.push(getLocalUrl(getItemIconUrl(itemName)));
                        }

                        return urls;
                    });

                const augmentUrls = (player.augments ?? [])
                    .map((augment) => getLocalUrl(augment.icon));

                return [...unitUrls, ...augmentUrls];
            })
                .filter((url): url is string => Boolean(url))
        )
    );
}
