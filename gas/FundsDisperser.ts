import { time, mine, loadFixture, } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { DevToken, FundsDisperser } from "../typechain-types";

import type { BN, Contract, Signer, Tx } from '../common/types';

import { gasUsed, logGas, deploy, addresses } from "../common/for-tests";

const sumBig = (array: BN[]) => array.reduce((acc, x) => acc + x, 0n);

describe("FundsDisperser", function () {
  async function init() {
    const signers = await ethers.getSigners();
    const [ deployer ] = signers
    const receivers = signers.slice(1, 13);

    const devToken = await deploy("DevToken", deployer) as DevToken;
    const disperser = await deploy("FundsDisperser", deployer) as FundsDisperser;

    const disperseEther = (to: Signer[], howMany: BN[], total: BN) =>
      disperser.disperseEther(addresses(to), howMany, { value: total })

    const disperseTokens = (tokens: Contract, to: Signer[], howMany: BN[]) =>
      disperser.disperseTokens(tokens.address, addresses(to), howMany)

    return { disperser, devToken, deployer, receivers, disperseEther, disperseTokens };
  }

  let totalGas = 0;

  beforeEach(async function () {
    totalGas = 0;
    console.log("-".repeat(20))
  });

  afterEach(function() {
    if (totalGas > 0)
      logGas("Total", totalGas)
  })


  it("✅ Контракты развёртнуты", async function () {
    const { disperser, devToken } = await loadFixture(init);
    expect(disperser.address).not.to.undefined;
    expect(devToken.address).not.to.undefined;
  });

  describe("ETH", () => {
    const power = 10n ** 18n
    const amounts = [
      1n * power, 2n * power,
      1n * power, 2n * power,
      1n * power, 2n * power,
      1n * power, 2n * power,
      1n * power, 2n * power,
      1n * power, 2n * power,
    ];
    const totalAmount = sumBig(amounts)

    const checkEthBalances = async (tx: Tx, deployer: Signer, receivers: Signer[]) => {
      await expect(
        tx,
        "Баланс получателей изменился некорректно"
      ).to.changeEtherBalances(receivers, amounts);
      await expect(
        tx,
        "Баланс отправителя изменился некорректно"
      ).to.changeEtherBalance(deployer, -totalAmount);
    }

    it("✅ Получается отправить ETH", async function () {
      const { disperseEther, deployer, receivers } = await loadFixture(init);

      let tx

      totalGas += await gasUsed((
        tx = await disperseEther(receivers, amounts, totalAmount)
      ))

      await checkEthBalances(tx, deployer, receivers)
    });

    it("✅ Появление события Transfer транзакции при отправке эфира", async function () {
      const { disperser, disperseEther, deployer, receivers } = await loadFixture(init);
      let tx

      totalGas += await gasUsed((
        tx = await disperseEther(receivers, amounts, totalAmount)
      ))

      await checkEthBalances(tx, deployer, receivers)

      for (let i = 0; i < receivers.length; i++)
        await expect(tx)
          .to.emit(disperser, "Transfer")
          .withArgs(deployer.address, receivers[i].address, amounts[i])
    });

    it("✅ Избыток ETH возвращается отправителю", async function () {
      const { disperseEther, deployer, receivers } = await loadFixture(init);
      let tx

      totalGas += await gasUsed((
        tx = await disperseEther(receivers, amounts, 30n * power)
      ))

      await checkEthBalances(tx, deployer, receivers)
    });
  })

  describe("Tokens", () => {
    const amounts = [
      1000n, 2000n,
      1000n, 2000n,
      1000n, 2000n,
      1000n, 2000n,
      1000n, 2000n,
      1000n, 2000n,
    ];

    const totalAmount = sumBig(amounts);

    it("✅ Получается отправить токены", async function () {
      const { disperser, devToken, disperseTokens, deployer, receivers } = await loadFixture(init);

      const tokenAmount = 3000000;

      await devToken.connect(deployer).approve(disperser.address, tokenAmount);
      expect(await devToken.allowance(deployer.address, disperser.address)).to.eq(
        tokenAmount
      );

      let tx
      totalGas += await gasUsed((
        tx = await disperseTokens(devToken, receivers, amounts)
      ))

      await expect(tx).to.be.changeTokenBalances(
        devToken,
        receivers,
        amounts
      );

      await expect(tx).to.be.changeTokenBalance(
        devToken,
        deployer,
        -totalAmount
      );
    });

    it("❌ Отправка контрактом токенов без разрешения", async function () {
      const { devToken, disperseTokens, receivers } = await loadFixture(init);

      await expect((
        disperseTokens(devToken, receivers, amounts)
      )).to.be.rejectedWith('ERC20: insufficient allowance');
    });
  })
});
