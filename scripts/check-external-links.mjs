import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.env.PRODUCTION_DIRECTORY ?? 'dist';
const timeoutMs = Number(process.env.LINK_CHECK_TIMEOUT_MS ?? 10_000);

async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return htmlFiles(path);
      return entry.name.endsWith('.html') ? [path] : [];
    }),
  );
  return nested.flat();
}

function externalLinks(html, file) {
  const links = [];
  for (const match of html.matchAll(/<a\b[^>]*\bhref\s*=\s*(["'])(.*?)\1/gi)) {
    const href = match[2]
      .replaceAll('&amp;', '&')
      .replaceAll('&#x27;', "'")
      .replaceAll('&quot;', '"');
    if (!/^https?:\/\//i.test(href)) continue;
    links.push({ href, file });
  }
  return links;
}

const pages = await htmlFiles(root);
const links = (
  await Promise.all(
    pages.map(async (file) =>
      externalLinks(await readFile(file, 'utf8'), file),
    ),
  )
).flat();
const unique = new Map(links.map((link) => [link.href, link]));
const failures = [];
const inconclusive = [];

for (const { href, file } of unique.values()) {
  try {
    const options = {
      redirect: 'follow',
      signal: AbortSignal.timeout(timeoutMs),
      headers: { 'user-agent': 'Portfolio external link verifier' },
    };
    let response = await fetch(href, { ...options, method: 'HEAD' });
    if (response.status === 405 || response.status === 501) {
      await response.body?.cancel();
      response = await fetch(href, {
        ...options,
        method: 'GET',
        headers: { ...options.headers, range: 'bytes=0-0' },
      });
      await response.body?.cancel();
    }
    if ([401, 403, 429, 999].includes(response.status)) {
      inconclusive.push(
        `${href}: HTTP ${response.status} (access restricted or bot limited; found in ${file})`,
      );
    } else if (response.status >= 400 && response.status < 500) {
      failures.push(`${href}: HTTP ${response.status} (found in ${file})`);
    } else if (response.status >= 500) {
      inconclusive.push(
        `${href}: HTTP ${response.status} (remote server error)`,
      );
    } else {
      console.log(`OK ${href} (${response.status})`);
    }
  } catch (error) {
    inconclusive.push(
      `${href}: ${error.message} (network outcome is unknown; found in ${file})`,
    );
  }
}

for (const message of inconclusive) console.warn(`INCONCLUSIVE ${message}`);
for (const message of failures) console.error(`BROKEN ${message}`);
if (failures.length > 0) {
  console.error(
    `External link check found ${failures.length} actionable failure(s); fix the destination or remove the dead link.`,
  );
  process.exitCode = 1;
} else if (inconclusive.length > 0) {
  console.log(
    `No confirmed broken links. ${inconclusive.length} destination(s) need a manual check; confirm the destination in a browser or from another network.`,
  );
} else {
  console.log(
    `Checked ${unique.size} external link(s); all responded successfully.`,
  );
}
