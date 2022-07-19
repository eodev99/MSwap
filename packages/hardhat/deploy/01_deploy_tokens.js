const { ethers } = require("hardhat");
const {
  INITIAL_SUPPLY_BETA,
  INITIAL_SUPPLY_ALPHA,
} = require("../../../helper.config");

const localChainId = "31337";

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  await deploy("AlphaToken", {
    from: deployer,
    log: true,
    waitConfirmations: 2,
    args: [INITIAL_SUPPLY_ALPHA],
  });

  await deploy("BetaToken", {
    from: deployer,
    log: true,
    waitConfirmations: 2,
    args: [INITIAL_SUPPLY_BETA],
  });

  // Getting a previously deployed contract
  const AlphaToken = await ethers.getContract("AlphaToken", deployer);
  const BetaToken = await ethers.getContract("BetaToken", deployer);
};

module.exports.tags = ["all", "tokens"];
