# Blockchain Loan System

This project uses the Besu network and Hardhat to implement a basic blockchain-based loan system for educational purposes.

## Prerequisites

Before you begin, make sure you have the following tools installed:

- [Node.js](https://nodejs.org/) 20+
- [Yarn](https://yarnpkg.com/)
- [JDK](https://www.oracle.com/java/technologies/javase-jdk21-downloads.html) 21+

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/your-username/blockchain_loan_system.git
    cd blockchain_loan_system
    ```

2. Install the dependencies:

    ```bash
    npm install
    ```

## IBFT Besu Private Network Configuration

1. Start the Besu network with the 4 nodes following the [documentation](https://besu.hyperledger.org/stable/private-networks/tutorials/ibft).

## Contract Deployment and Usage

1. Ensure that you have the node libraries and the .env file correctly filled out.
2. Deploy the contract on the Besu network:

    ```bash
    npx hardhat run scripts/deploy.js --network besu
    ```

3. Execute the project:

    ```bash
    npx hardhat run scripts/project.js --network besu
    ```

## Contribution

If you wish to contribute to the project, please get in touch.

## License

This project is free to use. No permission is required for use, just proper citation of the author.
