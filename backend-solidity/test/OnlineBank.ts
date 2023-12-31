import { ethers } from 'hardhat';
import { expect } from 'chai';
const {
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

function Enum(...options: string[]) {
    return Object.fromEntries(options.map((key, i) => [key, BigInt(i)]));
}

describe('OnlineBank', function () {
    let owner: any;
    let addr1: any;
    let addr2: any;
    const AccountType = Enum("COURANT", "LIVRETA");

    async function deployOneYearLockFixture() {
        [owner, addr1, addr2] = await ethers.getSigners();

        const Currency = await ethers.getContractFactory("MyERC20");
        const currency = await Currency.deploy("euros", "EUR");
        await currency.waitForDeployment();
        const OnlineBank = await ethers.getContractFactory("OnlineBank");
        const onlineBank = await OnlineBank.deploy(currency.target);
        await onlineBank.waitForDeployment();

        return { currency, onlineBank };
    }

    it('Should allow deposit', async function () {
        const { currency, onlineBank } = await loadFixture(deployOneYearLockFixture)
        await currency.approve(onlineBank.target, 100)
        await onlineBank.deposit(AccountType.COURANT, 100);
        const balance = await onlineBank.getAccountBalance(owner, AccountType.COURANT);
        expect(balance).to.equal(100);
    });

    it('Should allow withdrawal', async function () {
        const { currency, onlineBank } = await loadFixture(deployOneYearLockFixture)
        await currency.approve(onlineBank.target, 100)
        await onlineBank.deposit(AccountType.COURANT, 100);
        await onlineBank.withdraw(AccountType.COURANT, 50);
        const balance = await onlineBank.getAccountBalance(owner, AccountType.COURANT);
        expect(balance).to.equal(50);
    });

    it('Should allow transfer between accounts', async function () {
        const { currency, onlineBank } = await loadFixture(deployOneYearLockFixture)
        await currency.approve(onlineBank.target, 100)
        await onlineBank.deposit(AccountType.COURANT, 100);
        await onlineBank.withdraw(AccountType.COURANT, 50);
        await onlineBank.transfer(AccountType.COURANT, AccountType.LIVRETA, 30);
        const balanceCOURANT = await onlineBank.getAccountBalance(owner, AccountType.COURANT);
        const balanceLIVRETA = await onlineBank.getAccountBalance(owner, AccountType.LIVRETA);
        expect(balanceCOURANT).to.equal(20);
        expect(balanceLIVRETA).to.equal(30);
    });

    it('Should allow stop functions if contract pause', async function () {
        const { currency, onlineBank } = await loadFixture(deployOneYearLockFixture)
        await currency.approve(onlineBank.target, 100)
        await onlineBank.deposit(AccountType.COURANT, 100);
        await onlineBank.withdraw(AccountType.COURANT, 50);
        const notPausedBefore = await onlineBank.paused();
        expect(notPausedBefore).to.be.false;
        await onlineBank.pause();
        const pausedAfter = await onlineBank.paused();
        expect(pausedAfter).to.be.true;
        await expect(onlineBank.transfer(AccountType.COURANT, AccountType.LIVRETA, 30)).to.be.reverted;
        await onlineBank.unpause();
        await onlineBank.withdraw(AccountType.COURANT, 20);
        const balanceCOURANT = await onlineBank.getAccountBalance(owner, AccountType.COURANT);
        expect(balanceCOURANT).to.equal(30);
    });
});
