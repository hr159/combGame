const config = {
    contractAddress: "0x700b6A60ce7EaaEA56F065753d8dcB9653dbAD35", // 替换为您的合约地址
    abi: [
        {
            "inputs": [],
            "name": "getGameState",
            "outputs": [
                { "internalType": "uint256", "name": "", "type": "uint256" },
                { "internalType": "uint8[4][4]", "name": "", "type": "uint8[4][4]" }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
            "name": "playerGames",
            "outputs": [{ "internalType": "uint256", "name": "score", "type": "uint256" }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "startGame",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                { "internalType": "uint256", "name": "score", "type": "uint256" },
                { "internalType": "uint8[4][4]", "name": "board", "type": "uint8[4][4]" }
            ],
            "name": "updateGame", // 确保这里有函数名
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ]
};

export default config;
