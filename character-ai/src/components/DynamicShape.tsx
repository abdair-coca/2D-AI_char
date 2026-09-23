import type {
  ShapeSpec,
} from "../types/shape";

type Props = {
  shape: ShapeSpec | null;
};

export default function DynamicShape({
  shape,
}: Props) {
  if (!shape) return null;

  const points = shape.points
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  return (
    <svg
      viewBox="0 0 100 100"
      style={{
        position: "absolute",
        width: `${shape.width}px`,
        height: `${shape.height}px`,
        pointerEvents: "none",
      }}
    >
      <polygon
        points={points}
        fill={shape.fill}
      />
    </svg>
  );
}