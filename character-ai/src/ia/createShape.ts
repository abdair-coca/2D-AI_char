import {
  isShapeParameters,
  type ShapeParameters,
} from "../types/shape";

type CreateShapeResponse = {
  parameters: unknown;
};

export async function createShape(
  prompt: string
): Promise<ShapeParameters> {
  const response = await fetch(
    "/api/create-shape",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        prompt,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Shape generation failed: ${response.status}`
    );
  }

  const data: CreateShapeResponse =
    await response.json();

  if (!isShapeParameters(data.parameters)) {
    throw new Error("Shape model returned invalid parameters");
  }

  return data.parameters;
}
