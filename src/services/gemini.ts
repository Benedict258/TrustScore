import { GoogleGenAI, Type } from "@google/genai";

const SYSTEM_PROMPT = `You are TrustScore AI, an alternative credit scoring engine for informal workers in West Africa. You analyze informal financial behaviour and generate a Trust Score.

You will receive a JSON object with user data and optionally a verification result from uploaded evidence.

User data fields:
- weeklyVolume: string (e.g. "20000-50000") — weekly mobile money transaction volume in Naira
- weeklyFrequency: number — how many transactions per week
- businessType: string — type of informal business
- savingsBehaviour: string — one of: "daily", "weekly", "monthly", "rarely", "never"
- monthsActive: number — months of consistent mobile money usage
- hasInformalLoan: boolean — whether they currently have an outstanding informal loan
- informalLoanAmount: number — outstanding loan amount in Naira (0 if none)

Verification data (if provided):
- verificationLevel: "Self-Reported" | "Evidence-Supported" | "Verified"
- confidenceScore: number (0-100)
- supportedClaims: string[]

You must respond ONLY with a valid JSON object. No explanation, no markdown, no backticks. Just raw JSON.

Scoring guidance:
- High volume + high frequency = strong positive signal
- Regular savings behaviour = major positive signal  
- Long history (12+ months) = positive signal
- Outstanding informal loans = negative signal, especially if large relative to income
- Business type context matters — food vendors and market traders are lower risk than unestablished services
- Score range: 0-40 Building, 41-60 Fair, 61-79 Good, 80-100 Excellent
- Loan eligibility should be 3–8x their estimated monthly volume for Good/Excellent scores

Always be encouraging but honest. This score represents a real person's financial dignity.`;

const EVIDENCE_PROMPT = `You are a Financial Evidence Auditor. Analyze the provided screenshot(s) of mobile money transactions, wallet balances, or savings records.
Extract patterns to verify the user's financial claims.

Check for:
1. Recency of transactions.
2. Frequency of activity.
3. Evidence of recurring savings or transfers.
4. Consistency with claimed business activity.

Respond ONLY with a valid JSON object following this schema:
{
  "verificationLevel": "Evidence-Supported" | "Self-Reported",
  "confidenceScore": number (0-100),
  "supportedClaims": string[],
  "riskFlags": string[],
  "summary": string
}`;

export interface VerificationResult {
  verificationLevel: "Self-Reported" | "Evidence-Supported" | "Verified";
  confidenceScore: number;
  supportedClaims: string[];
  riskFlags: string[];
  summary: string;
}

export interface TrustScoreResult {
  score: number;
  tier: "Excellent" | "Good" | "Fair" | "Building";
  tierDescription: string;
  maxLoanEligibility: string;
  factors: {
    name: string;
    impact: "positive" | "negative" | "neutral";
    weight: string;
    explanation: string;
  }[];
  positiveDrivers: string[];
  negativeDrivers: string[];
  improvementTip: string;
  recommendedProduct: {
    name: string;
    reason: string;
  };
  verification: VerificationResult;
  aiInterpretation: string;
}

export interface UserData {
  weeklyVolume: string;
  weeklyFrequency: number;
  businessType: string;
  savingsBehaviour: string;
  monthsActive: number;
  hasInformalLoan: boolean;
  informalLoanAmount: number;
}

let ai: GoogleGenAI | null = null;

function getAI() {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set");
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

export async function analyzeEvidence(images: string[]): Promise<VerificationResult> {
  const genAI = getAI();
  
  const imageParts = images.map(img => ({
    inlineData: {
      data: img.split(',')[1],
      mimeType: "image/jpeg"
    }
  }));

  const response = await genAI.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ parts: [...imageParts, { text: EVIDENCE_PROMPT }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          verificationLevel: { type: Type.STRING, enum: ["Evidence-Supported", "Self-Reported"] },
          confidenceScore: { type: Type.INTEGER },
          supportedClaims: { type: Type.ARRAY, items: { type: Type.STRING } },
          riskFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
          summary: { type: Type.STRING }
        },
        required: ["verificationLevel", "confidenceScore", "supportedClaims", "riskFlags", "summary"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function getTrustScore(userData: UserData, verification?: VerificationResult): Promise<TrustScoreResult> {
  const genAI = getAI();
  
  const prompt = `${SYSTEM_PROMPT}\n\nUser data:\n${JSON.stringify(userData)}${verification ? `\n\nVerification Data:\n${JSON.stringify(verification)}` : ""}`;

  const response = await genAI.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.INTEGER },
          tier: { type: Type.STRING, enum: ["Excellent", "Good", "Fair", "Building"] },
          tierDescription: { type: Type.STRING },
          maxLoanEligibility: { type: Type.STRING },
          factors: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                impact: { type: Type.STRING, enum: ["positive", "negative", "neutral"] },
                weight: { type: Type.STRING },
                explanation: { type: Type.STRING },
              },
              required: ["name", "impact", "weight", "explanation"],
            },
          },
          positiveDrivers: { type: Type.ARRAY, items: { type: Type.STRING } },
          negativeDrivers: { type: Type.ARRAY, items: { type: Type.STRING } },
          improvementTip: { type: Type.STRING },
          recommendedProduct: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              reason: { type: Type.STRING },
            },
            required: ["name", "reason"],
          },
          aiInterpretation: { type: Type.STRING },
        },
        required: ["score", "tier", "tierDescription", "maxLoanEligibility", "factors", "positiveDrivers", "negativeDrivers", "improvementTip", "recommendedProduct", "aiInterpretation"],
      },
    },
  });

  const result = JSON.parse(response.text || "{}");
  
  return {
    ...result,
    verification: verification || {
      verificationLevel: "Self-Reported",
      confidenceScore: 45,
      supportedClaims: ["Data provided by user manually"],
      riskFlags: ["No evidence uploaded for verification"],
      summary: "Score is based on self-reported data. Confidence is low to medium."
    }
  };
}
