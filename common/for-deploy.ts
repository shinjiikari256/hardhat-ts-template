import { ethers, network } from 'hardhat';
import fs from 'fs';
import path from 'path';

import type { Signer, Wallet, Contract } from './types';

// Types
interface NameWithType {
  name: string;
  type: string;
}

type ContractName = string | NameWithType;

type DictContracts = {
  [key: string]: Contract;
}

interface ForContractsInfo {
  dir?: string;
  net?: string;
  contracts: DictContracts;
}


// Functions

const getNet = async () => (await network).name;

const deploy = async (contract: ContractName, deployer: Signer, ...args: any[]): Promise<Contract> => {
  const { name, type } = typeof contract == 'string'
    ? { name: contract, type: contract }
    : contract

  const contractFactory = await ethers.getContractFactory(type, deployer);
  const _contract = await contractFactory.deploy(...args);
  await _contract.deployed();

  console.log(`${name} address:`, _contract.address);

  return _contract
}

const getAbi = (contract: Contract) => {
  const raw_abi = contract.interface.format(ethers.utils.FormatTypes.json)
  const abi = typeof raw_abi == 'string' ? raw_abi : raw_abi.join('')
  return JSON.parse(abi)
}

const createDir = (name: string) =>
  !fs.existsSync(name) && fs.mkdirSync(name)

const readFile = (name: string) =>
  fs.existsSync(name) && fs.readFileSync(name, 'utf8')

const readJson = (name: string) => {
  const file = readFile(name)
  return file ? JSON.parse(file) : {}
}
const writeJson = (name: string, data: any) =>
  fs.writeFileSync(name, JSON.stringify(data, null, 2))

const getContractAddresses = (name: string) =>
  readJson(name)?.address || {}

const writeContract2 = (dir: string, net: string) =>
  ([name, contract]: [string, Contract]) => {
    const fileName = `${dir}/${name}.json`
    writeJson(fileName, {
      name,
      addresses: {
        ...getContractAddresses(fileName),
        [net]: contract.address,
      },
      abi: getAbi(contract),
    })
  }

const saveFrontendFiles = ({ dir = 'forFront', net = 'localhost', contracts }: ForContractsInfo) => {
  const contractsDir = path.join(__dirname, '/..', dir)

  createDir(contractsDir)

  const writeContract = writeContract2(contractsDir, net)

  Object.entries(contracts).forEach(writeContract)
}

const setDir4Front = (dirWithAbi: string = './forFront', net: string = 'localhost') => {
  const fromFront = (name: string) => readJson(`${dirWithAbi}/${name}.json`);

  return (name: string, provider: Signer) => {
    const {addresses: {[net]: address}, abi } = fromFront(name);
    return new ethers.Contract(address, abi, provider);
  }
}
const deployerInfo = async (signer: Signer) => {
  const accountBalance = await signer.getBalance();

  console.log("Deploying contracts with account: ", signer.address);
  console.log("Account balance: ", accountBalance.toString());
  console.log()
}

const addresses = (wallets: Signer[] | Wallet[]) => wallets.map((wallet) => wallet.address);

export { deploy, saveFrontendFiles, addresses, setDir4Front, deployerInfo, getNet };
