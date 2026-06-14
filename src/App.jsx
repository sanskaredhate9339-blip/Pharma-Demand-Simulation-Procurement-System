import React, { useState, useMemo } from "react";
import { runSimulation } from "./utils/simulation";
import FileUploader from "./components/FileUploader";
import KPICards from "./components/KPICards";
import AnalyticsCharts from "./components/AnalyticsCharts";
import DashboardTabs from "./components/DashboardTabs";
import SimulationDatePicker from "./components/SimulationDatePicker";
import { Pill, RefreshCw, Layers, ChevronRight } from "lucide-react";

export default function App() {
  const [rawUploadedData, setRawUploadedData] = useState(null);
  const [simDate, setSimDate] = useState("2021-01-01");
  const [isProcessing, setIsProcessing] = useState(false);

  // Compute simulation data dynamically when raw uploaded data or simulation date changes
  const simulationData = useMemo(() => {
    if (!rawUploadedData) return null;
    try {
      return runSimulation(rawUploadedData, simDate);
    } catch (err) {
      console.error("Simulation run failed: ", err);
      return null;
    }
  }, [rawUploadedData, simDate]);

  const handleDataLoaded = (rawData) => {
    setIsProcessing(true);
    // Simulate a brief delay to show a premium processing micro-animation
    setTimeout(() => {
      setRawUploadedData(rawData);
      setIsProcessing(false);
    }, 1000);
  };

  const handleReset = () => {
    setRawUploadedData(null);
  };

  return (
    <div className="min-h-screen relative overflow-hidden pb-16">
      {/* Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[60%] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none"></div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Navigation/Header Bar */}
        <header className="py-6 border-b border-slate-900 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-2xl text-slate-100 shadow-md shadow-purple-500/20">
              <Pill className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-100 tracking-tight m-0">Aegis Flow</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/20">
                  v2.0
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">AI Pharma Procurement Suite</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <SimulationDatePicker simDate={simDate} setSimDate={setSimDate} />
          </div>
        </header>

        {/* Loading State Overlay */}
        {isProcessing && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center z-50">
            <div className="relative w-16 h-16 mb-4">
              <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-base font-semibold text-slate-200">Rebuilding Warehouse Ledger...</p>
            <p className="text-xs text-slate-500 mt-1">Simulating FEFO batches, lead times, and calculating ROP models</p>
          </div>
        )}

        {/* Dashboard Content */}
        {!simulationData ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-20 animate-fadeIn">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 mb-4">
                <Layers className="w-3.5 h-3.5" />
                Intelligent Inventory Optimization
              </span>
              <h2 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-slate-100 to-slate-400 tracking-tight mb-4">
                Pharma Demand Simulation & Procurement Engine
              </h2>
              <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
                Upload your historical inventory dataset to simulate FEFO expiration schedules, analyze safety stock thresholds, and calculate optimal replenishment purchases automatically.
              </p>
            </div>

            <FileUploader
              onDataLoaded={handleDataLoaded}
              onSampleLoaded={handleDataLoaded}
            />
          </div>
        ) : (
          <div className="space-y-8 animate-fadeIn">
            {/* Top Workspace Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/30 border border-slate-900 p-6 rounded-3xl">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                  <span>Inventory Health Workspace</span>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-purple-400 font-semibold font-mono">Processed</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-200 tracking-tight">
                  Procurement Decision Panel
                </h2>
              </div>
              <button
                onClick={handleReset}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-750 border border-slate-700/80 text-slate-200 font-semibold rounded-2xl text-sm transition-all duration-200 shadow-md"
              >
                <RefreshCw className="w-4 h-4" />
                Upload New Data
              </button>
            </div>

            {/* KPI Cards Panel */}
            <KPICards data={simulationData} />

            {/* Visual Analytics */}
            <AnalyticsCharts data={simulationData} />

            {/* Main Interactive Tables */}
            <DashboardTabs data={simulationData} />
          </div>
        )}
      </div>
      
      {/* Simulation Info Footer */}
      <footer className="mt-16 text-center text-xs text-slate-600 border-t border-slate-950 pt-8 max-w-7xl mx-auto px-4">
        <p>© 2026 Aegis Flow Inc. Powered by Seeded FEFO Warehouse & Demand Forecast Model.</p>
        <p className="mt-1 text-[11px] text-slate-600">
          Simulation Parameters: Expiry Horizon = 120 Days | Safety Stock Buffer = 20% | Seed = 42 | Sim Date = {simDate}
        </p>
      </footer>
    </div>
  );
}
