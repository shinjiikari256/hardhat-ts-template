import { ethers } from "hardhat";

import type { Signer, Wallet, Contract, Tx, TxWait } from './types';

const logGas = (description: string, value: number) => {
  if (!description) return
  const f_gas = "\x1b[38;2;255;193;7m[gas]\x1b[0m"
  console.log(`${f_gas} ${description}:`, value);
}

const gasUsed = async (transaction: Tx, description: string = '') => {
  const receipt = await transaction.wait();
  const gas = receipt.gasUsed.toNumber();
  logGas(description, gas);
  return gas;
}

const deploy = async (name: string, deployer: Signer, ...args: any[]): Promise<Contract> => {
  const contractFactory = await ethers.getContractFactory(name, deployer);
  const contract = await contractFactory.deploy(...args);
  await contract.deployed();
  return contract
}

const allGasUsed = async (_txs: TxWait | TxWait[]) => {
  const sum = (acc: number, item: number) => acc + item;

  const txs = _txs instanceof Array ? _txs : [_txs];
  return await Promise.all(txs.map(async(tx) => gasUsed(await tx)))
    .then(gases => gases.reduce(sum))
}


const repeatTx = (tx: Function, count: number) =>
  [...Array(count)].forEach(() => tx())

const repeatTxAsync = async (tx: Function, count: number) => {
  for (let i = 0; i < count; i++) await tx()
}

const getTimestamp = async (tx: Tx | Contract) =>
	( await ethers.provider.getBlock(tx.blockNumber) ).timestamp;

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const times = {
  js: {
    milliseconds:                    1,
    seconds:                      1000,
    minutes:                 60 * 1000,
    hours:              60 * 60 * 1000,
    days:          24 * 60 * 60 * 1000,
    weeks:     7 * 24 * 60 * 60 * 1000,
    months:   30 * 24 * 60 * 60 * 1000,
  },
  sol: {
    seconds:                      1,
    minutes:                 60 * 1,
    hours:              60 * 60 * 1,
    days:          24 * 60 * 60 * 1,
    weeks:     7 * 24 * 60 * 60 * 1,
    months:   30 * 24 * 60 * 60 * 1,
  },
}

const addresses = (wallets: Signer[] | Wallet[]) => wallets.map((wallet) => wallet.address);

type genItem = any | any[] |
                  (() => {}) |
                  ((item: any) => {}) |
                  ((item: any, index: number) => {});

interface Gen {
  [key: string]: genItem
}

function* zip(...args: any[]) {
  const iterators = args.map(x => x[Symbol.iterator]());
  while (true) {
    const current = iterators.map(x => x.next());
    if (current.some(x => x.done)) break;
    yield current.map(x => x.value);
  }
}

const generatorArray = (count: number, args: Gen) => {
  const repeat = [...Array(count)].map((_, i) => 1 + i);
  const getValues = (arg: genItem) =>
    arg instanceof Function ? repeat.map(arg) :
    arg instanceof Array ? arg : repeat.map(() => arg)

  const keys = Object.keys(args);

  const allAsArray = keys.reduce(
    (acc: any[], key: string) => [...acc, getValues(args[key])], [])

  return [...zip(...allAsArray)]
}

const generator = (count: number, args: Gen) => {
  const keys = Object.keys(args);

  const rowToObj = (row: any[], _keys: string[]) =>
    row.reduce((acc: any, value: any, i: number) =>
        ({...acc, [_keys[i]]: value}),
    {})

  return generatorArray(count, args).map(row => rowToObj(row, keys))
}

export {
  logGas,
  gasUsed,
  allGasUsed,
  deploy,
  repeatTx,
  repeatTxAsync,
  getTimestamp,
  delay,
  times,
  addresses,
  generatorArray,
  generator,
}