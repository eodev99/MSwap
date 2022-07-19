pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

error MSwap__Amount_Is_0();

contract MSwap is Ownable {
    //Type declarations

    //State variables
    mapping(address => uint256) public reserves;
    ERC20 public immutable token0;
    ERC20 public immutable token1;

    //Events

    //Functions

    constructor(address token0Address, address token1Address) {
        token0 = ERC20(token0Address);
        token1 = ERC20(token1Address);
        reserves[token0Address] = 0;
        reserves[token1Address] = 0;
    }

    receive() external payable {}

    fallback() external payable {}

    function addLiquidity(uint256 amount0, uint256 amount1) external {
        if (amount0 == 0 || amount1 == 0) {
            revert MSwap__Amount_Is_0();
        }
        reserves[address(token0)] += amount0;
        reserves[address(token1)] += amount1;
        require(token0.transferFrom(msg.sender, address(this), amount0));
        require(token1.transferFrom(msg.sender, address(this), amount1));
    }
}
