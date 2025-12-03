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
                          <div className="bg-white/5 rounded-xl p-4">
                            <h4 className="text-white font-semibold mb-2">
                              3 Days Before
                            </h4>
                            <p className="text-white/70 text-sm">
                              Carb loading begins
                            </p>
                            <p className="text-green-400 text-sm mt-2">
                              • Complex carbohydrates
                              <br />• Hydration focus
                            </p>
                          </div>
                          <div className="bg-white/5 rounded-xl p-4">
                            <h4 className="text-white font-semibold mb-2">
                              Race Morning
                            </h4>
                            <p className="text-white/70 text-sm">
                              Light, familiar foods
                            </p>
                            <p className="text-blue-400 text-sm mt-2">
                              • Banana + peanut butter
                              <br />• Coffee (if usual)
                            </p>
                          </div>
                          <div className="bg-white/5 rounded-xl p-4">
                            <h4 className="text-white font-semibold mb-2">
                              During Race
                            </h4>
                            <p className="text-white/70 text-sm">
                              Fuel strategy
                            </p>
                            <p className="text-orange-400 text-sm mt-2">
                              • Gels every 45min
                              <br />• Electrolyte drinks
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
                        <div className="bg-blue-500/10 rounded-xl p-4">
                          <p className="text-blue-300 mb-2">
                            For a 1:30:00 race duration:
                          </p>
                          <div className="grid grid-cols-2 gap-4 text-white">
                            <div>
                              <span className="text-white/70">Pre-race: </span>
                              <span className="font-semibold">16-20oz</span>
                            </div>
                            <div>
                              <span className="text-white/70">
                                During race:{" "}
                              </span>
                              <span className="font-semibold">
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
                            <h4 className="text-blue-400 font-semibold mb-3 flex items-center gap-2">
                              <span className="flex items-center gap-2">
                                <TbSwimming className="w-4 h-4" /> Swim
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
                                  className="flex items-center gap-2 text-white/80"
                                >
                                  <input type="checkbox" className="rounded" />
                                  <span className="text-sm">{item}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-orange-400 font-semibold mb-3 flex items-center gap-2">
                              <span className="flex items-center gap-2">
                                <TbBike className="w-4 h-4" /> Bike
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
                                  className="flex items-center gap-2 text-white/80"
                                >
                                  <input type="checkbox" className="rounded" />
                                  <span className="text-sm">{item}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-green-400 font-semibold mb-3 flex items-center gap-2">
                              <span className="flex items-center gap-2">
                                <TbRun className="w-4 h-4" /> Run
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
                                  className="flex items-center gap-2 text-white/80"
                                >
                                  <input type="checkbox" className="rounded" />
                                  <span className="text-sm">{item}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl">
                        <h3 className="text-xl font-bold text-white mb-4">
                          Transition Setup
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="bg-blue-500/10 rounded-xl p-4">
                            <h4 className="text-blue-300 font-semibold mb-2">
                              T1: Swim → Bike
                            </h4>
                            <ul className="text-white/80 text-sm space-y-1">
                              <li>• Towel for feet</li>
                              <li>• Cycling shoes ready</li>
                              <li>• Helmet on first</li>
                              <li>• Nutrition in bike bottle</li>
                            </ul>
                          </div>
                          <div className="bg-orange-500/10 rounded-xl p-4">
                            <h4 className="text-orange-300 font-semibold mb-2">
                              T2: Bike → Run
                            </h4>
                            <ul className="text-white/80 text-sm space-y-1">
                              <li>• Running shoes loose laced</li>
                              <li>• Race belt with number</li>
                              <li>• Hat & sunglasses ready</li>
                              <li>• Running nutrition</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === "strategy" && (
                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl">
                      <h3 className="text-xl font-bold text-white mb-6">
                        Race Strategy Plan
                      </h3>
                      <div className="space-y-6">
                        <div className="border border-blue-400/30 rounded-xl p-4 bg-blue-500/5">
                          <h4 className="text-blue-400 font-semibold mb-3">
                            Swim Strategy
                          </h4>
                          <div className="grid md:grid-cols-2 gap-4 text-white/80 text-sm">
                            <div>
                              <strong>Position:</strong> Start wide right to
                              avoid crowds
                              <br />
                              <strong>Pace:</strong> Controlled effort, save
                              energy
                              <br />
                              <strong>Sighting:</strong> Every 6-8 strokes
                            </div>
                            <div>
                              <strong>Target Time:</strong> 8:30 - 9:00
                              <br />
                              <strong>Exit:</strong> Gradual stand in shallow
                              water
                              <br />
                              <strong>Transition:</strong> Run to T1, wetsuit
                              off quickly
                            </div>
                          </div>
                        </div>

                        <div className="border border-orange-400/30 rounded-xl p-4 bg-orange-500/5">
                          <h4 className="text-orange-400 font-semibold mb-3">
                            Bike Strategy
                          </h4>
                          <div className="grid md:grid-cols-2 gap-4 text-white/80 text-sm">
                            <div>
                              <strong>First 10 min:</strong> Easy spin, settle
                              in
                              <br />
                              <strong>Main effort:</strong> 80% threshold pace
                              <br />
                              <strong>Hills:</strong> Stay seated, steady power
                            </div>
                            <div>
                              <strong>Target Time:</strong> 42:00 - 44:00
                              <br />
                              <strong>Nutrition:</strong> Gel at 30min mark
                              <br />
                              <strong>Final 10 min:</strong> Prepare legs for
                              run
                            </div>
                          </div>
                        </div>

                        <div className="border border-green-400/30 rounded-xl p-4 bg-green-500/5">
                          <h4 className="text-green-400 font-semibold mb-3">
                            Run Strategy
                          </h4>
                          <div className="grid md:grid-cols-2 gap-4 text-white/80 text-sm">
                            <div>
                              <strong>First mile:</strong> Controlled pace, find
                              rhythm
                              <br />
                              <strong>Middle miles:</strong> Target race pace
                              <br />
                              <strong>Final mile:</strong> Empty the tank
                            </div>
                            <div>
                              <strong>Target Time:</strong> 23:00 - 24:00
                              <br />
                              <strong>Hydration:</strong> Every aid station
                              <br />
                              <strong>Form cues:</strong> Relax shoulders, quick
                              turnover
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "timeline" && (
                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl">
                      <h3 className="text-xl font-bold text-white mb-6">
                        Race Day Timeline
                      </h3>
                      <div className="space-y-4">
                        {[
                          {
                            time: "5:00 AM",
                            task: "Wake up, light breakfast",
                            color: "blue",
                          },
                          {
                            time: "5:45 AM",
                            task: "Final gear check, leave for venue",
                            color: "blue",
                          },
                          {
                            time: "6:30 AM",
                            task: "Arrive at race venue, packet pickup",
                            color: "orange",
                          },
                          {
                            time: "6:45 AM",
                            task: "Set up transition area",
                            color: "orange",
                          },
                          {
                            time: "7:15 AM",
                            task: "Wetsuit on, warm-up swim",
                            color: "cyan",
                          },
                          {
                            time: "7:45 AM",
                            task: "Pre-race briefing",
                            color: "green",
                          },
                          {
                            time: "8:00 AM",
                            task: "Race start!",
                            color: "red",
                            icon: "TbFlag",
                          },
                        ].map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-4 p-4 bg-white/5 rounded-xl"
                          >
                            <div
                              className={`w-3 h-3 rounded-full bg-${item.color}-500`}
                            ></div>
                            <div className="flex-1 flex justify-between items-center">
                              <span className="text-white font-medium">
                                {item.task}
                              </span>
                              <span className="text-white/70 font-mono">
                                {item.time}
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
