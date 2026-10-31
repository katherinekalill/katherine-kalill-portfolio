import { readFile } from 'node:fs/promises';
import {
  featuredProjectOrder,
  featuredRelease,
  mediaSchema,
  projectSchema,
  siteSchema,
  validateContent,
  type Media,
  type Project,
} from '../src/lib/content/schema';
import { validateLocalMediaFiles } from '../src/lib/content/local-media';

async function readJson<T>(path: string): Promise<T> {
  return JSON.parse(
    await readFile(new URL(path, import.meta.url), 'utf8'),
  ) as T;
}

const rawProjects = await readJson<unknown[]>('../src/data/projects.json');
const rawMedia = await readJson<unknown[]>('../src/data/media.json');
const rawSite = await readJson<unknown>('../src/data/site.json');
const projects: Project[] = rawProjects.map((entry) =>
  projectSchema.parse(entry),
);
const featuredProjects = projects.filter((project) => project.featured);
const media: Media[] = rawMedia.map((entry) => mediaSchema.parse(entry));
siteSchema.parse(rawSite);

const issues = [
  ...validateContent(projects, media),
  ...validateLocalMediaFiles(media),
];
if (issues.length > 0) {
  console.error(issues.map((issue) => `- ${issue}`).join('\n'));
  process.exitCode = 1;
} else if (projects.some((project) => project.status !== 'published')) {
  console.error(
    'The public project inventory must contain only published records.',
  );
  process.exitCode = 1;
} else if (featuredProjects.length !== featuredProjectOrder.length) {
  console.error(
    `Expected exactly ${featuredProjectOrder.length} featured projects.`,
  );
  process.exitCode = 1;
} else if (JSON.stringify(rawSite).match(/placeholder|example\.com/i)) {
  console.error('Site contact configuration contains a placeholder.');
  process.exitCode = 1;
} else {
  try {
    featuredRelease(projects);
    console.log(
      `Validated ${projects.length} public project records and ${media.length} public media records.`,
    );
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
