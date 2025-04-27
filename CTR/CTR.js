document.addEventListener('DOMContentLoaded', function() {
  // UI Elements
  const inputText = document.getElementById('inputText');
  const encryptBtn = document.getElementById('encryptBtn');
  const decryptBtn = document.getElementById('decryptBtn');
  const resultOutput = document.getElementById('resultOutput');
  const logsOutput = document.getElementById('logsOutput');
  const keyOutput = document.getElementById('keyOutput');
  
  // IV (Initialization Vector)
  const ivString = "1234567890abcdef";
  
  // Generate LCG (Linear Congruential Generator)
  function generateLcg(length = 16) {
    const a = 1664525;
    const c = 1013904223;
    const m = 2 ** 32;
    let seed = Date.now();
  
    let key = "";
    for (let i = 0; i < length; i++) {
      seed = (a * seed + c) % m;
      const charCode = 97 + (seed % 26); // a-z
      key += String.fromCharCode(charCode);
    }
  
    log(`Generated Key: ${key}`);
    return key;
  }
  
  // CTR encryption function with space replacement
  function encryptWithCTR(plainText) {
    log("Starting encryption process...");
    
    // Remove all spaces from the text and replace with a special symbol
    const text = plainText.replaceAll(" ", "#");
    log(`Text after space replacement: ${text}`);
  
    // Generate a secret key using LCG
    const keyString = generateLcg(16);
    const key = CryptoJS.enc.Utf8.parse(keyString);
  
    // Convert IV to bytes
    const ivBytes = CryptoJS.enc.Utf8.parse(ivString);
    log(`IV in bytes: ${ivBytes}`);
  
    // Convert the plaintext to a format suitable for cryptographic operations
    const data = CryptoJS.enc.Utf8.parse(text);
  
    const blockSize = 16;
    let encryptedResult = [];
  
    // Encryption for each block
    for (let i = 0; i < data.sigBytes; i += blockSize) {
      const block = data.words.slice(i / 4, (i + blockSize) / 4);
  
      // Generate Counter
      let counter = ivBytes.words.slice();
      const blockIndex = Math.floor(i / blockSize);
      log(`Processing block ${blockIndex}`);
  
      // XOR the last word of the counter with the block index
      counter[counter.length - 1] ^= blockIndex;
      
      // Encrypt Counter
      const counterEncrypted = CryptoJS.AES.encrypt(
        CryptoJS.lib.WordArray.create(counter),
        key,
        {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.NoPadding,
        }
      ).ciphertext.words;
  
      log(`Encrypted counter for block ${blockIndex}: ${counterEncrypted}`);
  
      // XOR the Message with Counter
      const xorResult = block.map((value, j) => value ^ counterEncrypted[j]);
  
      // Add the encrypted block to the result
      encryptedResult = encryptedResult.concat(xorResult);
    }
  
    // Convert to Base64
    const encryptedBase64 = CryptoJS.enc.Base64.stringify(
      CryptoJS.lib.WordArray.create(encryptedResult)
    );
  
    log(`Encryption complete. Result: ${encryptedBase64}`);
    return { key: keyString, encrypted: encryptedBase64 };
  }
  
  // Decryption in CTR mode with space replacement
  function decryptCTR(base64Cipher, keyString) {
    log("Starting decryption process...");
    
    // Parse the key string to a format suitable for CryptoJS
    const key = CryptoJS.enc.Utf8.parse(keyString);
    log(`Using key: ${keyString}`);
  
    // Parse the IV to bytes
    const ivBytes = CryptoJS.enc.Utf8.parse(ivString);
  
    // Convert the Base64 ciphertext to bytes
    const encryptedBytes = CryptoJS.enc.Base64.parse(base64Cipher);
    log(`Ciphertext bytes: ${encryptedBytes}`);
  
    const blockSize = 16;
    let decryptedResult = [];
  
    for (let i = 0; i < encryptedBytes.sigBytes; i += blockSize) {
      // Extract the current block of ciphertext
      const block = encryptedBytes.words.slice(i / 4, (i + blockSize) / 4);
  
      // Generate the same counter value that was used during encryption
      const counter = ivBytes.words.slice();
      const blockIndex = Math.floor(i / blockSize);
      log(`Decrypting block ${blockIndex}`);
  
      // XOR the last word of the counter with the block index
      counter[counter.length - 1] ^= blockIndex;
  
      // Convert the counter to WordArray
      const counterWordArray = CryptoJS.lib.WordArray.create(counter);
  
      // Encrypt the Counter Value
      const aesEcb = CryptoJS.AES.encrypt(counterWordArray, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.NoPadding,
      });
  
      // Get the encrypted counter value
      const counterEncrypted = aesEcb.ciphertext.words;
      log(`Encrypted counter for block ${blockIndex}: ${counterEncrypted}`);
  
      // XOR the ciphertext block with the encrypted counter to recover the plaintext
      const xorResult = block.map((byte, j) => byte ^ counterEncrypted[j]);
      decryptedResult = decryptedResult.concat(xorResult);
    }
  
    let decryptedText = CryptoJS.enc.Utf8.stringify(
      CryptoJS.lib.WordArray.create(decryptedResult)
    )
      .replace(/\0+$/, "")
      .trim();
  
    log(`Decrypted text before space replacement: ${decryptedText}`);
  
    // Replace the special symbol (#) back to space
    decryptedText = decryptedText.replace(/#/g, ' ');
  
    log(`Decryption complete. Result: ${decryptedText}`);
    return decryptedText;
  }
  
  // Helper function to log messages
  function log(message) {
    const timestamp = new Date().toLocaleTimeString();
    logsOutput.innerHTML += `[${timestamp}] ${message}<br>`;
    logsOutput.scrollTop = logsOutput.scrollHeight;
  }
  
  // Event Listeners
  encryptBtn.addEventListener('click', function() {
    if (!inputText.value.trim()) {
      alert("Please enter text to encrypt!");
      return;
    }
    
    logsOutput.innerHTML = "";
    const encryptedResult = encryptWithCTR(inputText.value);
    resultOutput.textContent = encryptedResult.encrypted;
    keyOutput.textContent = encryptedResult.key;
  });
  
  decryptBtn.addEventListener('click', function() {
    if (!resultOutput.textContent || !keyOutput.textContent) {
      alert("No encrypted data found. Please encrypt something first!");
      return;
    }
    
    logsOutput.innerHTML = "";
    const decryptedResult = decryptCTR(resultOutput.textContent, keyOutput.textContent);
    resultOutput.textContent = decryptedResult;
  });
});