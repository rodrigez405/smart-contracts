import { ethers } from "hardhat";

async function main() {

  const newProtocolFee = ["0x681bC8E9d4f71C2BC5bC64ce657E8C89E69D4c64", 300]

  const marketplace = await ethers.getContractAt("ArttacaMarketplaceUpgradeable", "0x05930E48405725D35c69aC3c15F073A71C65f047")

  let tx = await marketplace.changeProtocolFee(newProtocolFee);
  await tx.wait();

  console.log(`Change protocol fee in the marketplace to ${JSON.stringify(newProtocolFee)}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
