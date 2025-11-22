/**
 * Category Display Name Mapping
 * Centralized utility for converting category slugs to human-readable names.
 */

/**
 * Converts a category slug to a human-readable display name.
 * This function ensures consistent category naming across the entire application.
 *
 * @param slug - The normalized category slug (e.g., "ai-futuro", "smartphones")
 * @returns The human-readable category name (e.g., "AI & Futuro", "Smartphones")
 */
export function getCategoryDisplayName(slug: string): string {
  const nameMap: Record<string, string> = {
    'smartphones': 'Smartphones',
    'wearables': 'Wearables',
    'audio': 'Audio',
    'computadores': 'Computadores',
    'internet-apps': 'Internet & Apps',
    'mobilidade': 'Mobilidade',
    'ciencia': 'Ciência',
    'gaming': 'Gaming',
    'ai-futuro': 'AI & Futuro',
    'entretenimento-gaming': 'Entretenimento & Gaming',
    'home': 'Home',
  };

  return nameMap[slug] || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}
