document.addEventListener('DOMContentLoaded', function() {
    const verifyForm = document.getElementById('verify-form');
    const messageSuccess = document.getElementById('message-success');
    const documentDownload = document.getElementById('document-download');

    verifyForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData(verifyForm);

        const fileInput = formData.get('file-upload');
        const keyInput = formData.get('key-upload');

        if (fileInput && fileInput instanceof Blob && keyInput && keyInput instanceof Blob) {
            const fileReader = new FileReader();
            const keyReader = new FileReader();

            fileReader.onload = async function(e) {
                const fileContent = e.target.result;
                keyReader.onload = async function(e) {
                    const keyContent = e.target.result;
                    try {
                        const privateKey = await importPrivateKey(keyContent);
                        const signature = await signData(privateKey, fileContent);
                        console.log('Digital Signature:', signature);

                        // Hide the form
                        verifyForm.style.display = 'none';

                        // Create download link for the signature
                        createDownloadLink(signature, 'signature.txt');

                        // Display success message
                        const div = document.createElement('div');
                        const text = document.createTextNode("Document signed successfully! You can download your signature:");
                        div.appendChild(text);
                        messageSuccess.appendChild(div);

                    } catch (error) {
                        console.error('Error during signing process:', error);
                    }
                };
                keyReader.onerror = function(e) {
                    console.error('Error reading private key:', e);
                };
                keyReader.readAsText(keyInput);
            };
            fileReader.onerror = function(e) {
                console.error('Error reading file:', e);
            };
            fileReader.readAsText(fileInput);
        } else {
            console.error('No file or key selected or they are not Blobs');
        }
    });

    async function importPrivateKey(pemKey) {
        try {
            // Remove the PEM header and footer
            const pemHeader = "-----BEGIN PKCS8 KEY-----";
            const pemFooter = "-----END PKCS8 KEY-----";
            let pemContents = pemKey.replace(pemHeader, "").replace(pemFooter, "").trim();
            pemContents = pemContents.replace(/\n/g, '').replace(/\s+/g, ''); // Remove all whitespace and line breaks

            const binaryDerString = window.atob(pemContents);
            const binaryDer = str2ab(binaryDerString);

            return await window.crypto.subtle.importKey(
                "pkcs8",
                binaryDer,
                {
                    name: "RSASSA-PKCS1-v1_5",
                    hash: {name: "SHA-256"},
                },
                true,
                ["sign"]
            );
        } catch (error) {
            console.error('Failed to import private key:', error);
            throw error;
        }
    }

    function str2ab(str) {
        const buf = new ArrayBuffer(str.length);
        const bufView = new Uint8Array(buf);
        for (let i = 0, strLen = str.length; i < strLen; i++) {
            bufView[i] = str.charCodeAt(i);
        }
        return buf;
    }

    function getArrayBufferFromString(str) {
        const encoder = new TextEncoder();
        return encoder.encode(str);
    }

    async function signData(privateKey, data) {
        const dataArrayBuffer = getArrayBufferFromString(data);

        const signature = await window.crypto.subtle.sign(
            {
                name: "RSASSA-PKCS1-v1_5",
            },
            privateKey,
            dataArrayBuffer
        );

        return btoa(String.fromCharCode(...new Uint8Array(signature)));
    }

    function createDownloadLink(content, filename) {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.className = "button";
        a.href = url;
        a.download = filename;
        a.textContent = `Download ${filename}`;
        documentDownload.appendChild(a);
    }
});