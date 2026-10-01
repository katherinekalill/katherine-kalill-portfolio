import { describe, expect, it } from 'vitest';
import {
  mediaSchema,
  projectSchema,
  previewProjectProjection,
  publicProjectProjection,
  featuredProjectOrder,
  featuredRelease,
  validateContent,
} from './schema';

const draft = {
  id: 'sample',
  slug: 'sample',
  status: 'draft' as const,
  featured: false,
  featuredOrder: null,
  title: 'Sample',
  editorialTitle: null,
  clientPlatform: null,
  operatingContext: null,
  location: null,
  year: null,
  disciplines: [],
  targetRoleRelevance: [],
  summary: null,
  insight: null,
  intention: null,
  opportunity: null,
  idea: null,
  role: null,
  experience: null,
  metrics: [],
  takeaway: null,
  chapters: [],
  presentation: { heroMediaId: null, gallery: [] },
  mediaIds: [],
  credits: [],
  confidentiality: 'pending' as const,
};

describe('content publication gate', () => {
  it('accepts the intentionally incomplete draft shape', () => {
    expect(projectSchema.safeParse(draft).success).toBe(true);
  });

  it('blocks publication until role, confidentiality, and claims are verified', () => {
    const published = { ...draft, status: 'published' as const };
    expect(validateContent([published], [])).toContain(
      'Published project sample has unresolved confidentiality.',
    );
    expect(validateContent([published], [])).toContain(
      'Published project sample needs a verified role, operating context, location, and summary.',
    );
    expect(validateContent([published], [])).not.toHaveLength(0);
  });

  it('allows a published project to omit an unverified year when other gates pass', () => {
    const published = {
      ...draft,
      status: 'published' as const,
      role: 'Led the community event experience',
      operatingContext: 'A neighborhood running event',
      location: 'New York, NY',
      summary: 'A welcoming event for local runners.',
      year: null,
      targetRoleRelevance: ['Experiential strategy'],
      mediaIds: ['approved-photo'],
      presentation: { heroMediaId: 'approved-photo', gallery: [] },
      confidentiality: 'clear' as const,
    };
    const approvedPhoto = {
      id: 'approved-photo',
      kind: 'image' as const,
      src: '/approved-photo.webp',
      width: 1200,
      height: 800,
      aspectRatio: 1.5,
      alt: 'Runners gathering at the start',
      decorative: false,
      focalPoint: { x: 0.5, y: 0.5 },
      credit: null,
      creditBasis: 'not-required' as const,
      permission: 'approved' as const,
      posterId: null,
      variants: [],
    };

    expect(validateContent([published], [approvedPhoto])).toEqual([]);
    expect(
      validateContent(
        [published],
        [{ ...approvedPhoto, permission: 'pending' as const }],
      ),
    ).toContain(
      'Published project sample uses media without approved permission: approved-photo',
    );
    expect(
      validateContent(
        [published],
        [{ ...approvedPhoto, creditBasis: 'pending' as const }],
      ),
    ).toContain(
      'Published project sample uses media with pending credit review: approved-photo',
    );
    expect(
      validateContent(
        [
          {
            ...published,
            metrics: [
              {
                value: '120%',
                label: 'growth',
                verification: 'pending' as const,
              },
            ],
          },
        ],
        [approvedPhoto],
      ),
    ).toContain('Published project sample contains an unverified metric.');
  });

  it('rejects media with invalid dimensions, crop, or unhelpful alt text', () => {
    const invalid = {
      id: 'photo',
      kind: 'image',
      src: '/photo.webp',
      width: 0,
      height: 100,
      aspectRatio: 1,
      alt: '',
      decorative: false,
      focalPoint: { x: 1.1, y: 0.5 },
      credit: null,
      creditBasis: 'pending',
      permission: 'pending',
      posterId: null,
      variants: [],
    };
    expect(mediaSchema.safeParse(invalid).success).toBe(false);
  });

  it('rejects protocol-relative and traversing media sources', () => {
    const media = {
      id: 'photo',
      kind: 'image',
      src: '//example.com/photo.webp',
      width: 100,
      height: 100,
      aspectRatio: 1,
      alt: 'A community run',
      decorative: false,
      focalPoint: { x: 0.5, y: 0.5 },
      credit: null,
      creditBasis: 'not-required',
      permission: 'approved',
      posterId: null,
      variants: [],
    };
    expect(mediaSchema.safeParse(media).success).toBe(false);
    expect(
      mediaSchema.safeParse({ ...media, src: '/../../private/photo.webp' })
        .success,
    ).toBe(false);
  });

  it('projects only publishable content and excludes internal audit sentinels', () => {
    const publishable = {
      ...draft,
      status: 'published' as const,
      role: 'Organized the program',
      operatingContext: 'Community event',
      confidentiality: 'clear' as const,
      metrics: [
        { value: '12', label: 'sessions', verification: 'verified' as const },
      ],
    };
    const internalRecord = {
      ...publishable,
      internalSource: 'PRIVATE_SOURCE_SENTINEL',
      confidentialityEvidence: 'PRIVATE_CONFIDENTIALITY_SENTINEL',
    };
    const [publicRecord] = publicProjectProjection([
      internalRecord as typeof publishable & { internalSource: string },
    ]);
    expect(publicRecord).not.toHaveProperty('internalSource');
    expect(publicRecord).not.toHaveProperty('confidentialityEvidence');
    expect(publicRecord).not.toHaveProperty('confidentiality');
  });

  it('keeps preview story cards limited to a safe display whitelist', () => {
    const reviewProject = {
      ...draft,
      featured: true,
      featuredOrder: 1,
      title: 'Sample project',
      editorialTitle: 'A reason to gather',
      clientPlatform: 'Sample partner',
      operatingContext: 'Independent collaboration',
      disciplines: ['Community'],
      role: 'PRIVATE_ROLE_SENTINEL',
      metrics: [
        {
          value: 'PRIVATE_METRIC_SENTINEL',
          label: 'Private result',
          verification: 'pending' as const,
        },
      ],
    };
    const [card] = previewProjectProjection([reviewProject]);
    expect(card).toMatchObject({
      slug: 'sample',
      editorialTitle: 'A reason to gather',
      operatingContext: 'Independent collaboration',
    });
    expect(card).not.toHaveProperty('role');
    expect(card).not.toHaveProperty('metrics');
    expect(card).not.toHaveProperty('confidentiality');
    expect(JSON.stringify(card)).not.toContain('PRIVATE_METRIC_SENTINEL');
  });

  it('rejects duplicate featured order and unresolved media references', () => {
    const featuredA = {
      ...draft,
      id: 'a',
      slug: 'a',
      featured: true,
      featuredOrder: 1,
    };
    const featuredB = {
      ...draft,
      id: 'b',
      slug: 'b',
      featured: true,
      featuredOrder: 1,
      mediaIds: ['missing'],
    };
    expect(validateContent([featuredA, featuredB], [])).toContain(
      'Duplicate featured order: 1',
    );
    expect(validateContent([featuredA, featuredB], [])).toContain(
      'Project b references missing media: missing',
    );
  });

  it('requires gallery and hero media to be assigned to the project', () => {
    const invalid = projectSchema.parse({
      ...draft,
      chapters: [{ id: 'chapter', title: 'Chapter', body: 'Copy' }],
      presentation: {
        heroMediaId: 'hero',
        gallery: [
          {
            mediaId: 'photo',
            layout: 'portrait',
            caption: null,
            chapterId: 'missing',
          },
        ],
      },
    });
    expect(validateContent([invalid], [])).toContain(
      'Project sample presentation references unassigned media: hero',
    );
    expect(validateContent([invalid], [])).toContain(
      'Project sample presentation references unassigned media: photo',
    );
    expect(validateContent([invalid], [])).toContain(
      'Project sample gallery references missing chapter: missing',
    );
  });

  it('keeps featured production routes behind the coordinated five story release', () => {
    const projects = featuredProjectOrder.map((slug, index) => ({
      ...draft,
      id: slug,
      slug,
      featured: true,
      featuredOrder: index + 1,
    }));
    expect(featuredRelease(projects).published).toBe(false);
    expect(() =>
      featuredRelease(
        projects.map((project, index) => ({
          ...project,
          status: index === 0 ? ('published' as const) : project.status,
        })),
      ),
    ).toThrow('published together');
    expect(
      featuredRelease(
        projects.map((project) => ({
          ...project,
          status: 'published' as const,
        })),
      ).published,
    ).toBe(true);
    expect(() => featuredRelease(projects.slice(1))).toThrow('approved order');
  });

  it('accepts responsive variants only when they preserve source proportions', () => {
    const source = {
      id: 'photo',
      kind: 'image',
      src: '/photo.webp',
      width: 1200,
      height: 800,
      aspectRatio: 1.5,
      alt: 'A community gathering',
      decorative: false,
      focalPoint: { x: 0.5, y: 0.5 },
      credit: null,
      creditBasis: 'not-required',
      permission: 'approved',
      posterId: null,
      variants: [{ src: '/photo-600.webp', width: 600, height: 400 }],
    };
    expect(mediaSchema.safeParse(source).success).toBe(true);
    expect(
      mediaSchema.safeParse({
        ...source,
        variants: [{ src: '/photo-600.webp', width: 600, height: 300 }],
      }).success,
    ).toBe(false);
  });
});
