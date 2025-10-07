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
} from 'gill'
import { getInitializePollInstructionAsync, SolanavoteappIDL, fetchPoll } from '../src'
// @ts-ignore error TS2307 suggest setting `moduleResolution` but this is already configured
import { loadKeypairSignerFromFile } from 'gill/node'
import { describe, beforeAll, expect, it } from 'vitest'

const { rpc, sendAndConfirmTransaction } = createSolanaClient({ urlOrMoniker: "localnet" })

describe('solanavoteapp', () => {
  let payer: KeyPairSigner
  const poll_id = BigInt(1);
  let pollPDA: Address

  beforeAll(async () => {
    payer = await loadKeypairSignerFromFile(process.env.ANCHOR_WALLET!)

    const [PDA] = await getProgramDerivedAddress({
      programAddress: SolanavoteappIDL.address as Address,
      seeds: [getU64Encoder().encode(poll_id)]
    })
    pollPDA = PDA
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

    const pollAccount = await fetchPoll(rpc, pollPDA);
    expect(pollAccount.data.candidateCount).toEqual(0n);
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
