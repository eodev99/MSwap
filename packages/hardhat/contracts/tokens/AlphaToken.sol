pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract AlphaToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("AlphaToken", "ALPHA") {
        _mint(msg.sender, initialSupply);
    }
}
