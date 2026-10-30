export interface HomepageCollaborator {
  name: string;
  relationship: string;
  projectSlug: string;
  chapterId: string | null;
  mediaIds: [string] | [string, string];
}

export const homepageCollaborators: HomepageCollaborator[] = [
  {
    name: 'All City Mile',
    relationship: 'Project · community race and product launch',
    projectSlug: 'all-city-mile',
    chapterId: 'race-day-format',
    mediaIds: ['all-city-mile-hero', 'all-city-mile-huddle'],
  },
  {
    name: 'Freaks of Nature × Alba Optics × Runaway Milano',
    relationship: 'Client and collaborators · community event and campaign',
    projectSlug: 'freaks-of-nature',
    chapterId: null,
    mediaIds: ['freaks-of-nature-hero', 'freaks-of-nature-campaign'],
  },
  {
    name: 'Little Words Project × goop',
    relationship: 'Partners · Your Mothers Run Crew gatherings',
    projectSlug: 'your-mothers-run-crew',
    chapterId: null,
    mediaIds: ['mothers-lwp-hero', 'mothers-goop-run-still'],
  },
  {
    name: 'Athletic Form',
    relationship: 'Collaborator · Mom, You Deserve Your Flowers',
    projectSlug: 'you-deserve-your-flowers',
    chapterId: 'event-activation',
    mediaIds: [
      'you-deserve-flowers-run-your-way',
      'you-deserve-flowers-bouquets',
    ],
  },
  {
    name: 'REI',
    relationship: 'Collaborator · Women’s Self-Defense Initiative',
    projectSlug: 'womens-self-defense',
    chapterId: 'community-led-event',
    mediaIds: ['womens-self-defense-hero', 'womens-self-defense-lesson'],
  },
];
