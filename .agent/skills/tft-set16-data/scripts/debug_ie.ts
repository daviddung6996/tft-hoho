import fetch from 'node-fetch';

const CDRAGON_URL = "https://raw.communitydragon.org/latest/cdragon/tft/en_us.json";

async function checkInfinityEdge() {
    console.log('Fetching...');
    const response = await fetch(CDRAGON_URL);
    const data = await response.json() as any;
    const items = data.items;

    const ie = items.find((i: any) => i.name === "Infinity Edge");
    console.log(JSON.stringify(ie, null, 2));
}

checkInfinityEdge().catch(console.error);
