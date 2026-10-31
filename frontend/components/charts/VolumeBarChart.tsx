"use client";

import { useEffect, useRef } from "react";
import * as echarts from "echarts";
import type { WeeklyStat } from "@/lib/api";

export default function VolumeBarChart({ data }: { data: WeeklyStat[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || data.length === 0) return;
    const chart = echarts.init(ref.current, "dark");

    const sorted = [...data].reverse(); // oldest → newest

    chart.setOption({
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        formatter: (params: any) => {
          const d = params[0];
          return `<b>${d.name}</b><br/>Volume: <b>${Math.round(d.value).toLocaleString()} kg</b>`;
        },
      },
      xAxis: {
        type: "category",
        data: sorted.map((w) => w.week_start),
        axisLabel: { color: "#71717a", fontSize: 11, rotate: 30 },
        axisLine: { lineStyle: { color: "#27272a" } },
      },
      yAxis: {
        type: "value",
        axisLabel: { color: "#71717a", formatter: (v: number) => `${(v / 1000).toFixed(0)}k` },
        splitLine: { lineStyle: { color: "#27272a" } },
      },
      series: [
        {
          type: "bar",
          data: sorted.map((w) => w.total_volume_kg),
          barMaxWidth: 40,
          itemStyle: { color: "#3b82f6", borderRadius: [4, 4, 0, 0] },
          emphasis: { itemStyle: { color: "#60a5fa" } },
        },
      ],
      grid: { left: 40, right: 10, top: 10, bottom: 50 },
    });

    const onResize = () => chart.resize();
    window.addEventListener("resize", onResize);
    return () => { chart.dispose(); window.removeEventListener("resize", onResize); };
  }, [data]);

  return <div ref={ref} style={{ width: "100%", height: 240 }} />;
}
