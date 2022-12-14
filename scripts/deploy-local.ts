import { ethers } from "hardhat";

import { saveFrontendFiles, deploy, deployerInfo, getNet } from '../common/for-deploy';

async function main() {
  const signers = await ethers.getSigners()
  const [deployer] = signers;

  await deployerInfo(deployer)

  const FundsDisperser = await deploy("FundsDisperser", deployer);
  const DevToken = await deploy("DevToken", deployer);
  const DevToken2 = await deploy({ name: "DevToken2", type: "DevToken" }, deployer);

  saveFrontendFiles({
      // dir: '../front/contracts',
      dir: 'forFront',
      net: await getNet(),
      contracts: {
        FundsDisperser,
        DevToken,
        DevToken2,
      }
    }
  )

    const ETH = 1e18;
    const tokensApprove = BigInt(1000) * BigInt(ETH)
    await DevToken.connect(deployer).approve(FundsDisperser.address, tokensApprove);
}

main()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err)
        process.exit(1)
    })
