export interface UKPlace { name: string; region: string; lat: number; lng: number; }

export const UK_PLACES: UKPlace[] = [
  { name: "London", region: "Greater London", lat: 51.5074, lng: -0.1278 },
  { name: "Hackney", region: "London", lat: 51.5450, lng: -0.0553 },
  { name: "Shoreditch", region: "London", lat: 51.5256, lng: -0.0876 },
  { name: "Camden", region: "London", lat: 51.5390, lng: -0.1426 },
  { name: "Peckham", region: "London", lat: 51.4733, lng: -0.0694 },
  { name: "Richmond", region: "London", lat: 51.4613, lng: -0.3037 },
  { name: "Greenwich", region: "London", lat: 51.4826, lng: 0.0077 },
  { name: "Canterbury", region: "Kent", lat: 51.2802, lng: 1.0789 },
  { name: "Whitstable", region: "Kent", lat: 51.3623, lng: 1.0264 },
  { name: "Margate", region: "Kent", lat: 51.3858, lng: 1.3865 },
  { name: "Broadstairs", region: "Kent", lat: 51.3596, lng: 1.4378 },
  { name: "Dover", region: "Kent", lat: 51.1279, lng: 1.3134 },
  { name: "Maidstone", region: "Kent", lat: 51.2720, lng: 0.5292 },
  { name: "Sandwich", region: "Kent", lat: 51.2745, lng: 1.3437 },
  { name: "Brighton", region: "East Sussex", lat: 50.8225, lng: -0.1372 },
  { name: "Bristol", region: "Bristol", lat: 51.4545, lng: -2.5879 },
  { name: "Bath", region: "Somerset", lat: 51.3811, lng: -2.3590 },
  { name: "Manchester", region: "Greater Manchester", lat: 53.4808, lng: -2.2426 },
  { name: "Liverpool", region: "Merseyside", lat: 53.4084, lng: -2.9916 },
  { name: "Edinburgh", region: "Scotland", lat: 55.9533, lng: -3.1883 },
  { name: "Glasgow", region: "Scotland", lat: 55.8642, lng: -4.2518 },
  { name: "Cardiff", region: "Wales", lat: 51.4816, lng: -3.1791 },
  { name: "Oxford", region: "Oxfordshire", lat: 51.7520, lng: -1.2577 },
  { name: "Cambridge", region: "Cambridgeshire", lat: 52.2053, lng: 0.1218 },
  { name: "York", region: "North Yorkshire", lat: 53.9590, lng: -1.0815 },
  { name: "Newcastle", region: "Tyne and Wear", lat: 54.9783, lng: -1.6178 },
  { name: "Leeds", region: "West Yorkshire", lat: 53.8008, lng: -1.5491 },
];

export const AVATARS = ["🦊", "🐻", "🦄", "🐉", "🦖", "🐙", "🦉", "🐯"];

export const BADGES = [
  { id: "first-quest", title: "First Quest", emoji: "🎯", desc: "Complete your first quest" },
  { id: "streak-5", title: "On Fire", emoji: "🔥", desc: "5-day streak" },
  { id: "treehouse", title: "Treehouse Sleeper", emoji: "🌳", desc: "Book a treehouse stay" },
  { id: "kent-conqueror", title: "Kent Conqueror", emoji: "👑", desc: "5 Kent quests done" },
  { id: "wild-one", title: "Wild One", emoji: "🌊", desc: "Complete 3 wild quests" },
  { id: "social-butterfly", title: "Social Butterfly", emoji: "🦋", desc: "Join a group" },
];
