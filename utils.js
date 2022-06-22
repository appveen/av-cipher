const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const IV_LENGTH = 16;

function encryptFile(filePath, key) {
    return new Promise((resolve, reject) => {
        try {
            const digestHash = crypto.createHash('sha256').update(key).digest('hex');
            const allocatedKey = Buffer.alloc(32, digestHash);
            const iv = crypto.randomBytes(IV_LENGTH);
            const parsedPath = path.parse(filePath);
            const newFilePath = path.join(parsedPath.dir, parsedPath.name + '.encrypted' + parsedPath.ext);
            const rStream = fs.createReadStream(filePath);
            const wStream = fs.createWriteStream(newFilePath);
            const cipher = crypto.createCipheriv('aes-256-cbc', allocatedKey, iv);
            wStream.write(iv);
            rStream.pipe(cipher).pipe(wStream);
            wStream.on('close', () => {
                resolve();
            });
            wStream.on('error', (err) => {
                reject(err);
            });
            rStream.on('error', (err) => {
                reject(err);
            });
        } catch (err) {
            reject(err);
        }
    });
}


function decryptFile(filePath, key) {
    return new Promise(async (resolve, reject) => {
        try {
            const digestHash = crypto.createHash('sha256').update(key).digest('hex');
            const allocatedKey = Buffer.alloc(32, digestHash);
            const iv = await getIvFromStream(filePath);
            const parsedPath = path.parse(filePath);
            const newFilePath = path.join(parsedPath.dir, parsedPath.name + '.decrypted' + parsedPath.ext);
            const rStream = fs.createReadStream(filePath, { start: IV_LENGTH });
            const wStream = fs.createWriteStream(newFilePath);
            const cipher = crypto.createDecipheriv('aes-256-cbc', allocatedKey, iv);
            rStream.pipe(cipher).pipe(wStream);
            wStream.on('close', () => {
                resolve();
            });
            wStream.on('error', (err) => {
                reject(err);
            });
            rStream.on('error', (err) => {
                reject(err);
            });
        } catch (err) {
            reject(err);
        }
    });
}

async function getIvFromStream(inputPath) {
    return new Promise((resolve) => {
        let iv;
        fs.createReadStream(inputPath, { start: 0, end: IV_LENGTH - 1 })
            .on('data', (persistedIv) => (iv = persistedIv))
            .on('close', () => resolve(iv));
    });
}


function encryptData(data, key) {
    const digestHash = crypto.createHash('sha256').update(key).digest('hex');
    const allocatedKey = Buffer.alloc(32, digestHash);
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', allocatedKey, iv);
    let cipherText = cipher.update(data, 'utf-8', 'hex');
    cipherText += cipher.final('hex');
    cipherText = iv.toString('hex') + cipherText;
    return cipherText;
}


function decryptData(data, key) {
    const digestHash = crypto.createHash('sha256').update(key).digest('hex');
    const allocatedKey = Buffer.alloc(32, digestHash);
    const bufferData = Buffer.from(data, 'hex');
    const iv = bufferData.slice(0, IV_LENGTH);
    const textData = bufferData.slice(IV_LENGTH);
    const decipher = crypto.createDecipheriv('aes-256-cbc', allocatedKey, iv);
    let decipherText = decipher.update(textData, 'hex', 'utf-8');
    decipherText += decipher.final('utf-8');
    return decipherText;
}



module.exports.encryptFile = encryptFile;
module.exports.decryptFile = decryptFile;
module.exports.encryptData = encryptData;
module.exports.decryptData = decryptData;