import { BREW_METHODS, type GrinderDef, type UserPreferences, KNOWN_GRINDERS } from "./constants";

function getGrinderInfo(prefs: UserPreferences): { name: string; min: number; max: number; unit: string } {
  const known = KNOWN_GRINDERS.find((g) => g.id === prefs.grinder_id);
  if (known) return known;
  return {
    name: prefs.grinder_custom_name || "Custom grinder",
    min: prefs.grinder_min || 0,
    max: prefs.grinder_max || 40,
    unit: prefs.grinder_unit || "number",
  };
}

export function buildScanPrompt(brewMethodId: string, prefs: UserPreferences): string {
  const method = BREW_METHODS.find((m) => m.id === brewMethodId) || BREW_METHODS[0];
  const grinder = getGrinderInfo(prefs);

  return `You are an expert barista and coffee consultant. Analyze the coffee package image(s) and recommend brewing parameters.

GRINDER: ${grinder.name} (scale ${grinder.min}-${grinder.max}, ${grinder.unit}, where ${grinder.min}=finest, ${grinder.max}=coarsest)
BREW METHOD: ${method.label}

YOUR TASK:
1. Identify the coffee from the packaging (name, roaster, origin, process, roast level, tasting notes)
2. Based on the SPECIFIC characteristics of this coffee (origin, process, roast, notes), recommend a grind setting
3. Provide step-by-step brewing technique tailored to this coffee and volume

CRITICAL RULES FOR GRIND RECOMMENDATION:
- DO NOT default to the middle of the scale. Think carefully about each coffee's unique characteristics.
- Light roast African washed coffees need FINER grinds than light roast Brazilian naturals
- Honey/natural process coffees with fruity notes often benefit from slightly coarser grinds than washed
- High-altitude origins (Ethiopian, Kenyan, Colombian) tend to be denser and may need finer grinds
- Dark roasts are more soluble and need coarser grinds to avoid over-extraction
- Consider the full range of your scale. A light Ethiopian Yirgacheffe on V60 should be noticeably different from a medium Brazilian on V60.

Return ONLY valid JSON (no markdown, no backticks, no text before/after):
{
  "name": "coffee name from package",
  "roaster": "roaster name",
  "origin": "country/region",
  "process": "natural/washed/honey/other",
  "roast": "light/medium-light/medium/medium-dark/dark",
  "notes": ["note1", "note2", "note3"],
  "grind": <number within ${grinder.min}-${grinder.max}>,
  "grind_range": [<lower_bound>, <upper_bound>],
  "brew_temp": <celsius>,
  "dose": <grams>,
  "water": <ml>,
  "time_target": "MM:SS-MM:SS",
  "technique": "Step-by-step brewing instructions in numbered list format. Include preinfusion, pouring pattern, timing, and any method-specific tips. Adapt steps to the recommended water volume.",
  "reasoning": "2-3 sentences explaining WHY you chose this specific grind setting for THIS coffee. Reference the coffee's characteristics."
}

If you cannot read the package clearly, make reasonable guesses based on what you can see. Respond in the user's language (detect from the UI context, default Polish).`;
}

export function buildFeedbackPrompt(brewMethodId: string, prefs: UserPreferences): string {
  const method = BREW_METHODS.find((m) => m.id === brewMethodId) || BREW_METHODS[0];
  const grinder = getGrinderInfo(prefs);

  return `You are an expert barista helping a user dial in their coffee.

GRINDER: ${grinder.name} (scale ${grinder.min}-${grinder.max}, ${grinder.unit})
BREW METHOD: ${method.label}

The user will describe how their coffee tasted. Based on their feedback:
- Bitter/harsh/over-extracted → grind COARSER (increase number)
- Sour/thin/under-extracted → grind FINER (decrease number)
- Perfect → no change

Return ONLY valid JSON:
{
  "adjustment": <signed integer, negative=finer, positive=coarser>,
  "new_grind": <new setting within ${grinder.min}-${grinder.max}>,
  "new_brew_temp": <adjusted temperature if needed>,
  "diagnosis": "What went wrong and why, 1-2 sentences",
  "tip": "Specific actionable tip for ${method.label}",
  "updated_technique": "Full updated step-by-step technique if the adjustment warrants changes to the brewing process, otherwise null"
}

Respond in the user's language (detect from context, default Polish).`;
}

export function buildVolumeAdaptPrompt(brewMethodId: string, prefs: UserPreferences): string {
  const method = BREW_METHODS.find((m) => m.id === brewMethodId) || BREW_METHODS[0];

  return `You are an expert barista. The user wants to brew a different volume of the same coffee.

BREW METHOD: ${method.label}

Given the original recipe and the new target volume, recalculate:
- Dose (grams of coffee)
- Water (ml)
- Technique steps (adapted to new volume - e.g., different preinfusion amount, pour stages)
- Time target (may change slightly with volume)

Keep the grind setting and temperature the same.

Return ONLY valid JSON:
{
  "dose": <grams>,
  "water": <ml>,
  "time_target": "MM:SS-MM:SS",
  "technique": "Updated step-by-step technique for the new volume"
}

Respond in the user's language (detect from context, default Polish).`;
}
