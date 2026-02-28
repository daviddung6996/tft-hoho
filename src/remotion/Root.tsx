import { Composition } from "remotion";
import { FlexCardChampionRemotion } from "./FlexCard/FlexCardChampionRemotion";
import { FlexCardData } from "../features/share/share.types";

export const RemotionRoot = () => {
    const defaultData = {
        username: "Admin TFT",
        iqScore: 1847,
        iqRank: "Challenger",
        topPercent: 0.3,
        region: "VN",
    } as FlexCardData;

    return (
        <Composition
            id="FlexCardChampion"
            component={FlexCardChampionRemotion}
            durationInFrames={150}
            fps={30}
            width={1080}
            height={1920}
            defaultProps={{ data: defaultData }}
        />
    );
};
