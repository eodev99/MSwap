const { ethers } = require("hardhat");
const { use, expect, assert } = require("chai");
const {
  INITIAL_SUPPLY_ALPHA,
  INITIAL_SUPPLY_BETA,
} = require("../../../../helper.config");
const { BigNumber } = require("ethers");

const BURN_ADDRESS = "0xa1Ec01cC32cA30dA1E5BF9fE63bE521d364983ce";
//TODO: add chain check
describe("MSwap", () => {
  let aToken, bToken, mSwap, accounts;
  beforeEach(async () => {
    accounts = await getNamedAccounts();
    await deployments.fixture("all");
    mSwap = await ethers.getContract("MSwap");
    aToken = await ethers.getContract("AlphaToken");
    bToken = await ethers.getContract("BetaToken");
  });

  describe("constructor", () => {
    it("initialises token objects", async () => {
      const aTokenAddress = await mSwap.token0();
      const bTokenAddress = await mSwap.token1();
      assert.equal(aTokenAddress, aToken.address);
      assert.equal(bTokenAddress, bToken.address);
    });
    it("initialises reserves at 0", async () => {
      const aReserve = await mSwap.reserves(aToken.address);
      const bReserve = await mSwap.reserves(bToken.address);
      assert.equal(aReserve, 0);
      assert.equal(bReserve, 0);
    });
  });
  describe("addLiquidity", () => {
    beforeEach(async () => {});
    it("reverts if amount0 is 0", async () => {
      await expect(mSwap.addLiquidity(0, 1000)).to.be.revertedWith(
        "MSwap__Amount_Is_0"
      );
    });
    it("reverts if amount0 is 1", async () => {
      await expect(mSwap.addLiquidity(1000, 0)).to.be.revertedWith(
        "MSwap__Amount_Is_0"
      );
    });

    it("reverts if sender does not have token0 balance", async () => {
      await aToken.approve(mSwap.address, 1000);
      await bToken.approve(mSwap.address, 1000);
      //remove token0 balance
      await aToken.transfer(BURN_ADDRESS, INITIAL_SUPPLY_ALPHA);
      await mSwap.connect(accounts.user1);
      await expect(mSwap.addLiquidity(1000, 1000)).to.be.reverted;
      const reserveAToken = await mSwap.reserves(aToken.address);
      const reserveBToken = await mSwap.reserves(bToken.address);
      assert.equal(reserveAToken.toString(), "0");
      assert.equal(reserveBToken.toString(), "0");
    });
    it("reverts if sender does not have token1 balance", async () => {
      await aToken.approve(mSwap.address, 1000);
      await bToken.approve(mSwap.address, 1000);
      //remove token1 balance
      await bToken.transfer(BURN_ADDRESS, INITIAL_SUPPLY_BETA);
      await expect(mSwap.addLiquidity(1000, 1000)).to.be.reverted;
      const reserveAToken = await mSwap.reserves(aToken.address);
      const reserveBToken = await mSwap.reserves(bToken.address);
      assert.equal(reserveAToken.toString(), "0");
      assert.equal(reserveBToken.toString(), "0");
    });
    it("transfers sender tokens to liquidity pool", async () => {
      await aToken.approve(mSwap.address, 1000);
      await bToken.approve(mSwap.address, 1000);
      const tx = await mSwap.addLiquidity(1000, 1000);
      await tx.wait(1);
      const reserveAToken = await mSwap.reserves(aToken.address);
      const reserveBToken = await mSwap.reserves(bToken.address);
      assert.equal(reserveAToken.toString(), "1000");
      assert.equal(reserveBToken.toString(), "1000");
    });
  });

  describe("swap", () => {
    describe("with liquidity", () => {
      beforeEach(async () => {
        await aToken.approve(mSwap.address, 250000000);
        await bToken.approve(mSwap.address, 100000000);
        await mSwap.addLiquidity(250000000, 100000000);
      });
      it("reverts if unknown token address passed", async () => {
        const unknownAddress = BURN_ADDRESS;
        await expect(mSwap.swap(1000, unknownAddress)).to.be.revertedWith(
          "MSwap__AddressHasNoLiquidity"
        );
      });
      it("trasnfers tokens token0 from sender and token1 to sender", async () => {
        const contractStartingBalanceA = await aToken.balanceOf(mSwap.address);
        const contractStartingBalanceB = await bToken.balanceOf(mSwap.address);
        const userStartingBalanceA = await aToken.balanceOf(accounts.deployer);
        const userStartingBalanceB = await bToken.balanceOf(accounts.deployer);

        await aToken.approve(mSwap.address, 1000);
        const tx = await mSwap.swap(1000, aToken.address);
        await tx.wait(1);
        const contractEndingBalanceA = await aToken.balanceOf(mSwap.address);
        const contractEndingBalanceB = await bToken.balanceOf(mSwap.address);
        const userEndingBalanceA = await aToken.balanceOf(accounts.deployer);
        const userEndingBalanceB = await bToken.balanceOf(accounts.deployer);

        assert.equal(
          contractStartingBalanceA.add(BigNumber.from(1000)).toString(),
          contractEndingBalanceA.toString()
        );
        assert(userEndingBalanceB.gt(userStartingBalanceB));
        assert.equal(
          userStartingBalanceA.sub(userEndingBalanceA).toString(),
          contractEndingBalanceA.sub(contractStartingBalanceA).toString()
        );
        assert.equal(
          userEndingBalanceB.sub(userStartingBalanceB).toString(),
          contractStartingBalanceB.sub(contractEndingBalanceB).toString()
        );
      });
    });
  });
});
