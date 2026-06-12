/**
 * 格式化工具函数
 */

// 格式化概率为百分比
export function formatPercent(value: number, decimals: number = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

// 格式化比赛时间
export function formatMatchTime(datetime: string): string {
  const date = new Date(datetime);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${month}月${day}日 ${hours}:${minutes}`;
}

// 格式化比赛日期（短格式）
export function formatMatchDate(datetime: string): string {
  const date = new Date(datetime);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}/${day}`;
}

// 获取北京时间
export function toBeijingTime(datetime: string): string {
  const date = new Date(datetime);
  // 转换为北京时间 (UTC+8)
  const bjDate = new Date(date.getTime() + (8 - date.getTimezoneOffset() / 60) * 3600000);
  const month = bjDate.getMonth() + 1;
  const day = bjDate.getDate();
  const hours = bjDate.getHours().toString().padStart(2, '0');
  const minutes = bjDate.getMinutes().toString().padStart(2, '0');
  return `${month}月${day}日 ${hours}:${minutes}`;
}

// 格式化进球数
export function formatGoals(goals: number): string {
  return goals.toFixed(1);
}

// 获取阶段中文名
export function getStageName(stage: string): string {
  const map: Record<string, string> = {
    group: '小组赛',
    r32: '1/16决赛',
    r16: '1/8决赛',
    qf: '1/4决赛',
    sf: '半决赛',
    '3rd': '季军赛',
    final: '决赛',
  };
  return map[stage] || stage;
}

// 获取组名
export function getGroupName(groupId: string): string {
  return `${groupId}组`;
}

// 格式化排名
export function formatRank(rank: number): string {
  return `#${rank}`;
}

// 获取近期战绩统计
export function getFormStats(results: Array<'W' | 'D' | 'L'>): { wins: number; draws: number; losses: number } {
  return {
    wins: results.filter(r => r === 'W').length,
    draws: results.filter(r => r === 'D').length,
    losses: results.filter(r => r === 'L').length,
  };
}

// 获取战绩颜色
export function getResultColor(result: 'W' | 'D' | 'L'): string {
  switch (result) {
    case 'W': return 'text-emerald-400';
    case 'D': return 'text-amber-400';
    case 'L': return 'text-red-400';
  }
}

export function getResultBg(result: 'W' | 'D' | 'L'): string {
  switch (result) {
    case 'W': return 'bg-emerald-500/20 text-emerald-400';
    case 'D': return 'bg-amber-500/20 text-amber-400';
    case 'L': return 'bg-red-500/20 text-red-400';
  }
}
