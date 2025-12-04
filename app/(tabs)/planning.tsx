import React, { useState, useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "../../src/store";
import { RaceSpecificPlanning } from "../../src/components/RaceSpecificPlanning";
import { AuthGuard } from "../../src/components/AuthGuard";
import { useTerminalModeToggle } from "../../src/hooks/useTerminalModeToggle";
import { getTerminalModeState } from "../../src/utils/featureFlags";
import {
  TbClipboard,
  TbSwimming,
  TbBike,
  TbRun,
  TbFlag,
  TbApple,
  TbBackpack,
  TbClock,
} from "react-icons/tb";

// Icon component mapping
const iconComponents = {
  TbClipboard,
  TbSwimming,
  TbBike,
  TbRun,
  TbFlag,
  TbApple,
  TbBackpack,
  TbClock,
};

const renderIcon = (iconName: string, className = "w-4 h-4") => {
  const IconComponent = iconComponents[iconName as keyof typeof iconComponents];
  return IconComponent ? (
    <IconComponent className={className} />
  ) : (
    <span>{iconName}</span>
  );
};

export default function PlanningScreen() {
  // Terminal mode
  useTerminalModeToggle();
  const [useTerminal, setUseTerminal] = useState(() => {
    const override = getTerminalModeState();
    if (override !== false) return override;
    return true; // Terminal mode is enabled in featureFlags.ts
  });

  // Listen for terminal mode changes
  useEffect(() => {
    const handleTerminalModeChange = () => {
      setUseTerminal(getTerminalModeState());
    };

    if (typeof window !== "undefined") {
      window.addEventListener("terminalModeChanged", handleTerminalModeChange);
      return () => {
        window.removeEventListener(
          "terminalModeChanged",
          handleTerminalModeChange,
        );
      };
    }
  }, []);

  const [activeTab, setActiveTab] = useState("nutrition");
  const [planningMode, setPlanningMode] = useState<"race-specific" | "general">(
    "general",
  );

  // Check for stored race data when component loads
  useEffect(() => {
    const storedRace = localStorage.getItem("selectedRaceForPlanning");
    if (storedRace) {
      // Ensure we're in race-specific mode when a race is selected
      setPlanningMode("race-specific");
    } else {
      // Default to general mode if no race is selected
      setPlanningMode("general");
    }
  }, []);

  const planningTabs = [
    { id: "nutrition", label: "Nutrition", icon: "TbApple" },
    { id: "gear", label: "Gear & Packing", icon: "TbBackpack" },
    { id: "strategy", label: "Race Strategy", icon: "TbClipboard" },
    { id: "timeline", label: "Timeline", icon: "TbClock" },
  ];

  return (
    <Provider store={store}>
      <AuthGuard>
        <div
          className={
            useTerminal
              ? "bg-terminal-bg relative overflow-auto"
              : "bg-slate-900 relative overflow-auto"
          }
          style={{ minHeight: "100vh", minHeight: "100dvh" }}
        >
          {/* Background Effects - Hide in terminal mode */}
          {!useTerminal && (
            <div className="fixed inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-slate-900 to-orange-900/20"></div>
              <div className="absolute top-1/4 -right-32 w-64 h-64 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-1/4 -left-32 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
            </div>
          )}

          <div className="relative z-10 p-6 pb-24">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1
                    className={
                      useTerminal
                        ? "text-3xl font-bold text-text-primary font-mono tracking-wider mb-2"
                        : "text-3xl font-bold text-white mb-2"
                    }
                  >
                    {useTerminal ? "RACE PLANNING" : "Race Planning"}
                  </h1>
                  <p
                    className={
                      useTerminal
                        ? "text-sm text-text-secondary font-mono uppercase tracking-wide"
                        : "text-lg text-white/70"
                    }
                  >
                    {useTerminal
                      ? "PLAN YOUR NUTRITION, GEAR, AND RACE STRATEGY"
                      : "Plan your nutrition, gear, and race strategy"}
                  </p>
                </div>

                {/* Mode Toggle */}
                <div
                  className={
                    useTerminal
                      ? "flex bg-terminal-panel border-2 border-terminal-border p-1"
                      : "flex bg-white/10 rounded-xl p-1 border border-white/20"
                  }
                >
                  <button
                    onClick={() => setPlanningMode("race-specific")}
                    className={
                      useTerminal
                        ? `px-4 py-2 text-sm font-medium font-mono transition-colors ${
                            planningMode === "race-specific"
                              ? "bg-accent-yellow text-terminal-bg"
                              : "text-text-secondary hover:text-text-primary"
                          }`
                        : `px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            planningMode === "race-specific"
                              ? "bg-blue-500/30 text-blue-300 border border-blue-400/30"
                              : "text-white/70 hover:text-white"
                          }`
                    }
                    style={useTerminal ? { borderRadius: 0 } : undefined}
                  >
                    {useTerminal ? "RACE-SPECIFIC" : "Race-Specific"}
                  </button>
                  <button
                    onClick={() => setPlanningMode("general")}
                    className={
                      useTerminal
                        ? `px-4 py-2 text-sm font-medium font-mono transition-colors ${
                            planningMode === "general"
                              ? "bg-accent-yellow text-terminal-bg"
                              : "text-text-secondary hover:text-text-primary"
                          }`
                        : `px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            planningMode === "general"
                              ? "bg-blue-500/30 text-blue-300 border border-blue-400/30"
                              : "text-white/70 hover:text-white"
                          }`
                    }
                    style={useTerminal ? { borderRadius: 0 } : undefined}
                  >
                    {useTerminal ? "GENERAL" : "General"}
                  </button>
                </div>
              </div>
            </div>

            {/* Planning Tabs */}
            <div className="flex flex-wrap gap-2 mb-8">
              {planningTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={
                    useTerminal
                      ? `px-4 py-3 font-medium transition-colors flex items-center gap-2 font-mono text-sm ${
                          activeTab === tab.id
                            ? "bg-terminal-panel text-accent-yellow border-2 border-accent-yellow"
                            : "bg-terminal-panel text-text-secondary border-2 border-terminal-border hover:border-text-secondary"
                        }`
                      : `px-4 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                          activeTab === tab.id
                            ? "bg-gradient-to-r from-blue-500/20 to-orange-500/20 text-white border border-blue-400/30"
                            : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                        }`
                  }
                  style={useTerminal ? { borderRadius: 0 } : undefined}
                >
                  {renderIcon(tab.icon, "w-5 h-5")}
                  {useTerminal ? tab.label.toUpperCase() : tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="grid gap-6">
              {planningMode === "race-specific" ? (
                <RaceSpecificPlanning activeTab={activeTab} />
              ) : (
                <>
                  {activeTab === "nutrition" && (
                    <>
                      <div
                        className={useTerminal ?
                          "bg-terminal-panel border-2 border-terminal-border p-6 shadow-xl" :
                          "bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl"
                        }
                        style={useTerminal ? { borderRadius: 0 } : undefined}
                      >
                        <h3 className={useTerminal ?
                          "text-lg font-bold text-text-primary mb-4 font-mono tracking-wider" :
                          "text-xl font-bold text-white mb-4"
                        }>
                          {useTerminal ? 'PRE-RACE NUTRITION PLAN' : 'Pre-Race Nutrition Plan'}
                        </h3>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div
                            className={
                              useTerminal
                                ? "bg-terminal-bg border border-terminal-border p-4"
                                : "bg-white/5 rounded-xl p-4"
                            }
                            style={useTerminal ? { borderRadius: 0 } : undefined}
                          >
                            <h4 className={useTerminal ? "text-text-primary font-mono font-bold mb-2" : "text-white font-semibold mb-2"}>
                              {useTerminal ? "3 DAYS BEFORE" : "3 Days Before"}
                            </h4>
                            <p className={useTerminal ? "text-text-secondary text-sm font-mono" : "text-white/70 text-sm"}>
                              {useTerminal ? "CARB LOADING BEGINS" : "Carb loading begins"}
                            </p>
                            <p className={useTerminal ? "text-[#4ECDC4] text-sm mt-2 font-mono" : "text-green-400 text-sm mt-2"}>
                              • {useTerminal ? "COMPLEX CARBS" : "Complex carbohydrates"}
                              <br />• {useTerminal ? "HYDRATION FOCUS" : "Hydration focus"}
                            </p>
                          </div>
                          <div
                            className={
                              useTerminal
                                ? "bg-terminal-bg border border-terminal-border p-4"
                                : "bg-white/5 rounded-xl p-4"
                            }
                            style={useTerminal ? { borderRadius: 0 } : undefined}
                          >
                            <h4 className={useTerminal ? "text-text-primary font-mono font-bold mb-2" : "text-white font-semibold mb-2"}>
                              {useTerminal ? "RACE MORNING" : "Race Morning"}
                            </h4>
                            <p className={useTerminal ? "text-text-secondary text-sm font-mono" : "text-white/70 text-sm"}>
                              {useTerminal ? "LIGHT, FAMILIAR FOODS" : "Light, familiar foods"}
                            </p>
                            <p className={useTerminal ? "text-[#00D4FF] text-sm mt-2 font-mono" : "text-blue-400 text-sm mt-2"}>
                              • {useTerminal ? "BANANA + PEANUT BUTTER" : "Banana + peanut butter"}
                              <br />• {useTerminal ? "COFFEE (IF USUAL)" : "Coffee (if usual)"}
                            </p>
                          </div>
                          <div
                            className={
                              useTerminal
                                ? "bg-terminal-bg border border-terminal-border p-4"
                                : "bg-white/5 rounded-xl p-4"
                            }
                            style={useTerminal ? { borderRadius: 0 } : undefined}
                          >
                            <h4 className={useTerminal ? "text-text-primary font-mono font-bold mb-2" : "text-white font-semibold mb-2"}>
                              {useTerminal ? "DURING RACE" : "During Race"}
                            </h4>
                            <p className={useTerminal ? "text-text-secondary text-sm font-mono" : "text-white/70 text-sm"}>
                              {useTerminal ? "FUEL STRATEGY" : "Fuel strategy"}
                            </p>
                            <p className={useTerminal ? "text-[#FF6B35] text-sm mt-2 font-mono" : "text-orange-400 text-sm mt-2"}>
                              • {useTerminal ? "GELS EVERY 45MIN" : "Gels every 45min"}
                              <br />• {useTerminal ? "ELECTROLYTE DRINKS" : "Electrolyte drinks"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div
                        className={useTerminal ?
                          "bg-terminal-panel border-2 border-terminal-border p-6 shadow-xl" :
                          "bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl"
                        }
                        style={useTerminal ? { borderRadius: 0 } : undefined}
                      >
                        <h3 className={useTerminal ?
                          "text-lg font-bold text-text-primary mb-4 font-mono tracking-wider" :
                          "text-xl font-bold text-white mb-4"
                        }>
                          {useTerminal ? 'HYDRATION CALCULATOR' : 'Hydration Calculator'}
                        </h3>
                        <div
                          className={
                            useTerminal
                              ? "bg-[#00D4FF]/10 border border-[#00D4FF]/50 p-4"
                              : "bg-blue-500/10 rounded-xl p-4"
                          }
                          style={useTerminal ? { borderRadius: 0 } : undefined}
                        >
                          <p className={useTerminal ? "text-[#00D4FF] mb-2 font-mono font-bold" : "text-blue-300 mb-2"}>
                            {useTerminal ? "FOR A 1:30:00 RACE DURATION:" : "For a 1:30:00 race duration:"}
                          </p>
                          <div className={useTerminal ? "grid grid-cols-2 gap-4 text-text-primary font-mono" : "grid grid-cols-2 gap-4 text-white"}>
                            <div>
                              <span className={useTerminal ? "text-text-secondary" : "text-white/70"}>
                                {useTerminal ? "PRE-RACE: " : "Pre-race: "}
                              </span>
                              <span className={useTerminal ? "font-bold" : "font-semibold"}>16-20oz</span>
                            </div>
                            <div>
                              <span className={useTerminal ? "text-text-secondary" : "text-white/70"}>
                                {useTerminal ? "DURING RACE: " : "During race: "}
                              </span>
                              <span className={useTerminal ? "font-bold" : "font-semibold"}>
                                6-8oz every 15min
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === "gear" && (
                    <>
                      <div
                        className={useTerminal ?
                          "bg-terminal-panel border-2 border-terminal-border p-6 shadow-xl" :
                          "bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl"
                        }
                        style={useTerminal ? { borderRadius: 0 } : undefined}
                      >
                        <h3 className={useTerminal ?
                          "text-lg font-bold text-text-primary mb-4 font-mono tracking-wider" :
                          "text-xl font-bold text-white mb-4"
                        }>
                          {useTerminal ? 'ESSENTIAL GEAR CHECKLIST' : 'Essential Gear Checklist'}
                        </h3>
                        <div className="grid md:grid-cols-3 gap-6">
                          <div>
                            <h4 className={useTerminal ? "text-[#00D4FF] font-mono font-bold mb-3 flex items-center gap-2 tracking-wider" : "text-blue-400 font-semibold mb-3 flex items-center gap-2"}>
                              <span className="flex items-center gap-2">
                                <TbSwimming className="w-4 h-4" /> {useTerminal ? "SWIM" : "Swim"}
                              </span>
                            </h4>
                            <div className="space-y-2">
                              {[
                                "Wetsuit",
                                "Goggles (+ backup)",
                                "Swim cap",
                                "Body glide",
                              ].map((item) => (
                                <label
                                  key={item}
                                  className={useTerminal ? "flex items-center gap-2 text-text-primary font-mono" : "flex items-center gap-2 text-white/80"}
                                >
                                  <input type="checkbox" className={useTerminal ? "border-2 border-terminal-border" : "rounded"} style={useTerminal ? { borderRadius: 0 } : undefined} />
                                  <span className="text-sm">{useTerminal ? item.toUpperCase() : item}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className={useTerminal ? "text-[#FF6B35] font-mono font-bold mb-3 flex items-center gap-2 tracking-wider" : "text-orange-400 font-semibold mb-3 flex items-center gap-2"}>
                              <span className="flex items-center gap-2">
                                <TbBike className="w-4 h-4" /> {useTerminal ? "BIKE" : "Bike"}
                              </span>
                            </h4>
                            <div className="space-y-2">
                              {[
                                "Helmet",
                                "Bike shoes",
                                "Cycling kit",
                                "Spare tubes (2)",
                                "CO2 cartridges",
                                "Multi-tool",
                              ].map((item) => (
                                <label
                                  key={item}
                                  className={useTerminal ? "flex items-center gap-2 text-text-primary font-mono" : "flex items-center gap-2 text-white/80"}
                                >
                                  <input type="checkbox" className={useTerminal ? "border-2 border-terminal-border" : "rounded"} style={useTerminal ? { borderRadius: 0 } : undefined} />
                                  <span className="text-sm">{useTerminal ? item.toUpperCase() : item}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className={useTerminal ? "text-[#4ECDC4] font-mono font-bold mb-3 flex items-center gap-2 tracking-wider" : "text-green-400 font-semibold mb-3 flex items-center gap-2"}>
                              <span className="flex items-center gap-2">
                                <TbRun className="w-4 h-4" /> {useTerminal ? "RUN" : "Run"}
                              </span>
                            </h4>
                            <div className="space-y-2">
                              {[
                                "Running shoes",
                                "Race belt",
                                "Hat/visor",
                                "Sunglasses",
                              ].map((item) => (
                                <label
                                  key={item}
                                  className={useTerminal ? "flex items-center gap-2 text-text-primary font-mono" : "flex items-center gap-2 text-white/80"}
                                >
                                  <input type="checkbox" className={useTerminal ? "border-2 border-terminal-border" : "rounded"} style={useTerminal ? { borderRadius: 0 } : undefined} />
                                  <span className="text-sm">{useTerminal ? item.toUpperCase() : item}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        className={
                          useTerminal
                            ? "bg-terminal-panel border-2 border-terminal-border p-6"
                            : "bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl"
                        }
                        style={useTerminal ? { borderRadius: 0 } : undefined}
                      >
                        <h3 className={useTerminal ? "text-lg font-bold text-text-primary mb-4 font-mono tracking-wider" : "text-xl font-bold text-white mb-4"}>
                          {useTerminal ? "TRANSITION SETUP" : "Transition Setup"}
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div
                            className={
                              useTerminal
                                ? "bg-[#00D4FF]/10 border border-[#00D4FF]/50 p-4"
                                : "bg-blue-500/10 rounded-xl p-4"
                            }
                            style={useTerminal ? { borderRadius: 0 } : undefined}
                          >
                            <h4 className={useTerminal ? "text-[#00D4FF] font-mono font-bold mb-2" : "text-blue-300 font-semibold mb-2"}>
                              {useTerminal ? "T1: SWIM → BIKE" : "T1: Swim → Bike"}
                            </h4>
                            <ul className={useTerminal ? "text-text-secondary text-sm space-y-1 font-mono" : "text-white/80 text-sm space-y-1"}>
                              <li>• {useTerminal ? "TOWEL FOR FEET" : "Towel for feet"}</li>
                              <li>• {useTerminal ? "CYCLING SHOES READY" : "Cycling shoes ready"}</li>
                              <li>• {useTerminal ? "HELMET ON FIRST" : "Helmet on first"}</li>
                              <li>• {useTerminal ? "NUTRITION IN BIKE BOTTLE" : "Nutrition in bike bottle"}</li>
                            </ul>
                          </div>
                          <div
                            className={
                              useTerminal
                                ? "bg-[#FF6B35]/10 border border-[#FF6B35]/50 p-4"
                                : "bg-orange-500/10 rounded-xl p-4"
                            }
                            style={useTerminal ? { borderRadius: 0 } : undefined}
                          >
                            <h4 className={useTerminal ? "text-[#FF6B35] font-mono font-bold mb-2" : "text-orange-300 font-semibold mb-2"}>
                              {useTerminal ? "T2: BIKE → RUN" : "T2: Bike → Run"}
                            </h4>
                            <ul className={useTerminal ? "text-text-secondary text-sm space-y-1 font-mono" : "text-white/80 text-sm space-y-1"}>
                              <li>• {useTerminal ? "RUNNING SHOES LOOSE LACED" : "Running shoes loose laced"}</li>
                              <li>• {useTerminal ? "RACE BELT WITH NUMBER" : "Race belt with number"}</li>
                              <li>• {useTerminal ? "HAT & SUNGLASSES READY" : "Hat & sunglasses ready"}</li>
                              <li>• {useTerminal ? "RUNNING NUTRITION" : "Running nutrition"}</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === "strategy" && (
                    <div
                      className={
                        useTerminal
                          ? "bg-terminal-panel border-2 border-terminal-border p-6"
                          : "bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl"
                      }
                      style={useTerminal ? { borderRadius: 0 } : undefined}
                    >
                      <h3
                        className={
                          useTerminal
                            ? "text-lg font-bold text-text-primary mb-6 font-mono tracking-wider"
                            : "text-xl font-bold text-white mb-6"
                        }
                      >
                        {useTerminal ? "RACE STRATEGY PLAN" : "Race Strategy Plan"}
                      </h3>
                      <div className="space-y-6">
                        {/* Swim Strategy */}
                        <div
                          className={
                            useTerminal
                              ? "border-2 border-[#00D4FF] p-4 bg-[#00D4FF]/10"
                              : "border border-blue-400/30 rounded-xl p-4 bg-blue-500/5"
                          }
                          style={useTerminal ? { borderRadius: 0 } : undefined}
                        >
                          <h4
                            className={
                              useTerminal
                                ? "text-[#00D4FF] font-mono font-bold mb-3 tracking-wider"
                                : "text-blue-400 font-semibold mb-3"
                            }
                          >
                            {useTerminal ? "SWIM STRATEGY" : "Swim Strategy"}
                          </h4>
                          <div
                            className={
                              useTerminal
                                ? "grid md:grid-cols-2 gap-4 text-text-primary text-sm font-mono"
                                : "grid md:grid-cols-2 gap-4 text-white/80 text-sm"
                            }
                          >
                            <div>
                              <strong>{useTerminal ? "POSITION:" : "Position:"}</strong>{" "}
                              {useTerminal ? "START WIDE RIGHT TO AVOID CROWDS" : "Start wide right to avoid crowds"}
                              <br />
                              <strong>{useTerminal ? "PACE:" : "Pace:"}</strong>{" "}
                              {useTerminal ? "CONTROLLED EFFORT, SAVE ENERGY" : "Controlled effort, save energy"}
                              <br />
                              <strong>{useTerminal ? "SIGHTING:" : "Sighting:"}</strong>{" "}
                              {useTerminal ? "EVERY 6-8 STROKES" : "Every 6-8 strokes"}
                            </div>
                            <div>
                              <strong>{useTerminal ? "TARGET TIME:" : "Target Time:"}</strong> 8:30 - 9:00
                              <br />
                              <strong>{useTerminal ? "EXIT:" : "Exit:"}</strong>{" "}
                              {useTerminal ? "GRADUAL STAND IN SHALLOW WATER" : "Gradual stand in shallow water"}
                              <br />
                              <strong>{useTerminal ? "TRANSITION:" : "Transition:"}</strong>{" "}
                              {useTerminal ? "RUN TO T1, WETSUIT OFF QUICKLY" : "Run to T1, wetsuit off quickly"}
                            </div>
                          </div>
                        </div>

                        {/* Bike Strategy */}
                        <div
                          className={
                            useTerminal
                              ? "border-2 border-[#FF6B35] p-4 bg-[#FF6B35]/10"
                              : "border border-orange-400/30 rounded-xl p-4 bg-orange-500/5"
                          }
                          style={useTerminal ? { borderRadius: 0 } : undefined}
                        >
                          <h4
                            className={
                              useTerminal
                                ? "text-[#FF6B35] font-mono font-bold mb-3 tracking-wider"
                                : "text-orange-400 font-semibold mb-3"
                            }
                          >
                            {useTerminal ? "BIKE STRATEGY" : "Bike Strategy"}
                          </h4>
                          <div
                            className={
                              useTerminal
                                ? "grid md:grid-cols-2 gap-4 text-text-primary text-sm font-mono"
                                : "grid md:grid-cols-2 gap-4 text-white/80 text-sm"
                            }
                          >
                            <div>
                              <strong>{useTerminal ? "FIRST 10 MIN:" : "First 10 min:"}</strong>{" "}
                              {useTerminal ? "EASY SPIN, SETTLE IN" : "Easy spin, settle in"}
                              <br />
                              <strong>{useTerminal ? "MAIN EFFORT:" : "Main effort:"}</strong>{" "}
                              {useTerminal ? "80% THRESHOLD PACE" : "80% threshold pace"}
                              <br />
                              <strong>{useTerminal ? "HILLS:" : "Hills:"}</strong>{" "}
                              {useTerminal ? "STAY SEATED, STEADY POWER" : "Stay seated, steady power"}
                            </div>
                            <div>
                              <strong>{useTerminal ? "TARGET TIME:" : "Target Time:"}</strong> 42:00 - 44:00
                              <br />
                              <strong>{useTerminal ? "NUTRITION:" : "Nutrition:"}</strong>{" "}
                              {useTerminal ? "GEL AT 30MIN MARK" : "Gel at 30min mark"}
                              <br />
                              <strong>{useTerminal ? "FINAL 10 MIN:" : "Final 10 min:"}</strong>{" "}
                              {useTerminal ? "PREPARE LEGS FOR RUN" : "Prepare legs for run"}
                            </div>
                          </div>
                        </div>

                        {/* Run Strategy */}
                        <div
                          className={
                            useTerminal
                              ? "border-2 border-[#4ECDC4] p-4 bg-[#4ECDC4]/10"
                              : "border border-green-400/30 rounded-xl p-4 bg-green-500/5"
                          }
                          style={useTerminal ? { borderRadius: 0 } : undefined}
                        >
                          <h4
                            className={
                              useTerminal
                                ? "text-[#4ECDC4] font-mono font-bold mb-3 tracking-wider"
                                : "text-green-400 font-semibold mb-3"
                            }
                          >
                            {useTerminal ? "RUN STRATEGY" : "Run Strategy"}
                          </h4>
                          <div
                            className={
                              useTerminal
                                ? "grid md:grid-cols-2 gap-4 text-text-primary text-sm font-mono"
                                : "grid md:grid-cols-2 gap-4 text-white/80 text-sm"
                            }
                          >
                            <div>
                              <strong>{useTerminal ? "FIRST MILE:" : "First mile:"}</strong>{" "}
                              {useTerminal ? "CONTROLLED PACE, FIND RHYTHM" : "Controlled pace, find rhythm"}
                              <br />
                              <strong>{useTerminal ? "MIDDLE MILES:" : "Middle miles:"}</strong>{" "}
                              {useTerminal ? "TARGET RACE PACE" : "Target race pace"}
                              <br />
                              <strong>{useTerminal ? "FINAL MILE:" : "Final mile:"}</strong>{" "}
                              {useTerminal ? "EMPTY THE TANK" : "Empty the tank"}
                            </div>
                            <div>
                              <strong>{useTerminal ? "TARGET TIME:" : "Target Time:"}</strong> 23:00 - 24:00
                              <br />
                              <strong>{useTerminal ? "HYDRATION:" : "Hydration:"}</strong>{" "}
                              {useTerminal ? "EVERY AID STATION" : "Every aid station"}
                              <br />
                              <strong>{useTerminal ? "FORM CUES:" : "Form cues:"}</strong>{" "}
                              {useTerminal ? "RELAX SHOULDERS, QUICK TURNOVER" : "Relax shoulders, quick turnover"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "timeline" && (
                    <div
                      className={
                        useTerminal
                          ? "bg-terminal-panel border-2 border-terminal-border p-6"
                          : "bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl"
                      }
                      style={useTerminal ? { borderRadius: 0 } : undefined}
                    >
                      <h3
                        className={
                          useTerminal
                            ? "text-lg font-bold text-text-primary mb-6 font-mono tracking-wider"
                            : "text-xl font-bold text-white mb-6"
                        }
                      >
                        {useTerminal ? "RACE DAY TIMELINE" : "Race Day Timeline"}
                      </h3>
                      <div className="space-y-4">
                        {[
                          {
                            time: "5:00 AM",
                            task: "Wake up, light breakfast",
                            color: "#00D4FF",
                            terminalTask: "WAKE UP, LIGHT BREAKFAST",
                          },
                          {
                            time: "5:45 AM",
                            task: "Final gear check, leave for venue",
                            color: "#00D4FF",
                            terminalTask: "FINAL GEAR CHECK, LEAVE FOR VENUE",
                          },
                          {
                            time: "6:30 AM",
                            task: "Arrive at race venue, packet pickup",
                            color: "#FF6B35",
                            terminalTask: "ARRIVE AT RACE VENUE, PACKET PICKUP",
                          },
                          {
                            time: "6:45 AM",
                            task: "Set up transition area",
                            color: "#FF6B35",
                            terminalTask: "SET UP TRANSITION AREA",
                          },
                          {
                            time: "7:15 AM",
                            task: "Wetsuit on, warm-up swim",
                            color: "#00D4FF",
                            terminalTask: "WETSUIT ON, WARM-UP SWIM",
                          },
                          {
                            time: "7:45 AM",
                            task: "Pre-race briefing",
                            color: "#4ECDC4",
                            terminalTask: "PRE-RACE BRIEFING",
                          },
                          {
                            time: "8:00 AM",
                            task: "Race start!",
                            color: "#FFD866",
                            terminalTask: "RACE START!",
                            icon: "TbFlag",
                          },
                        ].map((item, index) => (
                          <div
                            key={index}
                            className={
                              useTerminal
                                ? "flex items-center gap-4 p-4 bg-terminal-bg border border-terminal-border"
                                : "flex items-center gap-4 p-4 bg-white/5 rounded-xl"
                            }
                            style={useTerminal ? { borderRadius: 0 } : undefined}
                          >
                            <div
                              className={useTerminal ? "w-3 h-3 border-2 flex-shrink-0" : "w-3 h-3 rounded-full flex-shrink-0"}
                              style={
                                useTerminal
                                  ? { backgroundColor: item.color, borderColor: item.color, borderRadius: 0 }
                                  : { backgroundColor: item.color }
                              }
                            ></div>
                            <div className="flex-1 flex justify-between items-center gap-4">
                              <span
                                className={
                                  useTerminal
                                    ? "text-text-primary font-mono font-bold"
                                    : "text-white font-medium"
                                }
                              >
                                {useTerminal ? item.terminalTask : item.task}
                              </span>
                              <span
                                className={
                                  useTerminal
                                    ? "text-accent-yellow font-mono font-bold flex-shrink-0"
                                    : "text-white/70 font-mono flex-shrink-0"
                                }
                              >
                                {useTerminal ? `[${item.time}]` : item.time}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </AuthGuard>
    </Provider>
  );
}
