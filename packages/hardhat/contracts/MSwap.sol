pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

error MSwap__Amount_Is_0();
error MSwap__AmountInTooSmall();
error MSwap__AddressHasNoLiquidity(address addressEntered);
error MSwap__InvariantBroken(uint256 o, uint256 i, uint256 kNew);

contract MSwap is Ownable {
    //Type declarations

    //State variables

    //TODO can these be uint256?
    mapping(address => uint256) public reserves;
    ERC20 public immutable token0;
    ERC20 public immutable token1;
    address public immutable feeTaker;
    uint256 public immutable feeBasisPoints;

    //Events

    //Functions

    constructor(
        address token0Address,
        address token1Address,
        address feeTakerAddress,
        uint256 feePoints
    ) {
        token0 = ERC20(token0Address);
        token1 = ERC20(token1Address);
        reserves[token0Address] = 0;
        reserves[token1Address] = 0;
        feeTaker = feeTakerAddress;
        feeBasisPoints = feePoints;
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

    function getAmountOutWithFee(uint256 amountIn, address addressIn)
        public
        view
        returns (uint256)
    {
        if (reserves[addressIn] == 0) {
            revert MSwap__AddressHasNoLiquidity(addressIn);
        }
        address addressOut = addressIn == address(token0)
            ? address(token1)
            : address(token0);
        uint256 amountInMinusFee = (amountIn * (10000 - feeBasisPoints));
        uint256 numerator = amountInMinusFee * reserves[addressOut];
        uint256 denominator = (reserves[addressIn] * 10000) + amountInMinusFee;
        return (numerator / denominator);
    }

    function swap(uint256 amountIn, address addressIn) external {
        if ((amountIn / 10000) * 10000 != amountIn) {
            revert MSwap__AmountInTooSmall();
        }
        uint256 amountOut = getAmountOutWithFee(amountIn, addressIn);
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

        //TODO: refactor to do fee calculation in get amountOutCalc
        uint256 feeToPay = calculateFee(amountIn);

        //transfer
        require(tokenIn.transferFrom(msg.sender, feeTaker, feeToPay));
        require(
            tokenIn.transferFrom(msg.sender, address(this), amountIn - feeToPay)
        );
        require(tokenOut.transfer(msg.sender, amountOut));
    }

    //TODO add minimum value for amount in (10000)
    function calculateFee(uint256 amount) internal view returns (uint256) {
        uint256 feeToTake = (amount * feeBasisPoints) / 10000;
        return feeToTake;
    }
}
