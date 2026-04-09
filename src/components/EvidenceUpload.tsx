import * as React from "react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, FileText, Image as ImageIcon, CheckCircle2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface EvidenceUploadProps {
  onUpload: (files: string[]) => void;
  isAnalyzing: boolean;
}

export function EvidenceUpload({ onUpload, isAnalyzing }: EvidenceUploadProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;

    const newPreviews: string[] = [];
    let processed = 0;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        processed++;
        if (processed === files.length) {
          const updated = [...previews, ...newPreviews].slice(0, 3);
          setPreviews(updated);
          onUpload(updated);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    const updated = previews.filter((_, i) => i !== index);
    setPreviews(updated);
    onUpload(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-stone-900">Evidence of Activity (Optional)</h4>
          <p className="text-xs text-stone-500">Upload screenshots of mobile money transactions or savings to boost your Confidence Score.</p>
        </div>
        {previews.length > 0 && (
          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-100">
            {previews.length}/3 Uploaded
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <AnimatePresence>
          {previews.map((preview, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative aspect-square rounded-lg border border-stone-200 overflow-hidden bg-stone-50 group"
            >
              <img src={preview} alt="Evidence preview" className="w-full h-full object-cover" />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 p-1 bg-white/80 backdrop-blur-sm rounded-full text-stone-600 hover:text-rose-600 transition-colors shadow-sm"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
          
          {previews.length < 3 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-lg border-2 border-dashed border-stone-200 flex flex-col items-center justify-center gap-2 text-stone-400 hover:border-amber-400 hover:text-amber-500 transition-all bg-stone-50/50"
            >
              <Upload className="w-5 h-5" />
              <span className="text-[10px] font-medium uppercase tracking-wider">Add Proof</span>
            </button>
          )}
        </AnimatePresence>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        multiple
        className="hidden"
      />

      {isAnalyzing && (
        <div className="flex items-center gap-2 text-xs text-amber-600 font-medium animate-pulse">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>AI is analyzing evidence for patterns...</span>
        </div>
      )}
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
