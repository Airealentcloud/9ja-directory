import {
  Building2,
  Briefcase,
  Car,
  ChefHat,
  Church,
  Clapperboard,
  Construction,
  CreditCard,
  Dumbbell,
  Factory,
  GraduationCap,
  Hammer,
  Heart,
  Home,
  Hotel,
  Laptop,
  Leaf,
  Palette,
  Plane,
  Scale,
  Scissors,
  Shield,
  ShoppingBag,
  Sparkles,
  Stethoscope,
  Sun,
  Truck,
  Utensils,
  Wheat,
  type LucideIcon,
} from 'lucide-react'

// Icon mapping for categories
export const categoryIcons: Record<string, LucideIcon> = {
  // Accommodation & Hotels
  'accommodation': Hotel,
  'hotels': Hotel,
  'hotels-lodging': Hotel,
  'hotels-&-lodging': Hotel,

  // Agriculture
  'agriculture': Wheat,
  'farming': Leaf,

  // Arts & Culture
  'arts': Palette,
  'arts-culture': Palette,
  'arts-&-culture': Palette,

  // Automotive & Auto Services
  'automotive': Car,
  'auto-services': Car,
  'auto': Car,

  // Beauty & Spa
  'beauty': Scissors,
  'beauty-spa': Scissors,
  'beauty-&-spa': Scissors,
  'spa': Sparkles,

  // Business & Professional
  'business': Briefcase,
  'professional-services': Briefcase,

  // Construction
  'construction': Construction,
  'building': Construction,

  // Education
  'education': GraduationCap,
  'schools': GraduationCap,
  'training': GraduationCap,

  // Entertainment
  'entertainment': Clapperboard,
  'events': Clapperboard,

  // Finance
  'finance': CreditCard,
  'banking': CreditCard,
  'insurance': CreditCard,

  // Insurance (dedicated category)
  'insurance-services': CreditCard,

  // Security Services
  'security-services': Shield,
  'security': Shield,

  // Solar & Power Solutions
  'solar-energy': Sun,
  'solar': Sun,
  'power-solutions': Sun,

  // Food & Restaurants
  'restaurants': Utensils,
  'restaurants-food': Utensils,
  'restaurants-&-food': Utensils,
  'food': ChefHat,
  'cafe': ChefHat,

  // Health & Medical
  'health': Stethoscope,
  'health-medical': Stethoscope,
  'health-&-medical': Stethoscope,
  'medical': Stethoscope,
  'healthcare': Heart,

  // Home Services
  'home-services': Home,
  'home': Home,
  'cleaning': Home,

  // Legal
  'legal': Scale,
  'legal-services': Scale,
  'lawyers': Scale,

  // Manufacturing
  'manufacturing': Factory,
  'production': Factory,

  // Real Estate
  'real-estate': Building2,
  'property': Building2,

  // Religion
  'religion': Church,
  'religious': Church,

  // Shopping & Retail
  'shopping': ShoppingBag,
  'shopping-retail': ShoppingBag,
  'shopping-&-retail': ShoppingBag,
  'retail': ShoppingBag,

  // Sports & Fitness
  'sports': Dumbbell,
  'sports-fitness': Dumbbell,
  'sports-&-fitness': Dumbbell,
  'fitness': Dumbbell,
  'gym': Dumbbell,

  // Technology
  'technology': Laptop,
  'tech': Laptop,
  'it': Laptop,

  // Transportation
  'transportation': Truck,
  'logistics': Truck,
  'travel': Plane,

  // Repairs & Maintenance
  'repairs': Hammer,
  'maintenance': Hammer,
}

// Color schemes for each category (background gradient + icon color)
export const categoryColors: Record<string, { bg: string; iconBg: string; iconColor: string }> = {
  // Accommodation - Warm Purple
  'accommodation': { bg: 'from-purple-50 to-purple-100', iconBg: 'bg-purple-500', iconColor: 'text-white' },
  'hotels': { bg: 'from-purple-50 to-purple-100', iconBg: 'bg-purple-500', iconColor: 'text-white' },
  'hotels-lodging': { bg: 'from-purple-50 to-purple-100', iconBg: 'bg-purple-500', iconColor: 'text-white' },
  'hotels-&-lodging': { bg: 'from-purple-50 to-purple-100', iconBg: 'bg-purple-500', iconColor: 'text-white' },

  // Agriculture - Fresh Green
  'agriculture': { bg: 'from-lime-50 to-green-100', iconBg: 'bg-lime-500', iconColor: 'text-white' },
  'farming': { bg: 'from-lime-50 to-green-100', iconBg: 'bg-lime-500', iconColor: 'text-white' },

  // Arts - Creative Pink
  'arts': { bg: 'from-pink-50 to-rose-100', iconBg: 'bg-pink-500', iconColor: 'text-white' },
  'arts-culture': { bg: 'from-pink-50 to-rose-100', iconBg: 'bg-pink-500', iconColor: 'text-white' },
  'arts-&-culture': { bg: 'from-pink-50 to-rose-100', iconBg: 'bg-pink-500', iconColor: 'text-white' },

  // Automotive - Bold Red
  'automotive': { bg: 'from-red-50 to-orange-100', iconBg: 'bg-red-500', iconColor: 'text-white' },
  'auto-services': { bg: 'from-red-50 to-orange-100', iconBg: 'bg-red-500', iconColor: 'text-white' },
  'auto': { bg: 'from-red-50 to-orange-100', iconBg: 'bg-red-500', iconColor: 'text-white' },

  // Beauty - Elegant Rose
  'beauty': { bg: 'from-fuchsia-50 to-pink-100', iconBg: 'bg-fuchsia-500', iconColor: 'text-white' },
  'beauty-spa': { bg: 'from-fuchsia-50 to-pink-100', iconBg: 'bg-fuchsia-500', iconColor: 'text-white' },
  'beauty-&-spa': { bg: 'from-fuchsia-50 to-pink-100', iconBg: 'bg-fuchsia-500', iconColor: 'text-white' },
  'spa': { bg: 'from-fuchsia-50 to-pink-100', iconBg: 'bg-fuchsia-500', iconColor: 'text-white' },

  // Business - Professional Blue
  'business': { bg: 'from-slate-50 to-gray-100', iconBg: 'bg-slate-600', iconColor: 'text-white' },
  'professional-services': { bg: 'from-slate-50 to-gray-100', iconBg: 'bg-slate-600', iconColor: 'text-white' },

  // Construction - Strong Orange
  'construction': { bg: 'from-orange-50 to-amber-100', iconBg: 'bg-orange-500', iconColor: 'text-white' },
  'building': { bg: 'from-orange-50 to-amber-100', iconBg: 'bg-orange-500', iconColor: 'text-white' },

  // Education - Academic Blue
  'education': { bg: 'from-blue-50 to-indigo-100', iconBg: 'bg-blue-600', iconColor: 'text-white' },
  'schools': { bg: 'from-blue-50 to-indigo-100', iconBg: 'bg-blue-600', iconColor: 'text-white' },
  'training': { bg: 'from-blue-50 to-indigo-100', iconBg: 'bg-blue-600', iconColor: 'text-white' },

  // Entertainment - Fun Purple
  'entertainment': { bg: 'from-violet-50 to-purple-100', iconBg: 'bg-violet-500', iconColor: 'text-white' },
  'events': { bg: 'from-violet-50 to-purple-100', iconBg: 'bg-violet-500', iconColor: 'text-white' },

  // Finance - Trust Green
  'finance': { bg: 'from-emerald-50 to-teal-100', iconBg: 'bg-emerald-600', iconColor: 'text-white' },
  'banking': { bg: 'from-emerald-50 to-teal-100', iconBg: 'bg-emerald-600', iconColor: 'text-white' },
  'insurance': { bg: 'from-emerald-50 to-teal-100', iconBg: 'bg-emerald-600', iconColor: 'text-white' },
  'insurance-services': { bg: 'from-emerald-50 to-teal-100', iconBg: 'bg-emerald-600', iconColor: 'text-white' },

  // Security Services - Strong Dark Blue
  'security-services': { bg: 'from-slate-50 to-blue-100', iconBg: 'bg-slate-700', iconColor: 'text-white' },
  'security': { bg: 'from-slate-50 to-blue-100', iconBg: 'bg-slate-700', iconColor: 'text-white' },

  // Solar & Power - Bright Yellow/Orange
  'solar-energy': { bg: 'from-yellow-50 to-orange-100', iconBg: 'bg-yellow-500', iconColor: 'text-white' },
  'solar': { bg: 'from-yellow-50 to-orange-100', iconBg: 'bg-yellow-500', iconColor: 'text-white' },
  'power-solutions': { bg: 'from-yellow-50 to-orange-100', iconBg: 'bg-yellow-500', iconColor: 'text-white' },

  // Food - Appetizing Orange
  'restaurants': { bg: 'from-amber-50 to-yellow-100', iconBg: 'bg-amber-500', iconColor: 'text-white' },
  'restaurants-food': { bg: 'from-amber-50 to-yellow-100', iconBg: 'bg-amber-500', iconColor: 'text-white' },
  'restaurants-&-food': { bg: 'from-amber-50 to-yellow-100', iconBg: 'bg-amber-500', iconColor: 'text-white' },
  'food': { bg: 'from-amber-50 to-yellow-100', iconBg: 'bg-amber-500', iconColor: 'text-white' },
  'cafe': { bg: 'from-amber-50 to-yellow-100', iconBg: 'bg-amber-500', iconColor: 'text-white' },

  // Health - Medical Teal
  'health': { bg: 'from-teal-50 to-cyan-100', iconBg: 'bg-teal-500', iconColor: 'text-white' },
  'health-medical': { bg: 'from-teal-50 to-cyan-100', iconBg: 'bg-teal-500', iconColor: 'text-white' },
  'health-&-medical': { bg: 'from-teal-50 to-cyan-100', iconBg: 'bg-teal-500', iconColor: 'text-white' },
  'medical': { bg: 'from-teal-50 to-cyan-100', iconBg: 'bg-teal-500', iconColor: 'text-white' },
  'healthcare': { bg: 'from-teal-50 to-cyan-100', iconBg: 'bg-teal-500', iconColor: 'text-white' },

  // Home Services - Cozy Brown
  'home-services': { bg: 'from-stone-50 to-amber-100', iconBg: 'bg-stone-500', iconColor: 'text-white' },
  'home': { bg: 'from-stone-50 to-amber-100', iconBg: 'bg-stone-500', iconColor: 'text-white' },
  'cleaning': { bg: 'from-stone-50 to-amber-100', iconBg: 'bg-stone-500', iconColor: 'text-white' },

  // Legal - Authoritative Navy
  'legal': { bg: 'from-indigo-50 to-blue-100', iconBg: 'bg-indigo-700', iconColor: 'text-white' },
  'legal-services': { bg: 'from-indigo-50 to-blue-100', iconBg: 'bg-indigo-700', iconColor: 'text-white' },
  'lawyers': { bg: 'from-indigo-50 to-blue-100', iconBg: 'bg-indigo-700', iconColor: 'text-white' },

  // Manufacturing - Industrial Gray
  'manufacturing': { bg: 'from-zinc-50 to-slate-100', iconBg: 'bg-zinc-600', iconColor: 'text-white' },
  'production': { bg: 'from-zinc-50 to-slate-100', iconBg: 'bg-zinc-600', iconColor: 'text-white' },

  // Real Estate - Premium Gold
  'real-estate': { bg: 'from-yellow-50 to-amber-100', iconBg: 'bg-yellow-600', iconColor: 'text-white' },
  'property': { bg: 'from-yellow-50 to-amber-100', iconBg: 'bg-yellow-600', iconColor: 'text-white' },

  // Religion - Serene Purple
  'religion': { bg: 'from-purple-50 to-indigo-100', iconBg: 'bg-purple-600', iconColor: 'text-white' },
  'religious': { bg: 'from-purple-50 to-indigo-100', iconBg: 'bg-purple-600', iconColor: 'text-white' },

  // Shopping - Vibrant Cyan
  'shopping': { bg: 'from-cyan-50 to-sky-100', iconBg: 'bg-cyan-500', iconColor: 'text-white' },
  'shopping-retail': { bg: 'from-cyan-50 to-sky-100', iconBg: 'bg-cyan-500', iconColor: 'text-white' },
  'shopping-&-retail': { bg: 'from-cyan-50 to-sky-100', iconBg: 'bg-cyan-500', iconColor: 'text-white' },
  'retail': { bg: 'from-cyan-50 to-sky-100', iconBg: 'bg-cyan-500', iconColor: 'text-white' },

  // Sports - Energetic Green
  'sports': { bg: 'from-green-50 to-emerald-100', iconBg: 'bg-green-500', iconColor: 'text-white' },
  'sports-fitness': { bg: 'from-green-50 to-emerald-100', iconBg: 'bg-green-500', iconColor: 'text-white' },
  'sports-&-fitness': { bg: 'from-green-50 to-emerald-100', iconBg: 'bg-green-500', iconColor: 'text-white' },
  'fitness': { bg: 'from-green-50 to-emerald-100', iconBg: 'bg-green-500', iconColor: 'text-white' },
  'gym': { bg: 'from-green-50 to-emerald-100', iconBg: 'bg-green-500', iconColor: 'text-white' },

  // Technology - Modern Blue
  'technology': { bg: 'from-sky-50 to-blue-100', iconBg: 'bg-sky-500', iconColor: 'text-white' },
  'tech': { bg: 'from-sky-50 to-blue-100', iconBg: 'bg-sky-500', iconColor: 'text-white' },
  'it': { bg: 'from-sky-50 to-blue-100', iconBg: 'bg-sky-500', iconColor: 'text-white' },

  // Transportation - Dynamic Blue
  'transportation': { bg: 'from-blue-50 to-sky-100', iconBg: 'bg-blue-500', iconColor: 'text-white' },
  'logistics': { bg: 'from-blue-50 to-sky-100', iconBg: 'bg-blue-500', iconColor: 'text-white' },
  'travel': { bg: 'from-blue-50 to-sky-100', iconBg: 'bg-blue-500', iconColor: 'text-white' },

  // Repairs - Practical Orange
  'repairs': { bg: 'from-orange-50 to-red-100', iconBg: 'bg-orange-600', iconColor: 'text-white' },
  'maintenance': { bg: 'from-orange-50 to-red-100', iconBg: 'bg-orange-600', iconColor: 'text-white' },
}

// Default colors for unmapped categories
export const defaultColors = {
  bg: 'from-gray-50 to-slate-100',
  iconBg: 'bg-green-600',
  iconColor: 'text-white',
}

// Helper function to get icon for a category
export function getCategoryIcon(slug: string): LucideIcon {
  const normalizedSlug = slug.toLowerCase().replace(/\s+/g, '-')
  return categoryIcons[normalizedSlug] || Briefcase
}

// Helper function to get colors for a category
export function getCategoryColors(slug: string) {
  const normalizedSlug = slug.toLowerCase().replace(/\s+/g, '-')
  return categoryColors[normalizedSlug] || defaultColors
}
