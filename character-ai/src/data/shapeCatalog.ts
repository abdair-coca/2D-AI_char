import type {
  CharacterState,
} from "../character/useCharacterController";

export type ShapeDefinition = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  riveState: CharacterState;
};

export const SHAPE_CATALOG: ShapeDefinition[] = [
  {
    id: "base",
    name: "Base",
    description: "La forma normal y neutral de JEV.",
    tags: [
      "normal",
      "base",
      "neutral",
      "original",
    ],
    riveState: "Base",
  },

  {
    id: "ghost",
    name: "Ghost",
    description: "JEV convertido en una forma de fantasma.",
    tags: [
      "ghost",
      "fantasma",
      "miedo",
      "terror",
      "spooky",
    ],
    riveState: "Ghost",
  },

  {
    id: "flower",
    name: "Flower",
    description: "JEV adopta una apariencia relacionada con una flor.",
    tags: [
      "flower",
      "flor",
      "flores",
      "bonito",
      "cute",
    ],
    riveState: "Flower",
  },
];

export function findExistingShape(
  message: string
): ShapeDefinition | null {
  const text = message.toLowerCase();

  for (const shape of SHAPE_CATALOG) {
    const matches = shape.tags.some((tag) =>
      text.includes(tag.toLowerCase())
    );

    if (matches) {
      return shape;
    }
  }

  return null;
}