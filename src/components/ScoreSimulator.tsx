import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Sparkles, ArrowRight, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ScoreSimulatorProps {
  currentScore: number;
  initialData: any;
}

export function ScoreSimulator({ currentScore, initialData }: ScoreSimulatorProps) {
  const [projectedScore, setProjectedScore] = useState(currentScore);
  const [isSimulating, setIsSimulating] = useState(false);
  const [savingsLevel, setSavingsLevel] = useState(2); // 0: Never, 1: Rarely, 2: Monthly, 3: Weekly, 4: Daily
  const [monthsActive, setMonthsActive] = useState(initialData.monthsActive);

  const runSimulation = () => {
    setIsSimulating(true);
    // Simple heuristic for simulation
    setTimeout(() => {
      let boost = 0;
      if (savingsLevel >= 3) boost += 12;
      if (monthsActive > initialData.monthsActive) boost += Math.min(15, (monthsActive - initialData.monthsActive) * 1.5);
      
      setProjectedScore(Math.min(98, currentScore + Math.round(boost)));
      setIsSimulating(false);
    }, 800);
  };

  const resetSimulation = () => {
    setProjectedScore(currentScore);
    setSavingsLevel(2);
    setMonthsActive(initialData.monthsActive);
  };

  return (
    <Card className="border-amber-100 bg-amber-50/30 overflow-hidden">
      <div className="bg-amber-100/50 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider">
          <TrendingUp className="w-3 h-3" />
          Score Improvement Simulator
        </div>
        {projectedScore > currentScore && (
          <Badge className="bg-emerald-500 text-white border-none text-[10px]">
            +{projectedScore - currentScore} Potential Boost
          </Badge>
        )}
      </div>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label className="text-xs font-bold text-stone-600 uppercase">Savings Discipline</Label>
                <span className="text-xs font-bold text-amber-700">
                  {["Never", "Rarely", "Monthly", "Weekly", "Daily"][savingsLevel]}
                </span>
              </div>
              <Slider 
                value={[savingsLevel]} 
                max={4} 
                step={1} 
                onValueChange={(v) => setSavingsLevel(v[0])}
                className="py-4"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Label className="text-xs font-bold text-stone-600 uppercase">Months of Activity</Label>
                <span className="text-xs font-bold text-amber-700">{monthsActive} Months</span>
              </div>
              <Slider 
                value={[monthsActive]} 
                min={initialData.monthsActive} 
                max={24} 
                step={1} 
                onValueChange={(v) => setMonthsActive(v[0])}
                className="py-4"
              />
            </div>
          </div>

          <div className="flex flex-col items-center justify-center bg-white rounded-2xl border border-amber-100 p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-amber-200" />
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Projected Score</span>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-stone-900">{isSimulating ? "..." : projectedScore}</span>
              <span className="text-stone-300 font-bold">/ 100</span>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-stone-500">
              <span>Current: {currentScore}</span>
              <ArrowRight className="w-3 h-3" />
              <span className="text-emerald-600">Target: {projectedScore}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={runSimulation}
            disabled={isSimulating}
            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold"
          >
            {isSimulating ? "Calculating..." : "Simulate Growth"}
            <Sparkles className="w-4 h-4 ml-2" />
          </Button>
          <Button 
            variant="ghost"
            onClick={resetSimulation}
            className="text-stone-400 hover:text-stone-600"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

import { Badge } from "@/components/ui/badge";
