const { ethers } = require("hardhat");

const localChainId = "31337";

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  const aToken = await ethers.getContract("AlphaToken");
  const bToken = await ethers.getContract("BetaToken");

  const args = [aToken.address, bToken.address];
  await deploy("MSwap", {
    from: deployer,
    log: true,
    waitConfirmations: 2,
    args,
  });

  const mSwap = await ethers.getContract("MSwap", deployer);
};

module.exports.tags = ["all", "mSwap"];
