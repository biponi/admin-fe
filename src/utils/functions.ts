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
    console.log(`${key}:`, arr);
    arr.forEach((item, index) => {
      if (item instanceof File) {
        // Append the file directly without stringifying
        formData.append(key, item);
      } else if (typeof item === "object") {
        // Convert object to JSON string and append with indexed key
        formData.append(`${key}[${index}]`, JSON.stringify(item));
      } else {
        // Append value directly with indexed key
        formData.append(`${key}[${index}]`, item);
      }
    });
  };

  // Iterate over the properties of the input object
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = data[key];
      if (Array.isArray(value)) {
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