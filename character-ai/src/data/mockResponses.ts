
import type {
  CharacterState,
} from "../character/useCharacterController";

export type MockReply = {
  message: string;
  reaction?: CharacterState;
};

export function getMockReply(
  message: string
): MockReply {
  const text = message.toLowerCase();

  if (
    text.includes("hola") ||
    text.includes("hello")
  ) {
    return {
      message: "¡Hola! Me alegra mucho verte.",
      reaction: "Hello",
    };
  }

  if (
    text.includes("fantasma") ||
    text.includes("miedo")
  ) {
    return {
      message: "Buuu... ahora me dio curiosidad.",
    };
  }

  if (
    text.includes("flor") ||
    text.includes("bonito")
  ) {
    return {
      message: "Creo que esto merece una flor.",
    };
  }

  return {
    message:
      "Hmm... eso está interesante. Cuéntame más.",
  };
}