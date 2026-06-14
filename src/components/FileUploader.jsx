import React, { useState, useRef } from "react";
import Papa from "papaparse";
import { Upload, FileSpreadsheet, AlertCircle, Database, Check } from "lucide-react";
import { validateHeaders, SAMPLE_DATA } from "../utils/simulation";

export default function FileUploader({ onDataLoaded, onSampleLoaded }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const processFile = (file) => {
    setError(null);
    setSuccess(false);

    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      setError("Please upload a valid CSV file (.csv).");
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        if (!validateHeaders(headers)) {
          setError(
            "Invalid CSV schema. The file must contain the following columns: 'Product Name', 'Quantity', 'Month', 'Year'."
          );
          return;
        }

        if (results.data.length === 0) {
          setError("The uploaded CSV file is empty.");
          return;
        }

        setSuccess(true);
        setTimeout(() => {
          onDataLoaded(results.data);
        }, 800);
      },
      error: (err) => {
        setError("Error parsing CSV file: " + err.message);
      },
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        className={`relative flex flex-col items-center justify-center w-full h-80 border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300 glass-panel glow-purple ${
          isDragActive
            ? "border-purple-500 bg-purple-500/10 scale-[1.01]"
            : success
            ? "border-green-500 bg-green-500/5"
            : "border-slate-700 hover:border-slate-500 bg-slate-900/40"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFileInput}
        />

        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-6">
          {success ? (
            <div className="flex flex-col items-center animate-bounce">
              <div className="p-4 bg-green-500/20 text-green-400 rounded-full mb-4">
                <Check className="w-12 h-12" />
              </div>
              <p className="text-xl font-medium text-green-400">CSV Validated Successfully!</p>
              <p className="text-sm text-slate-400 mt-1">Generating optimization dashboard...</p>
            </div>
          ) : (
            <>
              <div className={`p-4 rounded-full mb-4 transition-all duration-300 ${
                isDragActive ? "bg-purple-500/20 text-purple-400" : "bg-slate-800/80 text-slate-400"
              }`}>
                <Upload className="w-12 h-12" />
              </div>
              <p className="mb-2 text-xl font-semibold text-slate-200">
                Drag & drop your procurement CSV file here
              </p>
              <p className="mb-6 text-sm text-slate-400">
                or <span className="text-purple-400 font-medium hover:underline">browse files</span> on your computer
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 text-xs text-slate-500 border-t border-slate-800/80 pt-6 mt-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/60 border border-slate-800/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                  Product Name (String)
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/60 border border-slate-800/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                  Quantity (Number)
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/60 border border-slate-800/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                  Month (e.g. October)
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/60 border border-slate-800/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                  Year (e.g. 2020)
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 mt-4 p-4 rounded-2xl bg-red-950/45 border border-red-500/20 text-red-300 text-sm animate-fadeIn">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Upload Failed:</span> {error}
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col items-center gap-4 text-center">
        <div className="flex items-center gap-2">
          <div className="h-px w-12 bg-slate-800"></div>
          <span className="text-xs text-slate-500 font-medium tracking-wider uppercase">Or Start Instantly</span>
          <div className="h-px w-12 bg-slate-800"></div>
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSampleLoaded(SAMPLE_DATA);
          }}
          className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-slate-50 font-medium rounded-2xl shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20 transition-all duration-200 border border-purple-500/20 transform active:scale-95"
        >
          <Database className="w-5 h-5" />
          Load Sample Pharma Dataset
        </button>
        <p className="text-xs text-slate-500">
          Preloaded with Amoxicillin, Lipitor, Metformin, Synthroid, and more (Sep-Dec 2020)
        </p>
      </div>
    </div>
  );
}
