import { readFileSync } from "node:fs";

type Point = {
    x: number;
    y: number;
};

type GeneratedGeometry = {
    name: string;
    points: Point[];
};

function isValidGeometry(
    value: unknown
): value is GeneratedGeometry {
    if (
        typeof value !== "object" ||
        value === null
    ) {
        return false;
    }

    const geometry =
        value as GeneratedGeometry;

    if (
        typeof geometry.name !== "string" ||
        geometry.name.length < 1 ||
        geometry.name.length > 50
    ) {
        return false;
    }

    if (
        !Array.isArray(geometry.points) ||
        geometry.points.length < 3 ||
        geometry.points.length > 24
    ) {
        return false;
    }

    return geometry.points.every(
        (point) =>
            typeof point.x === "number" &&
            typeof point.y === "number" &&
            point.x >= 0 &&
            point.x <= 100 &&
            point.y >= 0 &&
            point.y <= 100
    );
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
You generate simple recognizable 2D silhouettes
for a small animated character named JEV.

The output will be rendered as one SVG polygon.

RULES:

- Work inside a 100x100 coordinate system.
- x and y must always be between 0 and 100.
- Create a recognizable silhouette based on the user's request.
- Prefer approximately 8 to 18 points.
- The polygon should occupy most of the canvas.
- Keep the silhouette centered.
- Prefer simple iconic shapes instead of detailed drawings.
- Avoid tiny details.
- Do not generate text.
- Do not generate SVG.
- Do not generate code.
- Only describe the geometry through points.
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
                                    name: {
                                        type: "string",
                                    },

                                    points: {
                                        type: "array",

                                        items: {
                                            type: "object",

                                            properties: {
                                                x: {
                                                    type: "number",
                                                },

                                                y: {
                                                    type: "number",
                                                },
                                            },

                                            required: ["x", "y"],

                                            additionalProperties: false,
                                        },
                                    },
                                },

                                required: [
                                    "name",
                                    "points",
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

        const data = await llmResponse.json();

        const content =
            data.choices?.[0]?.message?.content;

        if (!content) {
            return response.status(502).json({
                error: "Model returned no geometry",
            });
        }

        const geometry =
            JSON.parse(content);

        if (!isValidGeometry(geometry)) {
            console.error(
                "Invalid geometry:",
                geometry
            );

            return response.status(422).json({
                error: "Invalid generated geometry",
            });
        }

        const shape = {
            id: crypto.randomUUID(),

            name: geometry.name,

            type: "polygon" as const,

            points: geometry.points,

            fill: "white",

            width: 180,
            height: 180,
        };

        return response.status(200).json({
            shape,
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