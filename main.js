import config from './config.js'; // 导入配置文件
/**
 * Created by JYL on 2014/6/8.
 */
var board = new Array(); // 全局变量
var hasConflicted = new Array();
var score = 0;
var isTransactionPending = false; // 用于跟踪交易状态

// 智能合约地址和 ABI
const contractAddress = config.contractAddress; // 使用配置文件中的合约地址
const abi = config.abi; // 使用配置文件中的 ABI

let provider;
let signer;
let gameContract;

window.onload = function() {
    // 页面加载时不再自动开始游戏
};


// 初始化以太坊连接
async function initEthereum() {
    if (window.ethereum) {
        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner(); // 获取签名者
        gameContract = new ethers.Contract(contractAddress, abi, signer);

        // 检查网络
        const network = await provider.getNetwork();
        console.log("Connected to network:", network);
    } else {
        alert("请安装 MetaMask!");
    }
}

// 启动新游戏
async function newgame() {
    try {
        // 初始化棋盘格
        init();
        // 在随机两个格子生成数字
        generateOneNumber();
        generateOneNumber();
    } catch (error) {
        console.error("Error starting new game:", error);
    }
}

// 开始游戏并上链
async function startGame() {
    if (isTransactionPending) {
        alert("游戏启动中，请等待上链操作后开始游戏"); // 改为弹窗提示
        return; // 如果有未完成的交易，阻止移动
    }
    console.log("startGame");
    try {
        isTransactionPending = true; // 标记交易开始
        await initEthereum();
        await gameContract.startGame(); // 调用智能合约的 startGame 函数
        newgame(); // 初始化游戏
    } catch (error) {
        console.error("Error starting game on blockchain:", error);
    } finally {
        isTransactionPending = false; // 标记交易结束
    }
}

function restartgame() {
    $("#gameover").remove();
    updateScore(0);
    newgame();
}

function init() {
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            var gridCell = $("#grid-cell-" + i + "-" + j);
            gridCell.css("top", getPosTop(i, j));
            gridCell.css("left", getPosLeft(i, j));
        }
    }

    for (var i = 0; i < 4; i++) {
        board[i] = new Array();
        hasConflicted[i] = new Array();
        for (var j = 0; j < 4; j++) {
            board[i][j] = 0;
            hasConflicted[i][j] = false;
        }
    }
    console.log(board);
    updateBoardView();
    score = 0;
}

function updateBoardView() {
    console.log("updateBoardView");
    $(".number-cell").remove();
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            $("#grid-container").append("<div class='number-cell' id='number-cell-" + i + "-" + j + "'></div>");
            var numberCell = $("#number-cell-" + i + "-" + j);

            if (board[i][j] == 0) {
                numberCell.css("width", "0px");
                numberCell.css("height", "0px");
                numberCell.css("top", getPosTop(i, j) + 50);
                numberCell.css("left", getPosLeft(i, j) + 50);
            } else {
                numberCell.css("width", "100px");
                numberCell.css("height", "100px");
                numberCell.css("top", getPosTop(i, j));
                numberCell.css("left", getPosLeft(i, j));
                numberCell.css("background-color", getNumberBackgroundColor(board[i][j]));
                numberCell.css("background-image", 'url('+getNumberBackgroundImage(board[i][j])+')');
                numberCell.css("color", getNumberColor(board[i][j]));
//                numberCell.text(board[i][j]);
            }

            hasConflicted[i][j] = false;
        }
    }

    $(".number-cell").css("line-height", "100px");
    $(".number-cell").css("font-size", "60px");
}

function generateOneNumber() {
    if (nospace(board)) {
        return false;
    }
    //随机一个位置
    var randx = parseInt(Math.floor(Math.random() * 4));
    var randy = parseInt(Math.floor(Math.random() * 4));
    while (true) {
        if (board[randx][randy] == 0) {
            break;
        }
        var randx = parseInt(Math.floor(Math.random() * 4));
        var randy = parseInt(Math.floor(Math.random() * 4));
    }

    //随机一个数字
    var randNumber = Math.random() < 0.5 ? 2 : 4;

    //在随机位置显示随机数字
    board[randx][randy] = randNumber;
    ShowNumberWithAnimation(randx, randy, randNumber);

    return true;
}

// 更新游戏状态
async function updateGame() {
    const score = calculateScore();
    const boards = getBoard();

    console.log("准备上链的数据：");
    console.log("分数：", score);
    console.log("棋盘状态：", JSON.stringify(boards, null, 2));

    try {
        isTransactionPending = true; // 标记交易开始
        const tx = await gameContract.updateGame(score, boards);
        console.log("上链交易详情：", tx);

        // 等待交易确认后更新界面
        await waitForTransaction(tx);
        console.log("数据上链成功！");
        updateBoardView(); // 更新界面
    } catch (error) {
        console.error("数据上链失败：", error);
    } finally {
        isTransactionPending = false; // 标记交易结束
    }
}

// 获取游戏状态
async function getGameState() {
    try {
        console.log("正在从链上获取游戏状态...");
        const [score, board] = await gameContract.getGameState();
        console.log("链上游戏状态：");
        console.log("分数：", score.toString());
        console.log("棋盘：", JSON.stringify(board, null, 2));
        // 更新前端显示...
        return [score, board];
    } catch (error) {
        console.error("获取链上游戏状态失败：", error);
        return null;
    }
}

// 计算当前游戏得分
function calculateScore() {
    // 直接返回全局变量 score
    // 因为在移动和合并数字的过程中，score 已经被更新了
    return score;
}

// 在适当的地方调用 updateGame 和 getGameState 函数


// 在合并数字的地方调用
// 例如：当两个数字合并时
// updateScore(mergedNumber); // mergedNumber 是合并后的数字

// 获取当前棋盘状态
function getBoard() {
    // 创建一个新的二维数组来存储棋盘状态
    let currentBoard = Array(4).fill().map(() => Array(4).fill(0));
    
    // 复制当前棋盘状态
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            // 确保数值在 uint8 范围内 (0-255)
            currentBoard[i][j] = Math.min(board[i][j], 255);
        }
    }
    
    return currentBoard;
}

document.getElementById('newgamebutton').addEventListener('click', async function(event) {
    event.preventDefault();
    await startGame(); // 点击按钮时调用 startGame
});

// 键盘事件监听
$(document).keydown(async function (event) {
    if (isTransactionPending) {
        alert("操作进行中，请等待上链后再操作"); // 改为弹窗提示
        return; // 如果有未完成的交易，阻止移动
    }

    switch (event.keyCode) {
        case 37://left
            if (moveLeft()) {
                setTimeout(generateOneNumber, 210);
                setTimeout(isgameover, 300);
                // 移动完成后上链
                setTimeout(async () => {
                    await updateGame();
                }, 350);
            }
            break;
        case 38://up
            if (moveUp()) {
                setTimeout(generateOneNumber, 210);
                setTimeout(isgameover, 300);
                // 移动完成后上链
                setTimeout(async () => {
                    await updateGame();
                }, 350);
            }
            break;
        case 39://right
            if (moveRight()) {
                setTimeout(generateOneNumber, 210);
                setTimeout(isgameover, 300);
                // 移动完成后上链
                setTimeout(async () => {
                    await updateGame();
                }, 350);
            }
            break;
        case 40://down
            if (moveDown()) {
                setTimeout(generateOneNumber, 210);
                setTimeout(isgameover, 300);
                // 移动完成后上链
                setTimeout(async () => {
                    await updateGame();
                }, 350);
            }
            break;
        default :
            break;
    }
});

function moveLeft() {
    if (!canMoveLeft(board)) {
        return false;
    }
    //moveLeft
    for (var i = 0; i < 4; i++) {
        for (var j = 1; j < 4; j++) {
            if (board[i][j] != 0) {
                for (var k = 0; k < j; k++) {
                    if (board[i][k] == 0 && noBlokHorizontalCol(i, k, j, board)) {
                        //move
                        showMoveAnimation(i, j, i, k);
                        board[i][k] = board[i][j];
                        board[i][j] = 0;
                        // playMoveSound(); // 播放滑动音效
                        continue;
                    } else if (board[i][k] == board[i][j] && noBlokHorizontalCol(i, k, j, board) && !hasConflicted[i][k]) {
                        //move
                        showMoveAnimation(i, j, i, k);
                        //add
                        board[i][k] += board[i][j];
                        board[i][j] = 0;
                        // playMergeSound(); // 播放合并音效

                        //add score
                        score += board[i][k];
                        updateScore(score);

                        hasConflicted[i][k] = true;
                        continue;
                    }
                }
            }
        }
    }
    setTimeout(updateBoardView, 200);
    return true;
}

function moveRight() {
    if (!canMoveRight(board)) {
        return false;
    }
    //moveRight
    for (var i = 0; i < 4; i++) {
        for (var j = 2; j >= 0; j--) {
            if (board[i][j] != 0) {
                for (var k = 3; k > j; k--) {
                    if (board[i][k] == 0 && noBlokHorizontalCol(i, j, k, board)) {
                        //move
                        showMoveAnimation(i, j, i, k);
                        board[i][k] = board[i][j];
                        board[i][j] = 0;
                        // playMoveSound(); // 播放滑动音效

                        continue;
                    } else if (board[i][k] == board[i][j] && noBlokHorizontalCol(i, j, k, board) && !hasConflicted[i][k]) {
                        //move
                        showMoveAnimation(i, j, i, k);
                        //add
                        board[i][k] += board[i][j];
                        board[i][j] = 0;
                        // playMergeSound(); // 播放合并音效

                        //add score
                        score += board[i][k];
                        updateScore(score);

                        hasConflicted[i][k] = true;
                        continue;
                    }
                }
            }
        }
    }

    setTimeout(updateBoardView, 200);
    return true;
}

function moveUp() {
    if (!canMoveUp(board)) {
        return false;
    }
    //moveUp
    for (var i = 1; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            if (board[i][j] != 0) {
                for (var k = 0; k < i; k++) {
                    if (board[k][j] == 0 && noBlokHorizontalRow(k, i, j, board)) {
                        //move
                        showMoveAnimation(i, j, k, j);
                        board[k][j] = board[i][j];
                        board[i][j] = 0;
                        // playMoveSound(); // 播放滑动音效

                        continue;
                    } else if (board[k][j] == board[i][j] && noBlokHorizontalRow(k, i, j, board) && !hasConflicted[k][j]) {
                        //move
                        showMoveAnimation(i, j, k, j);
                        //add
                        board[k][j] += board[i][j];
                        board[i][j] = 0;
                        // playMergeSound(); // 播放合并音效

                        //add score
                        score += board[k][j];
                        updateScore(score);

                        hasConflicted[k][j] = true;
                        continue;
                    }
                }
            }
        }
    }

    setTimeout(updateBoardView, 200);
    return true;
}

function moveDown() {
    if (!canMoveDown(board)) {
        return false;
    }
    //moveDown
    for (var i = 2; i >= 0; i--) {
        for (var j = 0; j < 4; j++) {
            if (board[i][j] != 0) {
                for (var k = 3; k > i; k--) {
                    if (board[k][j] == 0 && noBlokHorizontalRow(i, k, j, board)) {
                        //move
                        showMoveAnimation(i, j, k, j);
                        board[k][j] = board[i][j];
                        board[i][j] = 0;
                        // playMoveSound(); // 播放滑动音效
                        continue;
                    } else if (board[k][j] == board[i][j] && noBlokHorizontalRow(i, k, j, board) && !hasConflicted[k][j]) {
                        //move
                        showMoveAnimation(i, j, k, j);
                        //add
                        board[k][j] += board[i][j];
                        board[i][j] = 0;
                        // playMergeSound(); // 播放合并音效
                        //add score
                        score += board[k][j];
                        updateScore(score);

                        hasConflicted[k][j] = true;
                        continue;
                    }
                }
            }
        }
    }

    setTimeout(updateBoardView, 200);
    return true;
}

function isgameover() {
    if (nospace(board) && nomove(board)) {
        gameover();
    }
}

function gameover() {
    alert("gameover!");
    $("#grid-container").append("<div id='gameover' class='gameover'><p>本次得分</p><span>" + score + "</span><a href='javascript:restartgame();' id='restartgamebutton'>Restart</a></div>");
    var gameover = $("#gameover");
    gameover.css("width", "500px");
    gameover.css("height", "500px");
    gameover.css("background-color", "rgba(0, 0, 0, 0.5)");
}

// 查询链上游戏状态
async function checkGameState() {
    try {
        console.log("正在从链上获取游戏状态...");
        const [score, board] = await gameContract.getGameState();
        console.log("链上游戏状态：");
        console.log("分数：", score.toString());
        console.log("棋盘：", JSON.stringify(board, null, 2));
    } catch (error) {
        console.error("获取链上游戏状态失败：", error);
        console.error("合约地址：", contractAddress);
        console.error("ABI：", JSON.stringify(abi, null, 2));
        console.error("网络：", provider.network); // 输出网络信息
    }
}

// 事件监听器
document.getElementById('checkstatebutton').addEventListener('click', async function(event) {
    event.preventDefault();
    await checkGameState(); // 点击按钮时调用 checkGameState
});

async function waitForTransaction(tx) {
    try {
        console.log("等待交易确认...");
        await tx.wait(); // 等待交易确认
        console.log("交易已确认！");
    } catch (error) {
        console.error("交易确认失败：", error);
    }
}