import {
  COACH_NOTEBOOK_IDS,
  buildCoachSourceGroups,
  buildCoachExplainQuery,
  buildCoachSelectQuery,
  resolveCoachId,
  serializeCoachCacheContext,
  serializeCompactGameContext,
} from './prompt.ts';
import { describe, expect, it } from 'vitest';

describe('visian-chat prompt helpers', () => {
  it('uses the strict Pick and Giai thich response contract', () => {
    const query = buildCoachSelectQuery('visian', 'Phan tich augment cho toi.', {
      stage: '3-2',
      comp: 'Bruiser / Sniper',
      gold: 24,
      level: 6,
      hp: 78,
      decisionType: 'augment',
      currentAugments: ['A', 'B', 'C'],
    });

    expect(query).toContain('Tra loi dung 2 dong');
    expect(query).toContain('Pick: <ten lua chon>');
    expect(query).toContain('Giai thich: <2-4 cau');
    expect(query).toContain('khong them next step');
    expect(query).not.toContain('Why:');
    expect(query).not.toContain('When not:');
  });

  it('keeps only compact context fields and truncates augment options', () => {
    const serialized = serializeCompactGameContext({
      stage: '4-2',
      comp: 'Flex',
      gold: 31,
      level: 8,
      hp: 42,
      decisionType: 'augment',
      currentAugments: ['Opt 1', 'Opt 2', 'Opt 3', 'Opt 4'],
      chosenAugments: ['Taken 1', 'Taken 2', 'Taken 3'],
      synergies: ['Trait 1', 'Trait 2', 'Trait 3', 'Trait 4'],
      boardChampions: ['Unit 1', 'Unit 2', 'Unit 3', 'Unit 4', 'Unit 5'],
      items: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'],
      proChoiceLabel: 'Opt 2',
    });

    expect(serialized).not.toContain('\n');
    expect(serialized).toContain('decision=augment');
    expect(serialized).toContain('options=Opt 1, Opt 2, Opt 3');
    expect(serialized).not.toContain('Opt 4');
    expect(serialized).not.toContain('pro_choice=');
    expect(serialized).not.toContain('taken=');
    expect(serialized).not.toContain('traits=');
    expect(serialized).not.toContain('board=');
    expect(serialized).not.toContain('items=');
  });

  it('stays compact and keeps query length down', () => {
    const query = buildCoachSelectQuery('tftiseasy', 'Phan tich tinh huong augment hien tai va chot pick tot nhat.', {
      stage: '2-1',
      comp: 'Open Board',
      gold: 10,
      level: 4,
      hp: 100,
      decisionType: 'augment',
      currentAugments: ['Augment A', 'Augment B', 'Augment C'],
      chosenAugments: [],
      synergies: ['Scrap'],
      boardChampions: ['Powder', 'Violet'],
      items: ['Sword', 'Bow'],
    });

    expect(query.length).toBeLessThan(600);
    expect(query).toContain('Ctx=stage=2-1 | comp=Open Board');
    expect(query).toContain('Q=Phan tich tinh huong augment hien tai va chot pick tot nhat.');
  });

  it('avoids unfamiliar English TFT jargon in the persona instructions', () => {
    const query = buildCoachSelectQuery('buffalow', 'Chot augment tot nhat cho toi.', {
      stage: '3-2',
      comp: 'Bruiser',
      gold: 20,
      level: 6,
      hp: 68,
    });

    expect(query).not.toContain('portfolio');
    expect(query).toContain('Uu tien nuoc on dinh, giu mau, de top 4.');
  });

  it('serializes path choices instead of hidden augment options during intent declaration', () => {
    const query = buildCoachSelectQuery('visian', 'Chot huong augment giup toi.', {
      stage: '3-2',
      comp: 'Sentinel / Sniper',
      gold: 22,
      level: 6,
      hp: 70,
      decisionType: 'path',
      currentDecisionOptions: [
        { title: 'Kinh te' },
        { title: 'Trang bi' },
        { title: 'Danh nhau' },
        { title: 'An' },
      ],
      currentAugments: ['An Bi Mat', 'Jeweled Lotus', 'Portable Forge'],
    });

    expect(query).toContain('Chot huong augment tot nhat');
    expect(query).toContain('decision=path');
    expect(query).toContain('options=Kinh te, Trang bi, Danh nhau, An');
    expect(query).not.toContain('Portable Forge');
  });

  it('serializes plan choices instead of hidden augment options during plan declaration', () => {
    const serialized = serializeCompactGameContext({
      stage: '4-2',
      comp: 'Form Swapper',
      gold: 18,
      level: 8,
      hp: 41,
      decisionType: 'plan',
      currentDecisionOptions: [
        { title: 'Choi top 4' },
        { title: 'Choi top cao' },
        { title: 'Fix item lai cho dep' },
        { title: 'Choi Loto' },
      ],
      currentAugments: ['Augment A', 'Augment B', 'Augment C'],
    });

    expect(serialized).toContain('decision=plan');
    expect(serialized).toContain('options=Choi top 4, Choi top cao, Fix item lai cho dep, Choi Loto');
    expect(serialized).not.toContain('Augment A');
  });

  it('falls back safely and keeps notebook ids mapped', () => {
    expect(resolveCoachId('one_by_one')).toBe('one_by_one');
    expect(resolveCoachId('unknown')).toBe('visian');
    expect(COACH_NOTEBOOK_IDS.visian).toBe('2c208255-a880-48db-924d-f106cd340256');
    expect(COACH_NOTEBOOK_IDS.tftiseasy).toBe('06f9ca46-d3bc-4040-8d57-3afe462a362d');
  });

  it('builds a stable coach cache context independent of whitespace and casing', () => {
    const canonicalA = serializeCoachCacheContext({
      stage: ' 3-2 ',
      comp: 'Bruiser   / Sniper',
      gold: 24,
      level: 6,
      hp: 78,
      decisionType: 'augment',
      currentAugments: [' Hedge Fund ', 'Component Grab Bag', 'JEWELED LOTUS II'],
      proChoiceLabel: ' Component Grab Bag ',
    });
    const canonicalB = serializeCoachCacheContext({
      stage: '3-2',
      comp: 'bruiser / sniper',
      gold: 24,
      level: 6,
      hp: 78,
      decisionType: 'AUGMENT',
      currentAugments: ['hedge fund', ' component   grab bag ', 'jeweled lotus ii'],
      proChoiceLabel: 'component grab bag',
    });

    expect(canonicalA).toBe('stage=3-2|comp=bruiser / sniper|gold=24|level=6|hp=78|decision=augment|options=hedge fund,component grab bag,jeweled lotus ii');
    expect(canonicalB).toBe(canonicalA);
  });

  it('builds an explain-only prompt with authoritative ProPick and no re-pick instructions', () => {
    const query = buildCoachExplainQuery('visian', 'Phan tich tinh huong hien tai.', {
      stage: '2-1',
      comp: 'Bruiser / Sniper',
      gold: 10,
      level: 4,
      hp: 100,
      decisionType: 'augment',
      currentAugments: ['Component Grab Bag', 'Hedge Fund', 'Jeweled Lotus II'],
      proChoiceLabel: 'Component Grab Bag',
    });

    expect(query).toContain('ProPick=Component Grab Bag');
    expect(query).toContain('Khong doi lua chon. Khong neu option khac.');
    expect(query).toContain('Dong 1 bat buoc la Pick: Component Grab Bag.');
    expect(query).toContain('Giai thich: <2-4 cau');
    expect(query).not.toContain('chon augment tot nhat');
  });

  it('builds ordered source-group hints so the bridge can target notebook shards', () => {
    expect(buildCoachSourceGroups('visian', {
      stage: '3-2',
      comp: 'Bruiser / Sniper',
      gold: 24,
      level: 6,
      hp: 78,
      decisionType: 'augment',
      currentAugments: ['A', 'B', 'C'],
    })).toEqual([
      'coach:visian',
      'shared:coach',
      'shared:decision:augment',
      'coach:visian:decision:augment',
      'shared:stage:3-2',
      'coach:visian:stage:3-2',
      'shared:stage-bucket:mid',
      'coach:visian:stage-bucket:mid',
      'shared:comp:bruiser-sniper',
      'coach:visian:comp:bruiser-sniper',
    ]);
  });
});
