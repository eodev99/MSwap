const { ethers } = require("hardhat");
const { use, expect, assert } = require("chai");
const {
  INITIAL_SUPPLY_ALPHA,
  INITIAL_SUPPLY_BETA,
} = require("../../../../helper.config");

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
});
