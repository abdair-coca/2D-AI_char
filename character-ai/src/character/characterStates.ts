export const CHARACTER_STATES = [
  "Base",
  "Hello",
  "Ghost",
  "Flower",
  "Talk",
  "Cloud",
  "MorphState",
  "triangle",
  "square",
  "think",
  "yes",
  "no",
  "Talk",
  "talkB",
  "talkC",
  "talkBC",
] as const;

export type CharacterState = (typeof CHARACTER_STATES)[number];
