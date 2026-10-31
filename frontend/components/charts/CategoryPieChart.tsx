"use client";

import { useEffect, useRef } from "react";
import * as echarts from "echarts";
import type { CategoryStat } from "@/lib/api";

export default function CategoryPieChart({ data }: { data: CategoryStat[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || data.length === 0) return;
    const chart = echarts.init(ref.current, "dark");

    const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

    chart.setOption({
      backgroundColor: "transparent",
      tooltip: {
        trigger: "item",
        formatter: ({ name, value, percent }: any) =>
          `<b>${name}</b><br/>${Math.round(value).toLocaleString()} kg (${percent}%)`,
      },
      legend: {
        orient: "vertical",
        right: 0,
        top: "center",
        textStyle: { color: "#a1a1aa", fontSize: 12 },
      },
      series: [
        {
          type: "pie",
          radius: ["40%", "70%"],
          center: ["40%", "50%"],
          data: data.map((d, i) => ({
            name: d.category,
            value: d.total_volume_kg,
            itemStyle: { color: COLORS[i % COLORS.length] },
          })),
          label: { show: false },
          emphasis: {
            itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: "rgba(0,0,0,0.5)" },
          },
        },
      ],
    });

    const onResize = () => chart.resize();
    window.addEventListener("resize", onResize);
    return () => { chart.dispose(); window.removeEventListener("resize", onResize); };
  }, [data]);

  return <div ref={ref} style={{ width: "100%", height: 240 }} />;
}
