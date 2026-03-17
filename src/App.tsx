/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Car, History, Plus, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Entry {
  id: string;
  timestamp: number;
  currentMileage: number;
  tripDistance: number;
}

export default function App() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [currentInput, setCurrentInput] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('vehicle_log_entries');
    if (saved) {
      try {
        setEntries(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse entries', e);
      }
    }
  }, []);

  // Save to localStorage whenever entries change
  useEffect(() => {
    localStorage.setItem('vehicle_log_entries', JSON.stringify(entries));
  }, [entries]);

  const handleSave = () => {
    const mileage = parseFloat(currentInput);
    setCurrentInput('');

    if (isNaN(mileage) || mileage <= 0) return;

    const lastEntry = entries[0]; // Entries are sorted newest first
    const previousMileage = lastEntry ? lastEntry.currentMileage : 0;
    
    if (lastEntry && mileage <= previousMileage) {
      alert("Current mileage must be greater than the previous entry.");
      return;
    }

    const tripDistance = lastEntry ? mileage - previousMileage : mileage;

    const newEntry: Entry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      currentMileage: mileage,
      tripDistance: tripDistance,
    };

    setEntries([newEntry, ...entries]);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const totalMileage = entries.length > 0 ? entries[0].currentMileage : 0;
  const lastTrip = entries.length > 0 ? entries[0].tripDistance : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30">
      {/* Header */}
      <header className="border-b border-white/5 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-md mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Car className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-lg tracking-tight text-white">LogBook</h1>
          </div>
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
            v1.0.0
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 py-8 space-y-8">
        {/* Dashboard */}
        <section id="dashboard" className="space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl p-8 shadow-2xl shadow-blue-900/20 relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-cyan-400/20 rounded-full blur-2xl" />
            
            <div className="relative z-10">
              <p className="text-blue-100/80 text-sm font-medium uppercase tracking-wider mb-1">Total Mileage</p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-5xl font-bold tracking-tighter text-white">
                  {totalMileage.toLocaleString()}
                </h2>
                <span className="text-blue-100/60 font-medium">mi</span>
              </div>
              
              <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-blue-100/60 text-xs uppercase tracking-widest mb-1">Last Trip</p>
                  <div className="flex items-center gap-1.5 text-cyan-100">
                    <ArrowUpRight className="w-4 h-4" />
                    <span className="text-xl font-semibold">{lastTrip.toLocaleString()}</span>
                    <span className="text-xs opacity-70">mi</span>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter text-white">
                  Active
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Input Section */}
        <section id="input" className="space-y-4">
          <div className="relative group">
            <label htmlFor="mileage-input" className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 ml-1">
              New Odometer Reading
            </label>
            <div className="relative">
              <input
                id="mileage-input"
                type="number"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder="Enter current mileage..."
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-sm">
                MI
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={!currentInput}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            Save Entry
          </button>

          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center justify-center gap-2 text-cyan-400 text-sm font-medium py-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Mileage Saved
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* History Section */}
        <section id="history" className="space-y-4 pb-12">
          <div className="flex items-center gap-2 px-1">
            <History className="w-4 h-4 text-slate-500" />
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Trip History</h3>
          </div>

          <div className="space-y-3">
            {entries.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-900 rounded-3xl">
                <p className="text-slate-600 text-sm">No entries yet. Start logging your trips.</p>
              </div>
            ) : (
              entries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-4 flex items-center justify-between hover:bg-slate-900/60 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500 font-medium">
                      {new Date(entry.timestamp).toLocaleDateString(undefined, { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <p className="text-sm font-semibold text-slate-300">
                      Odometer: <span className="text-slate-100">{entry.currentMileage.toLocaleString()}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-cyan-500/70 font-bold uppercase tracking-tighter">Trip</p>
                    <p className="text-xl font-bold text-cyan-400">
                      +{entry.tripDistance.toLocaleString()}
                      <span className="text-[10px] ml-0.5 opacity-60">mi</span>
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
