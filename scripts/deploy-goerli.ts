import { ethers } from "hardhat";

import { saveFrontendFiles, deploy, deployerInfo, getNet } from '../common/for-deploy';

async function main() {
  const signers = await ethers.getSigners()
  const [deployer] = signers;

  await deployerInfo(deployer)

  const FundsDisperser = await deploy("FundsDisperser", deployer);
  const DevToken = await deploy("DevToken", deployer);

  saveFrontendFiles({
      net: await getNet(),
      contracts: {
        FundsDisperser,
        DevToken,
      }
    }
  )
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
