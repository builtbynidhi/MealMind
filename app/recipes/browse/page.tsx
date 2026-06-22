import Nav from"@/components/Nav";
import { BrowseExplorer } from"@/components/recipes/BrowseExplorer";

export const metadata = {
 title:"Browse recipes | MealMind",
 description:"Explore every MealMind recipe — filter by cuisine and diet, or search by name. Indian, Italian, Chinese, Thai, Mexican and more; veg & non-veg.",
};

export default async function BrowsePage({
 searchParams,
}: {
 searchParams: Promise<{ cuisine?: string }>;
}) {
 const { cuisine } = await searchParams;
 return (
 <main className="min-h-screen">
 <Nav />
 <div className="section py-10">
 <div className="mb-6">
 <h1 className="text-3xl font-bold text-ink-900">Browse recipes</h1>
 <p className="mt-1 text-ink-700/80">
 Explore the whole library — filter by cuisine &amp; diet, or search by name.
 </p>
 </div>
 <BrowseExplorer initialCuisine={cuisine ??""} />
 </div>
 </main>
 );
}
