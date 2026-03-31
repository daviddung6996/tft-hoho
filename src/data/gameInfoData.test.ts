import { describe, expect, it } from 'vitest';
import { IONIA_PATHS, VOID_MODS } from './gameInfoData';

describe('gameInfoData', () => {
  it('uses Set 17 themed featured paths instead of Set 16 Ionia names', () => {
    expect(IONIA_PATHS.map(path => path.name)).not.toContain('Path of Blades');
    expect(IONIA_PATHS.map(path => path.nameVi)).not.toContain('Đạo Kiếm');
  });

  it('uses Set 17 themed featured mods instead of Set 16 Void mods', () => {
    expect(VOID_MODS.map(mod => mod.name)).not.toContain('Royal Protection');
    expect(VOID_MODS.map(mod => mod.nameVi)).not.toContain('Bảo Hộ Hoàng Gia');
  });
});
