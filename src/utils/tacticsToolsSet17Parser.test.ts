import { describe, expect, it } from 'vitest';
import {
    buildSet17ChampionArtifactFromTacticsToolsHtml,
    parseChampionCardsFromTacticsToolsHtml,
    sanitizeSet17AbilityDescription,
} from './tacticsToolsSet17Parser';

const sampleChampionHtml = `
    <div class="champion-card">
        <img src="https://ap.tft.tools/img/new17/face_full_ultrawide/TFT17_Ryze.jpg" alt="Ryze" />
        <div class="font-semibold">Ryze</div>
        <div><span>4</span><img alt="gold" src="/gold.png" /></div>
        <div>
            <img src="https://ap.tft.tools/static/trait-icons/new17_tft17_nova_w.svg" />
            <div>N.O.V.A.</div>
            <img src="https://ap.tft.tools/static/trait-icons/new17_tft17_nova_w.svg" />
            <div>N.O.V.A.</div>
            <img src="https://ap.tft.tools/static/trait-icons/new17_tft17_sorcerer_w.svg" />
            <div>Sorcerer</div>
        </div>
        <div>
            <img title="Range" src="/range.png" />
            <div>4</div>
        </div>
        <div>
            <img src="https://ap.tft.tools/img/new17/ability/TFT17_Ryze.png" />
            <div>Rune Prison 15/75</div>
        </div>
        <div>
            Ryze deals 320/480/1500 magic damage to the current target.
        </div>
    </div>
`;

const secondChampionHtml = `
    <div class="champion-card">
        <img src="https://ap.tft.tools/img/new17/face_full_ultrawide/TFT17_Samira.jpg" alt="Samira" />
        <div class="font-semibold">Samira</div>
        <div><span>5</span><img alt="gold" src="/gold.png" /></div>
        <div>
            <img src="https://ap.tft.tools/static/trait-icons/new17_tft17_streetdemon_w.svg" />
            <div>Street Demon</div>
        </div>
        <div>
            <img title="Range" src="/range.png" />
            <div>4</div>
        </div>
        <div>
            <img src="https://ap.tft.tools/img/new17/ability/TFT17_Samira.png" />
            <div>Trigger Happy 20/100</div>
        </div>
        <div>
            Samira fires in a line for 200/300/900 physical damage.
        </div>
    </div>
`;

const livePageChampionSnippet = `
<div class=" rounded text-white1 w-[291px] flex flex-col bg-bg"><div class="relative rounded-[6px] border-[3px] border-primary-6"><div class="relative flex justify-between p-[9px] bg-bg text-[18px] font-montserrat font-semibold rounded-[3px] css-7wiopk">Aatrox<div class="flex items-end text-[16px]">1<img class="ml-[2px] pb-[1px]" alt="gold" height="13" src="https://cdn.tft.tools/general/gold.png?width=13" width="13"/></div></div><img class="mt-[-3px] z-[-1] aspect-[9/4] object-cover css-hzvj2z" alt="Aatrox" src="https://ap.tft.tools/img/new17/face_full_ultrawide/TFT17_Aatrox.jpg?w=290" width="290"/><div class="absolute text-lg leading-snug bottom-[6px] left-[6px]"><div class="flex items-center sm:pt-1 font-montserrat font-bold text-[15px]"><img alt="N.O.V.A. 0" class="aspect-square  w-[21px]" src="https://ap.tft.tools/static/trait-icons/new17_tft17_nova_w.svg" opacity="0.87"/><div class="pl-1 css-1fxzlo3">N.O.V.A.</div></div><div class="flex items-center sm:pt-1 font-montserrat font-bold text-[15px]"><img alt="Bastion 0" class="aspect-square  w-[21px]" src="https://ap.tft.tools/static/trait-icons/new17_tft17_bastion_w.svg" opacity="0.87"/><div class="pl-1 css-1fxzlo3">Bastion</div></div></div></div><div class="p-3 flex flex-col text-sm"><div class="flex items-center justify-between mb-2"><div class="bg-bg2 rounded-lg px-2 py-1 font-montserrat font-medium self-start">Attack Tank</div><div class="flex items-center gap-[2px]"><div class="flex-shrink-0"><img title="Range" alt="Range" height="14" src="https://cdn.tft.tools/general/range.png" width="14"/></div><div class="pl-1 font-montserrat text-lg font-medium text-white1 break-all">1</div></div></div><div class="flex items-center mt-1 mb-2"><img class="rounded flex-shrink-0 w-[22px] h-[22px]" height="22" src="https://ap.tft.tools/img/new17/ability/TFT17_Aatrox.png?w=22" width="22"/><div class="flex items-center pl-2 leading-none"><div class="font-medium text-sm">Stellar Slash</div><div class="flex items-center pt-[2px] h-[18px] text-sm pl-2"><div class="mt-[-1px] mr-[2px] w-[14px] h-[14px]"><img alt="Mana" height="14" src="https://cdn.tft.tools/general/mana.png" width="14"/></div><div class="pt-[1px]">30/90</div></div></div></div><div class="leading-tight "><span class=""><span>Heal </span></span><span class=""><span class="text-green-9"><span class=""><span>HealAP (</span></span><span class=""><img class="inline-block mt-[-2px]" alt="Ability power" width="14" height="14" src="https://ap.tft.tools/img/general/ap.png?w=14"/></span><span class=""><span>)</span></span></span></span><span class=""><span>, then deal </span></span><span class=""><span class="text-tomato-11"><span class=""><span>DamageAD + DamagePercentArmor (</span></span><span class=""><img class="inline-block mt-[-2px]" alt="Attack damage" width="14" height="14" src="https://ap.tft.tools/img/general/ad.png?w=14"/></span><span class=""><span> </span></span><span class=""><img class="inline-block mt-[-2px]" alt="Armor" width="14" height="14" src="https://ap.tft.tools/img/general/armor.png?w=14"/></span><span class=""><span>) physical damage to the current target.</span></span></span></span></div></div></div>
`;

const livePageSecondChampionSnippet = `
<div class=" rounded text-white1 w-[291px] flex flex-col bg-bg"><div class="relative rounded-[6px] border-[3px] border-primary-6"><div class="relative flex justify-between p-[9px] bg-bg text-[18px] font-montserrat font-semibold rounded-[3px] css-7wiopk">Briar<div class="flex items-end text-[16px]">1<img class="ml-[2px] pb-[1px]" alt="gold" height="13" src="https://cdn.tft.tools/general/gold.png?width=13" width="13"/></div></div><img class="mt-[-3px] z-[-1] aspect-[9/4] object-cover css-hzvj2z" alt="Briar" src="https://ap.tft.tools/img/new17/face_full_ultrawide/TFT17_Briar.jpg?w=290" width="290"/><div class="absolute text-lg leading-snug bottom-[6px] left-[6px]"><div class="flex items-center sm:pt-1 font-montserrat font-bold text-[15px]"><img alt="Anima 0" class="aspect-square  w-[21px]" src="https://ap.tft.tools/static/trait-icons/new17_tft17_anima_w.svg" opacity="0.87"/><div class="pl-1 css-1fxzlo3">Anima</div></div><div class="flex items-center sm:pt-1 font-montserrat font-bold text-[15px]"><img alt="Primordian 0" class="aspect-square  w-[21px]" src="https://ap.tft.tools/static/trait-icons/new17_tft17_primordian_w.svg" opacity="0.87"/><div class="pl-1 css-1fxzlo3">Primordian</div></div><div class="flex items-center sm:pt-1 font-montserrat font-bold text-[15px]"><img alt="Rogue 0" class="aspect-square  w-[21px]" src="https://ap.tft.tools/static/trait-icons/new17_tft17_rogue_w.svg" opacity="0.87"/><div class="pl-1 css-1fxzlo3">Rogue</div></div></div></div><div class="p-3 flex flex-col text-sm"><div class="flex items-center justify-between mb-2"><div class="bg-bg2 rounded-lg px-2 py-1 font-montserrat font-medium self-start">Attack Fighter</div><div class="flex items-center gap-[2px]"><div class="flex-shrink-0"><img title="Range" alt="Range" height="14" src="https://cdn.tft.tools/general/range.png" width="14"/></div><div class="pl-1 font-montserrat text-lg font-medium text-white1 break-all">1</div></div></div><div class="flex items-center mt-1 mb-2"><img class="rounded flex-shrink-0 w-[22px] h-[22px]" height="22" src="https://ap.tft.tools/img/new17/ability/TFT17_Briar.png?w=22" width="22"/><div class="flex items-center pl-2 leading-none"><div class="font-medium text-sm">Fish Frenzy</div><div class="flex items-center pt-[2px] h-[18px] text-sm pl-2"><div class="mt-[-1px] mr-[2px] w-[14px] h-[14px]"><img alt="Mana" height="14" src="https://cdn.tft.tools/general/mana.png" width="14"/></div><div class="pt-[1px]">0/40</div></div></div></div><div class="leading-tight "><span class=""><span>Passive: For every </span></span><span class=""><span class="text-yellow-9"><span class=""><span>PassiveAttacks</span></span></span></span><span class=""><span> attacks, leap to the target with the lowest Health, dealing </span></span><span class=""><span class="text-tomato-11"><span class=""><span>PassiveDamage (</span></span><span class=""><img class="inline-block mt-[-2px]" alt="Attack damage" width="14" height="14" src="https://ap.tft.tools/img/general/ad.png?w=14"/></span><span class=""><span>) physical damage in a 1-hex area. Heal for </span></span><span class=""><span class="text-green-9"><span class=""><span>PassiveHeal (</span></span><span class=""><img class="inline-block mt-[-2px]" alt="Attack damage" width="14" height="14" src="https://ap.tft.tools/img/general/ad.png?w=14"/></span><span class=""><span>) of damage dealt. </span></span></span></span></div></div></div>
`;

describe('parseChampionCardsFromTacticsToolsHtml', () => {
    it('extracts normalized Set 17 champion rows from tactics.tools card markup', () => {
        expect(parseChampionCardsFromTacticsToolsHtml(sampleChampionHtml)).toEqual([
            {
                id: 'TFT17_Ryze',
                name: 'Ryze',
                cost: 4,
                traits: ['N.O.V.A.', 'Sorcerer'],
                avatar: 'https://ap.tft.tools/img/new17/face/tft17_ryze.jpg',
                stats: {
                    hp: null,
                    ad: null,
                    as: null,
                    armor: null,
                    mr: null,
                    mana: { min: 15, max: 75 },
                    range: 4,
                    dps: null,
                },
                ability_name: null,
                ability_name_en: 'Rune Prison',
                ability_description: 'Ryze deals 320/480/1500 magic damage to the current target.',
                ability: {
                    name: 'Rune Prison',
                    desc: 'Ryze deals 320/480/1500 magic damage to the current target.',
                    icon: 'https://ap.tft.tools/img/new17/ability/TFT17_Ryze.png',
                    variables: [],
                },
                ability_variables: [],
                deleted_at: null,
            },
        ]);
    });

    it('builds the nested Set 17 champion artifact shape for later seeding', () => {
        expect(buildSet17ChampionArtifactFromTacticsToolsHtml(sampleChampionHtml)).toEqual({
            champions: [
                {
                    apiName: 'TFT17_Ryze',
                    characterName: 'TFT17_Ryze',
                    name: 'Ryze',
                    cost: 4,
                    traits: ['N.O.V.A.', 'Sorcerer'],
                    icon: 'https://ap.tft.tools/img/new17/face/tft17_ryze.jpg',
                    tileIcon: 'https://ap.tft.tools/img/new17/face/tft17_ryze.jpg',
                    squareIcon: 'https://ap.tft.tools/img/new17/face/tft17_ryze.jpg',
                    stats: {
                        hp: null,
                        ad: null,
                        as: null,
                        armor: null,
                        mr: null,
                        mana: { min: 15, max: 75 },
                        range: 4,
                        dps: null,
                    },
                    ability: {
                        name: 'Rune Prison',
                        desc: 'Ryze deals 320/480/1500 magic damage to the current target.',
                        icon: 'https://ap.tft.tools/img/new17/ability/TFT17_Ryze.png',
                        variables: [],
                    },
                },
            ],
        });
    });

    it('extracts multiple champion cards from a larger page fragment', () => {
        const pageHtml = `<section><h2>Set 17</h2>${sampleChampionHtml}${secondChampionHtml}</section>`;

        expect(parseChampionCardsFromTacticsToolsHtml(pageHtml).map(champion => champion.id)).toEqual([
            'TFT17_Ryze',
            'TFT17_Samira',
        ]);
    });

    it('parses live tactics.tools page structure for champion cards', () => {
        const pageHtml = `<section><h2>Units</h2><div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">${livePageChampionSnippet}${livePageSecondChampionSnippet}</div></section>`;

        expect(parseChampionCardsFromTacticsToolsHtml(pageHtml)).toEqual([
            {
                id: 'TFT17_Aatrox',
                name: 'Aatrox',
                cost: 1,
                traits: ['N.O.V.A.', 'Bastion'],
                avatar: 'https://ap.tft.tools/img/new17/face/tft17_aatrox.jpg',
                stats: {
                    hp: null,
                    ad: null,
                    as: null,
                    armor: null,
                    mr: null,
                    mana: { min: 30, max: 90 },
                    range: 1,
                    dps: null,
                },
                ability_name: null,
                ability_name_en: 'Stellar Slash',
                ability_description: 'Heal HealAP (), then deal DamageAD + DamagePercentArmor () physical damage to the current target.',
                ability: {
                    name: 'Stellar Slash',
                    desc: 'Heal HealAP (), then deal DamageAD + DamagePercentArmor () physical damage to the current target.',
                    icon: 'https://ap.tft.tools/img/new17/ability/TFT17_Aatrox.png',
                    variables: [],
                },
                ability_variables: [],
                deleted_at: null,
            },
            {
                id: 'TFT17_Briar',
                name: 'Briar',
                cost: 1,
                traits: ['Anima', 'Primordian', 'Rogue'],
                avatar: 'https://ap.tft.tools/img/new17/face/tft17_briar.jpg',
                stats: {
                    hp: null,
                    ad: null,
                    as: null,
                    armor: null,
                    mr: null,
                    mana: { min: 0, max: 40 },
                    range: 1,
                    dps: null,
                },
                ability_name: null,
                ability_name_en: 'Fish Frenzy',
                ability_description: 'Passive: For every PassiveAttacks attacks, leap to the target with the lowest Health, dealing PassiveDamage () physical damage in a 1-hex area. Heal for PassiveHeal () of damage dealt.',
                ability: {
                    name: 'Fish Frenzy',
                    desc: 'Passive: For every PassiveAttacks attacks, leap to the target with the lowest Health, dealing PassiveDamage () physical damage in a 1-hex area. Heal for PassiveHeal () of damage dealt.',
                    icon: 'https://ap.tft.tools/img/new17/ability/TFT17_Briar.png',
                    variables: [],
                },
                ability_variables: [],
                deleted_at: null,
            },
        ]);
    });

    it('drops trailing page chrome tokens from live ability descriptions', () => {
        expect(
            sanitizeSet17AbilityDescription(
                'Heal HealAP (), then deal DamageAD + DamagePercentArmor () physical damage to the current target. Ability Traits',
            ),
        ).toBe('Heal HealAP (), then deal DamageAD + DamagePercentArmor () physical damage to the current target.');
    });

    it('decodes HTML entities from tactics.tools markup before building the artifact', () => {
        const html = `
            <div class="champion-card">
                <img src="https://ap.tft.tools/img/new17/face_full_ultrawide/TFT17_RekSai.jpg" alt="Rek&#x27;Sai" />
                <div class="font-semibold">Rek&#x27;Sai</div>
                <div><span>1</span><img alt="gold" src="/gold.png" /></div>
                <div>
                    <img src="https://ap.tft.tools/static/trait-icons/new17_tft17_bastion_w.svg" />
                    <div>Bastion</div>
                </div>
                <div>
                    <img title="Range" src="/range.png" />
                    <div>1</div>
                </div>
                <div>
                    <img src="https://ap.tft.tools/img/new17/ability/TFT17_RekSai.png" />
                    <div>Tunnel Bite 30/80</div>
                </div>
                <div>
                    Rek&#x27;Sai deals 320/480/720 physical damage if they&#x27;re in range.
                </div>
            </div>
        `;

        const [champion] = parseChampionCardsFromTacticsToolsHtml(html);
        expect(champion.name).toBe("Rek'Sai");
        expect(champion.ability_description).toBe("Rek'Sai deals 320/480/720 physical damage if they're in range.");
    });
});








































