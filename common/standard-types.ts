
// #region types
export type {
  Wallet,
  VoidSigner,

  getDefaultProvider,
  providers,

  BaseContract,
  Contract,
  ContractFactory,

  BigNumber,
  FixedNumber,

  errors,

  ContractFunction,
  ContractReceipt,
  Event,
  EventFilter,

  Overrides,
  PayableOverrides,
  CallOverrides,

  PopulatedTransaction,

  ContractInterface,

  TypedDataDomain,
  TypedDataField,

  Bytes,
  BytesLike,

  Signature,

  Transaction,
  UnsignedTransaction,

  Wordlist
} from "ethers";
// #endregion

import type {
  ContractTransaction,
} from "ethers";

import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

type Signer = SignerWithAddress;

type Tx = ContractTransaction;
type TxWait = Promise<Tx>;

type BN = BigNumberish

export type {
  Signer,
  Tx,
  TxWait,
  BN,
}