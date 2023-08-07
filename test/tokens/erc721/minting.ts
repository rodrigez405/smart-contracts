import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { deployCollection } from "./util/fixtures";
import { createMintSignature } from "../../common/utils/signature";
import { getLastBlockTimestamp } from "../../common/utils/time";

describe("ArttacaERC721Upgradeable minting", function () {
  let collection, owner, user, factory, splits, royalties;
  const TOKEN_ID = BigNumber.from(3);
  const tokenURI = 'ipfs://123123';
  const royaltiesFee = 10;
  const splitShares = 100;
  beforeEach(async () => {
    ({ collection, owner, user, factory } = await loadFixture(deployCollection));
    splits = [{account: owner.address, shares: splitShares}];
    royalties = {splits, percentage: royaltiesFee}
  });

  it("Owner should mint", async function () {
    const tx = await collection.mintAndTransferByOwner(owner.address, TOKEN_ID, tokenURI, royalties);
    await tx.wait();

    expect(await collection.totalSupply()).to.equal(1);
    expect(await collection.ownerOf(TOKEN_ID)).to.equal(owner.address);
  });

  it("Not owner minting should fail", async function () {
    await expect(
      collection.connect(user).mintAndTransferByOwner(owner.address, TOKEN_ID, tokenURI, royalties)
    ).to.rejectedWith("VM Exception while processing transaction: reverted with reason string 'Ownable: caller is not the owner'");
  });

  it("Operator with correct signature should be able to mint", async function () {

    let tx = await factory.addOperator(user.address);
    await tx.wait();

	  const timestamp = await getLastBlockTimestamp();
    const expTimestamp = timestamp + 100;
	  const mintSignature = await createMintSignature(
	    collection.address,
      owner,
      TOKEN_ID,
      tokenURI,
      royalties,
      expTimestamp
    );

    const tokenData = [
      TOKEN_ID,
      tokenURI,
      royalties
    ]

    const mintData = [
      user.address,
      expTimestamp,
      mintSignature
    ]

    tx = await collection.connect(user).mintAndTransfer(tokenData, mintData);
    await tx.wait();

    expect(await collection.totalSupply()).to.equal(1);
    expect(await collection.ownerOf(TOKEN_ID)).to.equal(user.address);
  });

  it("Operator with wrong signature should fail", async function () {

    let tx = await factory.addOperator(user.address);
    await tx.wait();

	  const timestamp = await getLastBlockTimestamp();
    const expTimestamp = timestamp + 100;
    const wrongTokenId = 5;

	  const wrongMintSignature = await createMintSignature(
	    collection.address,
      owner,
      TOKEN_ID,
      tokenURI,
      royalties,
      expTimestamp
    );

    const tokenData = [
      wrongTokenId,
      tokenURI,
      royalties
    ]

    const mintData = [
      user.address,
      expTimestamp,
      wrongMintSignature
    ]

    await expect(
      collection.connect(user).mintAndTransfer(tokenData, mintData)
    ).to.rejectedWith("VM Exception while processing transaction: reverted with reason string 'ArttacaERC721Upgradeable:mintAndTransfer:: Signature is not valid.'");
  });


  it("Operator with expired signature should fail", async function () {

    let tx = await factory.addOperator(user.address);
    await tx.wait();

	  const timestamp = await getLastBlockTimestamp();
    const pastExpTimestamp = timestamp - 100;

	  const expiredMintSignature = await createMintSignature(
	    collection.address,
      owner,
      TOKEN_ID,
      tokenURI,
      royalties,
      pastExpTimestamp // time is before timestamp
    );

    const tokenData = [
      TOKEN_ID,
      tokenURI,
      royalties
    ]

    const mintData = [
      user.address,
      pastExpTimestamp,
      expiredMintSignature
    ]

    await expect(
      collection.connect(user).mintAndTransfer(tokenData, mintData)
    ).to.rejectedWith("VM Exception while processing transaction: reverted with reason string 'ArttacaERC721Upgradeable:mintAndTransfer:: Signature is expired.'");
  });


  it("Minting a existing ID should revert", async function () {
    const tx = await collection.mintAndTransferByOwner(owner.address, TOKEN_ID, tokenURI, royalties);
    await tx.wait();

    await expect(
      collection.mintAndTransferByOwner(owner.address, TOKEN_ID, tokenURI, royalties)
    ).to.rejectedWith("VM Exception while processing transaction: reverted with reason string 'ERC721: token already minted'");
  });
});
