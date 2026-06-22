// Ingredient (normalized name) → grocery aisle. Keys are matched after
// normalizeName(). Anything unmapped falls back to"Other".

export const AISLE_RAW: Record<string, string> = {
 // Produce
 onion:"Produce","red onion":"Produce","spring onion":"Produce", potato:"Produce",
 peas:"Produce", tomato:"Produce","bell pepper":"Produce","green chili":"Produce",
"red chili":"Produce","curry leaves":"Produce", lemon:"Produce", lime:"Produce",
 carrot:"Produce", cauliflower:"Produce", cucumber:"Produce", parsley:"Produce",
 broccoli:"Produce", banana:"Produce", berries:"Produce", coriander:"Produce",
 cilantro:"Produce", ginger:"Produce", garlic:"Produce", celery:"Produce",
"mixed vegetables":"Produce", spinach:"Produce", mushroom:"Produce", zucchini:"Produce",
 eggplant:"Produce","bok choy":"Produce", scallion:"Produce", basil:"Produce",
 mint:"Produce", lettuce:"Produce", avocado:"Produce", lemongrass:"Produce",
"green beans":"Produce", corn:"Produce","sweet potato":"Produce", beetroot:"Produce",
 cabbage:"Produce","snow peas":"Produce", shallot:"Produce","kaffir lime leaves":"Produce",
 apple:"Produce", thyme:"Produce", rosemary:"Produce", oregano:"Produce",
 // Grains & Pantry
 poha:"Grains & Pantry", oats:"Grains & Pantry", rice:"Grains & Pantry",
"basmati rice":"Grains & Pantry", quinoa:"Grains & Pantry", bread:"Grains & Pantry",
 flour:"Grains & Pantry","all-purpose flour":"Grains & Pantry", semolina:"Grains & Pantry",
 pasta:"Grains & Pantry", spaghetti:"Grains & Pantry", penne:"Grains & Pantry",
 noodles:"Grains & Pantry","rice noodles":"Grains & Pantry","egg noodles":"Grains & Pantry",
 tortilla:"Grains & Pantry","taco shell":"Grains & Pantry", couscous:"Grains & Pantry",
 sugar:"Grains & Pantry","brown sugar":"Grains & Pantry", cornstarch:"Grains & Pantry",
"baking powder":"Grains & Pantry", vinegar:"Grains & Pantry","rice vinegar":"Grains & Pantry",
"tomato paste":"Grains & Pantry","canned tomatoes":"Grains & Pantry","coconut milk":"Grains & Pantry",
"breadcrumbs":"Grains & Pantry","vegetable stock":"Grains & Pantry","chicken stock":"Grains & Pantry",
 // Legumes
 chickpeas:"Legumes","kidney beans":"Legumes", lentils:"Legumes","red lentils":"Legumes",
"black beans":"Legumes","pinto beans":"Legumes","black-eyed peas":"Legumes",
 // Spices
 turmeric:"Spices", cumin:"Spices","garam masala":"Spices","mustard seeds":"Spices",
 coriander_powder:"Spices","chili powder":"Spices", paprika:"Spices", cinnamon:"Spices",
"bay leaf":"Spices", cardamom:"Spices", clove:"Spices","black pepper":"Spices",
 salt:"Spices","red chili powder":"Spices","cumin powder":"Spices","five spice":"Spices",
"italian seasoning":"Spices", nutmeg:"Spices","fennel seeds":"Spices", asafoetida:"Spices",
 // Condiments / oils
"soy sauce":"Condiments", tahini:"Condiments", honey:"Condiments","olive oil":"Condiments",
 olives:"Condiments", peanuts:"Condiments","chia seeds":"Condiments","sesame oil":"Condiments",
"vegetable oil":"Condiments", ketchup:"Condiments", mayonnaise:"Condiments","hoisin sauce":"Condiments",
"oyster sauce":"Condiments","fish sauce":"Condiments","chili sauce":"Condiments",
"peanut butter":"Condiments","tomato sauce":"Condiments","pesto":"Condiments",
 cashews:"Condiments", almonds:"Condiments","sesame seeds":"Condiments","salsa":"Condiments",
 // Dairy & Eggs
 paneer:"Dairy & Eggs", ghee:"Dairy & Eggs","feta cheese":"Dairy & Eggs", cheese:"Dairy & Eggs",
 butter:"Dairy & Eggs", milk:"Dairy & Eggs", yogurt:"Dairy & Eggs", eggs:"Dairy & Eggs",
"parmesan":"Dairy & Eggs","mozzarella":"Dairy & Eggs","cream":"Dairy & Eggs",
"sour cream":"Dairy & Eggs","cheddar":"Dairy & Eggs","ricotta":"Dairy & Eggs",
 // Refrigerated / plant protein
 tofu:"Refrigerated", tempeh:"Refrigerated",
 // Meat & Seafood
 chicken:"Meat & Seafood","chicken breast":"Meat & Seafood","chicken thigh":"Meat & Seafood",
 mutton:"Meat & Seafood", lamb:"Meat & Seafood", goat:"Meat & Seafood", beef:"Meat & Seafood",
 pork:"Meat & Seafood", bacon:"Meat & Seafood", ham:"Meat & Seafood", sausage:"Meat & Seafood",
 fish:"Meat & Seafood", salmon:"Meat & Seafood", tuna:"Meat & Seafood", prawns:"Meat & Seafood",
 shrimp:"Meat & Seafood", crab:"Meat & Seafood", squid:"Meat & Seafood", anchovy:"Meat & Seafood",
 mussels:"Meat & Seafood", clams:"Meat & Seafood", octopus:"Meat & Seafood","pork shoulder":"Meat & Seafood",
 prosciutto:"Meat & Seafood","veal cutlet":"Meat & Seafood","beef sirloin":"Meat & Seafood","beef chuck":"Meat & Seafood",

 // ── Extended coverage (from generated corpus) ──────────────────────────────
 // Produce
"thai basil":"Produce","celery stalk":"Produce","poblano pepper":"Produce", poblano:"Produce",
"shiitake mushroom":"Produce","mixed greens":"Produce","green onion":"Produce","red cabbage":"Produce",
 jalapeno:"Produce","chili pepper":"Produce","thai eggplant":"Produce","bean sprouts":"Produce",
 tomatillo:"Produce","broccoli florets":"Produce", okra:"Produce","brussels sprouts":"Produce",
"bamboo shoots":"Produce","lotus root":"Produce",
 // Spices
"cumin seeds":"Spices","smoked paprika":"Spices","white pepper":"Spices","sichuan peppercorns":"Spices",
"garlic powder":"Spices", pepper:"Spices","chili flakes":"Spices",
 // Condiments / sauces
"lime juice":"Condiments","lemon juice":"Condiments", oil:"Condiments","curry paste":"Condiments",
"green curry paste":"Condiments","barbecue sauce":"Condiments","vegetarian oyster sauce":"Condiments",
"apple cider vinegar":"Condiments","chili oil":"Condiments", dressing:"Condiments",
"worcestershire sauce":"Condiments","yellow mustard":"Condiments","black vinegar":"Condiments",
"nutritional yeast":"Condiments", capers:"Condiments","vanilla extract":"Condiments",
"marinara sauce":"Condiments",
 // Grains & Pantry
"vegetable broth":"Grains & Pantry","chicken broth":"Grains & Pantry","beef broth":"Grains & Pantry",
 broth:"Grains & Pantry","white wine":"Grains & Pantry","dry white wine":"Grains & Pantry",
"arborio rice":"Grains & Pantry","corn tortilla":"Grains & Pantry", pita:"Grains & Pantry",
"pita bread":"Grains & Pantry", bun:"Grains & Pantry","hamburger bun":"Grains & Pantry",
"hoagie roll":"Grains & Pantry", linguine:"Grains & Pantry", fettuccine:"Grains & Pantry",
 polenta:"Grains & Pantry", cornmeal:"Grains & Pantry","phyllo dough":"Grains & Pantry",
"pizza dough":"Grains & Pantry","pie crust":"Grains & Pantry","dumpling wrappers":"Grains & Pantry",
"panko breadcrumbs":"Grains & Pantry","granulated sugar":"Grains & Pantry","cannellini beans":"Legumes",
 // Dairy & Eggs
"parmesan cheese":"Dairy & Eggs","mozzarella cheese":"Dairy & Eggs","heavy cream":"Dairy & Eggs",
"plant milk":"Dairy & Eggs",
 // Refrigerated
"firm tofu":"Refrigerated", seitan:"Refrigerated",
};
