
export interface Bundle {
  title: string;
  description: string;
  image: string;
  hint: string;
}

export const recommendedBundles: Bundle[] = [
  {
    title: "Tech Starter Pack",
    description: "Invest in leading tech companies with this diversified bundle. Ideal for growth-oriented beginners.",
    image: "https://placehold.co/600x400.png",
    hint: "tech computer",
  },
  {
    title: "Global Giants",
    description: "A stable collection of well-established international corporations with a history of solid returns.",
    image: "https://placehold.co/600x400.png",
    hint: "city skyline",
  },
];

export const specializedBundles: Bundle[] = [
    {
    title: "Green Energy Fund",
    description: "Support a sustainable future by investing in renewable energy and clean technology companies.",
    image: "https://placehold.co/600x400.png",
    hint: "solar panels",
  },
  {
    title: "Healthcare Innovators",
    description: "Focus on the future of health with companies in biotechnology and medical research.",
    image: "https://placehold.co/600x400.png",
    hint: "science laboratory",
  },
  {
    title: "Disruptive Tech",
    description: "High-risk, high-reward bundle focusing on emerging technologies like AI, blockchain, and robotics.",
    image: "https://placehold.co/600x400.png",
    hint: "abstract technology",
  },
  {
    title: "Dividend Champions",
    description: "A collection of companies with a long history of consistently paying and increasing their dividends.",
    image: "https://placehold.co/600x400.png",
    hint: "money growth",
  },
];
