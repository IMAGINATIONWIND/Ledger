"use client";

import { useEffect, useRef } from "react";
import * as echarts from "echarts";
import type { ProgressionRow } from "@/lib/api";

interface Props {
  data: ProgressionRow[];
  exercise: string;
}

export default function ProgressionLineChart({ data, exercise }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || data.length === 0) return;
    const chart = echarts.init(ref.current, "dark");

    chart.setOption({
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        formatter: (params: any) => {
          const [actual, avg] = params;
          return `<b>${actual.name}</b><br/>
            Max: <b>${actual.value} kg</b><br/>
            7d avg: <b>${avg?.value ?? "—"} kg</b>`;
        },
      },
      legend: {
        data: ["Max Weight", "7-day Avg"],
        textStyle: { color: "#a1a1aa" },
        top: 0,
      },
      xAxis: {
        type: "category",
        data: data.map((d) => d.logged_on),
        axisLabel: { color: "#71717a", fontSize: 10, rotate: 30 },
        axisLine: { lineStyle: { color: "#27272a" } },
      },
      yAxis: {
        type: "value",
        name: "kg",
        nameTextStyle: { color: "#71717a" },
        axisLabel: { color: "#71717a" },
        splitLine: { lineStyle: { color: "#27272a" } },
      },
      series: [
        {
          name: "Max Weight",
          type: "line",
          data: data.map((d) => d.max_weight_kg),
          smooth: true,
          symbol: "circle",
          symbolSize: 6,
          itemStyle: { color: "#3b82f6" },
          lineStyle: { color: "#3b82f6", width: 2 },
          areaStyle: { color: "rgba(59,130,246,0.08)" },
        },
        {
          name: "7-day Avg",
          type: "line",
          data: data.map((d) => d.moving_avg_7d),
          smooth: true,
          symbol: "none",
          itemStyle: { color: "#f59e0b" },
          lineStyle: { color: "#f59e0b", width: 2, type: "dashed" },
        },
      ],
      dataZoom: [{ type: "inside" }, { type: "slider", height: 20, bottom: 0 }],
      grid: { left: 45, right: 10, top: 40, bottom: 60 },
    });

    const onResize = () => chart.resize();
    window.addEventListener("resize", onResize);
    return () => { chart.dispose(); window.removeEventListener("resize", onResize); };
  }, [data, exercise]);

  return <div ref={ref} style={{ width: "100%", height: 300 }} />;
}
