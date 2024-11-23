// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Game {
    struct GameState {
        uint256 score;
        uint8[4][4] board;
    }

    mapping(address => GameState) public playerGames;
    mapping(address => uint256) public playerScores;
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
        require(block.timestamp > startTime, "Game has not started yet");
        require(block.timestamp < endTime, "Game has ended");
        require(msg.value >= entryFee, "Insufficient entry fee");
        require(players.length < 2, "Game is full");
        playerGames[msg.sender] = GameState(0, [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]);
        players.push(msg.sender);
    }

    function updateGame(uint256 score, uint8[4][4] memory board) public gameNotEnded {
        playerGames[msg.sender].score = score;
        playerGames[msg.sender].board = board;
        playerScores[msg.sender] = score;
    }

    function endGame() public onlyOwner {
        require(block.timestamp > endTime, "Game is still active");
        gameActive = false;
        distributeRewards();
    }

    function distributeRewards() internal {
        require(players.length == 2, "Not enough players");
        address winner = playerScores[players[0]] > playerScores[players[1]] ? players[0] : players[1];
        payable(winner).transfer(address(this).balance);
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
} 