import { getCollection } from 'astro:content';
import mediaManifest from '../../data/media.json';
import {
  featuredRelease,
  mediaSchema,
  publicMediaProjection,
  publicProjectProjection,
  validateContent,
  type Media,
  type Project,
} from './schema';
import { validateLocalMediaFiles } from './local-media';

export async function loadSiteContent() {
  const entries = await getCollection('projects');
  const projects: Project[] = entries.map(({ data }) => data);
  const media: Media[] = mediaManifest.map((record) =>
    mediaSchema.parse(record),
  );
  const issues = [
    ...validateContent(projects, media),
    ...validateLocalMediaFiles(media),
  ];
  if (issues.length > 0)
    throw new Error(
      `Portfolio content validation failed: ${issues.join('; ')}`,
    );

  const release = featuredRelease(projects);
  if (!release.published)
    return { featured: [], media: [], published: false as const };

  const safeProjects = publicProjectProjection(release.projects);
  const safeMedia = publicMediaProjection(
    media,
    new Set(safeProjects.flatMap((project) => project.mediaIds)),
  );
  return { featured: safeProjects, media: safeMedia, published: true as const };
}
