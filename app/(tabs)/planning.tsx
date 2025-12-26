import React, { useState, useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "../../src/store";
import { RaceSpecificPlanning } from "../../src/components/RaceSpecificPlanning";
import { AuthGuard } from "../../src/components/AuthGuard";
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
          className="bg-terminal-bg relative overflow-auto"
          style={{ minHeight: "100vh", minHeight: "100dvh" }}
        >

          <div className="relative z-10 p-6 pb-24">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-text-primary font-mono tracking-wider mb-2">
                    RACE PLANNING
                  </h1>
                  <p className="text-sm text-text-secondary font-mono uppercase tracking-wide">
                    PLAN YOUR NUTRITION, GEAR, AND RACE STRATEGY
                  </p>
                </div>

                {/* Mode Toggle */}
                <div className="flex bg-terminal-panel border-2 border-terminal-border p-1">
                  <button
                    onClick={() => setPlanningMode("race-specific")}
                    className={`px-4 py-2 text-sm font-medium font-mono transition-colors ${
                      planningMode === "race-specific"
                        ? "bg-accent-yellow text-terminal-bg"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                    style={{ borderRadius: 0 }}
                  >
                    RACE-SPECIFIC
                  </button>
                  <button
                    onClick={() => setPlanningMode("general")}
                    className={`px-4 py-2 text-sm font-medium font-mono transition-colors ${
                      planningMode === "general"
                        ? "bg-accent-yellow text-terminal-bg"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                    style={{ borderRadius: 0 }}
                  >
                    GENERAL
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
                  className={`px-4 py-3 font-medium transition-colors flex items-center gap-2 font-mono text-sm ${
                    activeTab === tab.id
                      ? "bg-terminal-panel text-accent-yellow border-2 border-accent-yellow"
                      : "bg-terminal-panel text-text-secondary border-2 border-terminal-border hover:border-text-secondary"
                  }`}
                  style={{ borderRadius: 0 }}
                >
                  {renderIcon(tab.icon, "w-5 h-5")}
                  {tab.label.toUpperCase()}
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
                        className="bg-terminal-panel border-2 border-terminal-border p-6 shadow-xl"
                        style={{ borderRadius: 0 }}
                      >
                        <h3 className="text-lg font-bold text-text-primary mb-4 font-mono tracking-wider">
                          PRE-RACE NUTRITION PLAN
                        </h3>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div
                            className="bg-terminal-bg border border-terminal-border p-4"
                            style={{ borderRadius: 0 }}
                          >
                            <h4 className="text-text-primary font-mono font-bold mb-2">
                              3 DAYS BEFORE
                            </h4>
                            <p className="text-text-secondary text-sm font-mono">
                              CARB LOADING BEGINS
                            </p>
                            <p className="text-[#4ECDC4] text-sm mt-2 font-mono">
                              • COMPLEX CARBS
                              <br />• HYDRATION FOCUS
                            </p>
                          </div>
                          <div
                            className="bg-terminal-bg border border-terminal-border p-4"
                            style={{ borderRadius: 0 }}
                          >
                            <h4 className="text-text-primary font-mono font-bold mb-2">
                              RACE MORNING
                            </h4>
                            <p className="text-text-secondary text-sm font-mono">
                              LIGHT, FAMILIAR FOODS
                            </p>
                            <p className="text-[#00D4FF] text-sm mt-2 font-mono">
                              • BANANA + PEANUT BUTTER
                              <br />• COFFEE (IF USUAL)
                            </p>
                          </div>
                          <div
                            className="bg-terminal-bg border border-terminal-border p-4"
                            style={{ borderRadius: 0 }}
                          >
                            <h4 className="text-text-primary font-mono font-bold mb-2">
                              DURING RACE
                            </h4>
                            <p className="text-text-secondary text-sm font-mono">
                              FUEL STRATEGY
                            </p>
                            <p className="text-[#FF6B35] text-sm mt-2 font-mono">
                              • GELS EVERY 45MIN
                              <br />• ELECTROLYTE DRINKS
                            </p>
                          </div>
                        </div>
                      </div>

                      <div
                        className="bg-terminal-panel border-2 border-terminal-border p-6 shadow-xl"
                        style={{ borderRadius: 0 }}
                      >
                        <h3 className="text-lg font-bold text-text-primary mb-4 font-mono tracking-wider">
                          HYDRATION CALCULATOR
                        </h3>
                        <div
                          className="bg-[#00D4FF]/10 border border-[#00D4FF]/50 p-4"
                          style={{ borderRadius: 0 }}
                        >
                          <p className="text-[#00D4FF] mb-2 font-mono font-bold">
                            FOR A 1:30:00 RACE DURATION:
                          </p>
                          <div className="grid grid-cols-2 gap-4 text-text-primary font-mono">
                            <div>
                              <span className="text-text-secondary">
                                PRE-RACE:
                              </span>
                              <span className="font-bold">16-20oz</span>
                            </div>
                            <div>
                              <span className="text-text-secondary">
                                DURING RACE:
                              </span>
                              <span className="font-bold">
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
                        className="bg-terminal-panel border-2 border-terminal-border p-6 shadow-xl"
                        style={{ borderRadius: 0 }}
                      >
                        <h3 className="text-lg font-bold text-text-primary mb-4 font-mono tracking-wider">
                          ESSENTIAL GEAR CHECKLIST
                        </h3>
                        <div className="grid md:grid-cols-3 gap-6">
                          <div>
                            <h4 className="text-[#00D4FF] font-mono font-bold mb-3 flex items-center gap-2 tracking-wider">
                              <span className="flex items-center gap-2">
                                <TbSwimming className="w-4 h-4" /> SWIM
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
                                  className="flex items-center gap-2 text-text-primary font-mono"
                                >
                                  <input type="checkbox" className="border-2 border-terminal-border" style={{ borderRadius: 0 }} />
                                  <span className="text-sm">{item.toUpperCase()}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-[#FF6B35] font-mono font-bold mb-3 flex items-center gap-2 tracking-wider">
                              <span className="flex items-center gap-2">
                                <TbBike className="w-4 h-4" /> BIKE
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
                                  className="flex items-center gap-2 text-text-primary font-mono"
                                >
                                  <input type="checkbox" className="border-2 border-terminal-border" style={{ borderRadius: 0 }} />
                                  <span className="text-sm">{item.toUpperCase()}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-[#4ECDC4] font-mono font-bold mb-3 flex items-center gap-2 tracking-wider">
                              <span className="flex items-center gap-2">
                                <TbRun className="w-4 h-4" /> RUN
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
                                  className="flex items-center gap-2 text-text-primary font-mono"
                                >
                                  <input type="checkbox" className="border-2 border-terminal-border" style={{ borderRadius: 0 }} />
                                  <span className="text-sm">{item.toUpperCase()}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        className="bg-terminal-panel border-2 border-terminal-border p-6"
                        style={{ borderRadius: 0 }}
                      >
                        <h3 className="text-lg font-bold text-text-primary mb-4 font-mono tracking-wider">
                          TRANSITION SETUP
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div
                            className="bg-[#00D4FF]/10 border border-[#00D4FF]/50 p-4"
                            style={{ borderRadius: 0 }}
                          >
                            <h4 className="text-[#00D4FF] font-mono font-bold mb-2">
                              T1: SWIM → BIKE
                            </h4>
                            <ul className="text-text-secondary text-sm space-y-1 font-mono">
                              <li>• TOWEL FOR FEET</li>
                              <li>• CYCLING SHOES READY</li>
                              <li>• HELMET ON FIRST</li>
                              <li>• NUTRITION IN BIKE BOTTLE</li>
                            </ul>
                          </div>
                          <div
                            className="bg-[#FF6B35]/10 border border-[#FF6B35]/50 p-4"
                            style={{ borderRadius: 0 }}
                          >
                            <h4 className="text-[#FF6B35] font-mono font-bold mb-2">
                              T2: BIKE → RUN
                            </h4>
                            <ul className="text-text-secondary text-sm space-y-1 font-mono">
                              <li>• RUNNING SHOES LOOSE LACED</li>
                              <li>• RACE BELT WITH NUMBER</li>
                              <li>• HAT & SUNGLASSES READY</li>
                              <li>• RUNNING NUTRITION</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === "strategy" && (
                    <div
                      className="bg-terminal-panel border-2 border-terminal-border p-6"
                      style={{ borderRadius: 0 }}
                    >
                      <h3 className="text-lg font-bold text-text-primary mb-6 font-mono tracking-wider">
                        RACE STRATEGY PLAN
                      </h3>
                      <div className="space-y-6">
                        {/* Swim Strategy */}
                        <div
                          className="border-2 border-[#00D4FF] p-4 bg-[#00D4FF]/10"
                          style={{ borderRadius: 0 }}
                        >
                          <h4 className="text-[#00D4FF] font-mono font-bold mb-3 tracking-wider">
                            SWIM STRATEGY
                          </h4>
                          <div className="grid md:grid-cols-2 gap-4 text-text-primary text-sm font-mono">
                            <div>
                              <strong>POSITION:</strong> START WIDE RIGHT TO AVOID CROWDS
                              <br />
                              <strong>PACE:</strong> CONTROLLED EFFORT, SAVE ENERGY
                              <br />
                              <strong>SIGHTING:</strong> EVERY 6-8 STROKES
                            </div>
                            <div>
                              <strong>TARGET TIME:</strong> 8:30 - 9:00
                              <br />
                              <strong>EXIT:</strong> GRADUAL STAND IN SHALLOW WATER
                              <br />
                              <strong>TRANSITION:</strong> RUN TO T1, WETSUIT OFF QUICKLY
                            </div>
                          </div>
                        </div>

                        {/* Bike Strategy */}
                        <div
                          className="border-2 border-[#FF6B35] p-4 bg-[#FF6B35]/10"
                          style={{ borderRadius: 0 }}
                        >
                          <h4 className="text-[#FF6B35] font-mono font-bold mb-3 tracking-wider">
                            BIKE STRATEGY
                          </h4>
                          <div className="grid md:grid-cols-2 gap-4 text-text-primary text-sm font-mono">
                            <div>
                              <strong>FIRST 10 MIN:</strong> EASY SPIN, SETTLE IN
                              <br />
                              <strong>MAIN EFFORT:</strong> 80% THRESHOLD PACE
                              <br />
                              <strong>HILLS:</strong> STAY SEATED, STEADY POWER
                            </div>
                            <div>
                              <strong>TARGET TIME:</strong> 42:00 - 44:00
                              <br />
                              <strong>NUTRITION:</strong> GEL AT 30MIN MARK
                              <br />
                              <strong>FINAL 10 MIN:</strong> PREPARE LEGS FOR RUN
                            </div>
                          </div>
                        </div>

                        {/* Run Strategy */}
                        <div
                          className="border-2 border-[#4ECDC4] p-4 bg-[#4ECDC4]/10"
                          style={{ borderRadius: 0 }}
                        >
                          <h4 className="text-[#4ECDC4] font-mono font-bold mb-3 tracking-wider">
                            RUN STRATEGY
                          </h4>
                          <div className="grid md:grid-cols-2 gap-4 text-text-primary text-sm font-mono">
                            <div>
                              <strong>FIRST MILE:</strong> CONTROLLED PACE, FIND RHYTHM
                              <br />
                              <strong>MIDDLE MILES:</strong> TARGET RACE PACE
                              <br />
                              <strong>FINAL MILE:</strong> EMPTY THE TANK
                            </div>
                            <div>
                              <strong>TARGET TIME:</strong> 23:00 - 24:00
                              <br />
                              <strong>HYDRATION:</strong> EVERY AID STATION
                              <br />
                              <strong>FORM CUES:</strong> RELAX SHOULDERS, QUICK TURNOVER
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "timeline" && (
                    <div
                      className="bg-terminal-panel border-2 border-terminal-border p-6"
                      style={{ borderRadius: 0 }}
                    >
                      <h3 className="text-lg font-bold text-text-primary mb-6 font-mono tracking-wider">
                        RACE DAY TIMELINE
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
                            className="flex items-center gap-4 p-4 bg-terminal-bg border border-terminal-border"
                            style={{ borderRadius: 0 }}
                          >
                            <div
                              className="w-3 h-3 border-2 flex-shrink-0"
                              style={{ backgroundColor: item.color, borderColor: item.color, borderRadius: 0 }}
                            ></div>
                            <div className="flex-1 flex justify-between items-center gap-4">
                              <span className="text-text-primary font-mono font-bold">
                                {item.terminalTask}
                              </span>
                              <span className="text-accent-yellow font-mono font-bold flex-shrink-0">
                                [{item.time}]
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
