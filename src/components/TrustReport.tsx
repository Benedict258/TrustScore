import { TrustScoreResult, UserData } from "@/src/services/gemini";
import { ShieldCheck, CheckCircle2, AlertCircle, Landmark } from "lucide-react";

interface TrustReportProps {
  result: TrustScoreResult;
  userData: UserData;
}

export function TrustReport({ result, userData }: TrustReportProps) {
  const reportId = `TS-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  const date = new Date().toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="hidden print:block bg-white p-12 text-stone-900 font-serif min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-stone-900 pb-8 mb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-1">TrustScore Report</h1>
          <p className="text-stone-500 font-sans text-sm font-bold uppercase tracking-widest">Alternative Credit Intelligence</p>
        </div>
        <div className="text-right font-sans">
          <p className="text-xs font-bold text-stone-400 uppercase">Report ID</p>
          <p className="font-bold">{reportId}</p>
          <p className="text-xs font-bold text-stone-400 uppercase mt-2">Date Generated</p>
          <p className="font-bold">{date}</p>
        </div>
      </div>

      {/* User Info */}
      <div className="grid grid-cols-2 gap-8 mb-12 font-sans">
        <div>
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Applicant Profile</h3>
          <p className="text-lg font-bold">{userData.businessType}</p>
          <p className="text-stone-600">Active for {userData.monthsActive} months</p>
        </div>
        <div>
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Verification Status</h3>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <p className="font-bold">{result.verification.verificationLevel}</p>
          </div>
          <p className="text-stone-600">Confidence Index: {result.verification.confidenceScore}%</p>
        </div>
      </div>

      {/* Score Section */}
      <div className="bg-stone-50 p-8 rounded-xl border border-stone-200 mb-12 flex items-center justify-between">
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Trust Score</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-7xl font-black">{result.score}</span>
            <span className="text-2xl font-bold text-stone-300">/ 100</span>
          </div>
          <p className={`text-xl font-bold ${
            result.tier === "Excellent" ? "text-emerald-600" :
            result.tier === "Good" ? "text-blue-600" :
            result.tier === "Fair" ? "text-amber-600" : "text-stone-600"
          }`}>
            {result.tier} Standing
          </p>
        </div>
        <div className="text-right space-y-2">
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Loan Readiness</h3>
          <p className="text-3xl font-bold text-stone-900">{result.maxLoanEligibility}</p>
          <p className="text-stone-500 text-sm italic">Estimated micro-loan range</p>
        </div>
      </div>

      {/* Analysis */}
      <div className="grid grid-cols-2 gap-12 mb-12">
        <div className="space-y-4">
          <h3 className="text-sm font-bold border-b border-stone-200 pb-2 uppercase tracking-widest">Behavioural Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-stone-500">Weekly Volume</span>
              <span className="font-bold">₦{userData.weeklyVolume}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Transaction Frequency</span>
              <span className="font-bold">{userData.weeklyFrequency} / week</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Savings Discipline</span>
              <span className="font-bold capitalize">{userData.savingsBehaviour}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Informal Debt Exposure</span>
              <span className="font-bold">{userData.hasInformalLoan ? `₦${userData.informalLoanAmount}` : "None"}</span>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-sm font-bold border-b border-stone-200 pb-2 uppercase tracking-widest">AI Interpretation</h3>
          <p className="text-sm text-stone-700 leading-relaxed italic">
            "{result.aiInterpretation}"
          </p>
        </div>
      </div>

      {/* Drivers */}
      <div className="grid grid-cols-2 gap-12 mb-12">
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Key Strengths</h3>
          <ul className="space-y-2">
            {result.positiveDrivers.map((d, i) => (
              <li key={i} className="text-sm flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-500 shrink-0" />
                {d}
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-amber-600 uppercase tracking-widest">Risk Considerations</h3>
          <ul className="space-y-2">
            {result.negativeDrivers.map((d, i) => (
              <li key={i} className="text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 text-amber-500 shrink-0" />
                {d}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action Plan */}
      <div className="p-6 bg-stone-900 text-white rounded-xl mb-12">
        <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">Improvement Action Plan</h3>
        <p className="font-medium">{result.improvementTip}</p>
      </div>

      {/* Footer */}
      <div className="border-t border-stone-200 pt-8 mt-auto">
        <div className="flex items-center gap-2 text-stone-400 mb-4">
          <Landmark className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">TrustScore Alternative Credit Intelligence</span>
        </div>
        <p className="text-[10px] text-stone-400 leading-relaxed">
          DISCLAIMER: This is an AI-generated alternative financial behaviour report and not a formal bureau score. 
          The score is calculated based on informal digital footprints and provided evidence. 
          Lenders should use this as a supplementary decision-making tool.
        </p>
      </div>
    </div>
  );
}
