/**
 * Returns the color classes for a location type badge.
 */
export function getLocationTypeColor(type: string): string {
  const typeLower = type.toLowerCase();
  
  if (typeLower.includes('planet')) {
    return 'bg-blue-100 text-blue-800';
  }
  if (typeLower.includes('space station') || typeLower.includes('station')) {
    return 'bg-purple-100 text-purple-800';
  }
  if (typeLower.includes('dimension')) {
    return 'bg-indigo-100 text-indigo-800';
  }
  if (typeLower.includes('spacecraft') || typeLower.includes('ship')) {
    return 'bg-cyan-100 text-cyan-800';
  }
  if (typeLower.includes('resort') || typeLower.includes('club')) {
    return 'bg-pink-100 text-pink-800';
  }
  if (typeLower.includes('reality') || typeLower.includes('universe')) {
    return 'bg-violet-100 text-violet-800';
  }
  if (typeLower.includes('planetoid') || typeLower.includes('asteroid')) {
    return 'bg-amber-100 text-amber-800';
  }
  if (typeLower.includes('moon')) {
    return 'bg-slate-100 text-slate-800';
  }
  if (typeLower.includes('country') || typeLower.includes('city') || typeLower.includes('town')) {
    return 'bg-green-100 text-green-800';
  }
  
  // Default color for unknown types
  return 'bg-gray-100 text-gray-800';
}

