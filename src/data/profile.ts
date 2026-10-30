export interface ProfileSection {
  id: string;
  eyebrow: string;
  title: string;
  paragraphs: Array<string | ProfileInlineLink>;
}

export interface ProfileInlineLink {
  before: string;
  label: string;
  href: string;
  after: string;
}

export interface ProfileStoryLink {
  href: string;
  label: string;
}

export interface ProfileCapability {
  title: string;
  description: string;
  evidence: ProfileStoryLink[];
}

export interface ProfileContent {
  eyebrow: string;
  title: string;
  introduction: string;
  sections: ProfileSection[];
  capabilities: ProfileCapability[];
}

export const profileContent: ProfileContent = {
  eyebrow: 'About',
  title: 'Katherine Kalill',
  introduction:
    'I work across brand experience, community, and partnerships, building moments that bring people together around shared interests and ideas.',
  sections: [
    {
      id: 'about-experience',
      eyebrow: 'Experience',
      title: 'Built across brand and community work',
      paragraphs: [
        'From August 2024 through February 2026, I worked in field events and account marketing for New Balance across the Pacific Northwest and Western Canada.',
        'Since 2023, I have also run Katherine Kalill Productions, an independent practice for brand, event, and content work. Earlier technology-sector commercial customer and account experience at VMware informs how I work across teams and relationships.',
      ],
    },
    {
      id: 'about-community',
      eyebrow: 'Community and culture',
      title: 'A reason to show up together',
      paragraphs: [
        'I founded Your Mothers Run Crew, a women’s running community in Austin. That work keeps me close to the small details that make people feel welcome, supported, and part of something.',
        {
          before: 'Through ',
          label: '@kikhianti',
          href: 'https://www.instagram.com/kikhianti/',
          after:
            ', I share running, travel, fashion, and life abroad, while building an audience around those interests.',
        },
      ],
    },
    {
      id: 'about-perspective',
      eyebrow: 'Perspective',
      title: 'Sport, fashion, and a global lens',
      paragraphs: [
        'My Communications & Branding studies at Milano Fashion Institute, with a focus on luxury, sit alongside earlier commercial work in technology. Together, these experiences inform how I move between different audiences, industries, and ways of working.',
      ],
    },
  ],
  capabilities: [
    {
      title: 'Brand experience',
      description:
        'Shape product introductions and in-person details around how people take part.',
      evidence: [
        { href: '/work/all-city-mile/', label: 'All City Mile × Rebel Relays' },
        {
          href: '/work/you-deserve-your-flowers/',
          label: 'Mom, You Deserve Your Flowers',
        },
      ],
    },
    {
      title: 'Community',
      description:
        'Create welcoming formats that bring local groups together around shared interests.',
      evidence: [
        {
          href: '/work/your-mothers-run-crew/',
          label: 'Your Mothers Run Crew',
        },
        {
          href: '/work/freaks-of-nature/',
          label: 'Freaks of Nature × Alba Optics × Runaway Milano',
        },
      ],
    },
    {
      title: 'Partnerships',
      description:
        'Connect brands and community partners through clear roles and a shared purpose.',
      evidence: [
        { href: '/work/all-city-mile/', label: 'All City Mile × Rebel Relays' },
        {
          href: '/work/womens-self-defense/',
          label: 'Women’s Self-Defense Initiative',
        },
      ],
    },
    {
      title: 'Events and content',
      description:
        'Coordinate event details and carry the story through useful social content.',
      evidence: [
        {
          href: '/work/freaks-of-nature/',
          label: 'Freaks of Nature × Alba Optics × Runaway Milano',
        },
        {
          href: '/work/you-deserve-your-flowers/',
          label: 'Mom, You Deserve Your Flowers',
        },
      ],
    },
  ],
};
