import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { deployMarketplace } from "../util/fixtures";
import { getLastBlockTimestamp } from "../../common/utils/time";
import { createMintSignature, createSaleSignature } from "../../common/utils/signature";
import {BigNumber} from "@ethersproject/bignumber";
import {AddressZero} from "@ethersproject/constants"

const royaltiesFee = 10;
const splitShares = 100;
const TOKEN_ID = BigNumber.from(3);
const tokenURI = 'ipfs://123123';
const PRICE = '10000000000000000'; // 0.01 ETH
let mintSignature, listingSignature, nodeSignature, mintData, saleData, timestamp, expTimestamp, listingExpTimestamp, nodeExpTimestamp, tokenData, splits, royalties;

describe("ArttacaMarketplaceUpgradeable ERC721 buy and mint", function () {
  let erc721factory, erc721, owner, user , erc721collection, marketplace, operator, protocol;
  beforeEach(async () => {
      ({ erc721factory, erc721, owner, user , erc721collection, marketplace, operator, protocol } = await loadFixture(deployMarketplace));
      splits = [{account: owner.address, shares: splitShares}];
      royalties = {splits, percentage: royaltiesFee}
      tokenData = {
        id: TOKEN_ID,
        URI:tokenURI,
        royalties
      }
      timestamp = await getLastBlockTimestamp();
      expTimestamp = timestamp + 100;
      listingExpTimestamp = expTimestamp + 100;
      nodeExpTimestamp = listingExpTimestamp + 100;
      mintSignature = await createMintSignature(
          erc721collection.address,
        owner,
        TOKEN_ID,
        tokenURI,
        royalties,
        expTimestamp
      );
      listingSignature = await createSaleSignature(
          erc721collection.address,
        owner,
        marketplace.address,
        TOKEN_ID,
        PRICE,
        listingExpTimestamp
      );
      nodeSignature = await createSaleSignature(
          erc721collection.address,
        operator,
        marketplace.address,
        TOKEN_ID,
        PRICE,
        nodeExpTimestamp
      );

      mintData = [ user.address, expTimestamp, mintSignature ];
      saleData = [ owner.address, PRICE, listingExpTimestamp, nodeExpTimestamp, listingSignature, nodeSignature ];
  });

  it("User can buy and mint", async function () {

    const tx = await marketplace.connect(user).buyAndMint(
      erc721collection.address,
      tokenData,
      mintData,
      saleData,
      {value: PRICE}
    );
    const receipt = await tx.wait();
      const transferEvent1 = erc721collection.interface.parseLog(receipt.logs[0]) // transfer event 1
      const transferEvent2 = erc721collection.interface.parseLog(receipt.logs[1]) // transfer event 2
      expect(transferEvent1.args.from).to.equal(AddressZero);
      expect(transferEvent1.args.to).to.equal(owner.address);
      expect(transferEvent2.args.from).to.equal(owner.address);
      expect(transferEvent2.args.to).to.equal(user.address);
    expect(await erc721collection.totalSupply()).to.equal(1);
    expect(await erc721collection.ownerOf(TOKEN_ID)).to.equal(user.address);
  });

  it("User cannot buy and mint if sent less ETH", async function () {

      const WRONG_PRICE = BigNumber.from(PRICE).div(2).toString();

      await expect(
          marketplace.connect(user).buyAndMint(
              erc721collection.address,
              tokenData,
              mintData,
              saleData,
              {value: WRONG_PRICE}
          )
      ).to.rejectedWith("VM Exception while processing transaction: reverted with reason string 'ArttacaMarketplaceUpgradeable::buyAndMint: Value sent is insufficient.'");

      expect(await erc721collection.totalSupply()).to.equal(0);
      await expect(erc721collection.ownerOf(TOKEN_ID)).to.rejectedWith("ERC721: invalid token ID");
  });

  it("User cannot buy and mint if expired timestamp value send or expired sale signature", async function () {

    const expiredTimestamp = expTimestamp - 200;

    listingSignature = await createSaleSignature(
        erc721collection.address,
      owner,
        marketplace.address,
      TOKEN_ID,
      PRICE,
      expiredTimestamp
    );

    const wrongExpiredTimeStampSaleData = [ owner.address, PRICE, expiredTimestamp, nodeExpTimestamp, listingSignature, nodeSignature ];
    const wrongListingSignatureSaleData = [ owner.address, PRICE, listingExpTimestamp, nodeExpTimestamp, listingSignature, nodeSignature ];

    await expect(
      marketplace.connect(user).buyAndMint(
          erc721collection.address,
        tokenData,
        mintData,
        wrongExpiredTimeStampSaleData,
        {value: PRICE}
      )
    ).to.rejectedWith("VM Exception while processing transaction: reverted with reason string 'ArttacaMarketplaceUpgradeable:buyAndMint:: Listing signature is probably expired.");

    expect(await erc721collection.totalSupply()).to.equal(0);
      await expect(erc721collection.ownerOf(TOKEN_ID)).to.rejectedWith("ERC721: invalid token ID");

    await expect(
      marketplace.connect(user).buyAndMint(
          erc721collection.address,
        tokenData,
        mintData,
        wrongListingSignatureSaleData,
        {value: PRICE}
      )
    ).to.rejectedWith("VM Exception while processing transaction: reverted with reason string 'ArttacaMarketplaceUpgradeable:buyAndMint:: Listing signature is not valid.'");

    expect(await erc721collection.totalSupply()).to.equal(0);
      await expect(erc721collection.ownerOf(TOKEN_ID)).to.rejectedWith("ERC721: invalid token ID");
  });

  it("User cannot buy and mint if wrong operator signature", async function () {

    const wrongOperatorSignature = await createSaleSignature(
        erc721collection.address,
      user,
        marketplace.address,
      TOKEN_ID,
      PRICE,
      expTimestamp
    );

    saleData = [ owner.address, PRICE, listingExpTimestamp, nodeExpTimestamp, listingSignature, wrongOperatorSignature ];

    await expect(
      marketplace.connect(user).buyAndMint(
          erc721collection.address,
        tokenData,
        mintData,
        saleData,
        {value: PRICE}
      )
    ).to.rejectedWith("VM Exception while processing transaction: reverted with reason string 'ArttacaMarketplaceUpgradeable:buyAndMint:: Node signature is not from a valid operator.'");

    expect(await erc721collection.totalSupply()).to.equal(0);
    await expect(erc721collection.ownerOf(TOKEN_ID)).to.rejectedWith("ERC721: invalid token ID");
  });
});
