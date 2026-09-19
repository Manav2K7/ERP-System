import PropTypes from "prop-types";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Paper, Stack, Typography } from "@mui/material";

/**
 * THE one chart wrapper (F7) — every dashboard widget and report chart renders
 * through this; no ad hoc Recharts usage elsewhere (rules.md §1).
 */
export default function SummaryChart({
  title,
  subtitle,
  data,
  xKey,
  series,
  type = "line",
  height = 280,
  currency = true,
}) {
  const colorPalette = ["#1976d2", "#9c27b0", "#ed6c02", "#2e7d32"];

  return (
    <Paper sx={{ p: 2, height: "100%" }}>
      <Stack spacing={1}>
        {(title || subtitle) && (
          <div>
            {title && <Typography variant="subtitle2">{title}</Typography>}
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </div>
        )}
        <ResponsiveContainer width="100%" height={height}>
          {type === "bar" ? (
            <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xKey} fontSize={12} />
              <YAxis fontSize={12} tickFormatter={(v) => (currency ? `₹${v}` : v)} width={70} />
              <Tooltip formatter={(v) => (currency ? `₹${Number(v).toLocaleString("en-IN")}` : v)} />
              {series.length > 1 && <Legend />}
              {series.map((s, i) => (
                <Bar
                  key={s.key}
                  dataKey={s.key}
                  name={s.name}
                  fill={s.color || colorPalette[i % colorPalette.length]}
                  radius={[3, 3, 0, 0]}
                />
              ))}
            </BarChart>
          ) : (
            <LineChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xKey} fontSize={12} />
              <YAxis fontSize={12} tickFormatter={(v) => (currency ? `₹${v}` : v)} width={70} />
              <Tooltip formatter={(v) => (currency ? `₹${Number(v).toLocaleString("en-IN")}` : v)} />
              {series.length > 1 && <Legend />}
              {series.map((s, i) => (
                <Line
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.name}
                  stroke={s.color || colorPalette[i % colorPalette.length]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </Stack>
    </Paper>
  );
}

SummaryChart.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  data: PropTypes.array.isRequired,
  xKey: PropTypes.string.isRequired,
  series: PropTypes.array.isRequired,
  type: PropTypes.oneOf(["line", "bar"]),
  height: PropTypes.number,
  currency: PropTypes.bool,
};
