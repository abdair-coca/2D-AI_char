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