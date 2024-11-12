// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LoanSystem {
    
    struct LoanRequest {
        address borrower;
        uint256 amount;
        uint256 income;
        uint256 creditScore;
        uint256 monthlyPayment;
        uint256 remainingBalance;
        uint256 dueDate;
        bool isApproved;
        bool isActive;
    }
    
    uint256 public interestRate = 5; // fixed interest rate
    uint256 public minimumCreditScore = 700;
    uint256 public minimumIncome = 4000;
    uint256 public penaltyFee = 2; // penalty percentage for late payment (on the installment amount)
    
    uint256 public constant MIN_INCOME = 1000;
    uint256 public constant MIN_CREDIT_SCORE = 600;

    mapping(address => LoanRequest) public loans;

    event LoanRequested(address indexed borrower, uint256 amount);
    event LoanApproved(address indexed borrower, uint256 amount);
    event PaymentMade(address indexed borrower, uint256 amount);
    event PenaltyApplied(address indexed borrower, uint256 penalty);

    modifier loanExists(address _borrower) {
        require(loans[_borrower].isActive, "No active loan for this address.");
        _;
    }

    // Request Loan
    function requestLoan(uint256 _amount, uint256 _income, uint256 _creditScore) external {
        require(loans[msg.sender].isActive == false, "Loan already active.");
        
        if (_income >= MIN_INCOME && _creditScore >= MIN_CREDIT_SCORE) {
            LoanRequest memory newLoan = LoanRequest({
                borrower: msg.sender,
                amount: _amount,
                income: _income,
                creditScore: _creditScore,
                monthlyPayment: (_amount * (100 + interestRate)) / 100 / 12, // Payment in one year
                remainingBalance: (_amount * (100 + interestRate)) / 100,
                dueDate: block.timestamp + 30 days,
                isApproved: false,
                isActive: true
            });
        
            loans[msg.sender] = newLoan;
            
            emit LoanRequested(msg.sender, _amount);
        } else {
            revert("Applicant does not meet the minimum eligibility criteria for the loan.");
        }
    }

    // Approve Loan
    function approveLoan(address _borrower) external {
        LoanRequest storage loan = loans[_borrower];
        
        require(loan.isActive, "No active loan.");
        require(loan.income >= minimumIncome, "Insufficient income.");
        require(loan.creditScore >= minimumCreditScore, "Insufficient credit score.");
        
        loan.isApproved = true;

        emit LoanApproved(_borrower, loan.amount);
    }

    // Make installment payment
    function makePayment() external payable {
        LoanRequest storage loan = loans[msg.sender];
        
        require(loan.isActive, "No active loan.");
        require(loan.isApproved, "Loan not approved.");
        require(msg.value == loan.monthlyPayment, "Incorrect payment amount.");
        
        loan.remainingBalance -= msg.value;
        loan.dueDate += 30 days;

        emit PaymentMade(msg.sender, msg.value);
        
        // Finalize loan if balance is paid off
        if (loan.remainingBalance == 0) {
            loan.isActive = false;
        }
    }

    // Apply penalty for late payment
    function applyPenalty(address _borrower) external {
        LoanRequest storage loan = loans[_borrower];
        
        require(loan.isActive, "No active loan.");
        // require(block.timestamp > loan.dueDate, "Payment is still within the deadline.");

        loan.remainingBalance += (penaltyFee * loan.monthlyPayment) / 100;

        emit PenaltyApplied(_borrower, penaltyFee);
    }

    // Check outstanding balance
    function getRemainingBalance(address _borrower) external view loanExists(_borrower) returns (uint256) {
        return loans[_borrower].remainingBalance;
    }

    // Check loan status
    function getLoanStatus(address _borrower) external view returns (bool isApproved, bool isActive, uint256 dueDate, uint256 remainingBalance) {
        require(msg.sender == _borrower, "Only the loan holder can check the status.");
        
        LoanRequest storage loan = loans[_borrower];
        if (!loan.isActive) {
            return (false, false, 0, 0); // default values if the loan does not exist
        }
        
        return (loan.isApproved, loan.isActive, loan.dueDate, loan.remainingBalance);
    }
}
