import Nav from"@/components/Nav";
import { FavoritesList } from"@/components/recipes/FavoritesList";

export const metadata = {
 title:"My saved recipes | MealMind",
 description:"Your saved MealMind recipes — kept on this device, no account needed.",
};

export default function FavoritesPage() {
 return (
 <main className="min-h-screen">
 <Nav />
 <div className="section py-10">
 <div className="mb-6">
 <h1 className="text-3xl font-bold text-ink-900">Saved recipes</h1>
 <p className="mt-1 text-ink-700/80">Your favourites, saved on this device.</p>
 </div>
 <FavoritesList />
 </div>
 </main>
 );
}
