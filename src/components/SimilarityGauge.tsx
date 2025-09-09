import React, { useState, useEffect } from "react";
import { Box, Typography, useTheme } from "@mui/material";

function getColor(pct: number): string {
  let r: number, g: number, b: number = 0;
  if (pct <= 50) {
    // green to yellow
    r = Math.round(255 * (pct / 50));
    g = 255;
  } else {
    // yellow to red
    r = 255;
    g = Math.round(255 * ((50 - (pct - 50)) / 50));
  }
  return `rgb(${r},${g},${b})`;
}

export function SimilarityGauge({ value, label }: { value: number; label: string }) {
  const theme = useTheme();
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    let start: number | null = null;
    const duration = 1000; // milliseconds

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const easedProgress = Math.min(1, progress / duration);
      const currentValue = easedProgress * value;
      setAnimatedValue(parseFloat(currentValue.toFixed(2)));

      if (progress < duration) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  const radius = 60;
  const stroke = 12;
  const c = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(100, animatedValue));
  const dash = (pct / 100) * c;
  const color = getColor(pct);

  return (
    <Box sx={{ textAlign: 'center' }}>
      <svg width="160" height="160">
        <circle
          cx="80"
          cy="80"
          r={radius}
          strokeWidth={stroke}
          stroke={theme.palette.grey[800]}
          fill="none"
        />
        <circle
          cx="80"
          cy="80"
          r={radius}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          transform="rotate(-90 80 80)"
          stroke={color}
          fill="none"
        />
        <text
          x="80"
          y="80"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="24"
          fontWeight="bold"
          fill={theme.palette.text.primary}
        >
          {animatedValue}%
        </text>
      </svg>
      <Typography variant="caption" component="div" sx={{ mt: 1 }}>
        {label}
      </Typography>
    </Box>
  );
}
