import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const isValidImageUrl = (url: string): boolean => {
  // Regular expression to match common image file extensions
  const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|webp)$/i;

  // Check if the URL matches a valid image file extension and is not a blob URL
  return imageExtensions.test(url) && !url.startsWith("blob:");
};

// Function to create FormData dynamically from an object
export const buildFormDataFromObject = (data: any): FormData => {
  const formData = new FormData();

  // Helper function to append nested arrays to FormData
  const appendArrayValues = (key: string, arr: any[]) => {
    if (key === 'imageGroups') {
      console.log(`appendArrayValues - Processing ${arr.length} imageGroups:`, arr);
    } else {
      console.log(`${key}:`, arr);
    }

    arr.forEach((item, index) => {
      if (item instanceof File) {
        // Append the file directly without stringifying
        formData.append(key, item);
      } else if (typeof item === "object") {
        // Convert object to JSON string and append with indexed key
        if (key === 'imageGroups') {
          // Validate each group before appending
          if (validateImageGroup(item)) {
            console.log(`appendArrayValues - Appending valid imageGroup[${index}]:`, item);
            formData.append(`${key}[${index}]`, JSON.stringify(item));
          } else {
            console.warn(`appendArrayValues - Skipping invalid imageGroup[${index}]:`, item);
          }
        } else {
          formData.append(`${key}[${index}]`, JSON.stringify(item));
        }
      } else {
        // Append value directly with indexed key
        formData.append(`${key}[${index}]`, item);
      }
    });
  };

  // Special handling for variant images - extract them first
  // This ensures variant images are sent as a flat array
  const variantImages = data.variantImages;
  const variantImageMappings = data.variantImageMappings;
  const removeVariantImageIndexes = data.removeVariantImageIndexes;

  // Remove these from data so they don't get processed in the loop below
  delete data.variantImages;
  delete data.variantImageMappings;
  delete data.removeVariantImageIndexes;

  // Handle variant images array separately
  if (variantImages && Array.isArray(variantImages)) {
    console.log('variantImages:', variantImages);
    variantImages.forEach((file: File) => {
      if (file instanceof File) {
        formData.append('variantImages', file);
      }
    });
  }

  // Handle variant image mappings
  if (variantImageMappings && Array.isArray(variantImageMappings)) {
    console.log('variantImageMappings:', variantImageMappings);
    formData.append('variantImageMapping', JSON.stringify(variantImageMappings));
  }

  // Handle remove variant image indexes
  if (removeVariantImageIndexes && Array.isArray(removeVariantImageIndexes)) {
    console.log('removeVariantImageIndexes:', removeVariantImageIndexes);
    formData.append('removeVariantImageIndexes', JSON.stringify(removeVariantImageIndexes));
  }

  // Iterate over the properties of the input object
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = data[key];

      // Skip null/undefined values
      if (value === null || value === undefined) {
        continue;
      }

      // Skip empty arrays
      if (Array.isArray(value) && value.length === 0) {
        continue;
      }

      // Skip commission fields if commissionType is "none"
      if (key === 'commissionType' && value === 'none') {
        continue;
      }
      if (key === 'commissionRate') {
        // Get commissionType from the original data object
        const commissionType = data.commissionType;
        if (commissionType === 'none' || commissionType === undefined || commissionType === null) {
          continue;
        }
      }

      if (key === 'variation' && Array.isArray(value)) {
        // Special handling for variation array
        // We need to ensure images array in variation doesn't include File objects
        // as they're already sent via variantImages
        value.forEach((variation: any, index: number) => {
          // Create a clean variation object without File objects in images
          const { images, ...variationData } = variation;

          // If images array exists and contains strings (existing URLs), include them
          if (images && Array.isArray(images) && images.length > 0) {
            const existingImages = images.filter((img: any) => typeof img === 'string');
            if (existingImages.length > 0) {
              variationData.images = existingImages;
            }
          }

          formData.append(`variation[${index}]`, JSON.stringify(variationData));
        });
      } else if (key === 'imageGroups' && Array.isArray(value)) {
        // Special handling for imageGroups array - validate before processing
        console.log('buildFormDataFromObject - imageGroups before filtering:', value);

        const { validGroups, invalidCount } = filterImageGroups(value);

        console.log('buildFormDataFromObject - imageGroups after filtering:', {
          validGroups,
          invalidCount,
          totalOriginal: value.length
        });

        if (invalidCount > 0) {
          console.warn(`buildFormDataFromObject - Filtered out ${invalidCount} incomplete imageGroup(s) before sending to API`);
        }

        // Only process valid groups
        if (validGroups.length > 0) {
          appendArrayValues(key, validGroups);
        }
      } else if (Array.isArray(value)) {
        // Handle nested arrays
        appendArrayValues(key, value);
      } else if (value instanceof File) {
        // Append the file directly without stringifying
        formData.append(key, value);
      } else if (typeof value === "object" && value !== null) {
        // Convert nested objects to JSON string
        formData.append(key, JSON.stringify(value));
      } else {
        // Append primitive value directly
        formData.append(key, value);
      }
    }
  }

  return formData;
};

export const getInitialsWord = (sentence: string) => {
  const words = sentence.trim().split(/\s+/); // Split the sentence into words based on whitespace

  if (!words || words.length < 1) return "N/A";

  if (words.length === 1) {
    return words[0].substring(0, 2); // Return first two letters if there is only one word
  } else if (words.length === 2) {
    return words[0][0] + words[1][0]; // Return the first letter of each word if there are two words
  } else {
    return words[0][0] + words[words.length - 1][0]; // Return the first letter of the first and last words if more than two words
  }
};

export const getLocationByFormattedString = (
  array: any[],
  formattedString: string
): Location | undefined => {
  // Extract name and bn_name from the formatted string
  const regex = /^(.*)\((.*)\)$/;
  const match = formattedString.match(regex);

  if (!match) {
    return undefined; // Return undefined if the formatted string doesn't match the expected format
  }

  const name = match[1].trim();
  const bn_name = match[2].trim();

  // Find the matching object in the array
  return array.find(
    (location) => location.name === name && location.bn_name === bn_name
  );
};


export const ArraysMatch = (array1:any[], array2:any[]) => {
  if (array1.length !== array2.length) return false;

  // Sort both arrays and compare each element
  const sortedArray1 = array1.slice().sort();
  const sortedArray2 = array2.slice().sort();

  return sortedArray1.every((value, index) => value === sortedArray2[index]);
};

/**
 * Validates that an imageGroup has all required fields
 * @param group - The imageGroup object to validate
 * @returns true if the group has both attribute and value with non-empty strings
 */
export const validateImageGroup = (group: any): boolean => {
  if (!group) return false;

  const hasAttribute = !!group.attribute && group.attribute.trim() !== '';
  const hasValue = !!group.value && group.value.trim() !== '';

  return hasAttribute && hasValue;
};

/**
 * Filters out incomplete imageGroups from an array
 * @param groups - Array of imageGroup objects
 * @returns Object containing valid groups and invalid group count
 */
export const filterImageGroups = (groups: any[]): { validGroups: any[]; invalidCount: number } => {
  if (!Array.isArray(groups)) {
    return { validGroups: [], invalidCount: 0 };
  }

  const validGroups = groups.filter(validateImageGroup);
  const invalidCount = groups.length - validGroups.length;

  return { validGroups, invalidCount };
};