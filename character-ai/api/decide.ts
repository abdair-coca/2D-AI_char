import {
  choice,
  TypeSafeClient,
} from "@typesafe-ai/sdk";

type NodeRequest = {
  method?: string;
  body?: unknown;
};

type NodeResponse = {
  status: (statusCode: number) => NodeResponse;
  json: (body: unknown) => NodeResponse;
};

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

        availableShapes: [
          {
            id: "base",
            description:
              "JEV's normal/default appearance",
          },
          {
            id: "ghost",
            description:
              "JEV transformed into a ghost",
          },
          {
            id: "flower",
            description:
              "JEV transformed into a flower-like appearance",
          },
        ],
      },

      questions: {
        visualAction: choice(
          `
Decide what visual action JEV should take.

Choose "ghost" or "flower" only when the user
actually wants JEV to visually transform into
one of those existing shapes.

Choose "base" when the user explicitly asks
JEV to return to its normal appearance.

Choose "create_new" when the user asks JEV
to transform into something that is not
currently available.

Choose "none" when the user is simply talking
and is not requesting a visual transformation.
          `,
          {
            base: null,
            ghost: null,
            flower: null,
            create_new: null,
            none: null,
          }
        ),
      },
    });

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