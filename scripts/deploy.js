import { resolve } from 'path';
import dotenv from 'dotenv';
import { readFileSync, writeFileSync } from 'fs';
dotenv.config();

async function main() {
    const contractName = "LoanSystem";
    const IdentityManager = await ethers.deployContract(contractName);
    await IdentityManager.waitForDeployment();
    const contractAddress = IdentityManager.target;
    console.log("Contract", contractName, "deployed: ", contractAddress);

    const envPath = resolve(new URL('.', import.meta.url).pathname, '../.env');
    let envContent = readFileSync(envPath, 'utf8');

    const contractAddressRegex = /^CONTRACT_ADDRESS=.*$/m;
    if (contractAddressRegex.test(envContent)) {
        envContent = envContent.replace(contractAddressRegex, `CONTRACT_ADDRESS=${contractAddress}`);
    } else {
        envContent += `CONTRACT_ADDRESS=${contractAddress}\n`;
    }

    writeFileSync(envPath, envContent);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });