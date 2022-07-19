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
      //Arrange
      const aTokenAddress = await mSwap.token0();
      assert.equal(aTokenAddress, aToken.address);
    });
    it("initialises reserves at 0", async () => {});
  });
  describe("addLiquidity", () => {});
});
