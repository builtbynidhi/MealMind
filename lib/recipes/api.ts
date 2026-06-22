import type {
 CookFromResponse,
 Diet,
 RecipeDetailResponse,
 RecommendResponse,
} from"@/lib/recipes/types";

async function postJSON<T>(url: string, body: unknown): Promise<T> {
 const res = await fetch(url, {
 method:"POST",
 headers: {"content-type":"application/json"},
 body: JSON.stringify(body),
 });
 if (!res.ok) {
 const msg = await res.json().catch(() => ({}));
 throw new Error((msg as any)?.error ??`Request failed (${res.status})`);
 }
 return res.json() as Promise<T>;
}

export function fetchCookFrom(input: {
 have: string[];
 diet?: Diet;
 cuisine?: string;
}): Promise<CookFromResponse> {
 return postJSON("/api/recipes/cook-from", input);
}

export function fetchRecommend(input: {
 groceries: string[];
 diet?: Diet;
 cuisine?: string;
}): Promise<RecommendResponse> {
 return postJSON("/api/recipes/recommend", input);
}

export async function fetchBrowse(input: {
 cuisine?: string;
 diet?: Diet;
 q?: string;
 limit?: number;
 offset?: number;
}): Promise<{ recipes: import("@/lib/recipes/types").RecipeCardData[]; hasMore: boolean }> {
 const p = new URLSearchParams();
 if (input.cuisine) p.set("cuisine", input.cuisine);
 if (input.diet && input.diet !=="any") p.set("diet", input.diet);
 if (input.q) p.set("q", input.q);
 if (input.limit) p.set("limit", String(input.limit));
 if (input.offset) p.set("offset", String(input.offset));
 const res = await fetch(`/api/recipes/browse?${p.toString()}`);
 if (!res.ok) throw new Error(`Browse failed (${res.status})`);
 return res.json();
}

export async function fetchRecipe(id: string, servings?: number): Promise<RecipeDetailResponse> {
 const qs = servings ?`?servings=${servings}`:"";
 const res = await fetch(`/api/recipes/${id}${qs}`);
 if (!res.ok) throw new Error(`Recipe not found (${res.status})`);
 return res.json();
}
