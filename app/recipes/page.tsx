import Nav from"@/components/Nav";
import { RecipeMaker } from"@/components/recipes/RecipeMaker";

export const metadata = {
 title:"Recipe Maker — cook with what you have | MealMind",
 description:
"Add the ingredients you have, pick veg/non-veg and a cuisine, and instantly see recipes you can cook now — plus near-misses with a short shopping list.",
};

export default function RecipesPage() {
 return (
 <main className="min-h-screen">
 <Nav />
 <div className="section py-10">
 <div className="mx-auto max-w-2xl text-center">
 <h1 className="text-4xl font-bold text-ink-900">What can I cook?</h1>
 <p className="mt-3 text-ink-700/80">
 Tell us what's in your kitchen. We'll show what you can make right now — and what's just a few
 items away. Then dial the servings to feed exactly your crew.
 </p>
 </div>
 <div className="mx-auto mt-8 max-w-5xl">
 <RecipeMaker />
 </div>
 </div>
 </main>
 );
}
