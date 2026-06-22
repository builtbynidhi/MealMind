import { GoogleGenerativeAI } from"@google/generative-ai";
import Groq from"groq-sdk";
import { z } from"zod";
import { env } from"@/lib/env";

// ── Provider abstraction ─────────────────────────────────────────────────────
// Primary: Google Gemini (free tier). Failover: Groq (Llama 3.3 70B) on
// rate-limit / overload / server errors. One interface for the whole app, so
// the LLM vendor is swappable in one file.

const GEMINI_FLASH ="gemini-2.5-flash";
const GEMINI_FLASH_LITE ="gemini-2.5-flash-lite"; // cheaper/faster — use for batch jobs
const GROQ_MODEL ="llama-3.3-70b-versatile";

export interface GenerateOptions {
 system?: string;
 prompt: string;
 /** Use the lighter model (batch / high-volume paths like cron). */
 lite?: boolean;
}

function isRetryable(err: unknown): boolean {
 const status =
 (err as any)?.status ?? (err as any)?.response?.status ?? (err as any)?.code;
 return [429, 500, 503, 529].includes(Number(status));
}

function extractJSON(text: string): string {
 const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
 const body = fenced ? fenced[1] : text;
 const firstObj = body.indexOf("{");
 const firstArr = body.indexOf("[");
 const start =
 firstArr === -1 ? firstObj : firstObj === -1 ? firstArr : Math.min(firstObj, firstArr);
 if (start === -1) return body.trim();
 const open = body[start];
 const close = open ==="{"?"}":"]";
 const end = body.lastIndexOf(close);
 return end === -1 ? body.slice(start).trim() : body.slice(start, end + 1).trim();
}

// ── Gemini ───────────────────────────────────────────────────────────────────
async function geminiText({ system, prompt, lite }: GenerateOptions, json = false): Promise<string> {
 const genAI = new GoogleGenerativeAI(env.geminiKey());
 const model = genAI.getGenerativeModel({
 model: lite ? GEMINI_FLASH_LITE : GEMINI_FLASH,
 systemInstruction: system,
 ...(json ? { generationConfig: { responseMimeType:"application/json"} } : {}),
 });
 const res = await model.generateContent(prompt);
 return res.response.text();
}

// ── Groq (failover) ──────────────────────────────────────────────────────────
async function groqText({ system, prompt }: GenerateOptions, json = false): Promise<string> {
 if (!env.groqKey()) throw new Error("Groq failover not configured (set GROQ_API_KEY)");
 const groq = new Groq({ apiKey: env.groqKey() });
 const res = await groq.chat.completions.create({
 model: GROQ_MODEL,
 messages: [
 ...(system ? [{ role:"system"as const, content: system }] : []),
 { role:"user"as const, content: prompt },
 ],
 ...(json ? { response_format: { type:"json_object"as const } } : {}),
 });
 return res.choices[0]?.message?.content ??"";
}

// ── Public API ─────────────────────────────────────────────────────────────
export async function generateText(opts: GenerateOptions): Promise<string> {
 try {
 return await geminiText(opts, false);
 } catch (err) {
 if (env.groqKey() && isRetryable(err)) return groqText(opts, false);
 throw err;
 }
}

/** Generate JSON and validate it against a Zod schema (with one failover hop). */
export async function generateJSON<S extends z.ZodTypeAny>(
 opts: GenerateOptions & { schema: S },
): Promise<z.infer<S>> {
 let raw: string;
 try {
 raw = await geminiText(opts, true);
 } catch (err) {
 if (env.groqKey() && isRetryable(err)) raw = await groqText(opts, true);
 else throw err;
 }
 return opts.schema.parse(JSON.parse(extractJSON(raw)));
}
