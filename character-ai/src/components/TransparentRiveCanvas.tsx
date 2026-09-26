import { useEffect, useRef } from "react";

type Props = {
  sourceCanvas: HTMLCanvasElement | null;
};

const BACKGROUND_THRESHOLD = 34;
const COLOR_TOLERANCE = 18;

function isConnectedBackgroundPixel(
  data: Uint8ClampedArray,
  offset: number
) {
  const red = data[offset];
  const green = data[offset + 1];
  const blue = data[offset + 2];

  return (
    Math.max(red, green, blue) <= BACKGROUND_THRESHOLD &&
    Math.max(red, green, blue) - Math.min(red, green, blue) <= COLOR_TOLERANCE
  );
}

function removeEdgeConnectedBackground(
  imageData: ImageData
) {
  const { data, width, height } = imageData;
  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let head = 0;
  let tail = 0;

  const enqueue = (x: number, y: number) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return;

    const pixelIndex = y * width + x;

    if (visited[pixelIndex]) return;

    const colorOffset = pixelIndex * 4;

    if (!isConnectedBackgroundPixel(data, colorOffset)) return;

    visited[pixelIndex] = 1;
    queue[tail] = pixelIndex;
    tail += 1;
  };

  for (let x = 0; x < width; x += 1) {
    enqueue(x, 0);
    enqueue(x, height - 1);
  }

  for (let y = 1; y < height - 1; y += 1) {
    enqueue(0, y);
    enqueue(width - 1, y);
  }

  while (head < tail) {
    const pixelIndex = queue[head];
    head += 1;

    data[pixelIndex * 4 + 3] = 0;

    const x = pixelIndex % width;
    const y = Math.floor(pixelIndex / width);

    enqueue(x - 1, y);
    enqueue(x + 1, y);
    enqueue(x, y - 1);
    enqueue(x, y + 1);
  }
}

export default function TransparentRiveCanvas({
  sourceCanvas,
}: Props) {
  const outputCanvasRef =
    useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const outputCanvas = outputCanvasRef.current;

    if (!sourceCanvas || !outputCanvas) return;

    const outputContext = outputCanvas.getContext("2d", {
      willReadFrequently: true,
    });

    if (!outputContext) return;

    let frameId = 0;

    const renderFrame = () => {
      const { width, height } = sourceCanvas;

      if (width > 0 && height > 0) {
        if (outputCanvas.width !== width) outputCanvas.width = width;
        if (outputCanvas.height !== height) outputCanvas.height = height;

        outputContext.clearRect(0, 0, width, height);
        outputContext.drawImage(sourceCanvas, 0, 0);

        const imageData = outputContext.getImageData(
          0,
          0,
          width,
          height
        );

        removeEdgeConnectedBackground(imageData);
        outputContext.putImageData(imageData, 0, 0);
      }

      frameId = requestAnimationFrame(renderFrame);
    };

    frameId = requestAnimationFrame(renderFrame);

    return () => cancelAnimationFrame(frameId);
  }, [sourceCanvas]);

  return (
    <canvas
      ref={outputCanvasRef}
      className="rive-processed-canvas"
      aria-hidden="true"
    />
  );
}
