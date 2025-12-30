"use client";

import { motion } from "framer-motion";

interface RadarChartProps {
    data: {
        label: string;
        value: number; // 0 to 100
        color: string; // HEX or CSS variable
    }[];
    size?: number;
    showBenchmark?: boolean;
}

export function RadarChart({ data, size = 320, showBenchmark = true }: RadarChartProps) {
    const center = size / 2;
    const radius = (size / 2) * 0.75;
    const angleStep = data.length > 0 ? (Math.PI * 2) / data.length : 0;

    // Ideal Benchmark Points (Fixed at 85%)
    const benchmarkPoints = data.map((_, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const distance = 0.85 * radius;
        return {
            x: center + Math.cos(angle) * distance,
            y: center + Math.sin(angle) * distance
        };
    });

    const points = data.map((d, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const distance = (Math.max(10, d.value) / 100) * radius;
        return {
            x: center + Math.cos(angle) * distance,
            y: center + Math.sin(angle) * distance,
            angle,
            distance,
            color: d.color,
            label: d.label
        };
    });

    // Background grid paths (rings)
    const gridLevels = [0.25, 0.5, 0.75, 1.0];

    return (
        <div className="relative flex items-center justify-center select-none" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="overflow-visible drop-shadow-2xl">
                {/* Glow behind the chart */}
                <defs>
                    <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="15" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                {/* Radar Rings */}
                {gridLevels.map((level, i) => {
                    const gridPoints = data.map((_, j) => {
                        const angle = j * angleStep - Math.PI / 2;
                        const distance = level * radius;
                        return `${center + Math.cos(angle) * distance},${center + Math.sin(angle) * distance}`;
                    }).join(" ");

                    return (
                        <polygon
                            key={i}
                            points={gridPoints}
                            fill="none"
                            stroke="currentColor"
                            className="text-foreground/5 dark:text-white/5"
                            strokeWidth="1"
                            strokeDasharray={i === 3 ? "0" : "4 4"}
                        />
                    );
                })}

                {/* Benchmark Radar (Ideal State - Ghost Mode) */}
                {showBenchmark && (
                    <motion.polygon
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.1 }}
                        points={benchmarkPoints.map(p => `${p.x},${p.y}`).join(" ")}
                        fill="currentColor"
                        className="text-primary no-print"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                    />
                )}

                {/* Axis & Section Wedges */}
                {points.map((p, i) => {
                    const nextP = points[(i + 1) % points.length];
                    const angleStart = p.angle;
                    const angleEnd = nextP.angle;

                    // Background segment for better visual volume
                    return (
                        <g key={`axis-${i}`}>
                            <line
                                x1={center}
                                y1={center}
                                x2={center + Math.cos(p.angle) * radius}
                                y2={center + Math.sin(p.angle) * radius}
                                stroke="currentColor"
                                className="text-foreground/10 dark:text-white/10"
                                strokeWidth="1"
                            />
                        </g>
                    );
                })}

                {/* Connection Shape (The "Blob") */}
                <motion.path
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                    d={`M ${points.map(p => `${p.x} ${p.y}`).join(" L ")} Z`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-primary hidden" // We use individual gradients instead
                />

                {/* Individual Dimension Triangles (Colored Wedges) */}
                {points.map((p, i) => {
                    const nextP = points[(i + 1) % points.length];
                    return (
                        <motion.polygon
                            key={`wedge-${i}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.15 }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                            points={`${center},${center} ${p.x},${p.y} ${nextP.x},${nextP.y}`}
                            style={{ fill: p.color }}
                        />
                    );
                })}

                {/* Main Outlines per segment with transparency */}
                {points.map((p, i) => {
                    const nextP = points[(i + 1) % points.length];
                    return (
                        <motion.line
                            key={`line-${i}`}
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.5, delay: 1 }}
                            x1={p.x}
                            y1={p.y}
                            x2={nextP.x}
                            y2={nextP.y}
                            stroke={p.color}
                            strokeWidth="1.5"
                            strokeOpacity="0.5"
                            strokeLinecap="round"
                        />
                    );
                })}

                {/* Data points (Glowing circles) */}
                {points.map((p, i) => (
                    <g key={`point-${i}`}>
                        <motion.circle
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 1.2 + i * 0.1, type: "spring" }}
                            cx={p.x}
                            cy={p.y}
                            r="4"
                            fill={p.color}
                            style={{
                                filter: `drop-shadow(0 0 6px ${p.color})`,
                                opacity: 0.8
                            }}
                        />
                    </g>
                ))}

                {/* Labels with dimension-specific colors */}
                {points.map((p, i) => {
                    const labelDist = radius + 35;
                    const lx = center + Math.cos(p.angle) * labelDist;
                    const ly = center + Math.sin(p.angle) * labelDist;

                    return (
                        <g key={`label-${i}`}>
                            <text
                                x={lx}
                                y={ly}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="text-[11px] font-black uppercase tracking-widest"
                                style={{ fill: p.color, opacity: 0.8 }}
                            >
                                {p.label}
                            </text>
                            <text
                                x={lx}
                                y={ly + 14}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="text-[14px] font-heading font-black fill-foreground dark:fill-white"
                            >
                                {data[i].value}%
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}
