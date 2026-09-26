import { readFileSync } from "node:fs";

import {
    isShapeParameters,
    type ShapeParameters,
} from "../src/types/shape.js";

type GroqResponse = {
    choices?: Array<{
        message?: {
            content?: unknown;
        };
    }>;
};

function isValidShapeParameters(
    value: unknown
): value is ShapeParameters {
    if (
        typeof value !== "object" ||
        value === null
    ) {
        return false;
    }

    return isShapeParameters(value) && value.shapeType !== 0;
}

export default async function handler(
    request: any,
    response: any
) {
    if (request.method !== "POST") {
        return response.status(405).json({
            error: "Method not allowed",
        });
    }

    const prompt = request.body?.prompt;

    if (
        typeof prompt !== "string" ||
        !prompt.trim()
    ) {
        return response.status(400).json({
            error: "Prompt is required",
        });
    }

    let apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        for (const envFile of [
            ".env.local",
            "character-ai/.env.local",
        ]) {
            try {
                const envText = readFileSync(envFile, "utf8");
                const keyLine = envText.match(
                    /^\s*GROQ_API_KEY\s*=\s*(.*?)\s*$/m
                );

                if (keyLine?.[1]) {
                    apiKey = keyLine[1].replace(
                        /^("|')|("|')$/g,
                        ""
                    );
                    break;
                }
            } catch {
                // Try the next local project path.
            }
        }
    }

    if (!apiKey) {
        return response.status(500).json({
            error: "GROQ_API_KEY is missing",
        });
    }

    try {
        const llmResponse = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",

                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },

                body: JSON.stringify({
                    model: "openai/gpt-oss-20b",

                    temperature: 0.4,

                    messages: [
                        {
                            role: "system",
                            content: `
You generate a procedural shape configuration
for a small animated character named JEV.

The shape will be rendered natively by a Rive
Path Effect Script. Do not generate SVG or points.

RULES:

- Choose shapeType 1 for rounded square, 2 for diamond,
  3 for triangle, or 4 for organic blob.
- Use shapeWidth and shapeHeight from 50 to 150.
- Use shapeSharpness and shapeRoundness from 0 to 100.
- Use shapeBulge, shapeTaper, and shapeAsymmetry
  from -100 to 100.
- Prefer neutral values unless the user's request needs
  a specific deformation.
- Return only the requested shape parameters.
              `,
                        },

                        {
                            role: "user",
                            content: prompt,
                        },
                    ],

                    response_format: {
                        type: "json_schema",

                        json_schema: {
                            name: "jev_shape",

                            strict: true,

                            schema: {
                                type: "object",

                                properties: {
                                    shapeType: {
                                        type: "integer",
                                        minimum: 1,
                                        maximum: 4,
                                    },
                                    shapeWidth: {
                                        type: "number",
                                        minimum: 50,
                                        maximum: 150,
                                    },
                                    shapeHeight: {
                                        type: "number",
                                        minimum: 50,
                                        maximum: 150,
                                    },
                                    shapeSharpness: {
                                        type: "number",
                                        minimum: 0,
                                        maximum: 100,
                                    },
                                    shapeRoundness: {
                                        type: "number",
                                        minimum: 0,
                                        maximum: 100,
                                    },
                                    shapeBulge: {
                                        type: "number",
                                        minimum: -100,
                                        maximum: 100,
                                    },
                                    shapeTaper: {
                                        type: "number",
                                        minimum: -100,
                                        maximum: 100,
                                    },
                                    shapeAsymmetry: {
                                        type: "number",
                                        minimum: -100,
                                        maximum: 100,
                                    },
                                },

                                required: [
                                    "shapeType",
                                    "shapeWidth",
                                    "shapeHeight",
                                    "shapeSharpness",
                                    "shapeRoundness",
                                    "shapeBulge",
                                    "shapeTaper",
                                    "shapeAsymmetry",
                                ],

                                additionalProperties: false,
                            },
                        },
                    },
                }),
            }
        );

        if (!llmResponse.ok) {
            const errorText =
                await llmResponse.text();

            console.error(
                "Groq error:",
                llmResponse.status,
                errorText
            );

            return response.status(502).json({
                error: "Shape model failed",
            });
        }

        const data =
            await llmResponse.json() as GroqResponse;

        const content =
            data.choices?.[0]?.message?.content;

        if (
            typeof content !== "string" ||
            !content
        ) {
            return response.status(502).json({
                error: "Model returned no geometry",
            });
        }

        const parameters =
            JSON.parse(content);

        if (!isValidShapeParameters(parameters)) {
            console.error(
                "Invalid shape parameters:",
                parameters
            );

            return response.status(422).json({
                error: "Invalid generated parameters",
            });
        }

        return response.status(200).json({
            parameters: parameters as ShapeParameters,
        });
    } catch (error) {
        console.error(
            "Shape generation error:",
            error
        );

        return response.status(500).json({
            error: "Shape generation failed",
        });
    }
}
