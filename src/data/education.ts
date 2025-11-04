
export type EducationalContentItem = {
  title: string;
  description: string;
  filePath: string;
  type: 'image' | 'video' | 'pdf';
};

export const educationalContent: EducationalContentItem[] = [
  {
    title: "Market Structures Explained",
    description: "A finance infographic explaining different market structures.",
    filePath: "/infographic.png",
    type: 'image',
  },
  {
    title: "The Power of Compound Interest",
    description: "A finance infographic explaining the power of compound interest.",
    filePath: "/deliverable.png",
    type: 'image',
  }
];
