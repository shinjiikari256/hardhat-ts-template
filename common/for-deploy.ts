import { ethers } from 'hardhat';
import fs from 'fs';
import path from 'path';

import type { Signer, Wallet, Contract } from './types';

interface NameWithType {
  name: string;
  type: string;
}

type ContractName = string | NameWithType;

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

type DictContracts = {
  [key: string]: Contract;
}

const saveFrontendFiles = (dir: string, contracts: DictContracts) : void => {
  const contractsDir = path.join(__dirname, '/..', dir)

  if(!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir)
  }

  const write = (name: string, value: any) =>
    fs.writeFileSync(`${contractsDir}/${name}.json`, JSON.stringify(value, null, 2))

  const writeContract = (name: string, address: any, abi: any) => {
    if(address)
      write(name + '-address', address)
    write(name, abi)
  }

  Object.entries(contracts).forEach((contract_item) => {
    const [name, contract] = contract_item;

    writeContract(name,
      { [name]: contract.address },
      contract.interface
    )
  })
}

const addresses = (wallets: Signer[] | Wallet[]) => wallets.map((wallet) => wallet.address);

const setDir4Front = (dirWithAbi: string = './forFront') => {
  const fromFront = (file: string) => require(dirWithAbi + file);

  return (name: string, provider: Signer) => {
    const address = fromFront(`${name}-address.json`);
    const abi = fromFront(`${name}.json`);
    return new ethers.Contract(address, abi, provider);
  }
}

const deployerInfo = async (signer: Signer) => {
  const accountBalance = await signer.getBalance();

  console.log("Deploying contracts with account: ", signer.address);
  console.log("Account balance: ", accountBalance.toString());

  console.log()
}

export { saveFrontendFiles, deploy, addresses, setDir4Front, deployerInfo };
