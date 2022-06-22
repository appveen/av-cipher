const { Command } = require('commander');
const utils = require('./utils');

const program = new Command();

program
    .name('av-cipher')
    .description('CLI to Encrypt/Decrypt Data')
    .version('1.0.1');

program.command('encrypt')
    .description('Encrypts a File or a Text')
    .option('-d, --data <string>', 'string data to encrypt')
    .option('-f, --file <string>', 'path of the file to encrypt')
    .requiredOption('-p, --password <string>', 'The password to Encrypt data')
    .action((config) => {
        console.log(config);
        if (config.file) {
            utils.encryptFile(config.file, config.password);
        } else {
            const data = utils.encryptData(config.data, config.password);
            console.log(data);
        }
    });
program.command('decrypt')
    .description('Decrypts a File or a Text')
    .option('-d, --data <string>', 'string data to decrypt')
    .option('-f, --file <string>', 'path of the file to decrypt')
    .requiredOption('-p, --password <string>', 'The password to Decrypt data')
    .action((config) => {
        console.log(config);
        if (config.file) {
            utils.decryptFile(config.file, config.password);
        } else {
            const data = utils.decryptData(config.data, config.password);
            console.log(data);
        }
    });

program.parse();