const { ethers } = require("hardhat");
const { use, expect, assert } = require("chai");

//TODO: add chain check
describe("MSwap", () => {
  let aToken, bToken, mSwap;
  beforeEach(async () => {
    const accounts = await getNamedAccounts();
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
  describe("addLiquidity", () => {});
});
