/* Hallmark · component: simulation-date-picker · genre: modern-minimal · theme: custom (light)
 * states: default · hover · focus-within
 * contrast: pass (APCA conformant)
 */

import React from 'react';
import { Calendar } from 'lucide-react';

export default function SimulationDatePicker({ simDate, setSimDate }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-paper-3 hover:bg-paper-3/80 border border-rule hover:border-rule-hover rounded-md transition-colors duration-150 focus-within:border-accent group">
      <Calendar className="w-3.5 h-3.5 text-accent transition-colors" />
      
      <span className="text-xs font-body font-medium text-ink-2 select-none">
        Sim Date:
      </span>
      
      <input 
        type="date" 
        value={simDate} 
        onChange={(e) => setSimDate(e.target.value)}
        className="bg-transparent text-xs font-body font-medium text-ink focus:outline-none cursor-pointer [color-scheme:dark]"
      />
    </div>
  );
}
