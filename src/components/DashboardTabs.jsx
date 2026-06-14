import React, { useState, useMemo } from "react";
import { 
  Search, Download, ChevronLeft, ChevronRight, ArrowUpDown, 
  ShieldAlert, ShoppingCart, Ban, Scroll, TrendingUp, 
  DollarSign, Coins, Sliders, PiggyBank, CalendarDays 
} from "lucide-react";

export default function DashboardTabs({ data }) {
  const [activeTab, setActiveTab] = useState("procurement");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter Data according to active tab
  const tabFilteredData = useMemo(() => {
    switch (activeTab) {
      case "procurement":
        // Filtered to RESTOCK items
        return data.filter((item) => item.Action.includes("RESTOCK"));
      case "overstock":
        // Filtered to EXCESSIVE items
        return data.filter((item) => item.Action.includes("EXCESSIVE"));
      case "expiry":
        // Filtered to items with Risky Stock > 0
        return data.filter((item) => item["Risky Stock (Near Expiry)"] > 0);
      case "profitability":
      case "eoq":
      case "ledger":
      default:
        // All items (for catalog-wide analysis)
        return data;
    }
  }, [data, activeTab]);

  // Apply Search Query on Tab-filtered data
  const searchedData = useMemo(() => {
    setCurrentPage(1); // Reset to page 1 when search changes
    if (!searchQuery.trim()) return tabFilteredData;
    
    const query = searchQuery.toLowerCase();
    return tabFilteredData.filter((item) =>
      item["Product Name"].toLowerCase().includes(query)
    );
  }, [tabFilteredData, searchQuery]);

  // Apply Sorting
  const sortedData = useMemo(() => {
    const sortable = [...searchedData];
    if (sortConfig.key !== null) {
      sortable.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle string parsing or date comparison
        if (typeof aValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    } else if (activeTab === "procurement") {
      // Procurement is sortable by predicted demand by default (descending)
      sortable.sort((a, b) => b["Predicted Demand (Next Month)"] - a["Predicted Demand (Next Month)"]);
    }
    return sortable;
  }, [searchedData, sortConfig, activeTab]);

  // Paginate sorted data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage) || 1;

  // --- Aggregate Metrics for Top Sections ---
  
  // 1. Procurement Savings (only restocks)
  const totalProcurementSavings = useMemo(() => {
    const restockItems = data.filter((item) => item.Action.includes("RESTOCK"));
    return restockItems.reduce((sum, item) => sum + (item["Annual Cost Savings"] || 0), 0);
  }, [data]);

  // 2. Profitability Aggregates (whole catalog)
  const profitabilityMetrics = useMemo(() => {
    let totalRevenue = 0;
    let totalProfit = 0;
    data.forEach((item) => {
      totalRevenue += item["Revenue"] || 0;
      totalProfit += item["Profit"] || 0;
    });
    const averageMargin = data.length > 0 
      ? data.reduce((sum, item) => sum + (item["Profit Margin (%)"] || 0), 0) / data.length 
      : 0;

    return { totalRevenue, totalProfit, averageMargin };
  }, [data]);

  // 3. EOQ Aggregates (whole catalog)
  const eoqMetrics = useMemo(() => {
    let totalEoqSavings = 0;
    let totalIntervals = 0;
    let itemsWithInterval = 0;
    
    data.forEach((item) => {
      totalEoqSavings += item["Annual Cost Savings"] || 0;
      if (item["Days Between Orders"] > 0) {
        totalIntervals += item["Days Between Orders"];
        itemsWithInterval += 1;
      }
    });

    const avgInterval = itemsWithInterval > 0 ? totalIntervals / itemsWithInterval : 0;
    return { totalEoqSavings, avgInterval };
  }, [data]);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // CSV Export helper
  const exportToCSV = () => {
    if (sortedData.length === 0) return;

    // Define columns to export based on tab
    const headers = Object.keys(sortedData[0]);
    const csvRows = [];

    // Header row
    csvRows.push(headers.map(h => `"${h.replace(/"/g, '""')}"`).join(","));

    // Data rows
    sortedData.forEach(row => {
      const values = headers.map(header => {
        const val = row[header];
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(","));
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `pharma_${activeTab}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionBadge = (action) => {
    if (action.includes("RESTOCK")) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
          🚨 Restock
        </span>
      );
    }
    if (action.includes("EXCESSIVE")) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          📦 Overstock
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        🟢 Optimal
      </span>
    );
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Tab Selectors */}
      <div className="flex flex-wrap border-b border-slate-800/80 gap-1 pb-px">
        <button
          onClick={() => { setActiveTab("procurement"); setSearchQuery(""); setSortConfig({ key: null, direction: "asc" }); }}
          className={`flex items-center gap-2 px-4 py-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-all duration-200 ${
            activeTab === "procurement"
              ? "border-rose-500 text-rose-400 bg-rose-500/5"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          Procurement (Buy)
          {data.filter((item) => item.Action.includes("RESTOCK")).length > 0 && (
            <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/35">
              {data.filter((item) => item.Action.includes("RESTOCK")).length}
            </span>
          )}
        </button>

        <button
          onClick={() => { setActiveTab("overstock"); setSearchQuery(""); setSortConfig({ key: null, direction: "asc" }); }}
          className={`flex items-center gap-2 px-4 py-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-all duration-200 ${
            activeTab === "overstock"
              ? "border-amber-500 text-amber-400 bg-amber-500/5"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
          }`}
        >
          <Ban className="w-4 h-4" />
          Overstock (Hold)
          {data.filter((item) => item.Action.includes("EXCESSIVE")).length > 0 && (
            <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/35">
              {data.filter((item) => item.Action.includes("EXCESSIVE")).length}
            </span>
          )}
        </button>

        <button
          onClick={() => { setActiveTab("expiry"); setSearchQuery(""); setSortConfig({ key: null, direction: "asc" }); }}
          className={`flex items-center gap-2 px-4 py-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-all duration-200 ${
            activeTab === "expiry"
              ? "border-emerald-500 text-emerald-400 bg-emerald-500/5"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Expiry Risk
        </button>

        {/* Profitability Tab */}
        <button
          onClick={() => { setActiveTab("profitability"); setSearchQuery(""); setSortConfig({ key: null, direction: "asc" }); }}
          className={`flex items-center gap-2 px-4 py-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-all duration-200 ${
            activeTab === "profitability"
              ? "border-purple-500 text-purple-400 bg-purple-500/5"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Profitability
        </button>

        {/* EOQ Tab */}
        <button
          onClick={() => { setActiveTab("eoq"); setSearchQuery(""); setSortConfig({ key: null, direction: "asc" }); }}
          className={`flex items-center gap-2 px-4 py-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-all duration-200 ${
            activeTab === "eoq"
              ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
          }`}
        >
          <Sliders className="w-4 h-4" />
          EOQ Optimization
        </button>

        <button
          onClick={() => { setActiveTab("ledger"); setSearchQuery(""); setSortConfig({ key: null, direction: "asc" }); }}
          className={`flex items-center gap-2 px-4 py-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-all duration-200 ${
            activeTab === "ledger"
              ? "border-slate-500 text-slate-300 bg-slate-500/5"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
          }`}
        >
          <Scroll className="w-4 h-4" />
          Master Ledger
        </button>
      </div>

      {/* Dynamic Summary Cards per Workspace Section */}
      
      {/* 1. Procurement Savings Banner */}
      {activeTab === "procurement" && totalProcurementSavings > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm glow-purple animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/20 rounded-xl text-purple-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="font-semibold text-slate-100 block">Economic Order Quantity (EOQ) Enabled</span>
              <span className="text-xs text-slate-400">Reduce storage and ordering friction. Displaying recommended replenishment orders.</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-semibold text-purple-400/80 block uppercase tracking-wider">Projected Annual Cost Savings</span>
            <span className="text-2xl font-black text-purple-400 font-mono tracking-tight">
              ${totalProcurementSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      )}

      {/* 2. Profitability Analysis Section KPI Cards */}
      {activeTab === "profitability" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-fadeIn">
          <div className="glass-panel p-5 rounded-2xl border border-purple-500/10 bg-purple-500/5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Catalog Projected Revenue</span>
              <span className="text-2xl font-black text-slate-100 font-mono">
                ${profitabilityMetrics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="p-3 bg-purple-500/15 text-purple-400 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-emerald-500/10 bg-emerald-500/5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Projected Annual Profit</span>
              <span className="text-2xl font-black text-slate-100 font-mono">
                ${profitabilityMetrics.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="p-3 bg-emerald-500/15 text-emerald-400 rounded-xl">
              <Coins className="w-5 h-5" />
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-indigo-500/10 bg-indigo-500/5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Avg Product Profit Margin</span>
              <span className="text-2xl font-black text-slate-100 font-mono">
                {profitabilityMetrics.averageMargin.toFixed(1)}%
              </span>
            </div>
            <div className="p-3 bg-indigo-500/15 text-indigo-400 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* 3. EOQ Optimization Section KPI Cards */}
      {activeTab === "eoq" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-fadeIn">
          <div className="glass-panel p-5 rounded-2xl border border-indigo-500/10 bg-indigo-500/5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Potential Catalog Savings</span>
              <span className="text-2xl font-black text-indigo-400 font-mono">
                ${eoqMetrics.totalEoqSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="p-3 bg-indigo-500/15 text-indigo-400 rounded-xl">
              <PiggyBank className="w-5 h-5 animate-bounce" />
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-purple-500/10 bg-purple-500/5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Average Reorder Interval</span>
              <span className="text-2xl font-black text-slate-100 font-mono">
                {Math.round(eoqMetrics.avgInterval)} days
              </span>
            </div>
            <div className="p-3 bg-purple-500/15 text-purple-400 rounded-xl">
              <CalendarDays className="w-5 h-5" />
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/40 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Ordering Constants Set</span>
              <span className="text-sm font-semibold text-slate-300 block mt-1">Ordering Cost: <span className="font-mono text-purple-400">$50</span></span>
              <span className="text-xs text-slate-500 block">Holding Cost Rate: <span className="font-mono text-purple-400">20%</span> of Purchase Cost</span>
            </div>
            <div className="p-3 bg-slate-800 text-slate-400 rounded-xl">
              <Sliders className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* Table Filters Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Search Bar */}
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by product name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 hover:bg-slate-900/80 focus:bg-slate-950 border border-slate-800 focus:border-slate-700 text-slate-200 placeholder-slate-500 text-sm rounded-xl focus:outline-none transition"
          />
        </div>

        {/* Export Button */}
        <button
          onClick={exportToCSV}
          disabled={sortedData.length === 0}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900/80 hover:bg-slate-850 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-800 text-slate-300 font-semibold rounded-xl text-sm transition"
        >
          <Download className="w-4 h-4" />
          Export to CSV
        </button>
      </div>

      {/* Data Table */}
      <div className="glass-panel border border-slate-800/80 bg-slate-900/10 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300 border-collapse">
            <thead className="bg-slate-950/65 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800/60 font-semibold">
              {activeTab === "procurement" && (
                <tr>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-100" onClick={() => requestSort("Product Name")}>
                    <div className="flex items-center gap-1.5">Product Name <ArrowUpDown className="w-3.5 h-3.5" /></div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-100 text-right" onClick={() => requestSort("Avg Monthly Sales")}>
                    <div className="flex items-center justify-end gap-1.5">Avg Sales <ArrowUpDown className="w-3.5 h-3.5" /></div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-100 text-right font-bold text-blue-400" onClick={() => requestSort("Predicted Demand (Next Month)")}>
                    <div className="flex items-center justify-end gap-1.5 text-blue-400">Demand Forecast <ArrowUpDown className="w-3.5 h-3.5" /></div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-100 text-right" onClick={() => requestSort("Usable Stock")}>
                    <div className="flex items-center justify-end gap-1.5">Usable Stock <ArrowUpDown className="w-3.5 h-3.5" /></div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-100 text-right" onClick={() => requestSort("Reorder Point (ROP)")}>
                    <div className="flex items-center justify-end gap-1.5">ROP <ArrowUpDown className="w-3.5 h-3.5" /></div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-100 text-right font-extrabold text-rose-400" onClick={() => requestSort("Units to Buy")}>
                    <div className="flex items-center justify-end gap-1.5 text-rose-400 font-extrabold">Units to Buy <ArrowUpDown className="w-3.5 h-3.5" /></div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-100 text-right font-extrabold text-purple-400" onClick={() => requestSort("EOQ")}>
                    <div className="flex items-center justify-end gap-1.5 text-purple-400 font-extrabold">Rec. EOQ <ArrowUpDown className="w-3.5 h-3.5" /></div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-100 text-right font-semibold text-purple-400" onClick={() => requestSort("Days Between Orders")}>
                    <div className="flex items-center justify-end gap-1.5 text-purple-400">Order Interval <ArrowUpDown className="w-3.5 h-3.5" /></div>
                  </th>
                </tr>
              )}

              {activeTab === "overstock" && (
                <tr>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-100" onClick={() => requestSort("Product Name")}>
                    <div className="flex items-center gap-1.5">Product Name <ArrowUpDown className="w-3.5 h-3.5" /></div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-100 text-right" onClick={() => requestSort("Avg Monthly Sales")}>
                    <div className="flex items-center justify-end gap-1.5">Avg Sales <ArrowUpDown className="w-3.5 h-3.5" /></div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-100 text-right" onClick={() => requestSort("Predicted Demand (Next Month)")}>
                    <div className="flex items-center justify-end gap-1.5">Demand <ArrowUpDown className="w-3.5 h-3.5" /></div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-100 text-right" onClick={() => requestSort("Usable Stock")}>
                    <div className="flex items-center justify-end gap-1.5">Usable Stock <ArrowUpDown className="w-3.5 h-3.5" /></div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-100 text-right" onClick={() => requestSort("Total Stock")}>
                    <div className="flex items-center justify-end gap-1.5">Total Stock <ArrowUpDown className="w-3.5 h-3.5" /></div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-100 text-center" onClick={() => requestSort("Nearest Expiry Date")}>
                    <div className="flex items-center justify-center gap-1.5">Nearest Expiry <ArrowUpDown className="w-3.5 h-3.5" /></div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-100 text-center" onClick={() => requestSort("Action")}>
                    <div className="flex items-center justify-center gap-1.5">Status <ArrowUpDown className="w-3.5 h-3.5" /></div>
                  </th>
                </tr>
              )}

              {activeTab === "expiry" && (
                <tr>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-100" onClick={() => requestSort("Product Name")}>
                    <div className="flex items-center gap-1.5">Product Name <ArrowUpDown className="w-3.5 h-3.5" /></div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-100 text-right" onClick={() => requestSort("Usable Stock")}>
                    <div className="flex items-center justify-end gap-1.5">Usable Stock <ArrowUpDown className="w-3.5 h-3.5" /></div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-100 text-right font-bold text-amber-400 animate-pulse" onClick={() => requestSort("Risky Stock (Near Expiry)")}>
                    <div className="flex items-center justify-end gap-1.5 text-amber-400">Risky Stock (Near Expiry) <ArrowUpDown className="w-3.5 h-3.5" /></div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-100 text-right" onClick={() => requestSort("Total Stock")}>
                    <div className="flex items-center justify-end gap-1.5">Total Stock <ArrowUpDown className="w-3.5 h-3.5" /></div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-100 text-center" onClick={() => requestSort("Nearest Expiry Date")}>
                    <div className="flex items-center justify-center gap-1.5">Nearest Expiry <ArrowUpDown className="w-3.5 h-3.5" /></div>
                  </th>
                </tr>
              )}

              {activeTab === "profitability" && (
                <tr>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-100" onClick={() => requestSort("Product Name")}>
                    <div className="flex items-center gap-1.5">Product Name <ArrowUpDown className="w-3.5 h-3.5" /></div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-100 text-right font-semibold text-purple-400" onClick={() => requestSort("Purchase Cost")}>
                    <div className="flex items-center justify-end gap-1.5 text-purple-400">Purchase Cost <ArrowUpDown className="w-3.5 h-3.5" /></div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-100 text-right font-bold text-emerald-400" onClick={() => requestSort("Selling Price")}>
                    <div className="flex items-center justify-end gap-1.5 text-emerald-400">Selling Price <ArrowUpDown className="w-3.5 h-3.5" /></div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-100 text-right" onClick={() => requestSort("Annual Demand")}>
                    <div className="flex items-center justify-end gap-1.5">Est. Annual Units <ArrowUpDown className="w-3.5 h-3.5" /></div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-100 text-right font-bold text-blue-400" onClick={() => requestSort("Revenue")}>
                    <div className="flex items-center justify-end gap-1.5 text-blue-400">Est. Revenue <ArrowUpDown className="w-3.5 h-3.5" /></div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-100 text-right font-black text-emerald-400" onClick={() => requestSort("Profit")}>
                    <div className="flex items-center justify-end gap-1.5 text-emerald-400">Est. Net Profit <ArrowUpDown className="w-3.5 h-3.5" /></div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-100 text-right font-semibold text-indigo-400" onClick={() => requestSort("Profit Margin (%)")}>
                    <div className="flex items-center justify-end gap-1.5 text-indigo-400">Margin % <ArrowUpDown className="w-3.5 h-3.5" /></div>
                  </th>
                </tr>
              )}

              {activeTab === "eoq" && (
                <tr>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-100" onClick={() => requestSort("Product Name")}>
                    <div className="flex items-center gap-1.5">Product Name <ArrowUpDown className="w-3.5 h-3.5" /></div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-100 text-right" onClick={() => requestSort("Annual Demand")}>
                    <div className="flex items-center justify-end gap-1.5">Annual Demand (D) <ArrowUpDown className="w-3.5 h-3.5" /></div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-100 text-right font-semibold text-purple-400" onClick={() => requestSort("Purchase Cost")}>
                    <div className="flex items-center justify-end gap-1.5 text-purple-400">Purchase Cost <ArrowUpDown className="w-3.5 h-3.5" /></div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-100 text-right" onClick={() => requestSort("Purchase Cost")}>
                    <div className="flex items-center justify-end gap-1.5">Holding Cost (H) <ArrowUpDown className="w-3.5 h-3.5" /></div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-100 text-right font-black text-indigo-400" onClick={() => requestSort("EOQ")}>
                    <div className="flex items-center justify-end gap-1.5 text-indigo-400">Optimal Order Size (EOQ) <ArrowUpDown className="w-3.5 h-3.5" /></div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-100 text-right font-semibold text-indigo-400" onClick={() => requestSort("Days Between Orders")}>
                    <div className="flex items-center justify-end gap-1.5 text-indigo-400">Interval (Days) <ArrowUpDown className="w-3.5 h-3.5" /></div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-100 text-right font-black text-emerald-400" onClick={() => requestSort("Annual Cost Savings")}>
                    <div className="flex items-center justify-end gap-1.5 text-emerald-400">Annual Savings <ArrowUpDown className="w-3.5 h-3.5" /></div>
                  </th>
                </tr>
              )}

              {activeTab === "ledger" && (
                <tr>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-100" onClick={() => requestSort("Product Name")}>
                    <div className="flex items-center gap-1.5">Product Name <ArrowUpDown className="w-3.5 h-3.5" /></div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-100 text-right" onClick={() => requestSort("Avg Monthly Sales")}>
                    <div className="flex items-center justify-end gap-1.5">Avg Sales <ArrowUpDown className="w-3.5 h-3.5" /></div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-100 text-right" onClick={() => requestSort("Predicted Demand (Next Month)")}>
                    <div className="flex items-center justify-end gap-1.5">Demand <ArrowUpDown className="w-3.5 h-3.5" /></div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-100 text-right" onClick={() => requestSort("Usable Stock")}>
                    <div className="flex items-center justify-end gap-1.5">Usable Stock <ArrowUpDown className="w-3.5 h-3.5" /></div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-100 text-right font-bold text-emerald-400" onClick={() => requestSort("Selling Price")}>
                    <div className="flex items-center justify-end gap-1.5 text-emerald-400">Selling Price <ArrowUpDown className="w-3.5 h-3.5" /></div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-100 text-right font-bold text-emerald-400" onClick={() => requestSort("Profit Margin (%)")}>
                    <div className="flex items-center justify-end gap-1.5 text-emerald-400">Margin % <ArrowUpDown className="w-3.5 h-3.5" /></div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-100 text-right font-bold text-purple-400" onClick={() => requestSort("EOQ")}>
                    <div className="flex items-center justify-end gap-1.5 text-purple-400">EOQ <ArrowUpDown className="w-3.5 h-3.5" /></div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-100 text-right font-semibold text-purple-400" onClick={() => requestSort("Days Between Orders")}>
                    <div className="flex items-center justify-end gap-1.5 text-purple-400">Interval <ArrowUpDown className="w-3.5 h-3.5" /></div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-100 text-center" onClick={() => requestSort("Action")}>
                    <div className="flex items-center justify-center gap-1.5">Action <ArrowUpDown className="w-3.5 h-3.5" /></div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-100 text-right" onClick={() => requestSort("Units to Buy")}>
                    <div className="flex items-center justify-end gap-1.5">Buy <ArrowUpDown className="w-3.5 h-3.5" /></div>
                  </th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-500">
                    No matching products found.
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-slate-900/30 transition-colors duration-150 group"
                  >
                    {activeTab === "procurement" && (
                      <>
                        <td className="py-4 px-6 font-semibold text-slate-200 group-hover:text-purple-400 transition-colors">
                          {item["Product Name"]}
                        </td>
                        <td className="py-4 px-6 text-right font-mono">{item["Avg Monthly Sales"]}</td>
                        <td className="py-4 px-6 text-right font-mono font-bold text-blue-400 bg-blue-500/5">{item["Predicted Demand (Next Month)"]}</td>
                        <td className="py-4 px-6 text-right font-mono">{item["Usable Stock"]}</td>
                        <td className="py-4 px-6 text-right font-mono text-slate-400">{item["Reorder Point (ROP)"]}</td>
                        <td className="py-4 px-6 text-right font-mono font-extrabold text-rose-400 bg-rose-500/5">
                          {item["Units to Buy"]}
                        </td>
                        <td className="py-4 px-6 text-right font-mono font-bold text-purple-400 bg-purple-500/5">
                          {item["EOQ"]} units
                        </td>
                        <td className="py-4 px-6 text-right font-mono text-purple-400 bg-purple-500/5">
                          {item["Days Between Orders"]} days
                        </td>
                      </>
                    )}

                    {activeTab === "overstock" && (
                      <>
                        <td className="py-4 px-6 font-semibold text-slate-200 group-hover:text-purple-400 transition-colors">
                          {item["Product Name"]}
                        </td>
                        <td className="py-4 px-6 text-right font-mono">{item["Avg Monthly Sales"]}</td>
                        <td className="py-4 px-6 text-right font-mono">{item["Predicted Demand (Next Month)"]}</td>
                        <td className="py-4 px-6 text-right font-mono text-amber-400/80">{item["Usable Stock"]}</td>
                        <td className="py-4 px-6 text-right font-mono font-bold text-amber-400 bg-amber-500/5">{item["Total Stock"]}</td>
                        <td className="py-4 px-6 text-center font-mono text-slate-400">{item["Nearest Expiry Date"]}</td>
                        <td className="py-4 px-6 text-center">{getActionBadge(item.Action)}</td>
                      </>
                    )}

                    {activeTab === "expiry" && (
                      <>
                        <td className="py-4 px-6 font-semibold text-slate-200 group-hover:text-purple-400 transition-colors">
                          {item["Product Name"]}
                        </td>
                        <td className="py-4 px-6 text-right font-mono">{item["Usable Stock"]}</td>
                        <td className="py-4 px-6 text-right font-mono font-bold text-rose-400 bg-rose-500/5">
                          {item["Risky Stock (Near Expiry)"]}
                        </td>
                        <td className="py-4 px-6 text-right font-mono">{item["Total Stock"]}</td>
                        <td className="py-4 px-6 text-center font-mono text-rose-400/90 font-medium">
                          {item["Nearest Expiry Date"]}
                        </td>
                      </>
                    )}

                    {activeTab === "profitability" && (
                      <>
                        <td className="py-4 px-6 font-semibold text-slate-200 group-hover:text-purple-400 transition-colors">
                          {item["Product Name"]}
                        </td>
                        <td className="py-4 px-6 text-right font-mono text-slate-400">${item["Purchase Cost"].toFixed(2)}</td>
                        <td className="py-4 px-6 text-right font-mono font-bold text-emerald-400">${item["Selling Price"].toFixed(2)}</td>
                        <td className="py-4 px-6 text-right font-mono">{item["Annual Demand"].toLocaleString()}</td>
                        <td className="py-4 px-6 text-right font-mono font-bold text-blue-400 bg-blue-500/5">
                          ${(item["Revenue"] || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 px-6 text-right font-mono font-bold text-emerald-400 bg-emerald-500/5">
                          ${(item["Profit"] || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 px-6 text-right font-mono">
                          <div className="flex items-center justify-end gap-2">
                            <span className="font-bold text-indigo-400">{item["Profit Margin (%)"].toFixed(1)}%</span>
                            <div className="w-12 bg-slate-800 rounded-full h-1.5 hidden sm:block border border-slate-700/55 overflow-hidden">
                              <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${item["Profit Margin (%)"]}%` }}></div>
                            </div>
                          </div>
                        </td>
                      </>
                    )}

                    {activeTab === "eoq" && (
                      <>
                        <td className="py-4 px-6 font-semibold text-slate-200 group-hover:text-purple-400 transition-colors">
                          {item["Product Name"]}
                        </td>
                        <td className="py-4 px-6 text-right font-mono">{item["Annual Demand"].toLocaleString()} units</td>
                        <td className="py-4 px-6 text-right font-mono text-slate-400">${item["Purchase Cost"].toFixed(2)}</td>
                        <td className="py-4 px-6 text-right font-mono text-slate-400">
                          ${Math.max(item["Purchase Cost"] * 0.20, 1).toFixed(2)}/unit
                        </td>
                        <td className="py-4 px-6 text-right font-mono font-black text-indigo-400 bg-indigo-500/5">
                          {item["EOQ"]} units
                        </td>
                        <td className="py-4 px-6 text-right font-mono font-semibold text-indigo-400 bg-indigo-500/5">
                          {item["Days Between Orders"]} days
                        </td>
                        <td className="py-4 px-6 text-right font-mono font-bold text-emerald-400 bg-emerald-500/5">
                          ${item["Annual Cost Savings"].toFixed(2)}
                        </td>
                      </>
                    )}

                    {activeTab === "ledger" && (
                      <>
                        <td className="py-4 px-6 font-semibold text-slate-200 group-hover:text-purple-400 transition-colors">
                          {item["Product Name"]}
                        </td>
                        <td className="py-4 px-6 text-right font-mono">{item["Avg Monthly Sales"]}</td>
                        <td className="py-4 px-6 text-right font-mono">{item["Predicted Demand (Next Month)"]}</td>
                        <td className="py-4 px-6 text-right font-mono">{item["Usable Stock"]}</td>
                        
                        <td className="py-4 px-6 text-right font-mono text-emerald-400">${item["Selling Price"].toFixed(2)}</td>
                        <td className="py-4 px-6 text-right font-mono text-emerald-400">{item["Profit Margin (%)"].toFixed(1)}%</td>
                        <td className="py-4 px-6 text-right font-mono text-purple-400 font-semibold">{item["EOQ"]}</td>
                        <td className="py-4 px-6 text-right font-mono text-purple-400">{item["Days Between Orders"]}d</td>

                        <td className="py-4 px-6 text-center">{getActionBadge(item.Action)}</td>
                        <td className="py-4 px-6 text-right font-mono font-bold">
                          {item["Units to Buy"] > 0 ? (
                            <span className="text-rose-400">{item["Units to Buy"]}</span>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {sortedData.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-slate-950/40 border-t border-slate-800/60 text-xs text-slate-400">
            <div>
              Showing <span className="font-semibold text-slate-200">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
              <span className="font-semibold text-slate-200">
                {Math.min(currentPage * itemsPerPage, sortedData.length)}
              </span>{" "}
              of <span className="font-semibold text-slate-200">{sortedData.length}</span> items
            </div>
            
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-850 disabled:opacity-40 disabled:hover:bg-slate-900 transition animate-fadeIn"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <span className="px-3 py-1 bg-slate-900 border border-slate-850 rounded-lg text-slate-200 font-semibold font-mono">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-850 disabled:opacity-40 disabled:hover:bg-slate-900 transition animate-fadeIn"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
