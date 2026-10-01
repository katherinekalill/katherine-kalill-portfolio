export interface HomepageCollaborator {
  name: string;
  relationship: string;
  projectSlug: string;
  chapterId: string | null;
  mediaIds: [string] | [string, string];
}

export const homepageCollaborators: HomepageCollaborator[] = [
  {
    name: 'New Balance',
    relationship: 'Employer · community events and brand experience',
    projectSlug: 'all-city-mile',
    chapterId: 'race-day-format',
    mediaIds: ['all-city-mile-hero', 'all-city-mile-huddle'],
  },
  {
    name: 'Freaks of Nature',
    relationship: 'Client · community event and campaign',
    projectSlug: 'freaks-of-nature',
    chapterId: 'event-content',
    mediaIds: ['freaks-of-nature-hero', 'freaks-of-nature-campaign'],
  },
  {
    name: 'goop',
    relationship: 'Collaborator · Your Mothers Run Crew gathering',
    projectSlug: 'your-mothers-run-crew',
    chapterId: 'goop',
    mediaIds: ['mothers-goop-run-still'],
  },
  {
    name: 'Little Words Project',
    relationship: 'Collaborator · Your Mothers Run Crew gathering',
    projectSlug: 'your-mothers-run-crew',
    chapterId: 'little-words-project',
    mediaIds: ['mothers-lwp-hero', 'mothers-lwp-bracelets'],
  },
  {
    name: 'Alba Optics',
    relationship: 'Collaborator · Back In Bed event',
    projectSlug: 'freaks-of-nature',
    chapterId: 'back-in-bed',
    mediaIds: ['freaks-of-nature-hero'],
  },
  {
    name: 'Runaway Milano',
    relationship: 'Collaborator · community and local host',
    projectSlug: 'freaks-of-nature',
    chapterId: 'shared-outdoor-culture',
    mediaIds: ['freaks-of-nature-hero', 'freaks-of-nature-run'],
  },
  {
    name: 'Athletic Form',
    relationship: 'Collaborator · Mom, You Deserve Your Flowers',
    projectSlug: 'you-deserve-your-flowers',
    chapterId: 'event-activation',
    mediaIds: ['you-deserve-flowers-hero', 'you-deserve-flowers-bouquets'],
  },
  {
    name: 'REI',
    relationship: 'Collaborator · Women’s Self-Defense Initiative',
    projectSlug: 'womens-self-defense',
    chapterId: 'community-led-event',
    mediaIds: ['womens-self-defense-hero', 'womens-self-defense-lesson'],
  },
];
