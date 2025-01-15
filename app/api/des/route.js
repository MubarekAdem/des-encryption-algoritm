export async function POST(req) {
  try {
    // Parse the incoming JSON body
    const body = await req.json();
    const { action, text, key } = body;

    // Validate that `text` and `key` are provided
    if (!text || !key) {
      return new Response(
        JSON.stringify({ error: "Text and key are required." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Ensure the key is exactly 8 characters long
    if (key.length !== 8) {
      return new Response(
        JSON.stringify({ error: "Key must be exactly 8 characters long." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Permutation tables for key scheduling
    const PC1 = [
      57, 49, 41, 33, 25, 17, 9, 1, 58, 50, 42, 34, 26, 18, 10, 2, 59, 51, 43,
      35, 27, 19, 11, 3, 60, 52, 44, 36, 63, 55, 47, 39, 31, 23, 15, 7, 62, 54,
      46, 38, 30, 22, 14, 6, 61, 53, 45, 37, 29, 21, 13, 5, 28, 20, 12, 4,
    ];
    const PC2 = [
      14, 17, 11, 24, 1, 5, 3, 28, 15, 6, 21, 10, 23, 19, 12, 4, 26, 8, 16, 7,
      27, 20, 13, 2, 41, 52, 31, 37, 47, 55, 30, 40, 51, 45, 33, 48, 44, 49, 39,
      56, 34, 53, 46, 42, 50, 36, 29, 32,
    ];

    // Number of left circular shifts for each round
    const LEFT_SHIFTS = [1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1];

    // Function to permute input based on a table
    function permute(input, table) {
      return table.map((pos) => input[pos - 1]).join("");
    }

    // Function to perform left circular shift
    function leftCircularShift(bits, shifts) {
      return bits.slice(shifts) + bits.slice(0, shifts);
    }

    // Generate 16 sub-keys from the original key
    function generateKeys(keyBinary) {
      const permutedKey = permute(keyBinary, PC1); // Apply PC1 permutation
      let left = permutedKey.slice(0, 28); // Split into left and right halves
      let right = permutedKey.slice(28);
      const keys = [];

      for (let i = 0; i < 16; i++) {
        // Perform left circular shifts
        left = leftCircularShift(left, LEFT_SHIFTS[i]);
        right = leftCircularShift(right, LEFT_SHIFTS[i]);

        // Combine halves and apply PC2 permutation to generate a sub-key
        const combined = left + right;
        keys.push(permute(combined, PC2));
      }

      return keys;
    }

    // Perform XOR operation on two binary strings
    function xor(bin1, bin2) {
      return bin1
        .split("")
        .map((bit, index) => (bit === bin2[index] ? "0" : "1"))
        .join("");
    }

    // Simplified DES encryption/decryption rounds
    function desRounds(textBinary, keys, encrypt = true) {
      let left = textBinary.slice(0, 32); // Left half
      let right = textBinary.slice(32); // Right half

      const rounds = encrypt ? keys : keys.reverse(); // Use keys in reverse for decryption
      for (const key of rounds) {
        // XOR left half with the result of XORing right half and the key
        const newRight = xor(left, xor(right, key));
        left = right; // Swap halves
        right = newRight;
      }

      return right + left; // Swap for the final round
    }

    // Convert string to binary
    function stringToBinary(input) {
      return input
        .split("")
        .map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
        .join("");
    }

    // Convert binary to string
    function binaryToString(input) {
      return input
        .match(/.{1,8}/g) // Split into 8-bit chunks
        .map((byte) => String.fromCharCode(parseInt(byte, 2)))
        .join("");
    }

    // Check if input is binary
    function isBinary(input) {
      return /^[01]+$/.test(input);
    }

    // Convert text and key to binary
    let textBinary;
    if (action === "encrypt") {
      textBinary = stringToBinary(text).padEnd(64, "0"); // Pad to 64 bits
    } else if (action === "decrypt") {
      textBinary = isBinary(text)
        ? text.padEnd(64, "0") // If already binary, pad to 64 bits
        : stringToBinary(text).padEnd(64, "0");
    }

    const keyBinary = stringToBinary(key).padEnd(64, "0"); // Convert key to binary

    // Generate sub-keys
    const keys = generateKeys(keyBinary);

    // Perform encryption or decryption
    const resultBinary =
      action === "encrypt"
        ? desRounds(textBinary, keys, true) // Encrypt
        : desRounds(textBinary, keys, false); // Decrypt

    // Convert binary result to string for decryption
    const result =
      action === "encrypt" ? resultBinary : binaryToString(resultBinary);

    // Return the result
    return new Response(JSON.stringify({ result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle errors
    return new Response(
      JSON.stringify({ error: error.message || "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
