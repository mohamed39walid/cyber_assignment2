//  Helper Function: Calculate GCD using the Euclidean Algorithm
function gcd(a, b) {
    while (b !== 0) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return a;
  }
  
  //  Extended Euclidean Algorithm to find modular inverse
  function extendedGCD(a, b) {
    if (b === 0) return { gcd: a, x: 1, y: 0 };
    const { gcd, x: x1, y: y1 } = extendedGCD(b, a % b);
    return { gcd, x: y1, y: x1 - Math.floor(a / b) * y1 };
  }
  
  function modInverseWithLcgKey(a, m) {
    const { gcd, x } = extendedGCD(a, m);
    if (gcd !== 1) throw new Error("Inverse doesn't exist.");
    return ((x % m) + m) % m;
  }
  
  //  Modular Inverse using LCG to generate candidates
  function modInverseLCG(e, phi) {
    const a = 1103515245;
    const c = 12345;
    const m = Math.pow(2, 31);
    let x = Date.now();
  
    for (let i = 0; i < 100000; i++) {
      x = (a * x + c) % m;
      const candidate = x % phi;
  
      if (candidate > 1 && gcd(e, candidate) === 1) {
        try {
          const inv = modInverseWithLcgKey(e, phi);
          return inv;
        } catch {}
      }
    }
  
    throw new Error("No modular inverse found using LCG.");
  }
  
  //  RSA Key Generation Function with fixed primes & LCG for private key
  function rsaLcg() {
    const p = 61;
    const q = 53;
    const n = p * q;
    const phi = (p - 1) * (q - 1);
    let e = 19;
  
    if (e >= phi || gcd(e, phi) !== 1) {
      throw new Error("Invalid 'e'. It must be less than φ and coprime with it.");
    }
  
    const d = modInverseLCG(e, phi); // Generate d using LCG
    return {
      publicKey: [n, e],
      privateKey: [n, d],
    };
  }
  
  //  Modular Exponentiation
  function modPow(base, exp, mod) {
    let result = 1;
    base = base % mod;
    while (exp > 0) {
      if (exp % 2 === 1) result = (result * base) % mod;
      exp = Math.floor(exp / 2);
      base = (base * base) % mod;
    }
    return result;
  }
  
  //  Convert number array to byte array
  function numberArrayToBytes(arr, byteLength = 4) {
    const bytes = [];
    for (const num of arr) {
      for (let i = byteLength - 1; i >= 0; i--) {
        bytes.push((num >> (8 * i)) & 0xff);
      }
    }
    return new Uint8Array(bytes);
  }
  
  //  Convert byte array to number array
  function bytesToNumberArray(bytes, byteLength = 4) {
    const result = [];
    for (let i = 0; i < bytes.length; i += byteLength) {
      let num = 0;
      for (let j = 0; j < byteLength; j++) {
        num = (num << 8) | (bytes[i + j] || 0);
      }
      result.push(num);
    }
    return result;
  }
  
  //  Encode Uint8Array to base64
  function toBase64(bytes) {
    return btoa(String.fromCharCode(...bytes));
  }
  
  //  Decode base64 to Uint8Array
  function fromBase64(b64) {
    const binaryStr = atob(b64);
    return new Uint8Array([...binaryStr].map((ch) => ch.charCodeAt(0)));
  }
  
  //  Encrypt text to base64
  function encryptTextBase64Lcg(text, publicKey) {
    const [n, e] = publicKey;
  
    const encoder = new TextEncoder();
    const textBytes = encoder.encode(text);
  
    const maxBlockSize = 53;
    if (textBytes.length > maxBlockSize) {
      throw new Error("Input too long. RSA max block size is 53 bytes.");
    }
  
    const cipherNums = [];
    for (const byte of textBytes) {
      cipherNums.push(modPow(byte, e, n));
    }
  
    const encryptedBytes = numberArrayToBytes(cipherNums);
    return toBase64(encryptedBytes);
  }
  
  //  Decrypt base64 to text
  function decryptTextBase64Lcg(base64Cipher, privateKey) {
    const [n, d] = privateKey;
  
    const encryptedBytes = fromBase64(base64Cipher);
    const cipherNums = bytesToNumberArray(encryptedBytes);
  
    const decryptedBytes = cipherNums.map((c) => modPow(c, d, n));
    const decoder = new TextDecoder();
    return decoder.decode(Uint8Array.from(decryptedBytes));
  }
  
  //  Main Logic
  let { publicKey: publicKeyLcg, privateKey: privateKeyLcg } = rsaLcg();
  
  //  Bind to Encrypt Button
  function encryptWithLcg() {
    const plainText = document.getElementById("plainText").value.trim();
    const outputField = document.getElementById("encryptOutput");
    console.log("Done with LCG");
  
    try {
      const encrypted = encryptTextBase64Lcg(plainText, publicKeyLcg);
      outputField.value = encrypted;
    } catch (err) {
      console.log(err.message);
    }
  }
  
  //  Bind to Decrypt Button
  function decryptLcg() {
    const cipherText = document.getElementById("cipherText").value.trim();
    const outputField = document.getElementById("decryptOutput");
  
    try {
      const decrypted = decryptTextBase64Lcg(cipherText, privateKeyLcg);
      outputField.value = decrypted;
    } catch (err) {
      alert("Decryption failed: " + err.message);
    }
  }