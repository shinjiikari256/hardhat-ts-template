import { Signer } from './standard-types';

interface Voting {
  who: Signer;
  type: number;
  value: number;
  duration: number;
};

interface Vote {
  who: Signer;
  id: number;
  agree: boolean;
};

interface TransferVote {
  from: Signer;
  to: Signer;
  value: number;
};

export {
  Vote,
  Voting,
  TransferVote,
}