import type { Affirmation } from "../types/content";

/** Stable birthday wishes: array order, ID, and lantern position stay paired. */
export const wishLanterns: Affirmation[] = [
  { id: "wish-01", opening: "A little wish for you.", message: "May this new year of your life bring you beautiful surprises, genuine happiness, and countless reasons to smile.", category: "A beautiful beginning", isActive: true },
  { id: "wish-02", opening: "Remember this.", message: "You don't have to figure everything out right now. You're allowed to grow at your own pace, and your journey is yours to make beautiful.", category: "Your own pace", isActive: true },
  { id: "wish-03", opening: "For the days ahead.", message: "May the difficult days become gentler, the good days become unforgettable, and the ordinary days bring little moments worth keeping.", category: "For brighter days", isActive: true },
  { id: "wish-04", opening: "Never forget this.", message: "You matter more than you sometimes realise. Your presence, your kindness, and the little things you do can make someone's world brighter.", category: "You matter", isActive: true },
  { id: "wish-05", opening: "A wish for your heart.", message: "May you find peace in the things you cannot change, courage for the things you can, and comfort whenever life feels overwhelming.", category: "A heart full of peace", isActive: true },
  { id: "wish-06", opening: "For your dreams.", message: "May you find the courage to follow the dreams that make your heart feel alive, even when the path ahead isn't completely clear.", category: "Dreams worth chasing", isActive: true },
  { id: "wish-07", opening: "For the people around you.", message: "May you be surrounded by people who celebrate your happiness, respect your boundaries, support your growth, and make you feel safe being yourself.", category: "Genuine people", isActive: true },
  { id: "wish-08", opening: "A reminder to celebrate.", message: "May you learn to celebrate every little victory, even the ones nobody else notices. Progress is still progress, no matter how quietly it happens.", category: "Small victories", isActive: true },
  { id: "wish-09", opening: "Take a breath.", message: "May you get to travel wherever you want a bit more this year.", category: "Travel more", isActive: true },
  { id: "wish-10", opening: "For the person you're becoming.", message: "May you trust yourself a little more each day and discover just how capable you are of handling things you once thought were beyond you.", category: "Confidence", isActive: true },
  { id: "wish-11", opening: "Something lovely, just for you.", message: "May happiness find you in unexpected places: a favourite song, a late-night conversation, a beautiful view, or a moment when everything simply feels right.", category: "Unexpected happiness", isActive: true },
  { id: "wish-12", opening: "Here's to what's waiting.", message: "May this year bring you new places to explore, new things to learn, and experiences that become stories you'll love telling someday.", category: "New adventures", isActive: true },
  { id: "wish-13", opening: "From one heart to another.", message: "You give more kindness to the world than you may realise. May that same kindness find its way back to you when you need it most.", category: "Kindness returned", isActive: true },
  { id: "wish-14", opening: "Whenever you need it.", message: "You can always begin again. A new day, a new decision, or a small change of direction can open doors you never expected.", category: "A fresh start", isActive: true },
  { id: "wish-15", opening: "This one's about you.", message: "There's something uniquely wonderful about the person you are. You don't need to become someone else to be worthy of love, respect, or happiness.", category: "Your unique light", isActive: true },
  { id: "wish-16", opening: "For the unknown.", message: "May you have the courage to take the next step even when you cannot see the whole path. You can move forward without having every answer.", category: "Courage through uncertainty", isActive: true },
  { id: "wish-17", opening: "A wish for more smiles.", message: "May your life hold plenty of laughter, conversations that go on too long, memories that make you smile later, and moments when your heart feels wonderfully light.", category: "Laughter and lightness", isActive: true },
  { id: "wish-18", opening: "For everything you're working toward.", message: "May your hard work open beautiful doors, your efforts bring meaningful opportunities, and your achievements feel as good as you once hoped they would.", category: "Meaningful success", isActive: true },
  { id: "wish-19", opening: "For a gentler day.", message: "Whenever life feels heavy, may tomorrow bring a little more clarity, a little more strength, and one good reason to keep believing in better days.", category: "A softer tomorrow", isActive: true },
  { id: "wish-20", opening: "A wish for connection.", message: "May you experience love in all its beautiful forms: through friendship, family, understanding, shared memories, and the quiet comfort of being truly appreciated.", category: "Love in many forms", isActive: true },
  { id: "wish-21", opening: "Follow what feels true.", message: "May you build a life that feels right to you, not just one that looks impressive to everyone else. Your happiness deserves a place in your plans.", category: "A life that feels like yours", isActive: true },
  { id: "wish-22", opening: "One last birthday wish.", message: "As you turn 22, may this year bring you more peace, more courage, more unforgettable memories, and more moments when you look around and think, “I'm really glad I'm here.”", category: "The year ahead", isActive: true },
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
  { x: 10, y: 34 }, { x: 12, y: 18 }, { x: 31, y: 30 }, { x: 56, y: 27 }, { x: 88, y: 31 },
  { x: 14, y: 43 }, { x: 25, y: 27 }, { x: 47, y: 44 }, { x: 84, y: 15 }, { x: 95, y: 39 },
  { x: 44, y: 25 }, { x: 63, y: 37 },
] as const;

/** Percentages of the visible cover crop on portrait viewports. */
export const wishLanternVideoPortraitPositions = [
  { x: 72.7, y: 50.9 }, { x: 47.1, y: 55.9 }, { x: 61.9, y: 32 }, { x: 12.4, y: 54.1 }, { x: 47.5, y: 31 },
  { x: 75.7, y: 26.1 }, { x: 30.2, y: 32.1 }, { x: 11.1, y: 40.8 }, { x: 44.7, y: 27.4 }, { x: 14.9, y: 23.7 },
  { x: 72.5, y: 40.2 }, { x: 58, y: 41.1 }, { x: 84.4, y: 64.8 }, { x: 90.7, y: 25 }, { x: 30.5, y: 62.7 },
  { x: 92, y: 51.2 }, { x: 87.4, y: 40.5 }, { x: 88.5, y: 26 }, { x: 27.5, y: 43.5 }, { x: 30.3, y: 23 },
  { x: 64.2, y: 62.4 }, { x: 11.6, y: 20 },
] as const;
