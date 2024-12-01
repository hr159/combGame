# ComboGame 游戏以太坊全链版本
# 请使用dev分支

## 项目简介
这是一个基于以太坊的 ComboGame，所有游戏状态都记录在区块链上。玩家可以通过支付以太币来保存游戏状态，并在需要时回滚到某个状态继续游戏。

## 部署智能合约指南

### 1. 安装 Foundry
如果您还没有安装 Foundry，请按照以下命令进行安装：
curl -L https://foundry.paradigm.xyz | bash
foundryup


### 2. 创建新的 Foundry 项目
在您希望创建项目的目录中，运行以下命令：
forge init MyGameProject
cd MyGameProject



### 3. 添加智能合约
将文件 `Game.sol` 复制到 `src` 目录下



### 4. 编译智能合约
在项目根目录下，运行以下命令以编译智能合约：
forge build

## 获取合约地址和 ABI
MyGameProject/
├── out/
├── script/
│   └── DeployGame.s.sol
├── src/
│   └── Game.sol
├── ...

在 out 目录中，找到 Game.json 文件并打开它。您应该能看到类似以下的内容：
   {
       "abi": [ /* ABI array here */ ],
       ...
   }

### 1. 获取合约地址
在成功部署合约后，您可以在控制台中查看合约地址。请注意该地址以便在前端代码中使用。

### 2. 获取合约 ABI
合约的 ABI 在编译合约后生成。您可以在 `out` 目录中找到生成的 ABI 文件，文件名通常为 `Game.json`。打开该文件以查看合约的 ABI 结构。

### 3. 更新 `main.js`
在 `main.js` 中，将合约地址和 ABI 更新为实际值，以便与合约进行交互。


### 4.本地测试链配置和使用

### 启动本地测试链
使用以下命令启动 Anvil（Foundry 的本地测试链）：
anvil
在启动 Anvil 后，您可以使用 --accounts 参数来指定要创建的账户数量。例如，如果您想创建 10 个账户，可以使用以下命令：
anvil --accounts 10
启动后，Anvil 将显示：
- 可用的测试账户及其私钥
- RPC 端点（默认为 http://127.0.0.1:8545）
- Chain ID（默认为 31337）


### 5. 运行部署脚本
在项目根目录下，运行以下命令以部署智能合约：
 forge create --rpc-url  127.0.0.1:8545 --private-key 私钥 src/Game.sol:Game --constructor-args-path constructorArgs.json
##constructorArgs.json为配置文件
文件内容:
[
     "100",//消耗代币设置
     "1674275200",//开始时间戳
    "1674364800" //结束时间戳
]
这里您也可以使用remix连接本地链去部署更灵活
生成的合约地址配置到3中

### 6. 验证合约部署
部署成功后，您可以在控制台中查看合约地址。您可以使用该地址与合约进行交互。

## 其他说明
- 请确保您已安装 MetaMask，并连接到正确的以太坊网络。
- 在 `main.js` 中，您需要更新智能合约地址和 ABI，以便与合约进行交互。
