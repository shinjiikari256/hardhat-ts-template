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
  const abi = contract.interface.format(ethers.utils.FormatTypes.full)
  return typeof abi == 'string' ? JSON.parse(abi) : abi
}

const createDir = (name: string) =>
  !fs.existsSync(name) && fs.mkdirSync(name)

const readFile = (name: string) =>
  fs.existsSync(name) && fs.readFileSync(name, 'utf8')

const readJson = (name: string) => {
  const file = readFile(name)
  return file ? JSON.parse(file) : {}
}
const writeFile = (name: string, data: any) =>
  fs.writeFileSync(name, data)

const writeJson = (name: string, data: any) =>
  writeFile(name, JSON.stringify(data, null, 2))

const getContractAddresses = (name: string) =>
  readJson(name)?.chains || {}

const writeContract2 = (dir: string, net: string) =>
  ([name, contract]: [string, Contract]) => {
    const fileName = `${dir}/${name}.json`
    const { hash, blockNumber } = contract.deployTransaction;
    writeJson(fileName, {
      name,
      chains: {
        ...getContractAddresses(fileName),
        [net]: {
          address: contract.address,
          deployBlock: blockNumber,
          deployTxHash: hash,
        },
      },
      abi: getAbi(contract),
    })
  }

const createIndex = (names: string[]) => [
    ...names.map((name: string) => `import ${name} from './${name}.json';`),
    '',
    `export { ${names.join(', ')} };`,
  ].join('\n')

const saveFrontendFiles = ({ dir = 'forFront', net = 'localhost', contracts }: ForContractsInfo) => {
  const contractsDir = path.join(__dirname, '/..', dir)

  createDir(contractsDir)

  const writeContract = writeContract2(contractsDir, net)

  Object.entries(contracts).forEach(writeContract)

  const names = Object.keys(contracts)

  writeFile(`${contractsDir}/index.js`, createIndex(names))
}

const setDir4Front = (dirWithAbi: string = './forFront', net: string = 'localhost') => {
  const fromFront = (name: string) => readJson(`${dirWithAbi}/${name}.json`);

  return (name: string, provider: Signer) => {
    const {chains: {[net]: {address}}, abi } = fromFront(name);
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
