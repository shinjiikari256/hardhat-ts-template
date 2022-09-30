import { ethers } from "hardhat";

import { addresses, setDir4Front } from '../common/for-deploy';

const createContract = setDir4Front('./forFront');

async function main() {
  const signers = await ethers.getSigners()
  const [ deployer ] = signers;

  const FundsDisperser = createContract('FundsDisperser', deployer);
  const DevToken = createContract('DevToken', deployer);

  // ---

  const tokenAmount = 3000000
  const receivers = addresses(signers.slice(1, 5))
  const amounts = [1000, 2000, 1000, 2000]

  await DevToken.approve(FundsDisperser.address, tokenAmount);
  await FundsDisperser.disperseTokens(DevToken.address, receivers, amounts);
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
