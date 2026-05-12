import { BDDeliveryCharge, BDDistrictList } from './contents';

export interface DeliveryChargeInfo {
  charge: number;
  category: string;
  zoneName: string;
}

/**
 * Calculate delivery charge based on district and division names
 * Uses BDDeliveryCharge data for accurate, zone-based pricing
 *
 * @param districtName - Name of the district (e.g., "Dhaka")
 * @param divisionName - Name of the division (e.g., "Dhaka")
 * @returns DeliveryChargeInfo with charge amount and metadata
 */
export const calculateDeliveryCharge = (
  districtName: string,
  divisionName: string
): DeliveryChargeInfo => {
  // Find district by name to get district_id
  const district = BDDistrictList.find(
    (d) => d.name === districtName
  );

  // If district not found, return default outside_dhaka charge
  if (!district) {
    return {
      charge: 150,
      category: 'outside_dhaka',
      zoneName: 'Unknown',
    };
  }

  // Find delivery charge by district_id
  const chargeInfo = BDDeliveryCharge.find(
    (dc) => dc.district_id === district.id
  );

  // Return charge info or fallback to default
  return {
    charge: chargeInfo?.deliveryCharge || 150,
    category: chargeInfo?.category || 'outside_dhaka',
    zoneName: chargeInfo?.zoneName || districtName,
  };
};
