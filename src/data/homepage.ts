import { profileContent } from './profile';

export const homepageCopy = {
  positioning: {
    description:
      'Brand experience, community, and partnerships shaped by the moments that bring people together.',
  },
  pointOfView: {
    eyebrow: 'A point of view',
    title: 'Emotion is the strategy',
    description:
      'Good experiences begin with how they make people feel. A clear intention, thoughtful partnerships, and considered details can turn that feeling into shared connection.',
  },
  range: {
    eyebrow: 'Brands and collaborators',
    title: 'From global brands to independent communities',
    description:
      'Different scales, shared interests, and one human reason to gather.',
  },
  capabilities: {
    eyebrow: 'Capabilities',
    title: 'Bring people closer to the things they care about.',
    items: [
      'Brand experience',
      'Community',
      'Partnerships',
      'Events and activations',
    ],
  },
  archive: {
    eyebrow: 'More to explore',
    title: 'Explore more work.',
    description:
      'Browse projects across community, sport, fashion, culture, and experience.',
  },
  about: {
    eyebrow: 'About',
    title: 'The Business of Human Connection',
    description: profileContent.introduction,
  },
  contact: {
    eyebrow: 'Start a conversation',
    title: 'Let’s make a moment matter.',
  },
} as const;
