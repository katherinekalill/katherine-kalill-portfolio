import { statSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import type { Media } from './schema';

export function validateLocalMediaFiles(media: Media[]): string[] {
  const publicRoot = resolve(process.cwd(), 'public');
  const issues: string[] = [];

  for (const item of media) {
    const filePath = resolve(publicRoot, item.src.slice(1));
    let isFile = false;
    try {
      isFile = statSync(filePath).isFile();
    } catch {
      // A missing path is invalid media.
    }
    if (
      (filePath !== publicRoot &&
        !filePath.startsWith(`${publicRoot}${sep}`)) ||
      !isFile
    ) {
      issues.push(
        `Media ${item.id} does not resolve to a file in public/: ${item.src}`,
      );
    }
  }

  return issues;
}
