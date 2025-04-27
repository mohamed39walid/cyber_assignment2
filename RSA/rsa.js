/*
This module provides a simple implementation of the RSA encryption algorithm in JavaScript. It includes functions for:
1. Checking if two numbers are co-prime.
2. Picking a number 'e' that is co-prime with 'o'.
3. Picking a number 'd' that is the modular multiplicative inverse of 'e' modulo 'o'.
4. Converting text to ASCII values and vice versa.
5. Encrypting and decrypting messages using RSA.
6. A main function 'rsa' that orchestrates the encryption or decryption process based on the mode provided.

The 'rsa' function can be used to either encrypt or decrypt a message. It takes an object with properties 'mode', 'value', 'publicKey', and 'privateKey'. If 'mode' is 'encrypt', it uses the 'publicKey' to encrypt the 'value'. If 'mode' is 'decrypt', it uses the 'privateKey' to decrypt the 'value'.
*/



/*
Co prime numbers are numbers that have no common factors other than 1 or each other.
ex) 2 and 9 are co prime numbers : 
common factors of 2 are : 1 , 2 
common factors of 9 are : 1 , 3 , 9
*/
const checkNumbersIsCoPrime = (num1, num2) => {
    // Find the smaller of the two numbers
    const smaller = num1 < num2 ? num1 : num2;
    for(let i = 2n; i <= smaller; i++) {
        if(num1 % i === 0n && num2 % i === 0n) {
            return false;
        }
    }
    return true;
}

/*
This function picks a number 'e' such that it is co-prime with 'o'. 
It starts from 'o-1' and goes down to '2', checking each number to see if it is co-prime with 'o'.
The first number it finds that is co-prime with 'o' is returned.
*/
const pickE = (o) => {
    // Start from o-1 (since o and o would share common factors)
    for(let i = o - 1n; i >= 2n; i--) {
        if(checkNumbersIsCoPrime(i, o)) {
            return i;
        }
    }
}

/*
This function picks a number 'd' such that it is the modular multiplicative inverse of 'e' modulo 'o'.
It starts from '2' and goes up to 'o', checking each number to see if it satisfies the condition.
The first number it finds that satisfies the condition is returned.
*/
const pickD = (e , o) =>{
    for(let i = 2n; i <= o; i++) {
        if((i * e )% o === 1n) {
            return i;
        }
    }
}

/*
This function converts a given text into an array of ASCII values.
It splits the text into individual characters, converts each character to its ASCII value, and returns an array of these values.
*/
const convertTextToASCII = (text) => {
    return text.split('').map(char => char.charCodeAt(0));
}

/*
This function takes an array of ASCII values, converts each value back into its corresponding character, and returns the resulting string.
*/
const convertASCIIToText = (ascii) => {
    ascii = ascii.split('-')
    return ascii.map(char => String.fromCharCode(char)).join('');
}

/*
This function encrypts a given message using RSA encryption.
It converts the message into ASCII values, then for each value, it calculates the cipher using the formula (char^e) % n, where 'e' and 'n' are from the public key.
The encrypted message is returned as a string of these ciphers separated by dashes.
*/
const sendEncryptedMessage = (message ,e, n)=>{
    let encryptedMessage = [];
    for (const char of message) {
        const cipher = (BigInt(char) ** BigInt(e)) % BigInt(n)
        encryptedMessage.push(cipher);
    }
    return encryptedMessage.join('-');
}

/*
This function decrypts a given encrypted message using RSA decryption.
It splits the encrypted message into individual ciphers, then for each cipher, it calculates the decrypted value using the formula (cipher^d) % n, where 'd' and 'n' are from the private key.
The decrypted message is returned as a string of these decrypted values separated by dashes.
*/
const reciveDecryptingMessage = (message , n , d)=>{
    let decryptedMessage = [];
    message.split('-').forEach(char => {
        
        decryptedMessage.push((BigInt(char) ** d) % n)
    });
    return decryptedMessage.join('-');
    // decryptedMessage.push((char ^ d) % n)
}

/*
This function encrypts a given message using RSA encryption.
It first converts the message into ASCII values, then it calls the sendEncryptedMessage function to encrypt these values.
The encrypted message is returned.
*/
const rsaEncrypt = (message , publicKey ) => {
    // compute numbers
    const asciiMessage = convertTextToASCII(message);
    const encryptedMessage = sendEncryptedMessage(asciiMessage,publicKey.e, publicKey.n);
    return encryptedMessage
}

const rsaDecrypt = (encryptedMessage,privateKey)=> {
    const decryptedMessage = reciveDecryptingMessage(encryptedMessage , privateKey.n , privateKey.d);
    const decryptedText = convertASCIIToText(decryptedMessage);
    return decryptedText
}





/*
This function is used to encrypt or decrypt a message using RSA algorithm.
It takes an object as an argument with the following properties:
- mode: The mode of operation, which can be 'encrypt' or 'decrypt'. Defaults to 'encrypt'.
- value: The message to be encrypted or decrypted.
- publicKey: The public key to be used for encryption. Required for encryption.
- privateKey: The private key to be used for decryption. Required for decryption.
If the mode is 'encrypt' and a public key is provided, the function returns the encrypted message.
If the mode is 'decrypt' and a private key is provided, the function returns the decrypted message.
If the mode is not valid or the value is not provided, the function throws an error.
Example usage:
rsa({mode: 'encrypt', value: 'Hello, World!', publicKey: {e: 65537, n: 9516311}});
*/

/* 
    pass two big prime numbers
    select mode (can be 'encrypt' or 'decrypt')
    select value (encrypted or decrypted value)
    select publicKey with encrypt or privateKey with decrypt
*/
const rsa = ({mode = 'encrypt' , value , publicKey = null , privateKey = null}) => {
    // try { 
        // validation
        if(!["encrypt" , "decrypt"].includes(mode)) throw new Error("mode must be 'encrypt' or 'decrypt'");
        if(!value) throw new Error("value is required");

        // return result
        if(mode === 'encrypt' && publicKey){
            return rsaEncrypt(value , publicKey);
        }else if(mode === 'decrypt' && privateKey){
            return rsaDecrypt(value , privateKey);
        }

        throw new Error("invalid arguments");
        
    // } catch (error) {
    //     throw new Error(error.message);
    // }
  
} 


//////////////////////////////////////// test function section ////////////////////////////////////////////////////////////
// two random prime numbers (should be big numbers but will choose small numbers for simplicity)
const p = 61n
const q = 53n
// compute numbers
const o = (p-1n) * (q-1n);
// n is the part that will be inside both public and private key
const n = p * q;
const e = pickE(o);
const d = pickD(e, o);




const encryptedMessage = rsa({
mode : 'encrypt' ,
value : 'Hello Mohamed Waleed , this message will be encrypted using RSA algorithm' ,
publicKey : {n,e}
})

const decryptedMessage = rsa({
mode : 'decrypt' ,
value : encryptedMessage ,
privateKey : {n,d}
})
console.log({encryptedMessage , decryptedMessage})

module.exports = {
    rsa
}