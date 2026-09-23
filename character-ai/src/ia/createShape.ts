import type {
  ShapeSpec,
} from "../types/shape";

type CreateShapeResponse = {
  shape: ShapeSpec;
};

export async function createShape(
  prompt: string
): Promise<ShapeSpec> {
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

  return data.shape;
}