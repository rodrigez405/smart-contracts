import { ethers, upgrades } from "hardhat";

async function main() {

  const marketplace = await ethers.getContractAt("ArttacaMarketplaceUpgradeable", "0x05930E48405725D35c69aC3c15F073A71C65f047")

  let tx = await marketplace.addOperator(process.env.TEST_OPERATOR_ADDRESS);
  await tx.wait();

  console.log(`Added operator to marketplace ${process.env.TEST_OPERATOR_ADDRESS}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
