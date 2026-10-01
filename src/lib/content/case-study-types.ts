import type { Media, Project } from './schema';

export type CaseStudyProject = Pick<
  Project,
  | 'id'
  | 'slug'
  | 'featured'
  | 'featuredOrder'
  | 'title'
  | 'editorialTitle'
  | 'clientPlatform'
  | 'operatingContext'
  | 'location'
  | 'year'
  | 'disciplines'
  | 'targetRoleRelevance'
  | 'summary'
  | 'insight'
  | 'intention'
  | 'opportunity'
  | 'idea'
  | 'role'
  | 'experience'
  | 'takeaway'
  | 'chapters'
  | 'presentation'
  | 'mediaIds'
  | 'credits'
> & { metrics: Array<{ value: string; label: string }> };

export type CaseStudyMedia = Pick<
  Media,
  | 'id'
  | 'src'
  | 'width'
  | 'height'
  | 'focalPoint'
  | 'alt'
  | 'decorative'
  | 'credit'
  | 'variants'
>;
