pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BetaToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("BetaToken", "BETA") {
        _mint(msg.sender, initialSupply);
    }
}
