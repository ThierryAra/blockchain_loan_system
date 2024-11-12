import fs from "fs";
import hardhat from "hardhat";
import dotenv from 'dotenv';
import inquirer from 'inquirer';

const { ethers } = hardhat;

dotenv.config();

async function main() {
    // Loading user data
    const usersData = JSON.parse(fs.readFileSync("api/users.json", "utf-8")).users;
    const signers = await ethers.getSigners();
    const users = usersData.map((user, index) => ({
        ...user,
        signer: signers[index]
    }));

    const { CONTRACT_ADDRESS } = process.env;
    const LoanSystem = await ethers.getContractFactory("LoanSystem");
    const contract = LoanSystem.attach(CONTRACT_ADDRESS);

    const owner = users[0].signer; // Contract owner
    const borrower = users[1].signer; // Loan applicant

    // Counter to apply penalty every two payments (test purposes)
    let paymentCounter = 0;

    async function showMenu() {
        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'Choose an action:',
                choices: [
                    'Request Loan',
                    'Check Loan Details',
                    'Make Payment',
                    'Exit'
                ]
            }
        ]);

        switch (answers.action) {
            case 'Request Loan':
                const success = await requestLoan();
                if (success) {
                    await approveLoan();
                }
                break;
            case 'Check Loan Details':
                await getLoanDetails();
                break;
            case 'Make Payment':
                if (paymentCounter % 2 === 1) {
                    await applyPenalty();
                }
                await makePayment();
                paymentCounter++;
                break;
            case 'Exit':
                process.exit(0);
        }
        await showMenu();
    }

    async function requestLoan() {
        let success = false;

        try {
            const loanAmount = ethers.parseEther("1");
            const income = users[1].income;
            const creditScore = users[1].credit_score;
            
            console.log("Requesting loan...");
            const tx = await contract.connect(borrower).requestLoan(loanAmount, income, creditScore);
            await tx.wait();
            console.log("Loan requested.");
            success = true;
        } catch (error) {
            console.log("------------------------------------");
            console.error("Error requesting loan:", error);
            console.log("------------------------------------\n");
        }

        console.log("\n");
        return success;
    }

    async function approveLoan() {
        try {
            console.log("Approving loan...");
            const tx = await contract.connect(owner).approveLoan(borrower.address);
            await tx.wait();
            console.log("Loan approved.");
        } catch (error) {
            console.log("------------------------------------");
            console.error("Error approving loan:", error);
            console.log("------------------------------------");
        }
    
        console.log("\n");
    }

    async function getLoanDetails() {
        try {
            const loanDetails = await contract.loans(borrower.address);
            console.log("\nLoan Details:", {
                Amount: ethers.formatEther(loanDetails.amount),
                Income: loanDetails.income.toString(),
                Credit_Score: loanDetails.creditScore.toString(),
                Approved: loanDetails.isApproved,
                Remaining_Balance: ethers.formatEther(loanDetails.remainingBalance),
                Monthly_Payment: ethers.formatEther(loanDetails.monthlyPayment)
            });
        } catch (error) {
            console.log("------------------------------------");
            console.error("Error checking loan details:", error);
            console.log("------------------------------------");
        }
    
        console.log("\n");
    }

    async function makePayment() {
        try {
            const loanDetails = await contract.loans(borrower.address);
            const monthlyPayment = loanDetails.monthlyPayment;

            console.log("\nMaking a payment...");
            const tx = await contract.connect(borrower).makePayment({ value: monthlyPayment });
            await tx.wait();
            console.log("Payment made.");
        } catch (error) {
            console.log("------------------------------------");
            console.error("Error making payment:", error);
            console.log("------------------------------------");
        }
    
        console.log("\n");
    }

    async function applyPenalty() {
        try {
            console.log("\nSimulating delay to apply penalty...");
            // await ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 31]); // Advance 31 days
            // await ethers.provider.send("evm_mine", []);

            const tx = await contract.connect(owner).applyPenalty(borrower.address);
            await tx.wait();
            console.log("Penalty applied for late payment.");
        } catch (error) {
            console.log("------------------------------------");
            console.error("Error applying penalty:", error);
            console.log("------------------------------------");
        }
    
        console.log("\n");
    }

    await showMenu();
}


main().then(() => process.exit(0)).catch((error) => {
    console.error("Error executing the script:", error);
    process.exit(1);
});
