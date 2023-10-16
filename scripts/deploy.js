const hre = require("hardhat");

async function sleep(ms){
  return new Promise((resolve) => setTimeout(resolve,ms));
}

async function main() {

  //Deploying the CryptoDevsNFT Contract
  const nftContract  = await hre.ethers.deployContract("CryptoDevsNFT");
  console.log("Deploying  CryptoDevsNFT  Smartcontract");
 
  await nftContract.waitForDeployment();

  console.log("CryptoDevsNFT deployed to:",nftContract.target);

  //Deploying the FakeNFTMarketplace
  const fakeNFTMarketplacecontract = await hre.ethers.deployContract("FakeNFTMarketplace");
  console.log("Deploying FakeNFTMarketplace Smartcontract");
  await fakeNFTMarketplacecontract.waitForDeployment();

  console.log("FakeNFTMarketplace deployed to:", fakeNFTMarketplacecontract.target);

  //Deploying the CryptoDevsDAO contract
  const amount = hre.ethers.parseEther("0.0001");

  const DAOContract = await hre.ethers.deployContract("CryptoDevsDAO",[fakeNFTMarketplacecontract.target,nftContract.target],{value:amount,});
  console.log("Deploying CryptoDevsDAO Smartcontract");
  await DAOContract.waitForDeployment();

  console.log("CryptoDevsDAO deployed to:",DAOContract.target);

  await sleep(30*1000);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
})

