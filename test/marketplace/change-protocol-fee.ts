import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { deployMarketplace } from "./util/fixtures";
import {BigNumber} from "ethers";

const protocolFee = ["0x681bC8E9d4f71C2BC5bC64ce657E8C89E69D4c64", 300]
describe("ArttacaMarketplaceUpgradeable protocol", function () {
  let erc721, owner, user , marketplace;
  beforeEach(async () => {
      ({ erc721, owner, user , marketplace } = await loadFixture(deployMarketplace));
  });


  it("Change protocol fee by owner succeed", async function () {
    const tx = await marketplace.changeProtocolFee(protocolFee)
    await tx.wait();
    const changedFee = await marketplace.protocolFee()
    expect(changedFee[0]).to.equal(protocolFee[0]);
    expect(changedFee[1].toNumber()).to.equal(protocolFee[1]);
  });

  it("Change protocol fee by user that is not owner fails", async function () {
    await expect(
        marketplace.connect(user).changeProtocolFee(protocolFee)
    ).to.be.rejectedWith(
      "Ownable: caller is not the owner"
    );
  });
});
