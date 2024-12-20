import config from './config.js'; // 导入配置文件
/**
 * Created by JYL on 2014/6/8.
 */
var board = new Array(); // 全局变量
var hasConflicted = new Array();
var score = 0;
// var isTransactionPending = false; // 用于跟踪交易状态

// 智能合约地址和 ABI
const contractAddress = config.contractAddress; // 使用配置文件中的合约地址
const abi = config.abi; // 使用配置文件中的 ABI

let provider;
let signer;
let gameContract;

window.onload = async function() {
    await initEthereum();
    await getGameTime(); // 获取游戏时间
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
        
        // 初始化完成后获取游戏时间
        await getGameTime();
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
    console.log("startGame");
    try {
        const entryFee = ethers.parseEther(config.entryFee);
        const tx = await gameContract.startGame({ value: entryFee });
        await waitForTransaction(tx);
        newgame(); // 初始化游戏
    } catch (error) {
        console.error("Error starting game on blockchain:", error);
        // 提取错误信息并显示给用户
        let errorMessage = "游戏启动失败";
        if (error.reason) {
            // 如果是智能合约的错误信息
            errorMessage = error.reason || "游戏启动失败，请检查您的钱包设置";
        } else if (error.message) {
            // 如果是其他类型的错误
            errorMessage = error.message;
        }
        alert(errorMessage);
    }
}

function restartgame() {
    $("#gameover").remove();
    moveCount = 0;
    updateScore(0);
    newgame();
}

// 将函数暴露到全局作用域
window.restartgame = restartgame;

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
    //随机一位置
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


// 修改 updateGame 函数
async function updateGame() {
    const score = calculateScore();
    const boards = getBoard();

    console.log("准备上链的数据：");
    console.log("分数：", score);
    console.log("棋盘状态：", JSON.stringify(boards, null, 2));

    try {
        const tx = await gameContract.updateGame(score, boards);
        console.log("上链交易详情：", tx);

        await waitForTransaction(tx);
        console.log("数据上链成功！");
        updateBoardView();
    } catch (error) {
        console.error("数据上链失败：", error);
        // 提取错误信息并显示给用户
        let errorMessage = "数据上链失败";
        if (error.reason) {
            // 如果是智能合约的错误信息
            errorMessage = error.reason || "数据上链失败，请检查您的钱包设置";
        } else if (error.message) {
            // 如果是其他类型的错误
            errorMessage = error.message;
        }
        alert(errorMessage);
        throw error; // 继续抛出错误以便调用者处理
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
        console.error("合约地址：", contractAddress);
        console.error("ABI：", JSON.stringify(abi, null, 2));
        console.error("网络：", provider.network); // 输出网络信息
        return null;
    }
}

// 计算当前游戏得分
function calculateScore() {
    // 直接返回全局变量 score
    // 因为在移动和并数字的过程中，score 已经被更新了
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
    await startGame(); // 点击按钮时调 startGame
});
// 添加计步器
var moveCount = 0;
var isUploading = false;

// 修改键盘事件监听器
$(document).keydown(async function (event) {
    if (isUploading) {
        alert("正在上链中，请等待...");
        return;
    }

    let moved = false;
    switch (event.keyCode) {
        case 37://left
            if (moveLeft()) {
                moved = true;
            }
            break;
        case 38://up
            if (moveUp()) {
                moved = true;
            }
            break;
        case 39://right
            if (moveRight()) {
                moved = true;
            }
            break;
        case 40://down
            if (moveDown()) {
                moved = true;
            }
            break;
        default:
            break;
    }

    if (moved) {
        moveCount++;
        console.log("移动次数：", moveCount);
        
        setTimeout(generateOneNumber, 210);
        setTimeout(async () => {
            await isgameover();
        }, 300);

        // 使用配置中的步数阈值
        if (moveCount >= config.moveCountThreshold) {
            isUploading = true;
            try {
                await updateGame();
                moveCount = 0; // 重置计步器
            } finally {
                isUploading = false;
            }
        }
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

async function gameover() {
    try {
        // 先上传最终分数
        isUploading = true;
        await updateGame(); // 确保最终状态上传到链上
        
        // 调用合约的结束游戏函数
        // const tx = await gameContract.endGame();
        // await waitForTransaction(tx);
        
        console.log("游戏结束，最终分数已上链！");
        
        // 显示游戏结束界面
        $("#grid-container").append(
            "<div id='gameover' class='gameover'>" +
            "<p>本次得分</p>" +
            "<span>" + score + "</span>" +
            "<p>分数已上链</p>" +
            "<a href='javascript:restartgame();' id='restartgamebutton'>重新开始</a>" +
            "</div>"
        );
        
        var gameover = $("#gameover");
        gameover.css("width", "500px");
        gameover.css("height", "500px");
        gameover.css("background-color", "rgba(0, 0, 0, 0.5)");
        
    } catch (error) {
        console.error("游戏结束上链失败：", error);
        let errorMessage = "游戏结束上链失";
        if (error.reason) {
            errorMessage = error.reason;
        } else if (error.message) {
            errorMessage = error.message;
        }
        alert(errorMessage);
    } finally {
        isUploading = false;
    }
}

// 修改 isgameover 函数为异步函数
async function isgameover() {
    if (nospace(board) && nomove(board)) {
        await gameover();
    }
}

// 查询链上游戏状态
async function checkGameState() {
    try {
        console.log("正在从链上获取游戏状态...");
        const [score, board] = await gameContract.getGameState();
        console.log("链上游戏状态：");
        console.log("分数：", score.toString());
        console.log("棋盘：", JSON.stringify(board, null, 2));
        alert(`当前游戏状态：\n分数：${score}\n棋盘：${JSON.stringify(board, null, 2)}`);
    } catch (error) {
        console.error("获取链上游戏状态失败：", error);
        // 提取错误信息并显示给用户
        let errorMessage = "获取游戏状态失败";
        if (error.reason) {
            // 如果是智能合约的错误信息
            errorMessage = error.reason || "获取游戏状态失败，请检查您的钱包设置";
        } else if (error.message) {
            // 如果是其他类型的错误
            errorMessage = error.message;
        }
        alert(errorMessage);
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

async function endGame() {
    try {
        const tx = await gameContract.endGame();
        await waitForTransaction(tx);
        console.log("游戏结束，奖励已分配！");
        alert("游戏结束，奖励已分配！");
    } catch (error) {
        console.error("结束游戏失败：", error);
        // 提取错误信息并显示给用户
        let errorMessage = "游戏结束失败";
        if (error.reason) {
            // 如果是智能合约的错误信息
            errorMessage = error.reason || "游戏结束失败，请检查您的钱包设置";
        } else if (error.message) {
            // 如果是其他类型的错误
            errorMessage = error.message;
        }
        alert(errorMessage);
    }
}

// gameContract.on("MoveExecuted", (player, direction, newScore, newBoard) => {
//     console.log(`Player: ${player}, Direction: ${direction}, New Score: ${newScore}`);
//     console.log("New Board:", newBoard);
//     updateBoardView();
// });

// 添加获取游戏时间的函数
async function getGameTime() {
    try {
        // 直接使用已初始化的 gameContract
        const [startTime, endTime, currentTime, isActive] = await gameContract.getGameTimes();

        if (startTime && endTime) {
            // 转换时间戳为可读格式
            const startDate = new Date(Number(startTime) * 1000).toLocaleString();
            const endDate = new Date(Number(endTime) * 1000).toLocaleString();

            // 更新 DOM
            document.getElementById('startTime').textContent = startDate;
            document.getElementById('endTime').textContent = endDate;
            document.getElementById('gameTime').style.display = 'block';
        }
    } catch (error) {
        console.error('获取游戏时间失败:', error);
        document.getElementById('gameTime').style.display = 'none';
    }
}

// 页面加载时获取时间
window.addEventListener('load', getGameTime);