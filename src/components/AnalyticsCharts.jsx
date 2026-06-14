import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { CheckSquare, Square, BarChart3, PieChartIcon } from "lucide-react";

export default function AnalyticsCharts({ data }) {
  // Inventory Health counts
  const stockHealthData = useMemo(() => {
    const restock = data.filter((item) => item.Action.includes("RESTOCK")).length;
    const excessive = data.filter((item) => item.Action.includes("EXCESSIVE")).length;
    const optimal = data.filter((item) => item.Action.includes("OPTIMAL")).length;

    return [
      { name: "Restock Required", value: restock, color: "#f43f5e" }, // rose-500
      { name: "Optimal Stock", value: optimal, color: "#10b981" },   // emerald-500
      { name: "Excessive Stock", value: excessive, color: "#f59e0b" }, // amber-500
    ].filter(item => item.value > 0);
  }, [data]);

  // List of all product names
  const allProductNames = useMemo(() => {
    return data.map((item) => item["Product Name"]);
  }, [data]);

  // Initialize selected products for the comparison chart (default first 6 products)
  const [selectedProducts, setSelectedProducts] = useState(() => {
    // Try to pre-select items needing restock first
    const restockList = data
      .filter((item) => item.Action.includes("RESTOCK"))
      .map((item) => item["Product Name"]);
    
    if (restockList.length > 0) {
      return restockList.slice(0, 6);
    }
    return allProductNames.slice(0, 6);
  });

  // Filter comparison data based on selected products
  const comparisonData = useMemo(() => {
    return data
      .filter((item) => selectedProducts.includes(item["Product Name"]))
      .map((item) => ({
        name: item["Product Name"].split(" ")[0] + " " + (item["Product Name"].split(" ")[1] || ""), // Shortened name for x-axis
        fullName: item["Product Name"],
        "Usable Stock": item["Usable Stock"],
        "Reorder Point (ROP)": item["Reorder Point (ROP)"],
        "Predicted Demand": item["Predicted Demand (Next Month)"],
      }));
  }, [data, selectedProducts]);

  const toggleProduct = (prodName) => {
    setSelectedProducts((prev) =>
      prev.includes(prodName)
        ? prev.filter((p) => p !== prodName)
        : [...prev, prodName]
    );
  };

  const selectAll = () => {
    setSelectedProducts(allProductNames);
  };

  const selectNone = () => {
    setSelectedProducts([]);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-4 rounded-2xl border border-slate-700 bg-slate-950/90 shadow-2xl text-xs flex flex-col gap-2">
          <p className="font-semibold text-slate-100 mb-1">{payload[0].payload.fullName}</p>
          {payload.map((entry, idx) => (
            <div key={idx} className="flex items-center justify-between gap-6">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                {entry.name}:
              </span>
              <span className="font-mono font-bold text-slate-200 text-right">{entry.value} units</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full mb-8">
      {/* Donut Chart: Inventory Health Breakdown */}
      <div className="glass-panel border border-slate-800/80 bg-slate-900/10 p-6 rounded-3xl flex flex-col h-[420px]">
        <div className="flex items-center gap-2 mb-4">
          <PieChartIcon className="w-5 h-5 text-purple-400" />
          <h3 className="text-base font-semibold text-slate-200">Stock Health Distribution</h3>
        </div>

        {stockHealthData.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
            No stock health status available
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center relative">
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie
                  data={stockHealthData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {stockHealthData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="glass-panel px-3 py-2 rounded-xl text-xs bg-slate-950/95 border border-slate-800 text-slate-200">
                          <span className="font-semibold">{payload[0].name}</span>:{" "}
                          <span className="font-mono">{payload[0].value} products</span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs mt-3 w-full border-t border-slate-800/60 pt-4">
              {stockHealthData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-slate-400">{item.name}</span>
                  <span className="font-semibold text-slate-200">({item.value})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bar Chart: Comparison */}
      <div className="glass-panel border border-slate-800/80 bg-slate-900/10 p-6 rounded-3xl lg:col-span-2 flex flex-col h-[420px]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-semibold text-slate-200">Usable Stock vs. Reorder Point (ROP)</h3>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <button
              onClick={selectAll}
              className="px-2.5 py-1 bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/50 rounded-lg transition"
            >
              Select All
            </button>
            <button
              onClick={selectNone}
              className="px-2.5 py-1 bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/50 rounded-lg transition"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Product Selector Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-2 border-b border-slate-850 scrollbar-thin">
          {allProductNames.map((pName) => {
            const isSelected = selectedProducts.includes(pName);
            const isRestock = data.find((i) => i["Product Name"] === pName)?.Action.includes("RESTOCK");
            
            return (
              <button
                key={pName}
                onClick={() => toggleProduct(pName)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl border flex-shrink-0 transition-all ${
                  isSelected
                    ? "bg-purple-600/15 border-purple-500/40 text-purple-300"
                    : isRestock
                    ? "bg-rose-500/5 border-rose-500/20 text-rose-400/80 hover:bg-rose-500/10"
                    : "bg-slate-900/30 border-slate-800 text-slate-400 hover:bg-slate-800/50 hover:text-slate-300"
                }`}
              >
                {isSelected ? (
                  <CheckSquare className="w-3.5 h-3.5" />
                ) : (
                  <Square className="w-3.5 h-3.5" />
                )}
                {pName}
              </button>
            );
          })}
        </div>

        {/* Chart View */}
        <div className="flex-1 min-h-[200px]">
          {selectedProducts.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">
              Please select one or more products above to view comparison
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="95%">
              <BarChart
                data={comparisonData}
                margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: "#334155" }}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: "#334155" }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Legend
                  verticalAlign="top"
                  height={36}
                  iconSize={10}
                  iconType="circle"
                  wrapperStyle={{ fontSize: "11px", color: "#94a3b8" }}
                />
                <Bar dataKey="Usable Stock" fill="#a855f7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Reorder Point (ROP)" fill="#64748b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Predicted Demand" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
