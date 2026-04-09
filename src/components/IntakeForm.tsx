import { useState, FormEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserData } from "@/src/services/gemini";
import { Loader2, Sparkles, ShieldCheck } from "lucide-react";
import { EvidenceUpload } from "./EvidenceUpload";

interface IntakeFormProps {
  onSubmit: (data: UserData, evidence: string[]) => void;
  isLoading: boolean;
  initialData: UserData;
}

export function IntakeForm({ onSubmit, isLoading, initialData }: IntakeFormProps) {
  const [formData, setFormData] = useState<UserData>(initialData);
  const [evidence, setEvidence] = useState<string[]>([]);

  // Sync with initialData when it changes (e.g. after recalculate)
  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData, evidence);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-stone-200 shadow-xl shadow-stone-200/50 overflow-hidden">
      <div className="h-2 bg-amber-600" />
      <CardHeader className="space-y-1 pb-8">
        <CardTitle className="text-2xl font-bold text-stone-900">Get Your Trust Score</CardTitle>
        <CardDescription className="text-stone-500">
          Tell us about your informal business activity. No bank statements required.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="businessType">Business Type</Label>
              <Select 
                value={formData.businessType} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, businessType: v }))}
              >
                <SelectTrigger className="bg-stone-50 border-stone-200">
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Market Trader">Market Trader</SelectItem>
                  <SelectItem value="Transport / Logistics">Transport / Logistics</SelectItem>
                  <SelectItem value="Food Vendor">Food Vendor</SelectItem>
                  <SelectItem value="Artisan / Tailor">Artisan / Tailor</SelectItem>
                  <SelectItem value="Retail Store">Retail Store</SelectItem>
                  <SelectItem value="Service Provider">Service Provider</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weeklyVolume">Weekly Mobile Money Volume (₦)</Label>
              <Select 
                value={formData.weeklyVolume} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, weeklyVolume: v }))}
              >
                <SelectTrigger className="bg-stone-50 border-stone-200">
                  <SelectValue placeholder="Select volume" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-10000">₦0 - ₦10,000</SelectItem>
                  <SelectItem value="10000-50000">₦10,000 - ₦50,000</SelectItem>
                  <SelectItem value="50000-100000">₦50,000 - ₦100,000</SelectItem>
                  <SelectItem value="100000-250000">₦100,000 - ₦250,000</SelectItem>
                  <SelectItem value="250000+">₦250,000+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weeklyFrequency">Transactions Per Week</Label>
              <Input 
                id="weeklyFrequency"
                type="number"
                min="0"
                value={formData.weeklyFrequency}
                onChange={(e) => setFormData(prev => ({ ...prev, weeklyFrequency: parseInt(e.target.value) || 0 }))}
                className="bg-stone-50 border-stone-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="savingsBehaviour">Savings Behaviour</Label>
              <Select 
                value={formData.savingsBehaviour} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, savingsBehaviour: v }))}
              >
                <SelectTrigger className="bg-stone-50 border-stone-200">
                  <SelectValue placeholder="Select savings frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily Savings</SelectItem>
                  <SelectItem value="weekly">Weekly Savings</SelectItem>
                  <SelectItem value="monthly">Monthly Savings</SelectItem>
                  <SelectItem value="rarely">Rarely / Occasionally</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthsActive">Months of Consistent Activity</Label>
              <Input 
                id="monthsActive"
                type="number"
                min="0"
                value={formData.monthsActive}
                onChange={(e) => setFormData(prev => ({ ...prev, monthsActive: parseInt(e.target.value) || 0 }))}
                className="bg-stone-50 border-stone-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hasInformalLoan">Outstanding Informal Loans?</Label>
              <Select 
                value={formData.hasInformalLoan ? "yes" : "no"} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, hasInformalLoan: v === "yes" }))}
              >
                <SelectTrigger className="bg-stone-50 border-stone-200">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No, I'm debt-free</SelectItem>
                  <SelectItem value="yes">Yes, I have active loans</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.hasInformalLoan && (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="informalLoanAmount">Total Outstanding Amount (₦)</Label>
                <Input 
                  id="informalLoanAmount"
                  type="number"
                  min="0"
                  value={formData.informalLoanAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, informalLoanAmount: parseInt(e.target.value) || 0 }))}
                  className="bg-stone-50 border-stone-200"
                  placeholder="Enter total amount"
                />
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-stone-100">
            <EvidenceUpload onUpload={setEvidence} isAnalyzing={isLoading} />
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-12 text-lg font-semibold bg-amber-600 hover:bg-amber-700 text-white transition-all duration-300"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analyzing Financial Footprint...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generate My Trust Score
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
