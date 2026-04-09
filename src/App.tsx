import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { IntakeForm } from "./components/IntakeForm";
import { ScoreCard } from "./components/ScoreCard";
import { getTrustScore, UserData, TrustScoreResult } from "./services/gemini";
import { motion, AnimatePresence } from "motion/react";
import { History, TrendingUp, Info } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

interface HistoryItem {
  date: string;
  score: number;
  tier: string;
}

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TrustScoreResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Lifted form state to persist values during "Recalculate"
  const [formData, setFormData] = useState<UserData>({
    weeklyVolume: "20000-50000",
    weeklyFrequency: 5,
    businessType: "Market Trader",
    savingsBehaviour: "weekly",
    monthsActive: 6,
    hasInformalLoan: false,
    informalLoanAmount: 0,
  });

  useEffect(() => {
    const savedHistory = localStorage.getItem("trustscore_history");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const handleSubmit = async (data: UserData) => {
    setIsLoading(true);
    setError(null);
    setFormData(data); // Update persistent state
    
    try {
      const scoreResult = await getTrustScore(data);
      setResult(scoreResult);
      
      const newHistoryItem: HistoryItem = {
        date: new Date().toLocaleDateString(),
        score: scoreResult.score,
        tier: scoreResult.tier,
      };
      
      const updatedHistory = [newHistoryItem, ...history].slice(0, 5);
      setHistory(updatedHistory);
      localStorage.setItem("trustscore_history", JSON.stringify(updatedHistory));
      
      toast.success("Trust Score Generated!", {
        description: `Your score is ${scoreResult.score} (${scoreResult.tier})`,
      });
    } catch (err) {
      console.error(err);
      setError("Failed to generate score. Please check your connection and try again.");
      toast.error("Generation Failed", {
        description: "Please check your internet connection.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  const getScoreDiff = () => {
    if (history.length < 1 || !result) return null;
    // The history already contains the current score as the first item
    if (history.length < 2) return null;
    
    const current = result.score;
    const previous = history[1].score;
    return current - previous;
  };

  const scoreDiff = getScoreDiff();

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-stone-900 font-sans selection:bg-amber-100 selection:text-amber-900">
      <Header />
      <Toaster position="top-center" />
      
      <main className="container mx-auto px-4 py-8 md:py-12">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="text-center max-w-2xl mx-auto space-y-4">
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider"
                >
                  <TrendingUp className="w-3 h-3" />
                  Financial Inclusion for All
                </motion.div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight text-stone-900 leading-[1.1]">
                  Your behavior is your <span className="text-amber-600">credit.</span>
                </h2>
                <p className="text-lg text-stone-500 font-medium">
                  We transform your informal digital footprint into a verifiable Trust Score, 
                  helping you unlock formal financial opportunities.
                </p>
              </div>

              <IntakeForm 
                onSubmit={handleSubmit} 
                isLoading={isLoading} 
                initialData={formData}
              />

              {error && (
                <div className="max-w-2xl mx-auto p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-center font-medium">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="p-6 rounded-2xl bg-white border border-stone-100 shadow-sm space-y-2">
                  <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-400">
                    <Info className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-stone-900">Privacy First</h3>
                  <p className="text-sm text-stone-500">Your data is analyzed in real-time and never shared without your explicit consent.</p>
                </div>
                <div className="p-6 rounded-2xl bg-white border border-stone-100 shadow-sm space-y-2">
                  <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-400">
                    <History className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-stone-900">Track Progress</h3>
                  <p className="text-sm text-stone-500">Watch your score grow as you maintain consistent business activity and savings.</p>
                </div>
                <div className="p-6 rounded-2xl bg-white border border-stone-100 shadow-sm space-y-2">
                  <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-400">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-stone-900">Better Rates</h3>
                  <p className="text-sm text-stone-500">A higher Trust Score unlocks lower interest rates and higher loan limits from partners.</p>
                </div>
              </div>

              {history.length > 0 && (
                <div className="max-w-2xl mx-auto space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2">
                    <History className="w-4 h-4" />
                    Recent Scores
                  </h3>
                  <div className="space-y-2">
                    {history.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-white border border-stone-100">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-stone-400 uppercase">{item.date}</span>
                          <span className="font-bold text-stone-700">{item.tier}</span>
                        </div>
                        <div className="text-2xl font-black text-amber-600">{item.score}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <ScoreCard 
                result={result} 
                onReset={handleReset} 
                scoreDiff={scoreDiff}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="py-12 border-t border-stone-100 text-center">
        <p className="text-stone-400 text-xs font-medium uppercase tracking-widest">
          &copy; 2026 TrustScore AI · Empowering the Informal Economy
        </p>
      </footer>
    </div>
  );
}
