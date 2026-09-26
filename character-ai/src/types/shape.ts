export type ShapeType = 0 | 1 | 2 | 3 | 4;

export type ShapeParameters = {
  shapeType: ShapeType;
  shapeWidth: number;
  shapeHeight: number;
  shapeSharpness: number;
  shapeRoundness: number;
  shapeBulge: number;
  shapeTaper: number;
  shapeAsymmetry: number;
};

export const BASE_SHAPE_PARAMETERS: ShapeParameters = {
  shapeType: 0,
  shapeWidth: 100,
  shapeHeight: 100,
  shapeSharpness: 0,
  shapeRoundness: 0,
  shapeBulge: 0,
  shapeTaper: 0,
  shapeAsymmetry: 0,
};

export function isShapeParameters(
  value: unknown
): value is ShapeParameters {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const parameters = value as Record<string, unknown>;

  return (
    Number.isInteger(parameters.shapeType) &&
    Number(parameters.shapeType) >= 0 &&
    Number(parameters.shapeType) <= 4 &&
    isNumberInRange(parameters.shapeWidth, 50, 150) &&
    isNumberInRange(parameters.shapeHeight, 50, 150) &&
    isNumberInRange(parameters.shapeSharpness, 0, 100) &&
    isNumberInRange(parameters.shapeRoundness, 0, 100) &&
    isNumberInRange(parameters.shapeBulge, -100, 100) &&
    isNumberInRange(parameters.shapeTaper, -100, 100) &&
    isNumberInRange(parameters.shapeAsymmetry, -100, 100)
  );
}

function isNumberInRange(
  value: unknown,
  minimum: number,
  maximum: number
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= minimum &&
    value <= maximum
  );
}

export type ShapePoint = {
  x: number;
  y: number;
};

export type ShapeSpec = {
  id: string;
  name: string;
  type: "polygon";

  points: ShapePoint[];

  fill: string;

  width: number;
  height: number;
};
