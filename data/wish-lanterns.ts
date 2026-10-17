import type { Affirmation } from "../types/content";

/** Stable birthday wishes: array order, ID, and lantern position stay paired. */
export const wishLanterns: Affirmation[] = [
  { id: "wish-01", opening: "Happy birthday, my friend!", message: "I hope this year brings you good surprises, real happiness, and plenty of reasons to smile. You have one of those smiles that makes everyone around you relax.", category: "A beautiful beginning", isActive: true },
{ id: "wish-02", opening: "Just so you know.", message: "You don't have to have it all figured out. You've always taken life calmly and at your own pace, and it suits you. Don't let anyone rush you.", category: "Your own pace", isActive: true },
{ id: "wish-03", opening: "For the days ahead.", message: "I hope the tough days go easy on you, the good days turn into memories, and even the boring days give you something small to smile about.", category: "For brighter days", isActive: true },
{ id: "wish-04", opening: "Never forget this.", message: "You matter more than you let on. You're quiet about it, but the way you show up for people means a lot. It does to me, too.", category: "You matter", isActive: true },
{ id: "wish-05", opening: "For your peace of mind.", message: "When life gets loud or overwhelming, I hope you can find that calm of yours and settle back into it. And if you can't, you know you can always talk to me.", category: "A heart full of peace", isActive: true },
{ id: "wish-06", opening: "For your dreams.", message: "Go after the things that excite you, even if you can't see the whole road yet. You've got the patience and steadiness to get there, and I'll be cheering for you.", category: "Dreams worth chasing", isActive: true },
{ id: "wish-07", opening: "For the people around you.", message: "I hope you're always surrounded by people who cheer for you and let you be yourself, quiet moments and all. Good people deserve good company.", category: "Genuine people", isActive: true },
{ id: "wish-08", opening: "Small wins count.", message: "Celebrate the little victories, even the ones nobody claps for. You've never needed a spotlight for your progress to be real. I notice, even when you don't make a big deal of it.", category: "Small victories", isActive: true },
{ id: "wish-09", opening: "Pack your bags.", message: "Here's to more trips this year: new places, random detours, window seats, and views that leave you speechless. And send me pictures, because I want to see everything!", category: "Travel more", isActive: true },
{ id: "wish-10", opening: "For who you're becoming.", message: "Trust yourself a little more each day. You're more capable than you give yourself credit for, and you've already proved it more than once.", category: "Confidence", isActive: true },
{ id: "wish-11", opening: "Something lovely, just for you.", message: "I hope happiness catches you off guard this year: a favourite song on a long drive, a late-night chat, a view at the end of a climb, or a moment when everything just feels right.", category: "Unexpected happiness", isActive: true },
{ id: "wish-12", opening: "Here's to what's waiting.", message: "Here's to new places, new things to learn, and stories you'll tell later with a big smile. I'm hoping to hear them all, and maybe be part of a few.", category: "New adventures", isActive: true },
{ id: "wish-13", opening: "From one friend to another.", message: "You're kind in a quiet, genuine way. You're gentle with people and respectful to your elders without ever making a show of it. I hope that kindness comes back to you when you need it most.", category: "Kindness returned", isActive: true },
{ id: "wish-14", opening: "Whenever you need it.", message: "You can always start over. A new day or a small change of direction is sometimes all it takes to open a door you didn't know was there.", category: "A fresh start", isActive: true },
{ id: "wish-15", opening: "This one's about you.", message: "Calm, kind, a little shy, and a genuinely good person. You don't need to be louder or different to deserve good things. You're already enough, and I'm lucky to have you as a friend.", category: "Your unique light", isActive: true },
{ id: "wish-16", opening: "For the unknown.", message: "Take the next step even when the path looks foggy. You don't need every answer to move forward, and you don't have to do it alone.", category: "Courage through uncertainty", isActive: true },
{ id: "wish-17", opening: "More smiles, please.", message: "I hope your year is full of laughter, conversations that run way too long, and memories that make you grin later. The world is a little brighter when you smile.", category: "Laughter and lightness", isActive: true },
{ id: "wish-18", opening: "For everything you're working toward.", message: "I hope your hard work opens real doors, and that when success shows up, it feels even better than you imagined. You've earned it.", category: "Meaningful success", isActive: true },
{ id: "wish-19", opening: "For a gentler day.", message: "On the heavy days, I hope tomorrow brings a little more clarity, a little more strength, and one good reason to keep believing in better things.", category: "A softer tomorrow", isActive: true },
{ id: "wish-20", opening: "A wish for connection.", message: "I hope you always have friends who really get you, family who's proud of you, and the quiet comfort of feeling truly appreciated.", category: "Love in many forms", isActive: true },
{ id: "wish-21", opening: "Follow what feels true.", message: "Build a life that feels right to you, not just one that looks good from the outside. Your peace and happiness deserve a spot in your plans.", category: "A life that feels like yours", isActive: true },
{ id: "wish-22", opening: "One last birthday wish.", message: "As you turn 22, I hope this year brings more peace, more courage, more adventures, and more moments when you look around and think, “I'm really glad I'm here.” And I'm really glad you're my friend.", category: "The year ahead", isActive: true },
];

/** Fixed positions are indexed in the same order as wishLanterns. */
export const wishLanternPositions = [
  { x: 63, y: 25, mobileX: 73.3, mobileY: 37.5, cabinX: 66, cabinY: 34, scale: 1.08, glow: 0.82 },
  { x: 79, y: 38, mobileX: 47, mobileY: 40.8, cabinX: 83, cabinY: 42, scale: 0.9, glow: 0.68 },
  { x: 53, y: 48, mobileX: 62.1, mobileY: 14.3, cabinX: 57, cabinY: 50, scale: 1.14, glow: 0.9 },
  { x: 88, y: 59, mobileX: 11.5, mobileY: 39.7, cabinX: 92, cabinY: 34, scale: 0.82, glow: 0.64 },
  { x: 72, y: 69, mobileX: 25.7, mobileY: 41.7, cabinX: 73, cabinY: 60, scale: 1.02, glow: 0.78 },
  { x: 43, y: 31, mobileX: 47.4, mobileY: 10.1, cabinX: 50, cabinY: 40, scale: 0.94, glow: 0.72 },
  { x: 31, y: 53, mobileX: 76.3, mobileY: 20.9, cabinX: 87, cabinY: 54, scale: 1.12, glow: 0.88 },
  { x: 58, y: 79, mobileX: 29.8, mobileY: 24.8, cabinX: 64, cabinY: 67, scale: 0.86, glow: 0.67 },
  { x: 92, y: 19, mobileX: 10.1, mobileY: 30.7, cabinX: 96, cabinY: 45, scale: 0.98, glow: 0.74 },
  { x: 23, y: 29, mobileX: 44.6, mobileY: 21.7, cabinX: 77, cabinY: 34, scale: 1.04, glow: 0.84 },
  { x: 15, y: 42, mobileX: 14, mobileY: 19.2, cabinX: 18, cabinY: 46, scale: 0.88, glow: 0.7 },
  { x: 37, y: 19, mobileX: 82.2, mobileY: 28.9, cabinX: 34, cabinY: 27, scale: 1.1, glow: 0.86 },
  { x: 56, y: 37, mobileX: 58.2, mobileY: 30.9, cabinX: 53, cabinY: 42, scale: 0.92, glow: 0.73 },
  { x: 82, y: 27, mobileX: 85.3, mobileY: 46.9, cabinX: 82, cabinY: 23, scale: 1.16, glow: 0.89 },
  { x: 95, y: 46, mobileX: 91.7, mobileY: 20.1, cabinX: 94, cabinY: 56, scale: 0.84, glow: 0.65 },
  { x: 67, y: 55, mobileX: 93, mobileY: 37.7, cabinX: 62, cabinY: 49, scale: 1.06, glow: 0.81 },
  { x: 47, y: 65, mobileX: 82.4, mobileY: 8.2, cabinX: 45, cabinY: 63, scale: 0.89, glow: 0.71 },
  { x: 27, y: 74, mobileX: 27, mobileY: 32.6, cabinX: 28, cabinY: 71, scale: 1.12, glow: 0.87 },
  { x: 8, y: 36, mobileX: 33.3, mobileY: 10.1, cabinX: 11, cabinY: 38, scale: 0.96, glow: 0.76 },
  { x: 39, y: 83, mobileX: 64.5, mobileY: 45.2, cabinX: 41, cabinY: 76, scale: 0.85, glow: 0.66 },
  { x: 84, y: 78, mobileX: 10.7, mobileY: 10.4, cabinX: 84, cabinY: 74, scale: 1.09, glow: 0.85 },
  { x: 10, y: 68, mobileX: 43.5, mobileY: 32.4, cabinX: 14, cabinY: 65, scale: 0.93, glow: 0.74 },
] as const;

/** Percentages in the source 1280×720 video frame (object-fit: cover). */
export const wishLanternVideoPositions = [
  { x: 20, y: 23 }, { x: 45, y: 27 }, { x: 72, y: 24 }, { x: 80, y: 38 }, { x: 70, y: 45 },
  { x: 38, y: 31 }, { x: 29, y: 34 }, { x: 55, y: 40 }, { x: 63, y: 28 }, { x: 93, y: 20 },
  { x: 10, y: 34 }, { x: 12, y: 18 }, { x: 36, y: 47 }, { x: 56, y: 27 }, { x: 88, y: 31 },
  { x: 14, y: 43 }, { x: 25, y: 27 }, { x: 47, y: 44 }, { x: 84, y: 15 }, { x: 95, y: 39 },
  { x: 52, y: 12 }, { x: 63, y: 37 },
] as const;

/** Percentages of the visible cover crop on portrait viewports. */
export const wishLanternVideoPortraitPositions = [
  { x: 72.7, y: 50.9 }, { x: 47.1, y: 55.9 }, { x: 61.9, y: 32 }, { x: 12.4, y: 54.1 }, { x: 47.5, y: 31 },
  { x: 75.7, y: 26.1 }, { x: 30.2, y: 32.1 }, { x: 11.1, y: 40.8 }, { x: 42, y: 15 }, { x: 14.9, y: 23.7 },
  { x: 72.5, y: 40.2 }, { x: 58, y: 41.1 }, { x: 84.4, y: 64.8 }, { x: 90.7, y: 25 }, { x: 30.5, y: 62.7 },
  { x: 92, y: 51.2 }, { x: 87.4, y: 40.5 }, { x: 54, y: 22 }, { x: 27.5, y: 43.5 }, { x: 30.3, y: 23 },
  { x: 64.2, y: 62.4 }, { x: 15, y: 20 },
] as const;
