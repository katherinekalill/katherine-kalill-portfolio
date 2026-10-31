export const homepageTeasers = {
  'all-city-mile':
    'A Seattle mile returns as a community race, with room for new runners, local partners, and a shared cause.',
  'your-mothers-run-crew':
    'A monthly Austin run crew grows into a gathering place for women and thoughtful brand collaborations.',
  'freaks-of-nature':
    'A Milan morning run connects an independent outdoor brand, local runners, and a neighborhood host.',
  'you-deserve-your-flowers':
    'A Mother’s Day workout pairs New Balance shoe trials with bouquets, brunch, and a local training community.',
  'womens-self-defense':
    'A trail-shoe demo run leads into practical self-defense instruction with REI and Seattle community partners.',
  'for-all-mothers':
    'At the Winter Games, athlete stories make room for the families and caregiving that support competition.',
  'usa-track-championships':
    'A Citius Magazine community run brings fans and athletes together around the USA Track & Field Championships.',
} satisfies Record<string, string>;

export function validateHomepageTeasers(
  teasers: Record<string, string> = homepageTeasers,
): string[] {
  return Object.entries(teasers)
    .filter(([, teaser]) => teaser.trim().split(/\s+/).length > 30)
    .map(([slug]) => slug);
}
