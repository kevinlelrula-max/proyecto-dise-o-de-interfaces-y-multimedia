import { useEffect, useState } from "react";
import { getReporteProductos } from "../services/api";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell, Legend
} from "recharts";

// Paleta monocromática verde — consistente con el branding
const COLORS = ["#0F6E56", "#1A9070", "#34b48a", "#5ecba1", "#90dbb8", "#bfedd3"];

const Reportes = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      const res = await getReporteProductos(token);
      const dataFix = res.map(item => ({
        ...item,
        total_vendido: Number(item.total_vendido),
      }));
      setData(dataFix);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "24px", color: "#64748b", fontSize: "14px" }}>
        Cargando reportes...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div style={s.page}>
        <div style={s.empty}>
          <span style={{ fontSize: "40px", display: "block", marginBottom: "12px" }}></span>
          <p style={{ fontSize: "15px", color: "#64748b" }}>No hay datos de ventas disponibles</p>
        </div>
      </div>
    );
  }

  const totalVendido = data.reduce((acc, p) => acc + p.total_vendido, 0);
  const topProducto = data.reduce((a, b) => a.total_vendido > b.total_vendido ? a : b);
  const totalProductos = data.length;

  // Tooltip personalizado para BarChart
  const CustomTooltipBar = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={s.tooltip}>
          <p style={s.tooltipLabel}>{label}</p>
          <p style={s.tooltipValue}>{payload[0].value} unidades</p>
        </div>
      );
    }
    return null;
  };

  // Tooltip personalizado para PieChart
  const CustomTooltipPie = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const pct = ((payload[0].value / totalVendido) * 100).toFixed(1);
      return (
        <div style={s.tooltip}>
          <p style={s.tooltipLabel}>{payload[0].name}</p>
          <p style={s.tooltipValue}>{payload[0].value} und · {pct}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={s.page}>

      {/* HEADER */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <span style={{ fontSize: "22px" }}>📊</span>
          <h2 style={s.headerTitle}>Reportes de Ventas</h2>
        </div>
      </div>

      {/* STAT CARDS */}
      <div style={s.statsRow}>
        <div style={s.statCard}>
          <span style={s.statLabel}>Total unidades vendidas</span>
          <span style={{ ...s.statValue, color: "#0F6E56" }}>{totalVendido}</span>
        </div>
        <div style={s.statCard}>
          <span style={s.statLabel}>Productos con ventas</span>
          <span style={s.statValue}>{totalProductos}</span>
        </div>
        <div style={s.statCard}>
          <span style={s.statLabel}>Producto estrella</span>
          <span style={{ ...s.statValue, fontSize: "16px", color: "#0F6E56" }}>
            {topProducto.nombre}
          </span>
        </div>
      </div>

      {/* GRÁFICAS — grid 2 columnas */}
      <div style={s.chartsGrid}>

        {/* BAR CHART */}
        <div style={s.chartCard}>
          <div style={s.chartHeader}>
            <h3 style={s.chartTitle}>Productos más vendidos</h3>
            <span style={s.chartSubtitle}>Unidades totales por producto</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="nombre"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                angle={-35}
                textAnchor="end"
                interval={0}
              />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Tooltip content={<CustomTooltipBar />} />
              <Bar dataKey="total_vendido" radius={[8, 8, 0, 0]} fill="#0F6E56" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* PIE CHART */}
        <div style={s.chartCard}>
          <div style={s.chartHeader}>
            <h3 style={s.chartTitle}>Distribución de ventas</h3>
            <span style={s.chartSubtitle}>Participación por producto</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                dataKey="total_vendido"
                nameKey="nombre"
                cx="50%"
                cy="45%"
                outerRadius={100}
                innerRadius={50}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltipPie />} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* TOP PRODUCTOS — tabla */}
      <div style={s.tableCard}>
        <div style={s.chartHeader}>
          <h3 style={s.chartTitle}>Ranking de productos</h3>
          <span style={s.chartSubtitle}>Ordenado por unidades vendidas</span>
        </div>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>#</th>
              <th style={s.th}>Producto</th>
              <th style={s.th}>Unidades vendidas</th>
              <th style={s.th}>Participación</th>
            </tr>
          </thead>
          <tbody>
            {[...data]
              .sort((a, b) => b.total_vendido - a.total_vendido)
              .map((p, i) => {
                const pct = ((p.total_vendido / totalVendido) * 100).toFixed(1);
                return (
                  <tr key={i} style={s.row}>
                    <td style={s.tdRank}>
                      <span style={{
                        ...s.rankBadge,
                        backgroundColor: i === 0 ? "#fef9c3" : i === 1 ? "#f1f5f9" : "#f8fafc",
                        color: i === 0 ? "#854d0e" : "#64748b",
                      }}>
                        {i + 1}
                      </span>
                    </td>
                    <td style={s.td}>
                      <div style={s.productRow}>
                        <div style={{ ...s.colorDot, backgroundColor: COLORS[i % COLORS.length] }} />
                        <span style={s.productName}>{p.nombre}</span>
                      </div>
                    </td>
                    <td style={s.td}>
                      <span style={s.units}>{p.total_vendido}</span>
                    </td>
                    <td style={s.td}>
                      <div style={s.barWrap}>
                        <div style={{ ...s.barFill, width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                        <span style={s.pctLabel}>{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default Reportes;

const s = {
  page: { padding: "24px" },

  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  headerLeft: { display: "flex", alignItems: "center", gap: "10px" },
  headerTitle: { fontSize: "20px", fontWeight: "700", color: "#0f172a", margin: 0 },

  statsRow: { display: "flex", gap: "12px", marginBottom: "20px" },
  statCard: {
    flex: 1, backgroundColor: "#f8fafc", borderRadius: "12px",
    padding: "12px 16px", display: "flex", flexDirection: "column", gap: "4px",
    border: "1px solid #e2e8f0",
  },
  statLabel: { fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" },
  statValue: { fontSize: "22px", fontWeight: "700", color: "#0f172a" },

  chartsGrid: {
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: "16px", marginBottom: "16px",
  },
  chartCard: {
    backgroundColor: "white", borderRadius: "14px",
    border: "1px solid #e2e8f0", padding: "20px 24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  tableCard: {
    backgroundColor: "white", borderRadius: "14px",
    border: "1px solid #e2e8f0", padding: "20px 24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  chartHeader: { marginBottom: "16px" },
  chartTitle: { fontSize: "15px", fontWeight: "700", color: "#0f172a", margin: "0 0 4px" },
  chartSubtitle: { fontSize: "12px", color: "#94a3b8" },

  // Tooltip
  tooltip: {
    backgroundColor: "#0f172a", borderRadius: "8px",
    padding: "8px 12px", border: "none",
  },
  tooltipLabel: { fontSize: "12px", color: "rgba(255,255,255,0.6)", marginBottom: "2px" },
  tooltipValue: { fontSize: "14px", fontWeight: "700", color: "white" },

  // Tabla ranking
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    padding: "10px 12px", textAlign: "left",
    fontSize: "11px", fontWeight: "700", color: "#94a3b8",
    textTransform: "uppercase", letterSpacing: "0.05em",
    borderBottom: "1px solid #e2e8f0",
  },
  row: { borderBottom: "1px solid #f1f5f9" },
  tdRank: { padding: "12px 12px", width: "48px" },
  td: { padding: "12px 12px", fontSize: "14px", color: "#334155" },
  rankBadge: {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    width: "26px", height: "26px", borderRadius: "6px",
    fontSize: "12px", fontWeight: "700",
  },
  productRow: { display: "flex", alignItems: "center", gap: "10px" },
  colorDot: { width: "10px", height: "10px", borderRadius: "50%", flexShrink: 0 },
  productName: { fontWeight: "500", color: "#0f172a" },
  units: { fontWeight: "700", color: "#0f172a" },
  barWrap: { display: "flex", alignItems: "center", gap: "8px" },
  barFill: { height: "6px", borderRadius: "999px", minWidth: "4px", maxWidth: "160px" },
  pctLabel: { fontSize: "12px", color: "#64748b", whiteSpace: "nowrap" },

  empty: { textAlign: "center", padding: "60px 20px" },
};
