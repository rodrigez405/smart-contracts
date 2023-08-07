import {ethers} from 'hardhat';

async function getLastBlockTimestamp(): Promise<number> {
    const blockNumber = await ethers.provider.getBlockNumber();
    return (await ethers.provider.getBlock(blockNumber)).timestamp;
}

export { getLastBlockTimestamp };