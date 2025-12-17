/** @jsx createElement */
import { createElement } from "./jsx-runtime";
import type { DataPoint } from "./data";

export interface ChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
}

export const Chart = (props: ChartProps) => {
  const width = props.width ?? 520;
  const height = props.height ?? 260;

  const ref = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // clear
    ctx.clearRect(0, 0, width, height);

    // padding
    const padL = 40;
    const padB = 30;
    const padT = 12;
    const padR = 12;

    // axes
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, height - padB);
    ctx.lineTo(width - padR, height - padB);
    ctx.stroke();

    const data = props.data;
    const max = Math.max(...data.map((d) => d.value), 1);

    const innerW = width - padL - padR;
    const innerH = height - padT - padB;

    const barW = innerW / Math.max(data.length, 1);

    // bars
    data.forEach((d, i) => {
      const barH = (d.value / max) * innerH;
      const x = padL + i * barW + barW * 0.15;
      const y = padT + (innerH - barH);
      ctx.fillRect(x, y, barW * 0.7, barH);

      // labels
      ctx.font = "12px system-ui";
      ctx.fillText(d.label, x, height - 10);
    });
  };

  return <canvas className="chart" width={width} height={height} ref={ref} />;
};
