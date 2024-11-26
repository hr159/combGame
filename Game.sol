// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Game {
    struct GameState {
        uint256 score;
        uint8[4][4] board;
    }

    mapping(address => GameState) public playerGames;
    address[] public players;
    address public owner;
    uint256 public entryFee;
    uint256 public startTime;
    uint256 public endTime;
    bool public gameActive;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    modifier gameStarted() {
        require(block.timestamp >= startTime, "Game has not started yet");
        _;
    }

    modifier gameNotEnded() {
        require(block.timestamp <= endTime, "Game has ended");
        _;
    }

    constructor(uint256 _entryFee, uint256 _startTime, uint256 _endTime) {
        owner = msg.sender;
        entryFee = _entryFee;
        startTime = _startTime;
        endTime = _endTime;
        gameActive = true;
    }

    function startGame() public payable gameStarted gameNotEnded {
        require(msg.value >= entryFee, "Insufficient entry fee");
        require(players.length < 2, "Game is full");
        
        // 退还多余的费用
        uint256 excess = msg.value - entryFee;
        if (excess > 0) {
            payable(msg.sender).transfer(excess);
        }
        
        // 保留现有积分，只重置棋盘
        uint256 currentScore = playerGames[msg.sender].score;
        playerGames[msg.sender] = GameState(
            currentScore, 
            [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
        );
        
        // 检查玩家是否已在players数组中
        bool playerExists = false;
        for (uint256 i = 0; i < players.length; i++) {
            if (players[i] == msg.sender) {
                playerExists = true;
                break;
            }
        }
        
        // 只有当玩家不在数组中时才添加
        if (!playerExists) {
            players.push(msg.sender);
        }
    }

    function updateGame(uint256 score, uint8[4][4] memory board) public gameNotEnded {
        uint256 currentScore = playerGames[msg.sender].score;
        if (currentScore < score) {
            playerGames[msg.sender].score = score;
        }
        playerGames[msg.sender].board = board;
    }

    function endGame() public onlyOwner {
        require(block.timestamp > endTime, "Game is still active");
        gameActive = false;
        distributeRewards();
    }

    event RewardDistributed(address indexed winner, uint256 amount);
    event TransferFailed(address indexed recipient);

    function distributeRewards() internal {
        require(players.length == 2, "Not enough players");
        uint256 score1 = playerGames[players[0]].score;
        uint256 score2 = playerGames[players[1]].score;
        
        if (score1 == score2) {
            // 平局情况下平分奖励
            uint256 splitAmount = address(this).balance / 2;
            (bool success1, ) = payable(players[0]).call{value: splitAmount}("");
            if (!success1) emit TransferFailed(players[0]);
            else emit RewardDistributed(players[0], splitAmount);
            
            (bool success2, ) = payable(players[1]).call{value: splitAmount}("");
            if (!success2) emit TransferFailed(players[1]);
            else emit RewardDistributed(players[1], splitAmount);
        } else {
            address winner = score1 > score2 ? players[0] : players[1];
            uint256 amount = address(this).balance;
            (bool success, ) = payable(winner).call{value: amount}("");
            if (!success) emit TransferFailed(winner);
            else emit RewardDistributed(winner, amount);
        }
    }

    function cancelGame() public onlyOwner {
        require(block.timestamp < startTime, "Game has already started");
        gameActive = false;
        refundAll();
    }

    function refundAll() internal {
        for (uint256 i = 0; i < players.length; i++) {
            payable(players[i]).transfer(entryFee);
        }
    }

    function withdraw() public onlyOwner {
        require(!gameActive, "Game is still active");
        payable(owner).transfer(address(this).balance);
    }
    
        // Function to get current game state
    function getGameState() public view returns (uint256, uint8[4][4] memory) {
        return (playerGames[msg.sender].score, playerGames[msg.sender].board);
    }

        // 根据地址查询游戏状态
    function getGameStateByAddress(address player) public view returns (uint256, uint8[4][4] memory) {
        return (playerGames[player].score, playerGames[player].board);
    }

    // 添加视图函数查询游戏时间
    function getGameTimes() public view returns (
        uint256 _startTime,
        uint256 _endTime,
        uint256 _currentTime,
        bool _isActive
    ) {
        return (
            startTime,
            endTime,
            block.timestamp,
            gameActive
        );
    }


} 