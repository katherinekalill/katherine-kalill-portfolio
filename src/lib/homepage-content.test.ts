import { describe, expect, it } from 'vitest';
import media from '../data/media.json';
import projects from '../data/projects.json';
import { homepageCollaborators } from '../data/homepage-collaborators';
import {
  homepageTeasers,
  validateHomepageTeasers,
} from '../data/homepage-teasers';
import {
  createHomepageHeroSlides,
  homepageHeroMediaOrder,
} from '../data/homepage-hero';
import { featuredProjectOrder } from './content/schema';

describe('homepage editorial content', () => {
  it('keeps only the seven approved projects in public source data', () => {
    expect(projects).toHaveLength(7);
    expect(projects.every(({ status }) => status === 'published')).toBe(true);
  });

  it('keeps a teaser for each featured story within the 30-word display limit', () => {
    expect(Object.keys(homepageTeasers)).toEqual(featuredProjectOrder);
    expect(validateHomepageTeasers()).toEqual([]);
  });

  it('keeps approved editorial titles distinct from factual project names', () => {
    expect(
      projects.find(({ slug }) => slug === 'for-all-mothers'),
    ).toMatchObject({
      title: 'Joie Baby × For All Mothers',
      editorialTitle: 'Making Space for Motherhood in Elite Sport',
      featuredOrder: 6,
      year: null,
    });
    expect(
      projects.find(({ slug }) => slug === 'usa-track-championships'),
    ).toMatchObject({
      title: 'USA Track Championships',
      editorialTitle: 'Bringing Professional Athletes and Community Together',
      featuredOrder: 7,
      metrics: [
        {
          value: '200+',
          label: 'people hosted at the community run',
          verification: 'verified',
        },
      ],
    });
  });

  it('keeps the background sequence independent of featured project order', () => {
    const slides = createHomepageHeroSlides(media);
    expect(homepageHeroMediaOrder).toEqual([
      'all-city-mile-hero',
      'all-city-mile-huddle',
      'freaks-of-nature-hero',
      'womens-self-defense-hero',
      'womens-self-defense-partner',
      'all-city-mile-community',
      'all-city-mile-results',
      'usa-track-championships-community',
      'usa-track-championships-collaborators',
    ]);
    expect(slides).toHaveLength(9);
    expect(slides.every(({ width, height }) => width > height)).toBe(true);
  });

  it('limits teaser validation failures to overlong entries', () => {
    expect(
      validateHomepageTeasers({ good: 'one two', bad: 'word '.repeat(31) }),
    ).toEqual(['bad']);
  });

  it('maps every collaborator to an included featured story and assigned media', () => {
    expect(
      homepageCollaborators.slice(0, 5).map(({ projectSlug }) => projectSlug),
    ).toEqual([
      'all-city-mile',
      'freaks-of-nature',
      'your-mothers-run-crew',
      'you-deserve-your-flowers',
      'womens-self-defense',
    ]);
    expect(
      homepageCollaborators.slice(-2).map(({ projectSlug }) => projectSlug),
    ).toEqual(['for-all-mothers', 'usa-track-championships']);
    for (const collaborator of homepageCollaborators) {
      const project = projects.find(
        ({ slug }) => slug === collaborator.projectSlug,
      );
      expect(project?.featured, collaborator.name).toBe(true);
      if (collaborator.chapterId) {
        expect(
          project?.chapters.some(({ id }) => id === collaborator.chapterId),
          collaborator.name,
        ).toBe(true);
      }
      for (const id of collaborator.mediaIds) {
        expect(project?.mediaIds, `${collaborator.name} media ${id}`).toContain(
          id,
        );
        expect(
          media.some((item) => item.id === id),
          id,
        ).toBe(true);
      }
    }
  });
});
