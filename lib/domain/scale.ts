import { round } from"@/lib/domain/normalize";

// Pure, dependency-light portion scaling — safe to import from both the server
// and client (no Supabase / BGE imports). Single source of truth for the
//"scale a recipe for N people"math that the grocery builder also relies on.

export interface ScalableLine {
 name: string;
 quantity: number | null;
 unit: string | null;
 aisle?: string | null;
}

/** Factor to multiply base-serving quantities by to reach`target`servings. */
export function scaleFactor(targetServings: number, baseServings: number): number {
 return baseServings > 0 ? targetServings / baseServings : 1;
}

/** Scale one quantity (nulls — unmeasured items — stay null). */
export function scaleQuantity(q: number | null, factor: number): number | null {
 return q == null ? null : round(q * factor, 2);
}

/** Scale every line's quantity by`factor`, preserving the other fields. */
export function scaleLines<T extends ScalableLine>(lines: T[], factor: number): T[] {
 return lines.map((l) => ({ ...l, quantity: scaleQuantity(l.quantity, factor) }));
}
