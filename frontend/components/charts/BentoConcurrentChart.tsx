"use client";

import { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";

interface Props {
  volumeData: { week_start: string; total_volume_kg: number; days_trained: number }[];
  progressionData: { logged_on: string; max_weight_kg: number; moving_avg_7d: number }[];
  exerciseName?: string;
}

export default function BentoConcurrentChart({
  volumeData,
  progressionData,
  exerciseName = "Bench Press",
}: Props) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const [timeRange, setTimeRange] = useState<"1W" | "1M" | "3M" | "ALL">("ALL");
  const [showVolume, setShowVolume] = useState(true);
  const [showIntensity, setShowIntensity] = useState(true);

  // Filter progression based on selected time range
  const filteredProgression = [...progressionData].filter((item) => {
    if (timeRange === "ALL") return true;
    const date = new Date(item.logged_on);
    const now = new Date();
    const daysAgo = (now.getTime() - date.getTime()) / (1000 * 3600 * 24);
    if (timeRange === "1W") return daysAgo <= 7;
    if (timeRange === "1M") return daysAgo <= 30;
    if (timeRange === "3M") return daysAgo <= 90;
    return true;
  });

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current, "dark");
    }
    const chart = chartInstance.current;

    const dates = filteredProgression.map((d) => d.logged_on);
    const weights = filteredProgression.map((d) => Number(d.max_weight_kg));
    const movingAvgs = filteredProgression.map((d) => Number(d.moving_avg_7d));
    const volumes = filteredProgression.map((d) => Number((d as any).session_volume_kg || d.max_weight_kg * 24));

    const option: echarts.EChartsOption = {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(9, 9, 11, 0.95)",
        borderColor: "rgba(39, 39, 42, 0.8)",
        borderWidth: 1,
        padding: [12, 16],
        textStyle: { color: "#f4f4f5", fontSize: 12 },
        axisPointer: {
          type: "cross",
          crossStyle: { color: "rgba(59, 130, 246, 0.4)" },
          lineStyle: { color: "rgba(59, 130, 246, 0.3)", width: 1, type: "dashed" },
        },
        formatter: (params: any) => {
          if (!params || !params.length) return "";
          let html = `<div class="font-mono text-[11px] text-zinc-400 mb-1.5 pb-1 border-b border-zinc-800">${params[0].axisValue}</div>`;
          params.forEach((p: any) => {
            const isWeight = p.seriesName.includes("Weight");
            const val = Math.round(p.value).toLocaleString();
            html += `
              <div class="flex items-center justify-between gap-4 py-0.5 text-xs">
                <span class="flex items-center gap-1.5 text-zinc-300">
                  <span class="w-2 h-2 rounded-full" style="background-color: ${p.color}"></span>
                  ${p.seriesName}
                </span>
                <span class="font-bold font-mono text-white">${val} ${isWeight ? "kg" : "kg volume"}</span>
              </div>
            `;
          });
          return html;
        },
      },
      grid: {
        left: 45,
        right: 45,
        top: 25,
        bottom: 30,
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: dates,
        boundaryGap: false,
        axisLine: { lineStyle: { color: "#27272a" } },
        axisTick: { show: false },
        axisLabel: {
          color: "#71717a",
          fontSize: 10,
          fontFamily: "monospace",
          formatter: (v: string) => v.slice(5), // '10-24'
        },
        splitLine: { show: false },
      },
      yAxis: [
        {
          type: "value",
          name: "Weight (kg)",
          nameTextStyle: { color: "#71717a", fontSize: 10, align: "left" },
          position: "left",
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: "#71717a", fontSize: 10, fontFamily: "monospace" },
          splitLine: { lineStyle: { color: "#18181b", type: "dashed" } },
        },
        {
          type: "value",
          name: "Volume",
          nameTextStyle: { color: "#71717a", fontSize: 10, align: "right" },
          position: "right",
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: {
            color: "#71717a",
            fontSize: 10,
            fontFamily: "monospace",
            formatter: (v: number) => `${(v / 1000).toFixed(1)}k`,
          },
          splitLine: { show: false },
        },
      ],
      series: [
        ...(showVolume
          ? [
              {
                name: "Session Volume",
                type: "bar" as const,
                yAxisIndex: 1,
                data: volumes,
                barMaxWidth: 16,
                itemStyle: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: "rgba(16, 185, 129, 0.45)" },
                    { offset: 1, color: "rgba(16, 185, 129, 0.05)" },
                  ]),
                  borderRadius: [4, 4, 0, 0],
                },
                emphasis: {
                  itemStyle: {
                    color: "rgba(16, 185, 129, 0.7)",
                  },
                },
              },
            ]
          : []),
        ...(showIntensity
          ? [
              {
                name: "Peak Weight (kg)",
                type: "line" as const,
                yAxisIndex: 0,
                data: weights,
                smooth: true,
                symbol: "circle",
                symbolSize: 7,
                itemStyle: { color: "#3b82f6", borderColor: "#60a5fa", borderWidth: 2 },
                lineStyle: { width: 3, color: "#3b82f6" },
                areaStyle: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: "rgba(59, 130, 246, 0.25)" },
                    { offset: 1, color: "rgba(59, 130, 246, 0.0)" },
                  ]),
                },
              },
              {
                name: "7-Day Moving Avg",
                type: "line" as const,
                yAxisIndex: 0,
                data: movingAvgs,
                smooth: true,
                symbol: "none",
                lineStyle: { width: 2, color: "#f59e0b", type: "dashed" as const },
                itemStyle: { color: "#f59e0b" },
              },
            ]
          : []),
      ] as any,
    };

    chart.setOption(option);

    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [filteredProgression, showVolume, showIntensity]);

  return (
    <div className="space-y-4">
      {/* Dynamic Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-zinc-800/60">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Concurrent View:
          </span>
          <button
            onClick={() => setShowIntensity(!showIntensity)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              showIntensity
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/40"
                : "bg-zinc-800/40 text-zinc-500 border border-transparent hover:text-zinc-300"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            Peak Weight
          </button>
          <button
            onClick={() => setShowVolume(!showVolume)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              showVolume
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                : "bg-zinc-800/40 text-zinc-500 border border-transparent hover:text-zinc-300"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Volume (kg)
          </button>
        </div>

        {/* Time range pills */}
        <div className="flex items-center bg-zinc-950/80 p-0.5 rounded-xl border border-zinc-800 text-[11px]">
          {(["1W", "1M", "3M", "ALL"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeRange(t)}
              className={`px-2.5 py-1 rounded-lg font-mono transition-all ${
                timeRange === t
                  ? "bg-zinc-800 text-white font-bold shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div ref={chartRef} className="w-full h-72" />
    </div>
  );
}
