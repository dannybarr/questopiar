import { GROUPS } from "@/data/groups";

export interface DiscoverPost {
  id: string;
  user: { name: string; avatar: string };
  questId: string;
  questTitle: string;
  rating: number;
  review: string;
  upvotes: number;
  comments: number;
  image: string;
  daysAgo: number;
}

export const DISCOVER_POSTS: DiscoverPost[] = [
  { id: "p1", user: { name: "Maya", avatar: "🦄" }, questId: "q-castle-climb", questTitle: "Send It at The Castle", rating: 5, review: "Got my first 6a! The vegan brownie at the café is borderline criminal.", upvotes: 142, comments: 12, image: "https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=900&q=80", daysAgo: 1 },
  { id: "p2", user: { name: "Theo", avatar: "🦊" }, questId: "q-whitstable", questTitle: "Sea Swim & Chips", rating: 5, review: "Sea was 9°C and life-changing. Chips healed everything.", upvotes: 287, comments: 34, image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80", daysAgo: 2 },
  { id: "p3", user: { name: "Priya", avatar: "🐯" }, questId: "q-boxhill", questTitle: "Sunrise on Box Hill", rating: 4, review: "Set off at 4am. Worth every yawn. Bring more coffee than you think.", upvotes: 98, comments: 7, image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80", daysAgo: 3 },
  { id: "p4", user: { name: "Ola", avatar: "🐙" }, questId: "s-hoots", questTitle: "Treehouse Sleepover", rating: 5, review: "Best night's sleep of my life. The outdoor bath is unreal under the stars.", upvotes: 512, comments: 48, image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=900&q=80", daysAgo: 4 },
  { id: "p5", user: { name: "Sam", avatar: "🐻" }, questId: "q-bermondsey", questTitle: "Beer Mile Crawl", rating: 4, review: "Made it to brewery 6. Don't judge me.", upvotes: 203, comments: 22, image: "https://images.unsplash.com/photo-1559526324-c1f275fbfa32?auto=format&fit=crop&w=900&q=80", daysAgo: 5 },
  { id: "p6", user: { name: "Zara", avatar: "🦉" }, questId: "q-broadstairs-surf", questTitle: "Surf Joss Bay", rating: 5, review: "Stood up on my third wave. Hooked.", upvotes: 176, comments: 14, image: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=900&q=80", daysAgo: 6 },
];

export { GROUPS };
