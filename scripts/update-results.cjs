/**
 * 自动数据更新脚本
 *
 * 数据源优先级:
 * 1. FOOTBALL_DATA_API_KEY 环境变量 → football-data.org API
 * 2. 手动维护的 public/results.json
 *
 * 用法: node scripts/update-results.cjs
 * GitHub Actions 每30分钟自动运行
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const RESULTS_PATH = path.join(__dirname, '..', 'public', 'results.json');
const API_KEY = process.env.FOOTBALL_DATA_API_KEY || '';
const COMPETITION_ID = 'WC'; // World Cup 2026

function fetch(url, headers = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { resolve(data); }
      });
    }).on('error', reject);
  });
}

/**
 * 从 football-data.org 获取比赛结果
 */
async function fetchFromFootballData(dateFrom, dateTo) {
  if (!API_KEY) return null;

  const url = `https://api.football-data.org/v4/competitions/${COMPETITION_ID}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}&status=FINISHED`;

  try {
    const data = await fetch(url, { 'X-Auth-Token': API_KEY });

    if (!data.matches) return null;

    const formatted = {};
    for (const m of data.matches) {
      const id = m.id || `${m.homeTeam.tla}-${m.awayTeam.tla}`;
      formatted[id] = {
        matchId: String(id),
        homeScore: m.score.fullTime.home ?? m.score.winner === 'HOME_TEAM' ? 1 : 0,
        awayScore: m.score.fullTime.away ?? m.score.winner === 'AWAY_TEAM' ? 1 : 0,
        status: 'completed',
        scorers: (m.goals || []).map(g => ({
          name: g.scorer?.name || 'Unknown',
          teamId: g.team?.tla?.toLowerCase() || '',
          minute: g.minute?.regular || g.minute || 0,
          isPenalty: g.type === 'PENALTY',
        })),
        cards: [],
        possession: [50, 50],
        shots: [0, 0],
        corners: [0, 0],
        externalId: String(id),
      };
    }
    return formatted;
  } catch (e) {
    console.error('API fetch error:', e.message);
    return null;
  }
}

/**
 * 合并新旧数据
 */
function mergeResults(existing, newResults) {
  if (!newResults) return existing;

  const merged = { ...existing };
  for (const [id, result] of Object.entries(newResults)) {
    if (result.status === 'completed') {
      merged[id] = result;
    }
  }
  return merged;
}

async function main() {
  // 读取现有数据
  let existing = {};
  if (fs.existsSync(RESULTS_PATH)) {
    existing = JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf-8'));
  }

  // 尝试从 API 获取最新数据 (获取最近7天)
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const dateFrom = weekAgo.toISOString().split('T')[0];
  const dateTo = today.toISOString().split('T')[0];

  console.log(`[${new Date().toISOString()}] Fetching results ${dateFrom} to ${dateTo}...`);

  let newResults = null;
  if (API_KEY) {
    console.log('  Using football-data.org API...');
    newResults = await fetchFromFootballData(dateFrom, dateTo);
    if (newResults) {
      console.log(`  Got ${Object.keys(newResults).length} matches from API`);
    }
  } else {
    console.log('  No API key set. Set FOOTBALL_DATA_API_KEY for live data.');
  }

  const updated = mergeResults(existing, newResults);

  // 写入文件
  fs.writeFileSync(RESULTS_PATH, JSON.stringify(updated, null, 2));

  const newCount = Object.keys(updated).length - Object.keys(existing).length;
  console.log(`  Updated: ${Object.keys(updated).length} total matches (+${newCount} new)`);
  console.log('  Done.');
}

main().catch(console.error);
