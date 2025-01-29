document.addEventListener('DOMContentLoaded', function() {
    const generateForm = document.querySelector('form');
    const keyDownload = document.getElementById('key-download');
    const message_success = document.getElementById('message-success');

    generateForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const keyPair = await generateKeyPair();
        const privateKey = keyPair.privateKey;
        const publicKey = keyPair.publicKey;

        console.log('Private Key:', privateKey);
        console.log('Public Key:', publicKey);

        const privateKeyPem = await exportKey(privateKey, 'pkcs8');
        const publicKeyPem = await exportKey(publicKey, 'spki');

        createDownloadLink(privateKeyPem, 'private-key.pem');
        createDownloadLink(publicKeyPem, 'public-key.pem');

        var div = document.createElement('div');
        var text = document.createTextNode("Keys generated successfully! You can download your keys:");
        div.appendChild(text);
        
        if (message_success) {
            message_success.appendChild(div);
        } 
    });

    async function generateKeyPair() {
        return await window.crypto.subtle.generateKey(
            {
                name: "RSASSA-PKCS1-v1_5",
                modulusLength: 2048,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: "SHA-256",
            },
            true,
            ["sign", "verify"]
        );
    }

    async function exportKey(key, format) {
        const exported = await window.crypto.subtle.exportKey(
            format,
            key
        );

        const exportedAsString = ab2str(exported);
        const exportedAsBase64 = window.btoa(exportedAsString);
        const pemExported = `-----BEGIN ${format.toUpperCase()} KEY-----\n${exportedAsBase64}\n-----END ${format.toUpperCase()} KEY-----`;

        return pemExported;
    }

    function ab2str(buf) {
        return String.fromCharCode.apply(null, new Uint8Array(buf));
    }

    function createDownloadLink(pem, filename) {
        const blob = new Blob([pem], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.className = "button";
        a.href = url;
        a.download = filename;
        a.textContent = `Download ${filename}`;
        keyDownload.appendChild(a);
    }
});