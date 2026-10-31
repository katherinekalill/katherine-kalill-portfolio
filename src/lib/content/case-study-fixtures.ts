import type { CaseStudyMedia, CaseStudyProject } from './case-study-types';

const image = (background: string, foreground: string) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><rect width="1200" height="800" fill="${background}"/><path d="M0 600 380 250 760 620 980 180 1200 400V800H0Z" fill="${foreground}"/></svg>`)}`;

const project = (
  slug: string,
  title: string,
  order: number,
  details: Partial<CaseStudyProject> = {},
): CaseStudyProject => ({
  id: slug,
  slug,
  featured: true,
  featuredOrder: order,
  title,
  editorialTitle: title,
  clientPlatform: 'Synthetic partner · review only',
  operatingContext: 'Synthetic case-study layout review',
  location: 'Example location',
  year: 2026,
  disciplines: ['Synthetic discipline'],
  targetRoleRelevance: ['Synthetic role example'],
  summary: 'Synthetic copy used only to review how a case study reads.',
  insight: 'Synthetic human insight for layout review.',
  intention: 'Synthetic emotional intention for layout review.',
  opportunity: 'Synthetic opportunity and constraint for layout review.',
  idea: 'Synthetic idea for layout review.',
  role: 'Synthetic role description. This is not a claim about Katherine.',
  experience: 'Synthetic execution narrative used only to review the template.',
  metrics: [
    {
      value: 'Example',
      label: 'Synthetic layout fixture',
    },
  ],
  takeaway: 'Synthetic learning for layout review.',
  chapters: [],
  presentation: {
    heroMediaId: `${slug}-hero`,
    gallery: [
      {
        mediaId: `${slug}-portrait`,
        layout: 'portrait',
        caption: 'Synthetic portrait crop.',
        chapterId: null,
      },
      {
        mediaId: `${slug}-portrait-pair`,
        layout: 'portrait',
        caption:
          'Synthetic companion portrait crop for responsive pairing review.',
        chapterId: null,
      },
      {
        mediaId: `${slug}-wide`,
        layout: 'full-bleed',
        caption: 'Synthetic full-width image.',
        chapterId: null,
      },
      {
        mediaId: `${slug}-detail`,
        layout: 'detail',
        caption: 'Synthetic detail crop.',
        chapterId: null,
      },
    ],
  },
  mediaIds: [
    `${slug}-hero`,
    `${slug}-portrait`,
    `${slug}-portrait-pair`,
    `${slug}-wide`,
    `${slug}-detail`,
  ],
  credits: [
    { name: 'Example collaborator', contribution: 'Synthetic credit example.' },
  ],
  ...details,
});

export const caseStudyFixtures: CaseStudyProject[] = [
  project('all-city-mile', 'Making Competition Feel Like Community', 1),
  project('your-mothers-run-crew', 'Building a Community People Return To', 2, {
    chapters: [
      {
        id: 'goop',
        title: 'Goop',
        body: 'Synthetic chapter copy demonstrates a partner proof-point chapter.',
      },
      {
        id: 'little-words-project',
        title: 'Little Words Project',
        body: 'Synthetic chapter copy demonstrates a second chapter and its gallery placement.',
      },
    ],
    presentation: {
      heroMediaId: 'your-mothers-run-crew-hero',
      gallery: [
        {
          mediaId: 'your-mothers-run-crew-portrait',
          layout: 'portrait',
          caption: 'Synthetic chapter image.',
          chapterId: 'goop',
        },
        {
          mediaId: 'your-mothers-run-crew-wide',
          layout: 'full-bleed',
          caption: 'Synthetic chapter image.',
          chapterId: 'little-words-project',
        },
        {
          mediaId: 'your-mothers-run-crew-detail',
          layout: 'detail',
          caption: 'Synthetic detail image.',
          chapterId: null,
        },
      ],
    },
  }),
  project('freaks-of-nature', 'Creating a Reason to Gather', 3, {
    insight: null,
    intention: null,
    metrics: [],
    credits: [],
    presentation: {
      heroMediaId: 'freaks-of-nature-hero',
      gallery: [
        {
          mediaId: 'freaks-of-nature-wide',
          layout: 'landscape',
          caption: null,
          chapterId: null,
        },
      ],
    },
    mediaIds: ['freaks-of-nature-hero', 'freaks-of-nature-wide'],
  }),
  project(
    'you-deserve-your-flowers',
    'Turning a Retail Moment Into a Personal Gesture',
    4,
  ),
  project(
    'womens-self-defense',
    'Using Brand Purpose to Create Practical Impact',
    5,
  ),
  project('for-all-mothers', 'Cortina Olympics Coverage', 6),
  project('usa-track-championships', 'USA Track Championships', 7),
];

export function fixtureMedia(project: CaseStudyProject): CaseStudyMedia[] {
  const palette = ['#7b303e', '#e5c6a4'];
  return project.mediaIds.map((id, index) => ({
    id,
    src: image(
      index % 2 ? palette[0]! : '#34534f',
      index % 2 ? palette[1]! : '#d4b995',
    ),
    width: id.includes('portrait') ? 800 : 1200,
    height: id.includes('portrait') ? 1200 : 800,
    focalPoint: { x: 0.5, y: 0.5 },
    alt: `Synthetic image fixture ${index + 1}`,
    decorative: false,
    credit: 'Synthetic fixture',
    variants: [],
  }));
}
