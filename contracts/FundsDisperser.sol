// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract FundsDisperser {
    event Transfer(address indexed from, address indexed to, uint value);

    function disperseEther(
        address[] memory wallets,
        uint[] calldata amounts
    ) external payable {
        uint length = wallets.length;
        for (uint i = 0; i < length; ++i) {
            payable(wallets[i]).transfer(amounts[i]);
            emit Transfer(msg.sender, wallets[i], amounts[i]);
        }
        if (address(this).balance > 0) {
            payable(msg.sender).transfer(address(this).balance);
        }
    }

    function disperseTokens(
        IERC20 token,
        address[] calldata wallets,
        uint[] calldata amounts
    ) external {
        uint length = wallets.length;
        uint total = 0;
        for (uint i = 0; i < length; ++i) {
            total += amounts[i];
        }
        require(token.transferFrom(msg.sender, address(this), total));
        for (uint i = 0; i < length; ++i) {
            require(token.transfer(wallets[i], amounts[i]));
        }
    }
}
