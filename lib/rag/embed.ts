import { pipeline, type FeatureExtractionPipeline } from"@xenova/transformers";

// Local, in-process embeddings — $0/call, forever. Runs in a warm Node process
// (server routes with runtime="nodejs", and the indexer scripts). bge-small-en-v1.5
// → 384-dim, matching recipe_embeddings.embedding vector(384).
//
// NOTE: this cannot run in a Cloudflare Worker (no onnxruntime-node). In a pure
// edge deployment, route query-embedding through Cloudflare Workers AI's BGE model
// instead — same 384-dim model, so vectors stay index-compatible.

const MODEL_ID ="Xenova/bge-small-en-v1.5";
export const EMBED_DIM = 384;

// bge models want this instruction prefix on the QUERY side only (not passages).
const QUERY_PREFIX ="Represent this sentence for searching relevant passages:";

let extractorPromise: Promise<FeatureExtractionPipeline> | null = null;
function getExtractor() {
 extractorPromise ??= pipeline("feature-extraction", MODEL_ID);
 return extractorPromise;
}

async function run(text: string): Promise<number[]> {
 const extractor = await getExtractor();
 const output = await extractor(text, { pooling:"mean", normalize: true });
 return Array.from(output.data as Float32Array);
}

/** Embed a passage (recipe text) for storage. */
export function embedPassage(text: string): Promise<number[]> {
 return run(text);
}

/** Embed a search query (adds the bge retrieval instruction prefix). */
export function embedQuery(text: string): Promise<number[]> {
 return run(QUERY_PREFIX + text);
}

/** Embed many passages sequentially (keeps memory flat during indexing). */
export async function embedPassages(texts: string[]): Promise<number[][]> {
 const out: number[][] = [];
 for (const t of texts) out.push(await embedPassage(t));
 return out;
}
