import {
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
  ACTIONS_CORS_HEADERS,
} from '@solana/actions'
import type { NextRequest } from 'next/server'
import {
  getCastVoteInstruction,
  SolanavoteappIDL
} from "@project/anchor"
import {
  getProgramDerivedAddress,
  getU64Encoder,
  createSolanaClient,
  createTransaction,
  type Address,
  address,
  getUtf8Encoder,
  compileTransaction,
  getBase64EncodedWireTransaction,
  transactionToBase64,
} from "gill"


export const GET = async (req: NextRequest) => {
  const response: ActionGetResponse = {
    icon: 'https://crypto-economy.com/es//wp-content/uploads/sites/4/2024/05/SolanaGovernance-1024x576.jpg',
    title: 'Vote with Solana',
    description: 'Vote for your favorite Linux distribution.',
    label: 'Vote with Solana',
    links: {
      actions: [
        {
          type: "transaction",
          label: "NixOS",
          href: req.nextUrl.origin + "/api/actions?vote=nixos",
        },
        {
          type: "transaction",
          label: "Arch",
          href: req.nextUrl.origin + "/api/actions?vote=arch",
        }
      ]
    },
    type: "action",
    disabled: false,
  }

  return Response.json(response, {
    headers: ACTIONS_CORS_HEADERS,
  })
}


export const POST = async (req: NextRequest) => {
  const { searchParams } = req.nextUrl
  const vote = searchParams.get('vote')
  const body: ActionPostRequest = await req.json()

  const { account } = body;

  let voterAddress: Address
  try {
    voterAddress = address(account)
  } catch {
    return new Response('Invalid account address', {
      status: 400,
      headers: ACTIONS_CORS_HEADERS
    })
  }

  if (vote !== 'nixos' && vote !== 'arch') {
    return new Response('Invalid vote option', {
      status: 400,
      headers: ACTIONS_CORS_HEADERS
    })
  }

  const pollId = BigInt(1);

  const [poll] = await getProgramDerivedAddress({
    programAddress: SolanavoteappIDL.address as Address,
    seeds: [getU64Encoder().encode(pollId)]
  })

  const candidate_name_1 = "nixos";
  const candidate_name_2 = "arch";

  const [candidatePDA1] = await getProgramDerivedAddress({
    programAddress: SolanavoteappIDL.address as Address,
    seeds: [
      getU64Encoder().encode(pollId),
      getUtf8Encoder().encode(candidate_name_1)
    ]
  })

  const [candidatePDA2] = await getProgramDerivedAddress({
    programAddress: SolanavoteappIDL.address as Address,
    seeds: [
      getU64Encoder().encode(pollId),
      getUtf8Encoder().encode(candidate_name_2)
    ]
  })

  let candidate: Address
  let candidateName: string
  if (vote === "nixos") {
    candidate = candidatePDA1
    candidateName = candidate_name_1
  } else {
    candidate = candidatePDA2
    candidateName = candidate_name_2
  }

  const voterSigner = { address: voterAddress } as any // this is shit

  const ix = getCastVoteInstruction({
    candidate,
    poll,
    candidateName,
    pollId,
    voter: voterSigner
  })

  const { rpc } = createSolanaClient({ urlOrMoniker: "localnet" })
  const { value: latestBlockhash } = await rpc.getLatestBlockhash().send()

  const tx = createTransaction({
    feePayer: voterAddress,
    instructions: [ix],
    version: 'legacy',
    latestBlockhash,
  })

  const compiledTx = compileTransaction(tx)
  const serializedTx = transactionToBase64(compiledTx)

  const response: ActionPostResponse = {
    type: "transaction",
    transaction: serializedTx,
    message: `Vote cast for ${candidateName}!`,
  }

  return Response.json(response, {
    headers: ACTIONS_CORS_HEADERS,
  })
}


export const OPTIONS = async (req: NextRequest) => {
  return Response.json(null, {
    headers: ACTIONS_CORS_HEADERS,
  })
}