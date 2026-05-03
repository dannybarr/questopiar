export interface Group {
  id: string;
  name: string;
  emoji: string;
  members: number;
  avatars: string[];
  vibe: string;
  region: string;
  activeQuest: { title: string; when: string; venue: string };
  description: string;
  cover: string;
}

export const GROUPS: Group[] = [
  {
    id: "g-kent-weekenders",
    name: "Kent Weekenders",
    emoji: "🌅",
    members: 12,
    avatars: ["🦊", "🐻", "🦉", "🐙", "🦄"],
    vibe: "Coastal, slow, pub-stops mandatory",
    region: "Kent",
    activeQuest: { title: "Coastal pub crawl", when: "Sat 2pm", venue: "Whitstable → Margate" },
    description: "A loose collective of Kent-based questers. We meet most Saturdays. Anyone welcome — bring a coat.",
    cover: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "g-london-after-dark",
    name: "London After Dark",
    emoji: "🌃",
    members: 28,
    avatars: ["🐉", "🦖", "🐯", "🦊", "🐙", "🦄"],
    vibe: "Speakeasies, night runs, rooftops",
    region: "London",
    activeQuest: { title: "Soho speakeasy hunt", when: "Fri 9pm", venue: "Start: Bar Termini" },
    description: "When the sun goes down, we go out. Weekly missions across the city. No pre-mades, just energy.",
    cover: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=900&q=80",
  },
];
