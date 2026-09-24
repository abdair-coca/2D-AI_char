import {
  choice,
  TypeSafeClient,
} from "@typesafe-ai/sdk";

import {
  CHARACTER_STATES,
  type CharacterState,
} from "../src/character/characterStates.js";

type NodeRequest = {
  method?: string;
  body?: unknown;
};

type NodeResponse = {
  status: (statusCode: number) => NodeResponse;
  json: (body: unknown) => NodeResponse;
};

const stateDescriptions: Record<CharacterState, string> = {
  Base: "JEV's normal/default appearance",
  Hello: "JEV greeting the user",
  Ghost: "JEV transformed into a ghost",
  Flower: "JEV transformed into a flower-like appearance",
  Talk: "JEV's standard talking animation",
  Cloud: "JEV thinking while covered by a cloud",
  MorphState: "JEV's morph state",
  triangle: "JEV in the triangle shape state",
  square: "JEV in the square shape state",
  think: "JEV thinking",
  yes: "JEV expressing yes or agreement",
  no: "JEV expressing no or disagreement",
  talkB: "JEV's talking variation B",
  talkC: "JEV's talking variation C",
  talkBC: "JEV's combined talking variation BC",
};

const availableStates = [
  ...new Set(CHARACTER_STATES),
].map((id) => ({
  id,
  description: stateDescriptions[id],
}));

const decisionOptions = {
  ...Object.fromEntries(
    [...new Set(CHARACTER_STATES)].map((state) => [
      state,
      null,
    ])
  ),
  create_new: null,
} as Record<
  CharacterState | "create_new",
  null
>;

export default async function handler(
  request: NodeRequest,
  response: NodeResponse
) {
  if (request.method !== "POST") {
    return response.status(405).json({
      error: "Method not allowed",
    });
  }

  let body: unknown;

  try {
    body = request.body;

    if (typeof body === "string") {
      body = JSON.parse(body);
    }
  } catch {
    return response.status(400).json({
      error: "Request body must be valid JSON",
    });
  }

  const prompt =
    typeof body === "object" && body !== null && "prompt" in body
      ? body.prompt
      : undefined;

  if (typeof prompt !== "string" || prompt.trim() === "") {
    return response.status(400).json({
      error: "Prompt must be a non-empty string",
    });
  }

  try {
    const client = new TypeSafeClient();
    const result = await client.systemOne({
      state: {
        userPrompt: prompt.trim(),

        availableStates,
      },

      questions: {
        visualAction: choice(
          `
Decide what visual action JEV should take.

Choose "Ghost" or "Flower" only when the user
actually wants JEV to visually transform into
one of those existing shapes.

Choose "Base" when the user explicitly asks
JEV to return to its normal appearance.

Choose "Hello" when JEV should greet the user.

Choose "Talk" when JEV should use its standard
talking animation.

Choose "Cloud" when JEV should think under a cloud.

Choose "MorphState", "triangle", or "square"
when the user explicitly requests that test or shape
state.

Choose "think" when JEV should visibly think.

Choose "yes" or "no" when JEV should express
agreement or disagreement.

Choose "talkB", "talkC", or "talkBC" when a
specific talking variation is requested.

Choose "create_new" when the user asks JEV
to transform into something that is not
currently available.

Choose an existing state whenever one matches the
user's requested interaction. Use "create_new" only
when no existing state matches the requested form.
          `,
          decisionOptions
        ),
      },
    });

    console.log(result.answers.visualAction.choice)

    return response.status(200).json({
      decision:
        result.answers.visualAction.choice,
    });
  } catch (error) {
    console.error("JEV decision error:", error);

    return response.status(500).json({
      error: "JEV decision failed",
    });
  }
}
