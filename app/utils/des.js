// utils/des.js

// Helper functions for DES
toBinary = (input, length) => {
  return input.toString(2).padStart(length, "0");
};

toDecimal = (binaryString) => {
  return parseInt(binaryString, 2);
};

// Initial Permutation Table
const IP = [
  58, 50, 42, 34, 26, 18, 10, 2, 60, 52, 44, 36, 28, 20, 12, 4, 62, 54, 46, 38,
  30, 22, 14, 6, 64, 56, 48, 40, 32, 24, 16, 8, 57, 49, 41, 33, 25, 17, 9, 1,
  59, 51, 43, 35, 27, 19, 11, 3, 61, 53, 45, 37, 29, 21, 13, 5, 63, 55, 47, 39,
  31, 23, 15, 7,
];

// Inverse Initial Permutation
const IP_INV = [
  40, 8, 48, 16, 56, 24, 64, 32, 39, 7, 47, 15, 55, 23, 63, 31, 38, 6, 46, 14,
  54, 22, 62, 30, 37, 5, 45, 13, 53, 21, 61, 29, 36, 4, 44, 12, 52, 20, 60, 28,
  35, 3, 43, 11, 51, 19, 59, 27, 34, 2, 42, 10, 50, 18, 58, 26, 33, 1, 41, 9,
  49, 17, 57, 25,
];

// Permuted Choice 1 Table
const PC1 = [
  57, 49, 41, 33, 25, 17, 9, 1, 58, 50, 42, 34, 26, 18, 10, 2, 59, 51, 43, 35,
  27, 19, 11, 3, 60, 52, 44, 36, 63, 55, 47, 39, 31, 23, 15, 7, 62, 54, 46, 38,
  30, 22, 14, 6, 61, 53, 45, 37, 29, 21, 13, 5, 28, 20, 12, 4,
];

// Permuted Choice 2 Table
const PC2 = [
  14, 17, 11, 24, 1, 5, 3, 28, 15, 6, 21, 10, 23, 19, 12, 4, 26, 8, 16, 7, 27,
  20, 13, 2, 41, 52, 31, 37, 47, 55, 30, 40, 51, 45, 33, 48, 44, 49, 39, 56, 34,
  53, 46, 42, 50, 36, 29, 32,
];

// Number of shifts per round
const SHIFTS = [1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1];

// Permutation function
const permute = (input, table) => {
  return table.map((pos) => input[pos - 1]).join("");
};

// Left Circular Shift
const leftCircularShift = (key, shifts) => {
  return key.slice(shifts) + key.slice(0, shifts);
};

// Subkey generation
const generateSubkeys = (key) => {
  // Perform Permuted Choice 1
  const permutedKey = permute(key, PC1);

  // Split the key into left and right halves
  let left = permutedKey.slice(0, 28);
  let right = permutedKey.slice(28);

  const subkeys = [];

  // Generate 16 subkeys
  for (let i = 0; i < 16; i++) {
    left = leftCircularShift(left, SHIFTS[i]);
    right = leftCircularShift(right, SHIFTS[i]);

    // Combine and permute using PC2
    const combinedKey = left + right;
    subkeys.push(permute(combinedKey, PC2));
  }

  return subkeys;
};

const feistelFunction = (right, subkey) => {
  // Placeholder for Feistel function logic, including Expansion, S-boxes, and P-box
  return right; // Replace with actual logic
};

const desEncrypt = (plaintext, key) => {
  // 1. Perform Initial Permutation
  const permutedText = permute(plaintext, IP);

  // 2. Split into left and right parts
  let left = permutedText.slice(0, 32);
  let right = permutedText.slice(32);

  // 3. Generate Subkeys
  const subkeys = generateSubkeys(key);

  // 4. Perform 16 rounds of DES
  for (let i = 0; i < 16; i++) {
    const temp = right;
    right = (
      parseInt(left, 2) ^ parseInt(feistelFunction(right, subkeys[i]), 2)
    )
      .toString(2)
      .padStart(32, "0");
    left = temp;
  }

  // 5. Swap halves and perform Inverse Initial Permutation
  const combined = right + left;
  return permute(combined, IP_INV);
};

const desDecrypt = (ciphertext, key) => {
  // Perform the same steps as encryption but use subkeys in reverse order
  const permutedText = permute(ciphertext, IP);

  let left = permutedText.slice(0, 32);
  let right = permutedText.slice(32);

  const subkeys = generateSubkeys(key).reverse();

  for (let i = 0; i < 16; i++) {
    const temp = right;
    right = (
      parseInt(left, 2) ^ parseInt(feistelFunction(right, subkeys[i]), 2)
    )
      .toString(2)
      .padStart(32, "0");
    left = temp;
  }

  const combined = right + left;
  return permute(combined, IP_INV);
};

module.exports = { desEncrypt, desDecrypt };
