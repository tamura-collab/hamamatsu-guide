import fs from 'node:fs/promises';
import path from 'node:path';

export async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT' && fallback !== undefined) return fallback;
    throw new Error(`${file} を読み込めません: ${err.message}`);
  }
}

export async function writeJson(file, data) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

export async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

/** ディレクトリ内の *.json をファイル名順に読み込む */
export async function readJsonDir(dir) {
  const names = (await fs.readdir(dir).catch(() => [])).filter((n) => n.endsWith('.json')).sort();
  return Promise.all(names.map(async (name) => ({ name, data: await readJson(path.join(dir, name)) })));
}

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const today = () => new Date().toISOString().slice(0, 10);
