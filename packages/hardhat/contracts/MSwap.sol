pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

error MSwap__Amount_Is_0();
error MSwap__AddressHasNoLiquidity(address addressEntered);
error MSwap__InvariantBroken(uint256 o, uint256 i, uint256 kNew);

contract MSwap is Ownable {
    //Type declarations

    //State variables

    //TODO can these be uint256?
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

    function getAmountOut(uint256 amountIn, address addressIn)
        public
        returns (uint256)
    {
        if (reserves[addressIn] == 0) {
            revert MSwap__AddressHasNoLiquidity(addressIn);
        }
        address addressOut = addressIn == address(token0)
            ? address(token1)
            : address(token0);
        uint256 numerator = amountIn * reserves[addressOut];
        uint256 denominator = reserves[addressIn] + amountIn;
        return numerator / denominator;
    }

    function swap(uint256 amountIn, address addressIn) external {
        uint256 amountOut = getAmountOut(amountIn, addressIn);
        address addressOut;
        ERC20 tokenIn;
        ERC20 tokenOut;
        if (addressIn == address(token0)) {
            addressOut = address(token1);
            tokenIn = token0;
            tokenOut = token1;
        } else {
            addressOut = address(token0);
            tokenIn = token1;
            tokenOut = token0;
        }

        reserves[address(addressIn)] += amountIn;
        reserves[address(addressOut)] -= amountOut;

        //transfer
        require(tokenIn.transferFrom(msg.sender, address(this), amountIn));
        require(tokenOut.transfer(msg.sender, amountOut));
    }
}
