import { z } from 'astro/zod';

export const verificationState = z.enum(['verified', 'pending', 'unavailable']);

export const metricSchema = z
  .object({
    value: z.string().min(1),
    label: z.string().min(1),
    verification: verificationState,
  })
  .strict();

export const creditSchema = z
  .object({ name: z.string().min(1), contribution: z.string().min(1) })
  .strict();

export const caseStudyChapterSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: z.string().min(1),
    body: z.string().min(1),
  })
  .strict();

export const projectPresentationSchema = z
  .object({
    heroMediaId: z.string().min(1).nullable(),
    gallery: z.array(
      z
        .object({
          mediaId: z.string().min(1),
          layout: z.enum(['portrait', 'landscape', 'full-bleed', 'detail']),
          caption: z.string().min(1).nullable(),
          chapterId: z
            .string()
            .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
            .nullable(),
        })
        .strict(),
    ),
  })
  .strict();

export const responsiveVariantSchema = z
  .object({
    src: z.string().regex(/^\/(?!\/)(?!.*(?:^|\/)\.\.?\/)[^\s?#]+$/),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
  })
  .strict();

export const projectSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    status: z.enum(['draft', 'published']),
    featured: z.boolean(),
    featuredOrder: z.number().int().positive().nullable(),
    title: z.string().min(1),
    editorialTitle: z.string().min(1).nullable(),
    clientPlatform: z.string().min(1).nullable(),
    operatingContext: z.string().min(1).nullable(),
    location: z.string().min(1).nullable(),
    year: z.number().int().min(1900).max(2100).nullable(),
    disciplines: z.array(z.string().min(1)),
    targetRoleRelevance: z.array(z.string().min(1)),
    summary: z.string().min(1).nullable(),
    insight: z.string().min(1).nullable(),
    intention: z.string().min(1).nullable(),
    opportunity: z.string().min(1).nullable(),
    idea: z.string().min(1).nullable(),
    role: z.string().min(1).nullable(),
    experience: z.string().min(1).nullable(),
    metrics: z.array(metricSchema),
    takeaway: z.string().min(1).nullable(),
    chapters: z.array(caseStudyChapterSchema),
    presentation: projectPresentationSchema,
    mediaIds: z.array(z.string().min(1)),
    credits: z.array(creditSchema),
    confidentiality: z.enum(['clear', 'pending', 'restricted']),
  })
  .strict()
  .superRefine((project, ctx) => {
    if (project.featured !== (project.featuredOrder !== null)) {
      ctx.addIssue({
        code: 'custom',
        message:
          'Featured projects need an order; archive projects must not have one.',
        path: ['featuredOrder'],
      });
    }
  });

export const mediaSchema = z
  .object({
    id: z.string().min(1),
    kind: z.enum(['image', 'video']),
    src: z
      .string()
      .regex(/^\/(?!\/)(?!.*(?:^|\/)\.\.?\/)[^\s?#]+$/, {
        message: 'Media source must be a local public path.',
      })
      .refine(
        (source) =>
          !source
            .split('/')
            .some((segment) => segment === '.' || segment === '..'),
        'Media source cannot traverse directories.',
      ),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    aspectRatio: z.number().positive(),
    alt: z.string(),
    decorative: z.boolean(),
    focalPoint: z
      .object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1) })
      .strict(),
    credit: z.string().min(1).nullable(),
    creditBasis: z.enum(['required', 'not-required', 'pending']),
    permission: z.enum(['approved', 'pending', 'unavailable']),
    posterId: z.string().min(1).nullable(),
    variants: z.array(responsiveVariantSchema),
  })
  .strict()
  .superRefine((media, ctx) => {
    if (Math.abs(media.aspectRatio - media.width / media.height) > 0.005) {
      ctx.addIssue({
        code: 'custom',
        message: 'Aspect ratio must match the media dimensions.',
        path: ['aspectRatio'],
      });
    }
    if (
      new Set([media.width, ...media.variants.map(({ width }) => width)])
        .size !==
      media.variants.length + 1
    )
      ctx.addIssue({
        code: 'custom',
        message: 'Responsive media widths must be unique.',
        path: ['variants'],
      });
    for (const [index, variant] of media.variants.entries()) {
      if (variant.width >= media.width)
        ctx.addIssue({
          code: 'custom',
          message: 'Responsive variants must be smaller than the source.',
          path: ['variants', index, 'width'],
        });
      if (
        Math.abs(variant.width / variant.height - media.aspectRatio) > 0.005
      ) {
        ctx.addIssue({
          code: 'custom',
          message: 'Responsive variants must preserve the media aspect ratio.',
          path: ['variants', index],
        });
      }
    }
    if (!media.decorative && !media.alt.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: 'Informative media requires alt text.',
        path: ['alt'],
      });
    }
    if (media.decorative && media.alt !== '') {
      ctx.addIssue({
        code: 'custom',
        message: 'Decorative media must use empty alt text.',
        path: ['alt'],
      });
    }
  });

export const siteSchema = z
  .object({
    name: z.string().min(1),
    portfolioThesis: z.string().min(1),
    linkedin: z.url(),
    email: z.email().nullable(),
    resume: z.string().min(1).nullable(),
  })
  .strict();

export type Project = z.infer<typeof projectSchema>;
export type Media = z.infer<typeof mediaSchema>;

export function validateContent(projects: Project[], media: Media[]): string[] {
  const issues: string[] = [];
  const projectIds = new Set<string>();
  const mediaIds = new Set<string>();
  const orders = new Set<number>();

  for (const record of projects) {
    if (projectIds.has(record.id) || projectIds.has(record.slug))
      issues.push(`Duplicate project id or slug: ${record.id}`);
    projectIds.add(record.id);
    projectIds.add(record.slug);
    if (record.featuredOrder !== null) {
      if (orders.has(record.featuredOrder))
        issues.push(`Duplicate featured order: ${record.featuredOrder}`);
      orders.add(record.featuredOrder);
    }
    if (new Set(record.mediaIds).size !== record.mediaIds.length)
      issues.push(`Project ${record.id} repeats a media reference.`);
    const chapterIds = new Set(record.chapters.map(({ id }) => id));
    if (chapterIds.size !== record.chapters.length)
      issues.push(`Project ${record.id} repeats a chapter id.`);
    for (const mediaId of [
      record.presentation.heroMediaId,
      ...record.presentation.gallery.map(({ mediaId: id }) => id),
    ]) {
      if (mediaId && !record.mediaIds.includes(mediaId))
        issues.push(
          `Project ${record.id} presentation references unassigned media: ${mediaId}`,
        );
    }
    for (const { chapterId } of record.presentation.gallery) {
      if (chapterId && !chapterIds.has(chapterId))
        issues.push(
          `Project ${record.id} gallery references missing chapter: ${chapterId}`,
        );
    }
    for (const mediaId of record.mediaIds) {
      if (!media.some((item) => item.id === mediaId))
        issues.push(
          `Project ${record.id} references missing media: ${mediaId}`,
        );
    }
    if (record.status === 'published') {
      if (record.confidentiality !== 'clear')
        issues.push(
          `Published project ${record.id} has unresolved confidentiality.`,
        );
      if (
        !record.role ||
        !record.operatingContext ||
        !record.location ||
        !record.summary
      )
        issues.push(
          `Published project ${record.id} needs a verified role, operating context, location, and summary.`,
        );
      if (record.mediaIds.length === 0)
        issues.push(
          `Published project ${record.id} needs at least one cleared media item.`,
        );
      const heroMedia = record.presentation.heroMediaId
        ? media.find((item) => item.id === record.presentation.heroMediaId)
        : record.mediaIds
            .map((id) => media.find((item) => item.id === id))
            .find(
              (item) =>
                item?.kind === 'image' && item.permission === 'approved',
            );
      if (
        !heroMedia ||
        heroMedia.kind !== 'image' ||
        heroMedia.permission !== 'approved'
      )
        issues.push(
          `Published project ${record.id} needs an approved image hero.`,
        );
      if (record.targetRoleRelevance.length === 0)
        issues.push(
          `Published project ${record.id} needs documented target-role relevance.`,
        );
      if (record.metrics.some((metric) => metric.verification !== 'verified'))
        issues.push(
          `Published project ${record.id} contains an unverified metric.`,
        );
      for (const mediaId of record.mediaIds) {
        const item = media.find((candidate) => candidate.id === mediaId);
        if (item && item.permission !== 'approved')
          issues.push(
            `Published project ${record.id} uses media without approved permission: ${mediaId}`,
          );
        if (item && item.creditBasis === 'pending')
          issues.push(
            `Published project ${record.id} uses media with pending credit review: ${mediaId}`,
          );
      }
      for (const { mediaId } of record.presentation.gallery) {
        const item = media.find((candidate) => candidate.id === mediaId);
        if (item && item.kind !== 'image')
          issues.push(
            `Published project ${record.id} gallery media must be an image: ${mediaId}`,
          );
      }
    }
  }

  for (const item of media) {
    if (mediaIds.has(item.id)) issues.push(`Duplicate media id: ${item.id}`);
    mediaIds.add(item.id);
    if (
      item.posterId &&
      !media.some((candidate) => candidate.id === item.posterId)
    ) {
      issues.push(
        `Media ${item.id} references missing poster: ${item.posterId}`,
      );
    }
    if (
      item.permission === 'approved' &&
      item.creditBasis === 'required' &&
      !item.credit
    ) {
      issues.push(`Approved media ${item.id} needs its required credit.`);
    }
  }
  return issues;
}

export function publicProjectProjection(projects: Project[]) {
  return projects
    .filter((project) => project.status === 'published')
    .map((project) => ({
      id: project.id,
      slug: project.slug,
      featured: project.featured,
      featuredOrder: project.featuredOrder,
      title: project.title,
      editorialTitle: project.editorialTitle,
      clientPlatform: project.clientPlatform,
      operatingContext: project.operatingContext,
      location: project.location,
      year: project.year,
      disciplines: project.disciplines,
      targetRoleRelevance: project.targetRoleRelevance,
      summary: project.summary,
      insight: project.insight,
      intention: project.intention,
      opportunity: project.opportunity,
      idea: project.idea,
      role: project.role,
      experience: project.experience,
      metrics: project.metrics
        .filter((metric) => metric.verification === 'verified')
        .map(({ value, label }) => ({ value, label })),
      takeaway: project.takeaway,
      chapters: project.chapters,
      presentation: project.presentation,
      mediaIds: project.mediaIds,
      credits: project.credits,
    }));
}

export function previewProjectProjection(projects: Project[]) {
  return projects
    .filter((project) => project.featured)
    .sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0))
    .map((project) => ({
      id: project.id,
      slug: project.slug,
      featured: project.featured,
      featuredOrder: project.featuredOrder,
      title: project.title,
      editorialTitle: project.editorialTitle,
      clientPlatform: project.clientPlatform,
      operatingContext: project.operatingContext,
      disciplines: project.disciplines,
      summary: null,
      mediaIds: [],
    }));
}

export function publicMediaProjection(
  media: Media[],
  usedMediaIds: Set<string>,
) {
  return media
    .filter(
      (item) =>
        usedMediaIds.has(item.id) &&
        item.kind === 'image' &&
        item.permission === 'approved',
    )
    .map((item) => ({
      id: item.id,
      kind: item.kind,
      src: item.src,
      width: item.width,
      height: item.height,
      aspectRatio: item.aspectRatio,
      alt: item.alt,
      decorative: item.decorative,
      focalPoint: item.focalPoint,
      credit: item.credit,
      posterId: item.posterId,
      variants: item.variants,
    }));
}

export const featuredProjectOrder = [
  'all-city-mile',
  'your-mothers-run-crew',
  'freaks-of-nature',
  'you-deserve-your-flowers',
  'womens-self-defense',
] as const;

export function featuredRelease(projects: Project[]) {
  const featured = projects
    .filter((project) => project.featured)
    .sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0));
  const actual = featured.map((project) => project.slug);
  if (
    actual.length !== featuredProjectOrder.length ||
    actual.some((slug, index) => slug !== featuredProjectOrder[index])
  ) {
    throw new Error(
      `Featured projects must match the approved order: ${featuredProjectOrder.join(', ')}.`,
    );
  }
  if (featured.some((project, index) => project.featuredOrder !== index + 1))
    throw new Error('Featured projects must use sequential order from 1 to 5.');
  const published = featured.filter(
    (project) => project.status === 'published',
  );
  if (published.length === 0)
    return { published: false as const, projects: [] };
  if (published.length !== featured.length)
    throw new Error(
      'Featured stories must be published together after editorial and rights approval.',
    );
  return { published: true as const, projects: featured };
}
