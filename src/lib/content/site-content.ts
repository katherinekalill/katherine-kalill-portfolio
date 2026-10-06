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
  const publicProjects = publicProjectProjection(projects);
  const featured = release.published
    ? publicProjectProjection(release.projects)
    : [];
  const safeMedia = publicMediaProjection(
    media,
    new Set(publicProjects.flatMap((project) => project.mediaIds)),
  );
  return {
    projects: publicProjects,
    featured,
    media: safeMedia,
    published: release.published,
  };
}
