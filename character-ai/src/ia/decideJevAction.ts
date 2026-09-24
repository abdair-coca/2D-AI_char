import type {
  CharacterState,
} from "../character/useCharacterController";

export type JevDecision =
  | CharacterState
  | "create_new";

type DecideResponse = {
  decision: JevDecision;
};

export async function decideJevAction(
  prompt: string
): Promise<JevDecision> {
  const response = await fetch("/api/decide", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Decision request failed: ${response.status}`
    );
  }

  const data: DecideResponse =
    await response.json();

  return data.decision;
}
