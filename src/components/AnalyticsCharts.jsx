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
      { name: "Restock Required", value: restock, color: "oklch(62% 0.18 15)" },  // Soft Crimson
      { name: "Optimal Stock", value: optimal, color: "oklch(74% 0.12 145)" },   // Clinical Mint
      { name: "Excessive Stock", value: excessive, color: "oklch(75% 0.13 75)" }, // Soft Amber
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

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-paper-2 border border-rule p-4 rounded-md shadow-lg text-xs font-body flex flex-col gap-2 leading-relaxed">
          <p className="font-body font-medium text-ink mb-1">{payload[0].payload.fullName}</p>
          {payload.map((entry, idx) => (
            <div key={idx} className="flex items-center justify-between gap-6">
              <span className="flex items-center gap-1.5 text-ink-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }}></span>
                {entry.name}:
              </span>
              <span className="font-semibold text-ink text-right tnum">{entry.value} units</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
      {/* Donut Chart: Inventory Health Breakdown */}
      <div className="bg-paper-2 border border-rule p-5 rounded-md flex flex-col h-[400px]">
        <div className="flex items-center gap-2 mb-4 border-b border-rule pb-3">
          <PieChartIcon className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-display font-semibold text-ink tracking-tight">Stock Health Distribution</h3>
        </div>

        {stockHealthData.length === 0 ? (
          <div className="flex-grow flex items-center justify-center text-ink-2 text-xs font-body">
            No health diagnostics
          </div>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center relative">
            <ResponsiveContainer width="100%" height={210}>
              <PieChart>
                <Pie
                  data={stockHealthData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={3}
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
                        <div className="bg-paper-2 border border-rule px-3 py-1.5 rounded-md text-xs font-body text-ink">
                          <span className="font-medium">{payload[0].name}</span>:{" "}
                          <span className="tnum">{payload[0].value} formulations</span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Legend indicators */}
            <div className="flex flex-col gap-1.5 mt-3 w-full border-t border-rule/50 pt-4 text-xs font-body">
              {stockHealthData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-ink-2">{item.name}</span>
                  </div>
                  <span className="font-semibold text-ink tnum">{item.value} ({Math.round(item.value / data.length * 100)}%)</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bar Chart: Comparison */}
      <div className="bg-paper-2 border border-rule p-5 rounded-md lg:col-span-2 flex flex-col h-[400px]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3 border-b border-rule pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-display font-semibold text-ink tracking-tight">Usable Stock vs. Reorder Thresholds</h3>
          </div>
          <div className="flex items-center gap-2 text-xs font-body">
            <button
              onClick={selectAll}
              className="px-2 py-1 bg-paper-3 hover:bg-paper-2 border border-rule hover:border-rule-hover text-ink rounded-sm transition-all focus-visible:outline-2 focus-visible:outline-accent active:scale-95 cursor-pointer"
            >
              Select All
            </button>
            <button
              onClick={selectNone}
              className="px-2 py-1 bg-paper-3 hover:bg-paper-2 border border-rule hover:border-rule-hover text-ink rounded-sm transition-all focus-visible:outline-2 focus-visible:outline-accent active:scale-95 cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Product Selection Bar with Custom Horizontal Scrollbar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 mb-3 border-b border-rule/50">
          {allProductNames.map((pName) => {
            const isSelected = selectedProducts.includes(pName);
            const isRestock = data.find((i) => i["Product Name"] === pName)?.Action.includes("RESTOCK");
            
            return (
              <button
                key={pName}
                onClick={() => toggleProduct(pName)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-body rounded-sm border flex-shrink-0 transition-all focus-visible:outline-2 focus-visible:outline-accent cursor-pointer ${
                  isSelected
                    ? "bg-accent/10 border-accent text-accent"
                    : isRestock
                    ? "bg-rose-500/5 border-rose-500/25 text-rose-400 hover:bg-rose-500/10"
                    : "bg-paper-3 border-rule text-ink-2 hover:bg-paper-2 hover:text-ink hover:border-rule-hover"
                }`}
              >
                {isSelected ? (
                  <CheckSquare className="w-3 h-3 text-accent" />
                ) : (
                  <Square className="w-3 h-3 text-ink-2" />
                )}
                {pName}
              </button>
            );
          })}
        </div>

        {/* Chart Frame */}
        <div className="flex-grow min-h-[180px]">
          {selectedProducts.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-ink-2 text-xs font-body">
              Toggle formulations above to activate comparative analytics
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="95%">
              <BarChart
                data={comparisonData}
                margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(22% 0.010 145)" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="oklch(76% 0.008 145)"
                  fontSize={9}
                  fontFamily="var(--font-body)"
                  tickLine={false}
                  axisLine={{ stroke: "oklch(22% 0.010 145)" }}
                />
                <YAxis
                  stroke="oklch(76% 0.008 145)"
                  fontSize={9}
                  fontFamily="var(--font-body)"
                  tickLine={false}
                  axisLine={{ stroke: "oklch(22% 0.010 145)" }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255, 255, 255, 0.02)" }} />
                <Legend
                  verticalAlign="top"
                  height={28}
                  iconSize={8}
                  iconType="circle"
                  wrapperStyle={{ fontSize: "10px", fontFamily: "var(--font-body)", color: "oklch(76% 0.008 145)" }}
                />
                <Bar dataKey="Usable Stock" fill="oklch(74% 0.12 145)" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Reorder Point (ROP)" fill="oklch(45% 0.05 145)" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Predicted Demand" fill="oklch(60% 0.14 250)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
