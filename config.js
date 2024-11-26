const config = {
	entryFee: "1", // 入场费金额（以 ETH 为单位）
    moveCountThreshold: 500, // 添加步数阈值配置
    contractAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // 替换为您的合约地址
    abi: [
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "_entryFee",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "_startTime",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "_endTime",
					"type": "uint256"
				}
			],
			"stateMutability": "nonpayable",
			"type": "constructor"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "address",
					"name": "winner",
					"type": "address"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "amount",
					"type": "uint256"
				}
			],
			"name": "RewardDistributed",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "address",
					"name": "recipient",
					"type": "address"
				}
			],
			"name": "TransferFailed",
			"type": "event"
		},
		{
			"inputs": [],
			"name": "cancelGame",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "endGame",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "endTime",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "entryFee",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "gameActive",
			"outputs": [
				{
					"internalType": "bool",
					"name": "",
					"type": "bool"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "getGameState",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				},
				{
					"internalType": "uint8[4][4]",
					"name": "",
					"type": "uint8[4][4]"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "player",
					"type": "address"
				}
			],
			"name": "getGameStateByAddress",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				},
				{
					"internalType": "uint8[4][4]",
					"name": "",
					"type": "uint8[4][4]"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "getGameTimes",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "_startTime",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "_endTime",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "_currentTime",
					"type": "uint256"
				},
				{
					"internalType": "bool",
					"name": "_isActive",
					"type": "bool"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "owner",
			"outputs": [
				{
					"internalType": "address",
					"name": "",
					"type": "address"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "",
					"type": "address"
				}
			],
			"name": "playerGames",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "score",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"name": "players",
			"outputs": [
				{
					"internalType": "address",
					"name": "",
					"type": "address"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "startGame",
			"outputs": [],
			"stateMutability": "payable",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "startTime",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "score",
					"type": "uint256"
				},
				{
					"internalType": "uint8[4][4]",
					"name": "board",
					"type": "uint8[4][4]"
				}
			],
			"name": "updateGame",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "withdraw",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		}
	]
};

export default config;
