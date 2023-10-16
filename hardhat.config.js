require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity:"0.8.18",
  networks:{
    sepolia:{
      url:process.env.RPC_URL,
      accounts:[process.env.PRIVATE_KEY]
    }
  }
}