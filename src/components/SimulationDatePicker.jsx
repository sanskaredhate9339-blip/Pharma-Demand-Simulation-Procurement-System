import React from 'react';
import { Calendar } from 'lucide-react';

export default function SimulationDatePicker({ simDate, setSimDate }) {
  return (
    <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-[#0b0f19]/80 hover:bg-[#131a2c] border border-slate-800 rounded-full shadow-md transition-all duration-200 group">
      {/* Premium Purple Icon */}
      <Calendar className="w-4 h-4 text-purple-400 group-hover:text-purple-300 transition-colors" />
      
      {/* Label */}
      <span className="text-xs font-medium tracking-wide font-mono text-slate-400 uppercase select-none">
        Sim Date:
      </span>
      
      {/* Native Dark-Stylable Date Input */}
      <input 
        type="date" 
        value={simDate} 
        onChange={(e) => setSimDate(e.target.value)}
        className="bg-transparent text-sm font-mono font-medium text-slate-200 focus:outline-none cursor-pointer [color-scheme:dark] selection:bg-purple-500/30"
      />
    </div>
  );
}
