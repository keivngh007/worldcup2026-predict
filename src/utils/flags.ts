/**
 * 国旗资源映射
 * 使用 flagcdn.com 提供的免费国旗图片，跨平台渲染一致
 * 格式: https://flagcdn.com/w80/{isoCode}.png (80px宽)
 *        https://flagcdn.com/w40/{isoCode}.png (40px宽, 2x retina)
 */

// teamId → ISO 3166-1 alpha-2 国家代码映射
const TEAM_TO_ISO: Record<string, string> = {
  mex: 'mx',   // 墨西哥
  kor: 'kr',   // 韩国
  cze: 'cz',   // 捷克
  rsa: 'za',   // 南非
  sui: 'ch',   // 瑞士
  can: 'ca',   // 加拿大
  bih: 'ba',   // 波黑
  qat: 'qa',   // 卡塔尔
  bra: 'br',   // 巴西
  mar: 'ma',   // 摩洛哥
  sco: 'gb-sct', // 苏格兰
  hai: 'ht',   // 海地
  tur: 'tr',   // 土耳其
  usa: 'us',   // 美国
  par: 'py',   // 巴拉圭
  aus: 'au',   // 澳大利亚
  ger: 'de',   // 德国
  ecu: 'ec',   // 厄瓜多尔
  civ: 'ci',   // 科特迪瓦
  cur: 'cw',   // 库拉索
  ned: 'nl',   // 荷兰
  jpn: 'jp',   // 日本
  swe: 'se',   // 瑞典
  tun: 'tn',   // 突尼斯
  bel: 'be',   // 比利时
  egy: 'eg',   // 埃及
  irn: 'ir',   // 伊朗
  nzl: 'nz',   // 新西兰
  esp: 'es',   // 西班牙
  cpv: 'cv',   // 佛得角
  ksa: 'sa',   // 沙特阿拉伯
  uru: 'uy',   // 乌拉圭
  fra: 'fr',   // 法国
  sen: 'sn',   // 塞内加尔
  irq: 'iq',   // 伊拉克
  nor: 'no',   // 挪威
  arg: 'ar',   // 阿根廷
  alg: 'dz',   // 阿尔及利亚
  aut: 'at',   // 奥地利
  jor: 'jo',   // 约旦
  por: 'pt',   // 葡萄牙
  cod: 'cd',   // 民主刚果
  uzb: 'uz',   // 乌兹别克斯坦
  col: 'co',   // 哥伦比亚
  eng: 'gb-eng', // 英格兰
  cro: 'hr',   // 克罗地亚
  gha: 'gh',   // 加纳
  pan: 'pa',   // 巴拿马
};

// 备选: 对于没有标准ISO码的地区(苏格兰/英格兰), 保留emoji作为fallback
const EMOJI_FALLBACK: Record<string, string> = {
  sco: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  eng: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
};

export type FlagSize = 'sm' | 'md' | 'lg';

const SIZE_MAP: Record<FlagSize, number> = {
  sm: 40,
  md: 60,
  lg: 80,
};

/**
 * 获取国旗图片URL
 * @param teamId 球队ID
 * @param size 尺寸
 * @returns flagcdn.com URL
 */
export function getFlagUrl(teamId: string, size: FlagSize = 'sm'): string {
  const iso = TEAM_TO_ISO[teamId];
  if (!iso) return '';
  const width = SIZE_MAP[size];
  return `https://flagcdn.com/w${width}/${iso}.png`;
}

/**
 * 获取国旗emoji (fallback)
 */
export function getFlagEmoji(teamId: string): string {
  return EMOJI_FALLBACK[teamId] || '';
}

/**
 * 判断球队是否使用subdivision国旗 (如苏格兰、英格兰)
 */
export function isSubdivisionFlag(teamId: string): boolean {
  return teamId in EMOJI_FALLBACK;
}
