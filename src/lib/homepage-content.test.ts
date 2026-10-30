import { describe, expect, it } from 'vitest';
import media from '../data/media.json';
import projects from '../data/projects.json';
import { homepageCollaborators } from '../data/homepage-collaborators';
import {
  homepageTeasers,
  validateHomepageTeasers,
} from '../data/homepage-teasers';

describe('homepage editorial content', () => {
  it('keeps only the seven approved projects in public source data', () => {
    expect(projects).toHaveLength(7);
    expect(projects.every(({ status }) => status === 'published')).toBe(true);
  });

  it('keeps all five story teasers within the 30-word display limit', () => {
    expect(Object.keys(homepageTeasers)).toEqual([
      'all-city-mile',
      'your-mothers-run-crew',
      'freaks-of-nature',
      'you-deserve-your-flowers',
      'womens-self-defense',
    ]);
    expect(validateHomepageTeasers()).toEqual([]);
  });

  it('limits teaser validation failures to overlong entries', () => {
    expect(
      validateHomepageTeasers({ good: 'one two', bad: 'word '.repeat(31) }),
    ).toEqual(['bad']);
  });

  it('maps every collaborator to an included featured story and assigned media', () => {
    expect(homepageCollaborators).toHaveLength(5);
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
