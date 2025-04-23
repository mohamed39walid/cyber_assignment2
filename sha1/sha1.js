document.addEventListener('DOMContentLoaded', function () {
    const shaInput = document.getElementById('shaInput');
    const hashButton = document.getElementById('hashButton');
    const resultParagraph = document.getElementById('result');

    hashButton.addEventListener('click', function () {
        const inputText = shaInput.value;
        let sha_input_list = inputText.split('');
        let converted_text_to_ascii = sha_input_list.map(char => char.charCodeAt(0));
        let converted_ascii_to_binary = converted_text_to_ascii.map(ascii => ascii.toString(2).padStart(8, '0'));
        let binary = converted_ascii_to_binary.join('')
        binary += "1"
        let binary_512 = binary.padEnd(448, "0")
        let letters_multi_8 = inputText.length * 8;
        let letters_multi_8_bin = letters_multi_8.toString(2).padStart(64, '0');
        binary_512 += letters_multi_8_bin;
        let chunks = []
        for (let i = 0; i < binary_512.length; i += 512) {
            chunks.push(binary_512.slice(i, i + 512))
        }

        let h0 = 0x67452301;
        let h1 = 0xEFCDAB89;
        let h2 = 0x98BADCFE;
        let h3 = 0x10325476;
        let h4 = 0xC3D2E1F0;

        let w = [];
        chunks.forEach((chunk, chunkIndex) => {
            for (let i = 0; i < 512; i += 32) {
                w.push(chunk.slice(i, i + 32))
            }

            for (let i = 16; i < 80; i++) {
                let xor = xorBits(w[i - 3], w[i - 8], w[i - 14], w[i - 16]);
                w[i] = leftShift(xor, 1);
            }



            // Convert binary strings to integers
            w = w.map(bin => parseInt(bin, 2));
            let a = h0;
            let b = h1;
            let c = h2;
            let d = h3;
            let e = h4;


            for (let i = 0; i < 80; i++) {
                let f, k;
                if (i < 20) {
                    f = (b & c) | ((~b) & d);
                    k = 0x5A827999;
                } else if (i < 40) {
                    f = b ^ c ^ d;
                    k = 0x6ED9EBA1;
                } else if (i < 60) {
                    f = (b & c) | (b & d) | (c & d);
                    k = 0x8F1BBCDC;
                } else {
                    f = b ^ c ^ d;
                    k = 0xCA62C1D6;
                }

                let temp = (leftRotateInt(a, 5) + f + e + k + w[i]) >>> 0;
                e = d;
                d = c;
                c = leftRotateInt(b, 30);
                b = a;
                a = temp;
            }
            h0 = (h0 + a) >>> 0;
            h1 = (h1 + b) >>> 0;
            h2 = (h2 + c) >>> 0;
            h3 = (h3 + d) >>> 0;
            h4 = (h4 + e) >>> 0;
        });

        const finalHash = [h0, h1, h2, h3, h4].map(h => h.toString(16).padStart(8, '0')).join('');
        resultParagraph.textContent = `SHA-1: ${finalHash}`;
    });



    function xorBits(...args) {
        let result = '';
        for (let i = 0; i < 32; i++) {
            let bit = args.reduce((acc, bin) => acc ^ parseInt(bin[i]), 0);
            result += bit;
        }
        return result;
    }

    function leftRotateInt(value, shift) {
        return ((value << shift) | (value >>> (32 - shift))) >>> 0;
    }

    function leftShift(binStr, n) {
        return binStr.slice(n) + binStr.slice(0, n);
    }

});