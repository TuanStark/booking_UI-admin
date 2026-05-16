export const amenityDictionary: Record<string, string> = {
  'WiFi': 'WiFi',
  'AC': 'Máy lạnh',
  'TV': 'TV',
  'Private Bathroom': 'Phòng tắm riêng',
  'Kitchen': 'Nhà bếp',
  'Parking': 'Bãi đỗ xe',
  'Gym': 'Phòng Gym',
  'Laundry': 'Giặt ủi',
  'Study Room': 'Phòng tự học',
  'Dining': 'Khu ăn uống',
  'Security': 'Bảo vệ / An ninh'
};

/**
 * Translates an English amenity string to Vietnamese for UI display.
 * If the translation is not found, returns the original string.
 * @param amenity The amenity string in English
 * @returns The translated amenity string in Vietnamese
 */
export const translateAmenity = (amenity: string): string => {
  if (!amenity) return '';
  // Trim and check to make it slightly more robust
  const trimmedAmenity = amenity.trim();
  return amenityDictionary[trimmedAmenity] || trimmedAmenity;
};
