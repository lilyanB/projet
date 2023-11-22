// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract OnlineBank {
    address public owner;
    address public usdcToken;

    enum AccountType {
        COURANT,
        LIVRETA
    }

    struct Account {
        AccountType name;
        uint256 amount;
    }

    struct User {
        address owner;
        uint256 age;
        mapping(AccountType => Account) accounts;
        int256 overdraft;
    }

    event Transaction(
        string _type,
        uint256 amount,
        uint256 date,
        string from,
        string to,
        uint256 newBalance,
        string information
    );

    mapping(address => User) public users;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    constructor(address _usdcToken) {
        owner = msg.sender;
        usdcToken = _usdcToken;
    }

    function deposit(AccountType name, uint256 amount) external {
        require(
            IERC20(usdcToken).transferFrom(msg.sender, address(this), amount),
            "Failed to transfer ERC20 tokens"
        );

        User storage user = users[msg.sender];
        user.accounts[name].amount += amount;

        emit Transaction(
            "Deposit",
            amount,
            block.timestamp,
            "External",
            accountTypeToString(name),
            user.accounts[name].amount,
            "Deposit to account"
        );
    }

    function withdraw(AccountType name, uint256 amount) external {
        User storage user = users[msg.sender];
        require(amount <= user.accounts[name].amount, "Insufficient funds");

        user.accounts[name].amount -= amount;

        require(
            IERC20(usdcToken).transfer(msg.sender, amount),
            "Failed to transfer ERC20 tokens"
        );

        emit Transaction(
            "Withdrawal",
            amount,
            block.timestamp,
            accountTypeToString(name),
            "External",
            user.accounts[name].amount,
            "Withdrawal from account"
        );
    }

    function transfer(
        AccountType from,
        AccountType to,
        uint256 amount
    ) external {
        User storage user = users[msg.sender];
        require(amount <= user.accounts[from].amount, "Insufficient funds");

        user.accounts[from].amount -= amount;
        user.accounts[to].amount += amount;

        emit Transaction(
            "Transfer",
            amount,
            block.timestamp,
            accountTypeToString(from),
            accountTypeToString(to),
            user.accounts[from].amount,
            "Internal transfer"
        );
    }

    function getAccountBalance(
        AccountType accountType
    ) external view returns (uint256) {
        User storage user = users[msg.sender];
        return user.accounts[accountType].amount;
    }

    function accountTypeToString(
        AccountType accountType
    ) internal pure returns (string memory) {
        if (accountType == AccountType.COURANT) {
            return "COURANT";
        } else if (accountType == AccountType.LIVRETA) {
            return "LIVRETA";
        } else {
            revert("Invalid AccountType");
        }
    }
}
