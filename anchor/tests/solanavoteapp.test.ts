import {
  type Blockhash,
  type KeyPairSigner,
  type Instruction,
  type Address,
  createSolanaClient,
  createTransaction,
  signTransactionMessageWithSigners,
  getProgramDerivedAddress,
  getU64Encoder,
  getUtf8Encoder,
} from 'gill'
import {
  getInitializePollInstructionAsync,
  SolanavoteappIDL,
  fetchPoll,
  getInitializeCandidateInstruction,
  fetchCandidate
} from '../src'
// @ts-ignore error TS2307 suggest setting `moduleResolution` but this is already configured
import { loadKeypairSignerFromFile } from 'gill/node'
import { describe, beforeAll, expect, it } from 'vitest'

const { rpc, sendAndConfirmTransaction } = createSolanaClient({ urlOrMoniker: "localnet" })

describe('solanavoteapp', () => {
  let payer: KeyPairSigner

  const poll_id = BigInt(1);
  let pollPDA: Address

  const candidate_name_1 = "Aditya";
  let candidatePDA1: Address

  const candidate_name_2 = "Roshan";
  let candidatePDA2: Address

  beforeAll(async () => {
    payer = await loadKeypairSignerFromFile(process.env.ANCHOR_WALLET!)

    pollPDA = (await getProgramDerivedAddress({
      programAddress: SolanavoteappIDL.address as Address,
      seeds: [getU64Encoder().encode(poll_id)]
    }))[0]

    candidatePDA1 = (await getProgramDerivedAddress({
      programAddress: SolanavoteappIDL.address as Address,
      seeds: [
        getU64Encoder().encode(poll_id),
        getUtf8Encoder().encode(candidate_name_1)
      ]
    }))[0];

    candidatePDA2 = (await getProgramDerivedAddress({
      programAddress: SolanavoteappIDL.address as Address,
      seeds: [
        getU64Encoder().encode(poll_id),
        getUtf8Encoder().encode(candidate_name_2)
      ]
    }))[0];
  })


  it('Initialize Poll', async () => {
    const ix = await getInitializePollInstructionAsync({
      pollId: poll_id,
      pollStart: BigInt(Math.floor(Date.now() / 1000)), // current time in seconds
      pollEnd: BigInt(Math.floor(Date.now() / 1000) + 3600), // current time + 1 hour
      description: "This is a sample poll",
      signer: payer,
    })

    await sendAndConfirm({ ix, payer })

    const pollAccount = await fetchPoll(rpc, ix.accounts[1].address);
    expect(pollAccount.data.candidateCount).toEqual(0n);
  })

  it("Initialize Candidate", async () => {
    const ix1 = getInitializeCandidateInstruction({
      candidateName: candidate_name_1,
      pollId: poll_id,
      signer: payer,
      poll: pollPDA,
      candidate: candidatePDA1
    });

    await sendAndConfirm({ ix: ix1, payer })
    const candidateAccount = await fetchCandidate(rpc, candidatePDA1);
    expect(candidateAccount.data.name).toEqual(candidate_name_1);
    expect(candidateAccount.data.voteCount).toEqual(0n);


    const ix2 = getInitializeCandidateInstruction({
      candidateName: candidate_name_2,
      pollId: poll_id,
      signer: payer,
      poll: pollPDA,
      candidate: candidatePDA2
    });

    await sendAndConfirm({ ix: ix2, payer });
    const candidateAccount2 = await fetchCandidate(rpc, candidatePDA2);
    expect(candidateAccount2.data.name).toEqual(candidate_name_2);
    expect(candidateAccount2.data.voteCount).toEqual(0n);

    const pollAccount = await fetchPoll(rpc, pollPDA);
    expect(pollAccount.data.candidateCount).toEqual(2n);
  })

  it("Let's Cast Vote", async () => {

  })
})

// Helper function to keep the tests DRY
let latestBlockhash: Awaited<ReturnType<typeof getLatestBlockhash>> | undefined
async function getLatestBlockhash(): Promise<Readonly<{ blockhash: Blockhash; lastValidBlockHeight: bigint }>> {
  if (latestBlockhash) {
    return latestBlockhash
  }
  return await rpc
    .getLatestBlockhash()
    .send()
    .then(({ value }) => value)
}
async function sendAndConfirm({ ix, payer }: { ix: Instruction; payer: KeyPairSigner }) {
  const tx = createTransaction({
    feePayer: payer,
    instructions: [ix],
    version: 'legacy',
    latestBlockhash: await getLatestBlockhash(),
  })
  const signedTransaction = await signTransactionMessageWithSigners(tx)
  return await sendAndConfirmTransaction(signedTransaction)
}
