// NOTE: Run migration: ALTER TABLE public.coffees ADD COLUMN favorite boolean NOT NULL DEFAULT false;

// Grinder definitions
export interface GrinderDef {
  id: string;
  name: string;
  min: number;
  max: number;
  unit: "number" | "clicks";
  popular: boolean;
}

export const KNOWN_GRINDERS: GrinderDef[] = [
  { id: "fellow-ode-2", name: "Fellow Ode 2", min: 1, max: 11, unit: "number", popular: true },
  { id: "comandante-c40", name: "Comandante C40", min: 0, max: 50, unit: "clicks", popular: true },
  { id: "1zpresso-jx", name: "1Zpresso JX / JX-Pro", min: 0, max: 120, unit: "clicks", popular: true },
  { id: "timemore-c2", name: "Timemore C2 / C3", min: 0, max: 36, unit: "clicks", popular: true },
  { id: "baratza-encore", name: "Baratza Encore", min: 1, max: 40, unit: "number", popular: true },
];

// Brewing methods
export interface BrewMethod {
  id: string;
  label: string;
  icon: string;
  grindHint: string;
  tempHint: string;
  timeHint: string;
}

export const BREW_METHODS: BrewMethod[] = [
  { id: "v60", label: "V60", icon: "filter_alt", grindHint: "medium", tempHint: "90-94°C", timeHint: "2:30-3:30" },
  { id: "chemex", label: "Chemex", icon: "science", grindHint: "medium-coarse", tempHint: "91-94°C", timeHint: "3:30-4:30" },
  { id: "aeropress", label: "AeroPress", icon: "colorize", grindHint: "fine-medium", tempHint: "80-92°C", timeHint: "1:30-2:30" },
  { id: "frenchpress", label: "French Press", icon: "coffee_maker", grindHint: "coarse", tempHint: "93-96°C", timeHint: "4:00-5:00" },
  { id: "moka", label: "Moka Pot", icon: "local_cafe", grindHint: "fine", tempHint: "cold water", timeHint: "4-6 min" },
  { id: "espresso", label: "Espresso", icon: "coffee", grindHint: "very fine", tempHint: "90-93°C", timeHint: "25-30s" },
  { id: "coldbrew", label: "Cold Brew", icon: "water_drop", grindHint: "very coarse", tempHint: "cold water", timeHint: "12-18h" },
  { id: "other", label: "Other", icon: "coffee", grindHint: "depends", tempHint: "depends", timeHint: "depends" },
];

// Coffee profile type
export interface CoffeeProfile {
  id: string;
  user_id: string;
  name: string;
  roaster: string;
  origin: string;
  process: string;
  roast: string;
  notes: string[];
  grind: number;
  grind_range: [number, number];
  final_grind: number;
  brew_temp: number;
  dose: number;
  water: number;
  time_target: string;
  brew_method: string;
  grinder_id: string;
  reasoning: string;
  technique: string;
  image_url: string | null;
  corrections: CoffeeCorrection[];
  favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface CoffeeCorrection {
  feedback: string;
  adjustment: number;
  new_grind: number;
  diagnosis: string;
  tip: string;
  created_at: string;
}

// User preferences
export interface UserPreferences {
  grinder_id: string;
  grinder_custom_name?: string;
  grinder_min?: number;
  grinder_max?: number;
  grinder_unit?: "number" | "clicks";
  default_brew_method: string;
  locale: "pl" | "en";
}
