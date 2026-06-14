import React from "react";
import { AlertOctagon, TrendingUp, CalendarDays, ClipboardList } from "lucide-react";

export default function KPICards({ data }) {
  // Counts
  const totalItems = data.length;
  const restockItems = data.filter((item) => item.Action.includes("RESTOCK")).length;
  const excessiveItems = data.filter((item) => item.Action.includes("EXCESSIVE")).length;
  const expiryHazardItems = data.filter((item) => item["Risky Stock (Near Expiry)"] > 0).length;

  const cards = [
    {
      title: "Procurement Restocks",
      value: restockItems,
      total: totalItems,
      label: "Needing Restock",
      desc: `${Math.round((restockItems / (totalItems || 1)) * 100)}% of catalog needs replenishment`,
      icon: AlertOctagon,
      textColor: "text-rose-400",
      borderColor: "border-rose-500/20",
      bgColor: "bg-rose-500/5",
      glowClass: "glow-red",
      iconBg: "bg-rose-500/10",
      progressColor: "bg-rose-500",
    },
    {
      title: "Overstock Holdings",
      value: excessiveItems,
      total: totalItems,
      label: "Excessive Inventory",
      desc: `${Math.round((excessiveItems / (totalItems || 1)) * 100)}% of catalog is overstocked`,
      icon: TrendingUp,
      textColor: "text-amber-400",
      borderColor: "border-amber-500/20",
      bgColor: "bg-amber-500/5",
      glowClass: "glow-orange",
      iconBg: "bg-amber-500/10",
      progressColor: "bg-amber-500",
    },
    {
      title: "Expiry Hazard Items",
      value: expiryHazardItems,
      total: totalItems,
      label: "Expiry Risk (≤120d)",
      desc: `${Math.round((expiryHazardItems / (totalItems || 1)) * 100)}% of items have short-dated batches`,
      icon: CalendarDays,
      textColor: "text-emerald-400",
      borderColor: "border-emerald-500/20",
      bgColor: "bg-emerald-500/5",
      glowClass: "glow-green",
      iconBg: "bg-emerald-500/10",
      progressColor: "bg-emerald-500",
    },
    {
      title: "Active Catalog Products",
      value: totalItems,
      total: totalItems,
      label: "Total Products Listed",
      desc: "Unique items processed in current simulation",
      icon: ClipboardList,
      textColor: "text-purple-400",
      borderColor: "border-purple-500/20",
      bgColor: "bg-purple-500/5",
      glowClass: "glow-purple",
      iconBg: "bg-purple-500/10",
      progressColor: "bg-purple-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-8">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        const percent = totalItems > 0 ? (card.value / totalItems) * 100 : 0;
        
        return (
          <div
            key={idx}
            className={`glass-panel glass-panel-hover flex flex-col p-6 rounded-3xl border transition-all duration-300 ${card.borderColor} ${card.bgColor} ${card.glowClass}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  {card.title}
                </p>
                <h3 className="text-3xl font-bold text-slate-100 font-mono tracking-tight">
                  {card.value}
                </h3>
              </div>
              <div className={`p-3 rounded-2xl ${card.iconBg} ${card.textColor}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
            
            <div className="mt-auto">
              <div className="w-full bg-slate-950/80 rounded-full h-1.5 mb-3.5 border border-slate-900">
                <div
                  className={`h-full rounded-full ${card.progressColor}`}
                  style={{ width: `${percent}%` }}
                ></div>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-slate-200">{card.label}</span>
                <span className="text-xs text-slate-400 leading-normal">{card.desc}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
