// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Game {
    struct GameState {
        uint256 score;
        uint8[4][4] board; // 4x4 matrix to represent the game board
    }

    mapping(address => GameState) public playerGames;

    // Function to start a new game
    function startGame() public {
        playerGames[msg.sender] = GameState(0, [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]);
    }

    // Function to update game state
    function updateGame(uint256 score, uint8[4][4] memory board) public {
        playerGames[msg.sender].score = score;
        playerGames[msg.sender].board = board;
    }

    // Function to get current game state
    function getGameState() public view returns (uint256, uint8[4][4] memory) {
        return (playerGames[msg.sender].score, playerGames[msg.sender].board);
    }
} 