const config = {
    contractAddress: "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720", // 替换为您的合约地址
    abi: [
                 {
                     "type": "function",
                     "name": "getGameState",
                     "inputs": [],
                     "outputs": [
                         {
                             "name": "",
                             "type": "uint256",
                             "internalType": "uint256"
                         },
                         {
                             "name": "",
                             "type": "uint8[4][4]",
                             "internalType": "uint8[4][4]"
                         }
                     ],
                     "stateMutability": "view"
                 },
                 {
                     "type": "function",
                     "name": "playerGames",
                     "inputs": [
                         {
                             "name": "",
                             "type": "address",
                             "internalType": "address"
                         }
                     ],
                     "outputs": [
                         {
                             "name": "score",
                             "type": "uint256",
                             "internalType": "uint256"
                         }
                     ],
                     "stateMutability": "view"
                 },
                 {
                     "type": "function",
                     "name": "startGame",
                     "inputs": [],
                     "outputs": [],
                     "stateMutability": "nonpayable"
                 },
                 {
                     "type": "function",
                     "name": "updateGame",
                     "inputs": [
                         {
                             "name": "score",
                             "type": "uint256",
                             "internalType": "uint256"
                         },
                         {
                             "name": "board",
                             "type": "uint8[4][4]",
                             "internalType": "uint8[4][4]"
                         }
                     ],
                     "outputs": [],
                     "stateMutability": "nonpayable"
                 }
             ]
};

export default config;
