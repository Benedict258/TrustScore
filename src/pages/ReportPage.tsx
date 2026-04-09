import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getScoreById } from "@/src/lib/firebase";
import { TrustReport } from "@/src/components/TrustReport";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Download, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";

export function ReportPage() {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReport() {
      if (!id) return;
      try {
        const data = await getScoreById(id);
        if (data) {
          setReport(data);
        } else {
          setError("Report not found");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load report");
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-amber-600" />
          <p className="text-stone-500 font-bold uppercase tracking-widest text-xs">Fetching Verifiable Report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-stone-900">Report Unavailable</h2>
          <p className="text-stone-500 max-w-md">{error || "This report may have been deleted or the link is invalid."}</p>
        </div>
        <Link to="/">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
          <Link to="/">
            <Button variant="ghost" className="gap-2 text-stone-500 hover:text-stone-900">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3" />
              Verified Financial Identity
            </div>
            <Button onClick={() => window.print()} className="bg-stone-900 hover:bg-stone-800 text-white gap-2">
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-stone-200"
        >
          {/* We reuse the TrustReport component but wrap it in a visible container for the web view */}
          <div className="p-8 sm:p-12 report-print-container">
             <TrustReport result={report} userData={report.userData} />
             
             {/* Since TrustReport has hidden print:block, we need a visible version for the web */}
             <div className="print:hidden">
                {/* We can just remove the hidden print:block from TrustReport or create a visible wrapper */}
                <p className="text-center text-stone-400 text-xs mt-12 pt-8 border-t border-stone-100">
                  This is a public verifiable version of the TrustScore report.
                </p>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
