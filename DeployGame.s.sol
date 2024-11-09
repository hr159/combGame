// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/Game.sol";

contract DeployGame is Script {
    function run() external {
        // 直接硬编码部署者地址（仅用于测试）
        address deployer = 0xYourDeployerAddressHere;
        vm.startBroadcast(deployer);

        // 部署合约
        Game game = new Game();

        // 打印部署者和合约地址
        console.log("Deployer Address:", deployer);
        console.log("Contract Address:", address(game));

        vm.stopBroadcast();
    }
}
