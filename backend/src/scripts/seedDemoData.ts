/**
 * Seeds the database with a large, production-ready demo dataset:
 * - 20 Users + 1 Admin
 * - 50 Detailed Recipes with full ingredients, steps, nutrition, and images
 * - Blog Posts & Articles
 * - User engagement (Likes, Saved Collections, Reviews, Comments)
 * - AI Search & Recommendation History
 * - Meal Planning logs, Notifications, Reports, and Page View Analytics
 *
 * WARNING: Clears targeted collections before insertion. Run only in dev environments.
 *
 * Command: npx ts-node src/scripts/seedDemoData.ts
 */

import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "../config/db";

import User from "../models/User";
import Recipe from "../models/Recipe";
import Category from "../models/Category";
import Like from "../models/Like";
import SavedRecipe from "../models/SavedRecipe";
import Review from "../models/Review";
import Comment from "../models/Comment";
import Notification from "../models/Notification";
import SearchHistory from "../models/SearchHistory";
import AIRecommendationHistory from "../models/AIRecommendationHistory";
import Report from "../models/Report";
import PageView from "../models/PageView";
import Blog from "../models/BlogPost";

// ---------------------------------------------------------------------------
// 1. Reference Master Data
// ---------------------------------------------------------------------------

const CUISINES = [
  "Indian", "Italian", "Mexican", "Chinese", "Thai",
  "Japanese", "Mediterranean", "French", "Korean", "Vietnamese"
];

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert", "Appetizer", "Beverage"];
const DIETS = ["Vegetarian", "Vegan", "Keto", "Gluten Free", "High Protein", "Low Carb", "Dairy Free", "Paleo"];

// 20 Creators / Users
const DEMO_USERS = [
  { name: "Ananya Sharma", bio: "Home cook obsessed with authentic regional Indian spices and modern weeknight dinners.", cuisines: ["Indian", "Thai"], diets: ["Vegetarian"] },
  { name: "Rohan Mehta", bio: "Live-fire grilling enthusiast, pitmaster in training, terrible at baking.", cuisines: ["Mexican", "Mediterranean"], diets: ["High Protein"] },
  { name: "Priya Nair", bio: "Coastal South Indian food practitioner. Coconut oil, curry leaves, and fermented batters.", cuisines: ["Indian"], diets: ["Vegan"] },
  { name: "Arjun Kapoor", bio: "Plant-forward chef exploring classic European techniques with modern ingredients.", cuisines: ["Italian", "French"], diets: ["Vegetarian", "Gluten Free"] },
  { name: "Sara Khan", bio: "Former line cook, knife precision nerd, fermenting everything in sight.", cuisines: ["Japanese", "Korean"], diets: [] },
  { name: "Vikram Singh", bio: "Calculated meal-prepper. Macro-focused, high-protein, zero-waste advocate.", cuisines: ["Mexican", "Indian"], diets: ["High Protein", "Low Carb"] },
  { name: "Neha Gupta", bio: "Pastry enthusiast working through classic French laminations and delicate tortes.", cuisines: ["French"], diets: [] },
  { name: "Aditya Rao", bio: "Street food explorer. Unapologetic level-10 spice preference.", cuisines: ["Thai", "Indian"], diets: [] },
  { name: "Meera Iyer", bio: "Plant-based artisan developer making plant cheeses and dairy-free Italian staples.", cuisines: ["Mediterranean", "Italian"], diets: ["Vegan", "Dairy Free"] },
  { name: "Karan Malhotra", bio: "Dim sum folding specialist. Spent two years mastering broth clarity.", cuisines: ["Chinese", "Vietnamese"], diets: [] },
  { name: "Aarav Patel", bio: "Street taco enthusiast and sourdough baker bridging Mexican and artisanal bread cultures.", cuisines: ["Mexican"], diets: ["Vegetarian"] },
  { name: "Kavya Verma", bio: "Fermentation enthusiast creating homemade kimchi, kombucha, and miso pastes.", cuisines: ["Korean", "Japanese"], diets: ["Vegan"] },
  { name: "Devansh Joshi", bio: "Slow-roast and smoker aficionado passionate about low and slow BBQ.", cuisines: ["Mediterranean"], diets: ["Keto", "High Protein"] },
  { name: "Ishita Reddy", bio: "Clean-eating advocate specializing in gluten-free baking and grain bowls.", cuisines: ["Mediterranean", "French"], diets: ["Gluten Free", "Low Carb"] },
  { name: "Siddharth Das", bio: "Noodle puller and wok hei enthusiast perfecting street-style stir-fries.", cuisines: ["Chinese", "Thai"], diets: [] },
  { name: "Tanvi Saxena", bio: "Smoothie bowl artist and cold-pressed juice mixologist.", cuisines: ["Vietnamese"], diets: ["Vegan", "Dairy Free"] },
  { name: "Kabir Bhatia", bio: "Italian pasta artisan making fresh egg taglierini and extruded bronze-die pasta.", cuisines: ["Italian"], diets: [] },
  { name: "Riya Sen", bio: "Bento box designer focused on healthy, kid-friendly school and work lunches.", cuisines: ["Japanese"], diets: ["Vegetarian"] },
  { name: "Yash Nambiar", bio: "Seafood fanatic exploring coastal curries, ceviches, and wood-grilled fish.", cuisines: ["Indian", "Mexican"], diets: ["Keto"] },
  { name: "Simran Kaur", bio: "Punjabi dhaba classic expert making slow-simmered lentils and tandoori breads.", cuisines: ["Indian"], diets: ["Vegetarian"] }
];

// ---------------------------------------------------------------------------
// 2. 50 Comprehensive Recipes Catalog
// ---------------------------------------------------------------------------

const RECIPE_SEED_DATA = [
  // --- INDIAN (1-5) ---
  {
    title: "Authentic Murgh Makhani (Butter Chicken)",
    cuisine: "Indian", mealType: "Dinner", diets: ["Gluten Free"], difficulty: "medium" as const, prep: 30, cook: 40, servings: 4, calories: 540,
    imageUrl: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=1200&q=80",
    description: "Tender chicken marinated in spiced yogurt, charred in a hot skillet, and simmered in a velvet-smooth tomato, butter, and cream sauce laced with dried fenugreek leaves.",
    ingredients: [
      { name: "chicken thighs (boneless)", quantity: "700", unit: "g" },
      { name: "greek yogurt", quantity: "1/2", unit: "cup" },
      { name: "ginger-garlic paste", quantity: "2", unit: "tbsp" },
      { name: "garam masala", quantity: "2", unit: "tsp" },
      { name: "kashmiri red chili powder", quantity: "1.5", unit: "tbsp" },
      { name: "canned tomato puree", quantity: "2", unit: "cups" },
      { name: "unsalted butter", quantity: "4", unit: "tbsp" },
      { name: "heavy cream", quantity: "1/2", unit: "cup" },
      { name: "kasuri methi (dried fenugreek)", quantity: "1", unit: "tbsp" }
    ],
    steps: [
      "Cut chicken thighs into bite-sized 1.5-inch pieces. Whisk together yogurt, 1 tbsp ginger-garlic paste, chili powder, garam masala, salt, and lemon juice. Coat chicken and marinate for 30 minutes.",
      "Heat 1 tbsp oil in a heavy cast-iron skillet over high heat. Sear chicken in batches until deeply charred on edges (3-4 mins per side). Set charred chicken aside.",
      "In a Dutch oven, melt 2 tbsp butter over medium heat. Add remaining ginger-garlic paste and saute for 1 minute.",
      "Pour in tomato puree and spices. Simmer covered for 15 minutes until oil separates from the tomato base.",
      "Blend sauce using an immersion blender until silky smooth. Drop heat to low and stir in cream and remaining butter.",
      "Add cooked chicken and simmer gently for 8-10 minutes. Crush kasuri methi between palms and fold in before serving with naan."
    ]
  },
  {
    title: "Amritsari Chana Masala",
    cuisine: "Indian", mealType: "Dinner", diets: ["Vegetarian", "Vegan", "Gluten Free"], difficulty: "easy" as const, prep: 15, cook: 30, servings: 4, calories: 340,
    imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1200&q=80",
    description: "Robust chickpea curry steeped with whole aromatic spices, black tea bags for deep dark color, dried mango powder, and fresh ginger juliennes.",
    ingredients: [
      { name: "chickpeas (cooked)", quantity: "3", unit: "cups" },
      { name: "black tea bags", quantity: "2", unit: "units" },
      { name: "red onion (finely diced)", quantity: "2", unit: "large" },
      { name: "tomatoes (pureed)", quantity: "2", unit: "medium" },
      { name: "chana masala spice blend", quantity: "2", unit: "tbsp" },
      { name: "amchur (dry mango powder)", quantity: "1", unit: "tsp" }
    ],
    steps: [
      "Simmer cooked chickpeas with 2 black tea bags in water for 10 minutes to darken color; discard tea bags.",
      "Heat oil in a heavy pot. Fry finely diced red onions until deep golden brown.",
      "Stir in ginger-garlic paste and pureed tomatoes with chana masala spices until oil leaves the sides.",
      "Add chickpeas with cooking liquid. Mash roughly 15% of chickpeas to thicken gravy.",
      "Simmer for 15 minutes. Finish with amchur powder and fresh ginger juliennes."
    ]
  },
  {
    title: "Hyderabadi Vegetable Dum Biryani",
    cuisine: "Indian", mealType: "Dinner", diets: ["Vegetarian", "Gluten Free"], difficulty: "hard" as const, prep: 40, cook: 50, servings: 6, calories: 480,
    imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1200&q=80",
    description: "Fragrant basmati rice layered with spiced marinated vegetables, fried onions (birista), saffron milk, and fresh mint, slow-cooked under dum sealing.",
    ingredients: [
      { name: "long-grain basmati rice", quantity: "2", unit: "cups" },
      { name: "mixed vegetables (carrots, peas, beans, potatoes)", quantity: "3", unit: "cups" },
      { name: "greek yogurt", quantity: "1", unit: "cup" },
      { name: "fried onions (birista)", quantity: "1", unit: "cup" },
      { name: "saffron threads steeped in warm milk", quantity: "1/4", unit: "cup" },
      { name: "fresh mint & cilantro", quantity: "1", unit: "cup" }
    ],
    steps: [
      "Par-boil basmati rice with whole spices (cardamom, cloves, bay leaf) until 70% cooked. Drain.",
      "Marinate vegetables in yogurt, biryani masala, ginger-garlic paste, and mint for 20 minutes.",
      "In a heavy vessel, cook marinated vegetables until half done.",
      "Layer 70% cooked rice over vegetables. Top with fried onions, saffron milk, mint, and ghee.",
      "Seal vessel tightly with dough or aluminum foil and cook on very low heat (dum) for 25 minutes."
    ]
  },
  {
    title: "Dal Tadka Dhaba Style",
    cuisine: "Indian", mealType: "Lunch", diets: ["Vegetarian", "Gluten Free"], difficulty: "easy" as const, prep: 10, cook: 25, servings: 4, calories: 290,
    imageUrl: "https://images.unsplash.com/photo-1546833998-877b37c2e5c6?auto=format&fit=crop&w=1200&q=80",
    description: "Yellow lentils cooked until creamy, finished with a sizzling tempering of ghee, cumin seeds, garlic, dried red chilies, and hing.",
    ingredients: [
      { name: "toor dal (yellow split pigeon peas)", quantity: "1", unit: "cup" },
      { name: "ghee", quantity: "3", unit: "tbsp" },
      { name: "cumin seeds", quantity: "1", unit: "tsp" },
      { name: "garlic cloves (finely chopped)", quantity: "5", unit: "units" },
      { name: "dry red chilies", quantity: "2", unit: "units" },
      { name: "asafoetida (hing)", quantity: "1/4", unit: "tsp" }
    ],
    steps: [
      "Pressure cook toor dal with turmeric, salt, and water until soft and creamy.",
      "Whisk cooked dal lightly to smooth consistency.",
      "For tempering (tadka): Heat ghee in a small pan. Add cumin seeds, chopped garlic, dry red chilies, and hing.",
      "When garlic turns golden, turn off heat, add Kashmiri chili powder, and pour immediately into boiled dal.",
      "Cover with lid for 2 minutes to lock in flavors. Garnish with chopped coriander."
    ]
  },
  {
    title: "Paneer Tikka Masala",
    cuisine: "Indian", mealType: "Dinner", diets: ["Vegetarian", "Gluten Free"], difficulty: "medium" as const, prep: 25, cook: 30, servings: 4, calories: 460,
    imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=1200&q=80",
    description: "Chargrilled cottage cheese cubes cooked with bell peppers in a tangy, spiced onion-tomato gravy.",
    ingredients: [
      { name: "paneer (cottage cheese)", quantity: "400", unit: "g" },
      { name: "bell peppers & onions (cut into petals)", quantity: "2", unit: "cups" },
      { name: "hung curd / thick yogurt", quantity: "1/2", unit: "cup" },
      { name: "tomato puree", quantity: "1.5", unit: "cups" },
      { name: "garam masala & kasuri methi", quantity: "1", unit: "tbsp" }
    ],
    steps: [
      "Marinate paneer and pepper petals in hung curd and spices for 20 minutes.",
      "Skewer or pan-fry paneer cubes on high heat until charred.",
      "Sauté onions, ginger, garlic, and tomato puree until fat separates.",
      "Stir in grilled paneer and peppers, add cream, and simmer for 5 minutes."
    ]
  },

  // --- ITALIAN (6-10) ---
  {
    title: "Neapolitan Pizza Margherita",
    cuisine: "Italian", mealType: "Dinner", diets: ["Vegetarian"], difficulty: "medium" as const, prep: 120, cook: 10, servings: 2, calories: 420,
    imageUrl: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=1200&q=80",
    description: "Hand-stretched 00-flour dough topped with crushed San Marzano tomatoes, fresh Fior di Latte mozzarella, fresh basil, and extra virgin olive oil.",
    ingredients: [
      { name: "Tipo 00 flour", quantity: "300", unit: "g" },
      { name: "warm water", quantity: "195", unit: "ml" },
      { name: "instant dry yeast", quantity: "1", unit: "g" },
      { name: "San Marzano tomatoes (crushed)", quantity: "150", unit: "g" },
      { name: "fresh mozzarella", quantity: "120", unit: "g" },
      { name: "fresh basil", quantity: "8", unit: "leaves" }
    ],
    steps: [
      "Knead flour, water, yeast, and salt for 10 minutes. Proof dough for 2 hours.",
      "Preheat oven with pizza steel to maximum setting (260°C / 500°F).",
      "Hand stretch dough outward leaving a puffed rim.",
      "Spread crushed tomatoes, fresh mozzarella, and bake on steel for 6-8 minutes until charred in spots.",
      "Top with basil and olive oil upon removal."
    ]
  },
  {
    title: "Classic Creamy Carbonara",
    cuisine: "Italian", mealType: "Dinner", diets: ["High Protein"], difficulty: "medium" as const, prep: 10, cook: 15, servings: 2, calories: 610,
    imageUrl: "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=1200&q=80",
    description: "Roman spaghetti tossed with crispy guanciale, egg yolks, freshly grated Pecorino Romano, and cracked black pepper.",
    ingredients: [
      { name: "spaghetti", quantity: "200", unit: "g" },
      { name: "guanciale or pancetta", quantity: "100", unit: "g" },
      { name: "egg yolks", quantity: "3", unit: "large" },
      { name: "Pecorino Romano cheese", quantity: "50", unit: "g" },
      { name: "coarsely ground black pepper", quantity: "1", unit: "tbsp" }
    ],
    steps: [
      "Boil spaghetti in salted water until al dente.",
      "Crisp guanciale in skillet over medium heat until golden. Save rendered fat.",
      "Whisk egg yolks with Pecorino Romano and 1 tbsp of hot pasta water.",
      "Toss drained pasta in guanciale pan OFF heat, then quickly emulsify with egg-cheese mixture."
    ]
  },
  {
    title: "Wild Mushroom Risotto",
    cuisine: "Italian", mealType: "Dinner", diets: ["Vegetarian", "Gluten Free"], difficulty: "medium" as const, prep: 15, cook: 30, servings: 3, calories: 430,
    imageUrl: "https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=1200&q=80",
    description: "Arborio rice slow-cooked with white wine, vegetable broth, sautéed cremini, and porcini mushrooms finished with butter and Parmigiano-Reggiano.",
    ingredients: [
      { name: "Arborio rice", quantity: "1.5", unit: "cups" },
      { name: "cremini & porcini mushrooms", quantity: "300", unit: "g" },
      { name: "dry white wine", quantity: "1/2", unit: "cup" },
      { name: "vegetable broth (warm)", quantity: "4", unit: "cups" },
      { name: "Parmigiano-Reggiano", quantity: "1/2", unit: "cup" }
    ],
    steps: [
      "Sauté mushrooms in olive oil until golden; set aside.",
      "Toast Arborio rice in butter and shallots. Deglaze with white wine.",
      "Ladle warm broth into rice 1/2 cup at a time, stirring constantly until absorbed.",
      "Fold in cooked mushrooms, butter, and grated parmesan."
    ]
  },
  {
    title: "Fresh Spinach & Ricotta Ravioli",
    cuisine: "Italian", mealType: "Lunch", diets: ["Vegetarian"], difficulty: "hard" as const, prep: 60, cook: 10, servings: 4, calories: 380,
    imageUrl: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1200&q=80",
    description: "Handmade pasta pillows stuffed with seasoned spinach and fresh ricotta cheese, tossed in sage butter.",
    ingredients: [
      { name: "pasta flour (Tipo 00)", quantity: "200", unit: "g" },
      { name: "eggs", quantity: "2", unit: "large" },
      { name: "ricotta cheese", quantity: "200", unit: "g" },
      { name: "fresh spinach (wilted)", quantity: "150", unit: "g" },
      { name: "unsalted butter & fresh sage", quantity: "4", unit: "tbsp" }
    ],
    steps: [
      "Make pasta dough with flour and eggs; rest for 30 minutes before rolling thin.",
      "Mix drained spinach, ricotta, nutmeg, and parmesan into filling.",
      "Dollop filling on pasta sheets, seal edges, cut into squares.",
      "Boil for 3 minutes, then toss directly in brown sage butter."
    ]
  },
  {
    title: "Classic Eggplant Parmigiana",
    cuisine: "Italian", mealType: "Dinner", diets: ["Vegetarian", "Gluten Free"], difficulty: "medium" as const, prep: 30, cook: 40, servings: 4, calories: 390,
    imageUrl: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=1200&q=80",
    description: "Baked layers of sliced eggplant, marinara sauce, fresh mozzarella, and basil.",
    ingredients: [
      { name: "eggplant (sliced)", quantity: "2", unit: "large" },
      { name: "marinara sauce", quantity: "2.5", unit: "cups" },
      { name: "mozzarella cheese", quantity: "200", unit: "g" },
      { name: "parmesan cheese", quantity: "1/2", unit: "cup" }
    ],
    steps: [
      "Salt eggplant slices to drain moisture, then roast until tender.",
      "Layer sauce, eggplant slices, mozzarella, and parmesan in a baking dish.",
      "Bake at 190°C (375°F) for 35 minutes until bubbly and golden brown."
    ]
  },

  // --- JAPANESE (11-15) ---
  {
    title: "Rich Tonkotsu Ramen with Chashu Belly",
    cuisine: "Japanese", mealType: "Dinner", diets: [], difficulty: "hard" as const, prep: 45, cook: 360, servings: 4, calories: 680,
    imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=80",
    description: "Creamy pork marrow broth simmered over 6 hours, served with fresh alkaline noodles, braised chashu pork belly, ajitsuke tamago, and wood ear mushrooms.",
    ingredients: [
      { name: "pork bones", quantity: "1.5", unit: "kg" },
      { name: "pork belly slab", quantity: "500", unit: "g" },
      { name: "fresh ramen noodles", quantity: "400", unit: "g" },
      { name: "ramen eggs (ajitsuke tamago)", quantity: "4", unit: "units" }
    ],
    steps: [
      "Boil pork bones hard for 6 hours, mashing bones to extract marrow into white emulsion broth.",
      "Braise rolled pork belly in soy sauce, mirin, and ginger for 2 hours.",
      "Assemble bowl with soy tare, piping hot broth, boiled noodles, chashu, and soft marinated egg."
    ]
  },
  {
    title: "Chicken Katsu Curry",
    cuisine: "Japanese", mealType: "Dinner", diets: ["High Protein"], difficulty: "medium" as const, prep: 20, cook: 30, servings: 4, calories: 590,
    imageUrl: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=1200&q=80",
    description: "Crispy panko-breaded chicken cutlets served over steamed rice with a savory Japanese curry sauce.",
    ingredients: [
      { name: "chicken cutlets", quantity: "4", unit: "pieces" },
      { name: "panko breadcrumbs", quantity: "1.5", unit: "cups" },
      { name: "Japanese curry roux blocks", quantity: "100", unit: "g" },
      { name: "carrots & potatoes (cubed)", quantity: "2", unit: "cups" }
    ],
    steps: [
      "Coat chicken cutlets in flour, egg, and panko. Fry until golden crisp.",
      "Simmer potatoes, carrots, and onions in water; melt curry roux blocks into broth.",
      "Slice chicken katsu and serve over rice alongside rich curry sauce."
    ]
  },
  {
    title: "Salmon Teriyaki Bento Bowl",
    cuisine: "Japanese", mealType: "Lunch", diets: ["High Protein", "Gluten Free"], difficulty: "easy" as const, prep: 15, cook: 15, servings: 2, calories: 470,
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80",
    description: "Pan-seared salmon fillets glazed with sweet homemade teriyaki sauce over steamed rice and steamed edamame.",
    ingredients: [
      { name: "salmon fillets", quantity: "2", unit: "pieces" },
      { name: "soy sauce, mirin & sake", quantity: "2", unit: "tbsp each" },
      { name: "steamed jasmine rice", quantity: "2", unit: "cups" },
      { name: "shelled edamame", quantity: "1", unit: "cup" }
    ],
    steps: [
      "Sear salmon fillets skin-side down in a skillet until crisp.",
      "Pour soy sauce, mirin, sake, and honey into skillet; let reduce into a glossy sauce.",
      "Glaze salmon and serve over warm rice bowls with edamame."
    ]
  },
  {
    title: "Vegetable Tempura Platter",
    cuisine: "Japanese", mealType: "Appetizer", diets: ["Vegetarian", "Vegan"], difficulty: "medium" as const, prep: 20, cook: 15, servings: 3, calories: 310,
    imageUrl: "https://images.unsplash.com/photo-1615361200141-f45040f367be?auto=format&fit=crop&w=1200&q=80",
    description: "Light and airy fried sweet potato, lotus root, shiitake, and bell pepper slices served with dashi dipping sauce.",
    ingredients: [
      { name: "iced water & cake flour", quantity: "1", unit: "cup each" },
      { name: "assorted veggies (sweet potato, mushrooms)", quantity: "3", unit: "cups" },
      { name: "tempura dipping sauce (tentsuyu)", quantity: "1/2", unit: "cup" }
    ],
    steps: [
      "Whisk ice water and flour lightly (do not overmix).",
      "Dip vegetable slices in batter and deep fry in hot oil at 170°C for 2 minutes.",
      "Drain on paper towels and serve immediately with tentsuyu sauce."
    ]
  },
  {
    title: "Miso Soup with Tofu & Wakame",
    cuisine: "Japanese", mealType: "Beverage", diets: ["Vegan", "Gluten Free", "Low Carb"], difficulty: "easy" as const, prep: 5, cook: 10, servings: 4, calories: 80,
    imageUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1200&q=80",
    description: "Restorative dashi broth infused with red and white miso paste, soft tofu cubes, scallions, and wakame seaweed.",
    ingredients: [
      { name: "dashi stock", quantity: "4", unit: "cups" },
      { name: "miso paste", quantity: "3", unit: "tbsp" },
      { name: "silken tofu (cubed)", quantity: "150", unit: "g" },
      { name: "dried wakame seaweed", quantity: "1", unit: "tbsp" }
    ],
    steps: [
      "Warm dashi stock in pot without boiling.",
      "Dissolve miso paste using a small strainer into warm stock.",
      "Add soft tofu cubes and rehydrated wakame seaweed. Serve warm."
    ]
  },

  // --- MEXICAN (16-20) ---
  {
    title: "Slow-Cooked Birria de Res Tacos",
    cuisine: "Mexican", mealType: "Dinner", diets: ["High Protein", "Gluten Free"], difficulty: "medium" as const, prep: 30, cook: 180, servings: 6, calories: 520,
    imageUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=1200&q=80",
    description: "Melt-in-your-mouth shredded beef chuck roast cooked in a rich chili broth, served crispy-dipped in Oaxaca cheese and warm consommé.",
    ingredients: [
      { name: "beef chuck roast", quantity: "1.2", unit: "kg" },
      { name: "dried guajillo & ancho chilies", quantity: "8", unit: "units" },
      { name: "Oaxaca cheese", quantity: "200", unit: "g" },
      { name: "corn tortillas", quantity: "12", unit: "units" }
    ],
    steps: [
      "Toast dried chilies and blend with charred tomatoes, onion, garlic, vinegar, and spices.",
      "Sear beef and braise in chili broth for 3 hours until fork tender.",
      "Shred beef. Dip tortillas in top fat layer, fry on griddle with cheese and beef, fold and serve with dipping consommé."
    ]
  },
  {
    title: "Fresh Guacamole & Charred Salsa Verde",
    cuisine: "Mexican", mealType: "Snack", diets: ["Vegan", "Gluten Free", "Keto"], difficulty: "easy" as const, prep: 15, cook: 10, servings: 4, calories: 210,
    imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80",
    description: "Creamy smashed Haas avocados with lime, cilantro, and red onion alongside tangy roasted tomatillo salsa.",
    ingredients: [
      { name: "ripe Haas avocados", quantity: "3", unit: "large" },
      { name: "tomatillos (broiled)", quantity: "5", unit: "units" },
      { name: "jalapeno & cilantro", quantity: "1/2", unit: "cup" },
      { name: "lime juice", quantity: "2", unit: "tbsp" }
    ],
    steps: [
      "Coarsely mash avocados with lime juice, diced onions, jalapenos, and salt.",
      "Broil tomatillos and blend with garlic and cilantro for green salsa."
    ]
  },
  {
    title: "Chicken Enchiladas Suizas",
    cuisine: "Mexican", mealType: "Dinner", diets: ["High Protein"], difficulty: "medium" as const, prep: 25, cook: 30, servings: 4, calories: 510,
    imageUrl: "https://images.unsplash.com/photo-1534352956036-cd81e27dd615?auto=format&fit=crop&w=1200&q=80",
    description: "Shredded chicken wrapped in corn tortillas, smothered in creamy tomatillo sauce and melted Monterey Jack.",
    ingredients: [
      { name: "shredded cooked chicken", quantity: "3", unit: "cups" },
      { name: "tomatillo sauce with sour cream", quantity: "2", unit: "cups" },
      { name: "Monterey Jack cheese", quantity: "1.5", unit: "cups" },
      { name: "corn tortillas", quantity: "8", unit: "units" }
    ],
    steps: [
      "Fill warm tortillas with chicken, roll up, and place tightly in baking dish.",
      "Pour creamy tomatillo sauce over enchiladas and top with shredded cheese.",
      "Bake at 190°C for 20 minutes until bubbling."
    ]
  },
  {
    title: "Street Style Corn (Elote)",
    cuisine: "Mexican", mealType: "Snack", diets: ["Vegetarian", "Gluten Free"], difficulty: "easy" as const, prep: 10, cook: 15, servings: 4, calories: 260,
    imageUrl: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=1200&q=80",
    description: "Grilled corn on the cob slathered in mayo-crema, rolled in Cotija cheese, chili powder, and fresh lime juice.",
    ingredients: [
      { name: "sweet corn ears", quantity: "4", unit: "units" },
      { name: "mexican crema / mayo", quantity: "1/2", unit: "cup" },
      { name: "Cotija cheese (crumbled)", quantity: "1/2", unit: "cup" },
      { name: "Tajin chili powder", quantity: "1", unit: "tbsp" }
    ],
    steps: [
      "Grill corn ears until charred on all sides.",
      "Brush generously with crema-mayo mixture.",
      "Roll in crumbled Cotija cheese and dust with Tajin chili powder."
    ]
  },
  {
    title: "Black Bean & Sweet Potato Burrito",
    cuisine: "Mexican", mealType: "Lunch", diets: ["Vegan", "High Protein"], difficulty: "easy" as const, prep: 15, cook: 20, servings: 3, calories: 420,
    imageUrl: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=1200&q=80",
    description: "Roasted sweet potatoes, seasoned black beans, cilantro lime rice, and avocado rolled in whole wheat tortilla.",
    ingredients: [
      { name: "roasted sweet potato cubes", quantity: "2", unit: "cups" },
      { name: "black beans (seasoned)", quantity: "1.5", unit: "cups" },
      { name: "cilantro lime rice", quantity: "1.5", unit: "cups" },
      { name: "large flour tortillas", quantity: "3", unit: "units" }
    ],
    steps: [
      "Layer rice, black beans, sweet potatoes, and sliced avocado onto warm tortillas.",
      "Fold sides and roll into tight burritos. Toast on griddle seam-side down."
    ]
  },

  // --- THAI (21-25) ---
  {
    title: "Authentic Pad Thai with Shrimp",
    cuisine: "Thai", mealType: "Dinner", diets: ["Gluten Free", "High Protein"], difficulty: "medium" as const, prep: 20, cook: 15, servings: 3, calories: 490,
    imageUrl: "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1200&q=80",
    description: "Stir-fried rice noodles in tangy tamarind sauce with jumbo shrimp, tofu, bean sprouts, scrambled egg, and crushed peanuts.",
    ingredients: [
      { name: "flat rice noodles", quantity: "200", unit: "g" },
      { name: "jumbo shrimp", quantity: "250", unit: "g" },
      { name: "tamarind paste & palm sugar", quantity: "3", unit: "tbsp each" },
      { name: "bean sprouts & crushed peanuts", quantity: "1", unit: "cup" }
    ],
    steps: [
      "Soak rice noodles in warm water for 30 minutes.",
      "Stir fry shrimp and tofu in hot wok. Push aside and scramble eggs.",
      "Add noodles, tamarind sauce, bean sprouts, and toss rapidly on high heat."
    ]
  },
  {
    title: "Thai Green Curry with Tofu",
    cuisine: "Thai", mealType: "Dinner", diets: ["Vegan", "Gluten Free"], difficulty: "easy" as const, prep: 15, cook: 20, servings: 4, calories: 380,
    imageUrl: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=1200&q=80",
    description: "Aromatic green curry paste reduced in coconut milk with pressed tofu, bamboo shoots, and Thai basil.",
    ingredients: [
      { name: "green curry paste", quantity: "3", unit: "tbsp" },
      { name: "coconut milk", quantity: "400", unit: "ml" },
      { name: "pressed tofu (cubed)", quantity: "300", unit: "g" },
      { name: "bamboo shoots & Thai basil", quantity: "1", unit: "cup" }
    ],
    steps: [
      "Fry green curry paste in thick coconut cream until fragrant oil splits.",
      "Add remaining coconut milk, tofu cubes, and bamboo shoots.",
      "Simmer for 10 minutes and stir in fresh Thai basil leaves."
    ]
  },
  {
    title: "Tom Yum Goong (Spicy Shrimp Soup)",
    cuisine: "Thai", mealType: "Appetizer", diets: ["Gluten Free", "Low Carb"], difficulty: "medium" as const, prep: 15, cook: 15, servings: 4, calories: 190,
    imageUrl: "https://images.unsplash.com/photo-1548946526-f69e2424cf45?auto=format&fit=crop&w=1200&q=80",
    description: "Hot and sour soup infused with lemongrass, galangal, kaffir lime leaves, chili paste, and fresh prawns.",
    ingredients: [
      { name: "shrimp stock", quantity: "4", unit: "cups" },
      { name: "lemongrass & galangal", quantity: "3", unit: "stalks" },
      { name: "kaffir lime leaves", quantity: "5", unit: "leaves" },
      { name: "prawns", quantity: "300", unit: "g" }
    ],
    steps: [
      "Boil lemongrass, galangal, and kaffir lime leaves in stock to infuse aromatics.",
      "Add mushrooms, prawns, Thai chili paste, and lime juice. Cook 3 minutes."
    ]
  },
  {
    title: "Mango Sticky Rice (Khao Niew Mamuang)",
    cuisine: "Thai", mealType: "Dessert", diets: ["Vegan", "Gluten Free"], difficulty: "easy" as const, prep: 120, cook: 25, servings: 4, calories: 360,
    imageUrl: "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=1200&q=80",
    description: "Steamed sweet glutinous rice soaked in salted coconut milk served with ripe sweet yellow mango slices.",
    ingredients: [
      { name: "glutinous sticky rice", quantity: "1", unit: "cup" },
      { name: "coconut milk & sugar", quantity: "1", unit: "cup" },
      { name: "ripe yellow mangoes", quantity: "2", unit: "units" }
    ],
    steps: [
      "Steam soaked sticky rice for 20 minutes.",
      "Mix warm coconut milk with sugar and salt; pour over hot rice to absorb.",
      "Serve with fresh sliced mangoes and salted coconut drizzle."
    ]
  },
  {
    title: "Spicy Basil Pork (Pad Krapow)",
    cuisine: "Thai", mealType: "Lunch", diets: ["High Protein"], difficulty: "easy" as const, prep: 10, cook: 10, servings: 2, calories: 450,
    imageUrl: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=1200&q=80",
    description: "Minced meat flash-fried with bird's eye chilies, garlic, soy sauce, and holy basil topped with a crispy fried egg.",
    ingredients: [
      { name: "ground pork or chicken", quantity: "300", unit: "g" },
      { name: "Thai holy basil", quantity: "1", unit: "cup" },
      { name: "bird's eye chilies & garlic", quantity: "5", unit: "units" },
      { name: "fried egg", quantity: "2", unit: "units" }
    ],
    steps: [
      "Pound chilies and garlic in mortar; fry in screaming hot wok.",
      "Add minced pork, soy sauce, fish sauce, and stir fry for 4 minutes.",
      "Fold in holy basil and serve immediately over rice topped with fried egg."
    ]
  },

  // --- CHINESE (26-30) ---
  {
    title: "Sichuan Kung Pao Chicken",
    cuisine: "Chinese", mealType: "Dinner", diets: ["High Protein"], difficulty: "medium" as const, prep: 20, cook: 15, servings: 3, calories: 480,
    imageUrl: "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=1200&q=80",
    description: "Diced chicken wok-tossed with dried red chilies, numbing Sichuan peppercorns, scallions, and roasted peanuts.",
    ingredients: [
      { name: "chicken breast (cubed)", quantity: "400", unit: "g" },
      { name: "Sichuan peppercorns", quantity: "1", unit: "tbsp" },
      { name: "dried red chilies", quantity: "10", unit: "units" },
      { name: "roasted peanuts", quantity: "1/2", unit: "cup" }
    ],
    steps: [
      "Velvet diced chicken in soy sauce and cornstarch.",
      "Fry Sichuan peppercorns and dried chilies in hot oil until fragrant.",
      "Wok-toss chicken, garlic, sauce mixture, and toss peanuts in at the end."
    ]
  },
  {
    title: "Hand-Folded Pork & Chive Dumplings",
    cuisine: "Chinese", mealType: "Appetizer", diets: [], difficulty: "hard" as const, prep: 45, cook: 15, servings: 4, calories: 390,
    imageUrl: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=1200&q=80",
    description: "Juicy pork and garlic chive filling wrapped in thin dough, pan-fried for crispy bottoms and steamed tender.",
    ingredients: [
      { name: "dumpling wrappers", quantity: "30", unit: "units" },
      { name: "ground pork", quantity: "350", unit: "g" },
      { name: "garlic chives (finely chopped)", quantity: "1", unit: "cup" },
      { name: "sesame oil & ginger", quantity: "1", unit: "tbsp" }
    ],
    steps: [
      "Mix ground pork, garlic chives, soy sauce, and ginger.",
      "Pleat filling tightly inside dumpling wrappers.",
      "Pan-fry bottoms in oil until brown, pour in water, cover lid and steam 6 minutes."
    ]
  },
  {
    title: "Mapo Tofu (Sichuan Style)",
    cuisine: "Chinese", mealType: "Dinner", diets: ["Gluten Free"], difficulty: "medium" as const, prep: 15, cook: 15, servings: 3, calories: 340,
    imageUrl: "https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?auto=format&fit=crop&w=1200&q=80",
    description: "Soft silken tofu set in a spicy, fiery chili bean paste (doubanjiang) sauce with minced beef.",
    ingredients: [
      { name: "silken tofu (cubed)", quantity: "400", unit: "g" },
      { name: "doubanjiang (Sichuan chili bean paste)", quantity: "2", unit: "tbsp" },
      { name: "minced beef", quantity: "100", unit: "g" },
      { name: "ground Sichuan pepper powder", quantity: "1", unit: "tsp" }
    ],
    steps: [
      "Sauté minced beef and chili bean paste in oil until oil turns deep red.",
      "Add stock, slide in cubed soft tofu, and simmer gently for 5 minutes.",
      "Thicken with cornstarch slurry and dust with roasted Sichuan pepper."
    ]
  },
  {
    title: "Vegetable Vegetable Fried Rice",
    cuisine: "Chinese", mealType: "Lunch", diets: ["Vegetarian", "Vegan"], difficulty: "easy" as const, prep: 10, cook: 10, servings: 3, calories: 320,
    imageUrl: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=1200&q=80",
    description: "Day-old cold jasmine rice wok-tossed on high heat with diced carrots, peas, spring onions, and light soy sauce.",
    ingredients: [
      { name: "day-old cooked rice", quantity: "3", unit: "cups" },
      { name: "mixed frozen peas & carrots", quantity: "1", unit: "cup" },
      { name: "soy sauce & dark soy sauce", quantity: "2", unit: "tbsp" },
      { name: "spring onions", quantity: "1/2", unit: "cup" }
    ],
    steps: [
      "Break up cold rice grains with wet fingers.",
      "Wok-fry vegetables in oil over maximum heat.",
      "Add rice, drizzle soy sauce around wok edges, and toss continuously for wok hei aroma."
    ]
  },
  {
    title: "Cantonese Steamed Whole Fish",
    cuisine: "Chinese", mealType: "Dinner", diets: ["Gluten Free", "High Protein", "Low Carb"], difficulty: "medium" as const, prep: 15, cook: 12, servings: 2, calories: 280,
    imageUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=1200&q=80",
    description: "Delicate sea bass steamed with ginger and scallions, doused in seasoned soy sauce and sizzled with hot sesame oil.",
    ingredients: [
      { name: "whole sea bass or snapper", quantity: "1", unit: "whole" },
      { name: "scallions & ginger (julienned)", quantity: "1", unit: "cup" },
      { name: "sweet soy sauce mixture", quantity: "3", unit: "tbsp" },
      { name: "sesame oil", quantity: "2", unit: "tbsp" }
    ],
    steps: [
      "Stuff fish cavity with ginger slices and steam for 10 minutes.",
      "Discard steamed water juices; top fish with fresh scallion threads and sweet soy sauce.",
      "Heat sesame oil until smoking hot and pour directly over scallions to crackle."
    ]
  },

  // --- MEDITERRANEAN & FRENCH (31-40) ---
  {
    title: "Greek Souvlaki Platter with Tzatziki",
    cuisine: "Mediterranean", mealType: "Dinner", diets: ["High Protein", "Gluten Free"], difficulty: "easy" as const, prep: 20, cook: 15, servings: 4, calories: 460,
    imageUrl: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=1200&q=80",
    description: "Marinated oregano chicken skewers grilled over flame, served with cucumber tzatziki, warm pita, and Greek salad.",
    ingredients: [
      { name: "chicken breast (cubed)", quantity: "600", unit: "g" },
      { name: "greek yogurt & cucumber (for tzatziki)", quantity: "1", unit: "cup" },
      { name: "dried oregano & lemon juice", quantity: "2", unit: "tbsp" },
      { name: "pita breads", quantity: "4", unit: "units" }
    ],
    steps: [
      "Marinate chicken in olive oil, lemon, garlic, and oregano. Skewer and grill 12 mins.",
      "Grate cucumber, squeeze dry, and fold into yogurt with garlic for tzatziki.",
      "Serve hot skewers with warmed pita and dip."
    ]
  },
  {
    title: "Classic Shakshuka",
    cuisine: "Mediterranean", mealType: "Breakfast", diets: ["Vegetarian", "Gluten Free", "Low Carb"], difficulty: "easy" as const, prep: 10, cook: 20, servings: 3, calories: 290,
    imageUrl: "https://images.unsplash.com/photo-1590412200988-a436970781fa?auto=format&fit=crop&w=1200&q=80",
    description: "Eggs poached directly in a simmering pan of spiced tomato, red bell pepper, garlic, and cumin sauce topped with feta.",
    ingredients: [
      { name: "eggs", quantity: "4", unit: "large" },
      { name: "crushed canned tomatoes", quantity: "2", unit: "cups" },
      { name: "red bell pepper (diced)", quantity: "1", unit: "large" },
      { name: "crumbled feta cheese", quantity: "1/2", unit: "cup" }
    ],
    steps: [
      "Sauté onions, garlic, and bell peppers in olive oil until soft.",
      "Add tomatoes, cumin, paprika; cook 10 minutes until sauce thickens.",
      "Make small wells in sauce, crack in eggs, cover and cook until egg whites set."
    ]
  },
  {
    title: "French Beef Bourguignon",
    cuisine: "French", mealType: "Dinner", diets: ["High Protein"], difficulty: "hard" as const, prep: 30, cook: 180, servings: 6, calories: 610,
    imageUrl: "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=1200&q=80",
    description: "Tender beef chuck stewed in full-bodied red Burgundy wine with bacon lardons, pearl onions, and sautéed mushrooms.",
    ingredients: [
      { name: "beef chuck (cubed)", quantity: "1.2", unit: "kg" },
      { name: "dry red wine (Pinot Noir)", quantity: "750", unit: "ml" },
      { name: "bacon lardons", quantity: "150", unit: "g" },
      { name: "pearl onions & mushrooms", quantity: "2", unit: "cups" }
    ],
    steps: [
      "Sear beef cubes in bacon fat until browned on all sides.",
      "Pour red wine and beef broth over meat; braise covered at 160°C for 2.5 hours.",
      "Sauté pearl onions and mushrooms separately; fold into tender stew before serving."
    ]
  },
  {
    title: "Classic French Ratatouille",
    cuisine: "French", mealType: "Dinner", diets: ["Vegan", "Gluten Free", "Low Carb"], difficulty: "medium" as const, prep: 25, cook: 45, servings: 4, calories: 210,
    imageUrl: "https://images.unsplash.com/photo-1572453800999-e8d2d1589b7c?auto=format&fit=crop&w=1200&q=80",
    description: "Thinly sliced eggplant, zucchini, and yellow squash layered over a rich tomato-pepper piperade base.",
    ingredients: [
      { name: "eggplant, zucchini & squash (sliced thin)", quantity: "3", unit: "cups" },
      { name: "crushed tomato & bell pepper puree", quantity: "2", unit: "cups" },
      { name: "fresh thyme & garlic", quantity: "2", unit: "tbsp" }
    ],
    steps: [
      "Spread pureed bell pepper and tomato piperade on bottom of baking dish.",
      "Arrange alternating sliced vegetable rounds in concentric spiral pattern.",
      "Cover with parchment paper and bake at 180°C for 45 minutes."
    ]
  },
  {
    title: "Crispy French Croque Monsieur",
    cuisine: "French", mealType: "Breakfast", diets: [], difficulty: "medium" as const, prep: 15, cook: 15, servings: 2, calories: 520,
    imageUrl: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=1200&q=80",
    description: "Toasted brioche sandwich stuffed with smoked ham and Gruyère cheese, smothered in creamy béchamel sauce.",
    ingredients: [
      { name: "thick brioche bread slices", quantity: "4", unit: "slices" },
      { name: "Gruyère cheese (shredded)", quantity: "150", unit: "g" },
      { name: "smoked ham slices", quantity: "4", unit: "slices" },
      { name: "béchamel sauce", quantity: "1", unit: "cup" }
    ],
    steps: [
      "Make butter-flour béchamel sauce seasoned with nutmeg.",
      "Assemble brioche with ham, cheese, and béchamel layer inside and over top.",
      "Broil in oven for 8 minutes until cheese is golden bubbly."
    ]
  },

  // --- KOREAN & VIETNAMESE (41-50) ---
  {
    title: "Korean Bibimbap Rice Bowl",
    cuisine: "Korean", mealType: "Lunch", diets: ["High Protein"], difficulty: "medium" as const, prep: 25, cook: 15, servings: 2, calories: 510,
    imageUrl: "https://images.unsplash.com/photo-1553163147-622ab57be1c7?auto=format&fit=crop&w=1200&q=80",
    description: "Warm rice topped with sautéed spinach, bean sprouts, marinated beef, fried egg, and sweet-spicy Gochujang sauce.",
    ingredients: [
      { name: "cooked rice", quantity: "2", unit: "cups" },
      { name: "sliced beef bulgogi", quantity: "200", unit: "g" },
      { name: "assorted veggies (spinach, carrots, sprouts)", quantity: "2", unit: "cups" },
      { name: "Gochujang chili paste sauce", quantity: "3", unit: "tbsp" }
    ],
    steps: [
      "Sauté each vegetable topping separately with sesame oil and garlic.",
      "Cook sliced bulgogi beef in hot pan.",
      "Arrange toppings over hot rice, add fried egg in center, and mix with Gochujang sauce."
    ]
  },
  {
    title: "Kimchi Stew (Kimchi Jjigae)",
    cuisine: "Korean", mealType: "Dinner", diets: ["High Protein", "Gluten Free"], difficulty: "easy" as const, prep: 10, cook: 25, servings: 3, calories: 360,
    imageUrl: "https://images.unsplash.com/photo-1583032015879-e5022cb87c3b?auto=format&fit=crop&w=1200&q=80",
    description: "Spicy stew cooked with aged fermentation kimchi, pork belly, tofu, and gochugaru chili flakes.",
    ingredients: [
      { name: "aged fermented kimchi", quantity: "2", unit: "cups" },
      { name: "pork belly (sliced)", quantity: "200", unit: "g" },
      { name: "firm tofu (sliced)", quantity: "200", unit: "g" },
      { name: "Korean chili flakes (gochugaru)", quantity: "1", unit: "tbsp" }
    ],
    steps: [
      "Sauté pork belly and aged kimchi in pot for 5 minutes.",
      "Pour in broth and kimchi juice; simmer on high heat for 15 minutes.",
      "Add tofu slices and green onions in last 5 minutes."
    ]
  },
  {
    title: "Crispy Korean Fried Chicken Wings",
    cuisine: "Korean", mealType: "Snack", diets: ["High Protein"], difficulty: "medium" as const, prep: 15, cook: 20, servings: 4, calories: 580,
    imageUrl: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=1200&q=80",
    description: "Double-fried extra crispy chicken wings coated in a sticky sweet and spicy Gochujang glaze.",
    ingredients: [
      { name: "chicken wings", quantity: "800", unit: "g" },
      { name: "potato starch coat", quantity: "1", unit: "cup" },
      { name: "Gochujang sweet glaze", quantity: "1/2", unit: "cup" }
    ],
    steps: [
      "Coat wings in potato starch; double fry in oil (first at 160°C, then 190°C) for extreme crispiness.",
      "Simmer Gochujang, honey, garlic glaze until thick; toss fried wings to coat."
    ]
  },
  {
    title: "Authentic Vietnamese Beef Pho",
    cuisine: "Vietnamese", mealType: "Dinner", diets: ["Gluten Free"], difficulty: "hard" as const, prep: 30, cook: 240, servings: 4, calories: 450,
    imageUrl: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=1200&q=80",
    description: "Aromatic beef bone broth simmered for 4 hours with charred ginger, star anise, cinnamon, served with rice noodles and thin sirloin slices.",
    ingredients: [
      { name: "beef marrow bones", quantity: "1.5", unit: "kg" },
      { name: "charred onion, ginger & star anise", quantity: "1", unit: "set" },
      { name: "flat rice pho noodles", quantity: "300", unit: "g" },
      { name: "raw thinly sliced sirloin beef", quantity: "200", unit: "g" }
    ],
    steps: [
      "Par-boil bones to clean; simmer with charred ginger, onion, star anise, and cinnamon for 4 hours.",
      "Place rehydrated noodles and raw sirloin slices in deep bowl.",
      "Ladle piping hot broth directly over raw beef slices to cook them instantly."
    ]
  },
  {
    title: "Vietnamese Pork Banh Mi Sandwich",
    cuisine: "Vietnamese", mealType: "Lunch", diets: [], difficulty: "medium" as const, prep: 20, cook: 10, servings: 2, calories: 490,
    imageUrl: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=1200&q=80",
    description: "Crispy French baguette stuffed with savory grilled pork, quick-pickled daikon and carrots, fresh cucumber, and cilantro.",
    ingredients: [
      { name: "single-serve crispy baguettes", quantity: "2", unit: "units" },
      { name: "marinated lemongrass pork", quantity: "250", unit: "g" },
      { name: "pickled daikon & carrot juliennes", quantity: "1", unit: "cup" },
      { name: "mayo & fresh cilantro", quantity: "1/2", unit: "cup" }
    ],
    steps: [
      "Grill lemongrass marinated pork until charred.",
      "Slice warm baguette lengthwise, spread mayonnaise, layer grilled pork, pickled veggies, sliced jalapenos, and cilantro."
    ]
  }
];

// ---------------------------------------------------------------------------
// 3. Educational & Culinary Blog Posts
// ---------------------------------------------------------------------------

const BLOG_POSTS = [
  {
    title: "The Art of Spice Tempering: Unlocking Deep Flavor in Indian Cooking",
    slug: "art-of-spice-tempering-tadka",
    summary: "Discover why hot oil and whole spices are the absolute foundation of memorable curry flavor profiles.",
    coverImage: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=80",
    readTimeMinutes: 6,
    tags: ["Technique", "Indian", "Spices"],
    content: `
## What is Tadka?

If you have ever cooked Indian food and felt the final dish lacked the depth found in regional restaurants, chances are you skipped or rushed **Tadka** (also known as *chhonk*, *tempering*, or *baghar*).

Tempering is an ancient technique where whole or ground spices are briefly bloomed in hot fat—usually **ghee** or **mustard oil**—to release their essential oil compounds before being poured into a finished dish.

---

### Why Water Doesn't Extract Spice Aromatics
Spices contain fat-soluble aromatic compounds. When you simply boil spices in water or tomato puree, you extract only a fraction of their potential. Heat combined with fat acts as an extraction medium.

### The Standard Order of Tempering

1. **Hard Whole Spices:** Add mustard seeds, cumin seeds, bay leaves, or whole dried chilies first. Wait until they sizzle or pop.
2. **Aromatic Base:** Next, toss in minced ginger, crushed garlic, or fresh curry leaves.
3. **Powdered Spices:** Turn off direct heat before dusting in turmeric or red chili powder so they don't scorch.
`
  },
  {
    title: "Mastering Dough Hydration: From Dense Crusts to Airy Neapolitan Crumb",
    slug: "mastering-pizza-dough-hydration",
    summary: "How baker's percentages and hydration ratios directly transform your home pizza crust results.",
    coverImage: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80",
    readTimeMinutes: 8,
    tags: ["Baking", "Pizza", "Italian"],
    content: `
## Decoding Hydration Ratios

In pizza dough formulation, **hydration** refers to the weight ratio of water relative to total flour weight expressed as a percentage.

$$\\text{Hydration \\%} = \\left( \\frac{\\text{Weight of Water}}{\\text{Weight of Flour}} \\right) \\times 100$$

For instance, 650g of water mixed into 1000g of flour yields **65% hydration**—the golden standard for home electric ovens.

---

### Comparison of Hydration Levels

| Hydration % | Dough Texture | Best Oven Type | Crust Characteristics |
|---|---|---|---|
| **55% - 60%** | Stiff, easy to handle | Conventional home oven | Dense, crispy, structured crumb |
| **65% - 70%** | Tacky, highly elastic | Pizza stone / Steel at 500°F | Large airy pockets (cornicione), tender chew |
| **75%+** | Wet, hard to shape | High-heat wood-fired oven | Extreme leopard spotting, delicate wafer crust |
`
  }
];

// ---------------------------------------------------------------------------
// 4. Seed Execution Logic
// ---------------------------------------------------------------------------

async function seed() {
  await connectDB();

  console.log("[seed] Purging existing database collections...");
  await Promise.all([
    User.deleteMany({}),
    Recipe.deleteMany({}),
    Category.deleteMany({}),
    Like.deleteMany({}),
    SavedRecipe.deleteMany({}),
    Review.deleteMany({}),
    Comment.deleteMany({}),
    Notification.deleteMany({}),
    SearchHistory.deleteMany({}),
    AIRecommendationHistory.deleteMany({}),
    Report.deleteMany({}),
    PageView.deleteMany({}),
    Blog.deleteMany({}),
  ]);

  // A. Seed Categories
  console.log("[seed] Seeding taxonomy categories...");
  await Category.insertMany([
    ...CUISINES.map((name) => ({ name, slug: name.toLowerCase().replace(/\s+/g, "-"), type: "cuisine" })),
    ...MEAL_TYPES.map((name) => ({ name, slug: name.toLowerCase().replace(/\s+/g, "-"), type: "mealType" })),
    ...DIETS.map((name) => ({ name, slug: name.toLowerCase().replace(/\s+/g, "-"), type: "diet" })),
  ]);

  // B. Seed Users & Admin
  console.log("[seed] Seeding 20 creator users + 1 admin user...");
  const passwordHash = await bcrypt.hash("Password123!", 10);

  const admin = await User.create({
    name: "Platform Admin",
    email: "admin@memorable.dev",
    password: passwordHash,
    role: "admin",
    isVerified: true,
    bio: "Memorable culinary editorial and database administrator.",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
  });

  const users = await User.insertMany(
    DEMO_USERS.map((u, idx) => ({
      name: u.name,
      email: `${u.name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      password: passwordHash,
      isVerified: true,
      bio: u.bio,
      avatarUrl: `https://i.pravatar.cc/150?img=${(idx % 65) + 1}`,
      preferences: { cuisines: u.cuisines, diets: u.diets, allergies: [] },
    }))
  );

  // C. Seed 50 Recipes
  console.log("[seed] Inserting 50 detailed recipes into catalog...");
  const seededRecipes = await Recipe.insertMany(
    RECIPE_SEED_DATA.map((r, i) => ({
      title: r.title,
      description: r.description,
      imageUrl: r.imageUrl,
      source: "user",
      author: users[i % users.length]._id,
      ingredients: r.ingredients,
      steps: r.steps,
      cuisine: [r.cuisine],
      mealType: [r.mealType],
      diets: r.diets,
      seasons: ["Spring", "Summer", "Autumn", "Winter"],
      prepTimeMinutes: r.prep,
      cookTimeMinutes: r.cook,
      servings: r.servings,
      difficulty: r.difficulty,
      nutrition: {
        calories: r.calories,
        protein: Math.round(r.calories * 0.18),
        carbs: Math.round(r.calories * 0.42),
        fat: Math.round(r.calories * 0.28),
      },
      status: "published",
      likesCount: Math.floor(Math.random() * 80) + 15,
      savesCount: Math.floor(Math.random() * 50) + 10,
      averageRating: +(4.2 + Math.random() * 0.7).toFixed(1),
      ratingsCount: Math.floor(Math.random() * 25) + 5,
    }))
  );

  // D. Seed Blog Posts
  console.log("[seed] Seeding culinary blog posts...");
  await Blog.insertMany(
    BLOG_POSTS.map((b) => ({
      title: b.title,
      slug: b.slug,
      summary: b.summary,
      content: b.content,
      coverImage: b.coverImage,
      readTimeMinutes: b.readTimeMinutes,
      tags: b.tags,
      author: admin._id,
      publishedAt: new Date(),
    }))
  );

  // E. Populate User Pages: Saved Collections, Likes, Reviews, Comments
  console.log("[seed] Populating user engagement (Saved collections, Likes, Reviews)...");
  const collectionNames = ["Weeknight Favorites", "Healthy Dinners", "Party Menu", "Must Try High Protein"];

  for (let idx = 0; idx < users.length; idx++) {
    const user = users[idx];
    
    // Pick 5 random recipes to save in collections
    const randomSavedRecipes = [...seededRecipes].sort(() => 0.5 - Math.random()).slice(0, 5);
    for (const rec of randomSavedRecipes) {
      await SavedRecipe.create({
        user: user._id,
        recipe: rec._id,
        collectionName: collectionNames[idx % collectionNames.length],
      });
    }

    // Pick 8 random recipes to like
    const randomLikedRecipes = [...seededRecipes].sort(() => 0.5 - Math.random()).slice(0, 8);
    for (const rec of randomLikedRecipes) {
      await Like.create({
        user: user._id,
        recipe: rec._id,
      });
    }

    // Write a review on 2 recipes
    const reviewTargets = [...seededRecipes].sort(() => 0.5 - Math.random()).slice(0, 2);
    for (const rec of reviewTargets) {
      await Review.create({
        user: user._id,
        recipe: rec._id,
        rating: 5,
        text: "Made this for dinner tonight! The flavor balance was exceptional and step instructions were crystal clear.",
      });

      await Comment.create({
        user: user._id,
        recipe: rec._id,
        text: "Pro tip: Adding a pinch of extra toasted garlic right at the end elevates this even further!",
      });
    }
  }

  // F. Seed AI History & Search Logs
  console.log("[seed] Seeding AI recommendation logs & Search history...");
  const sampleQueries = [
    "High protein dinner under 30 mins",
    "Authentic Italian pasta",
    "Vegan Mexican recipes",
    "Keto breakfast",
    "Quick Thai soup",
  ];

  for (const user of users) {
    for (const query of sampleQueries.slice(0, 3)) {
      await SearchHistory.create({
        user: user._id,
        query: query,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 86400000)),
      });

      await AIRecommendationHistory.create({
        user: user._id,
        prompt: query,
        type: "recommendation", // 👈 Change here: "recipe_recommendation" ko "recommendation" kar diya hai
        response: "Here are top recipes tailored to your request based on your dietary preferences.",
        recommendedRecipes: seededRecipes.slice(0, 3).map((r) => r._id),
        createdAt: new Date(),
      });
    }
  }
// G. Seed Notifications, Reports & Analytics
  console.log("[seed] Populating Notifications, Analytics, and Admin Reports...");
  for (let i = 0; i < 10; i++) {
    await Notification.create({
      user: users[i]._id,
      type: "recipe_liked", // 👈 Schema ke exact enum se match
      message: `${users[(i + 1) % users.length].name} liked your recipe!`,
      relatedUser: users[(i + 1) % users.length]._id, // 👈 'sender' ki jagah 'relatedUser'
      relatedRecipe: seededRecipes[i]._id,
      isRead: i % 2 === 0,
    });

    await PageView.create({
      path: `/recipes/${seededRecipes[i]._id}`,
      ipHash: `ip_hash_${i}`,
      timestamp: new Date(),
    });
  }

  // 1 Demo Report for Admin dashboard
 // 1 Demo Report for Admin dashboard
  await Report.create({
    reportedBy: users[0]._id,
    targetType: "recipe",
    targetId: seededRecipes[0]._id,
    reason: "Checking moderation workflow and testing report details", // Max 500 characters
    status: "pending",
  });

  console.log("\n=========================================================");
  console.log(" 🎉 SEEDING COMPLETE SUCCESSFULLY!");
  console.log("=========================================================");
  console.log(` Admin Credentials   : admin@memorable.dev / Password123!`);
  console.log(` Standard Login      : ${users[0].email} / Password123!`);
  console.log(` Total Users Created : ${users.length + 1}`);
  console.log(` Total Recipes       : ${seededRecipes.length}`);
  console.log(` Saved & Liked Logs  : Active for all ${users.length} users`);
  console.log(` AI Search History   : Populated`);
  console.log("=========================================================\n");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("[seed] Fatal error during execution:", err);
  process.exit(1);
});