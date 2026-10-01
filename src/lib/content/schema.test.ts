import { describe, expect, it } from 'vitest';
import {
  mediaSchema,
  projectSchema,
  previewProjectProjection,
  publicProjectProjection,
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
      'Published project sample needs a verified role, operating context, year, location, and summary.',
    );
    expect(validateContent([published], [])).not.toHaveLength(0);
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
});
