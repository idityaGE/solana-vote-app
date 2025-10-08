import {
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
  ACTIONS_CORS_HEADERS
} from '@solana/actions'
import type { NextRequest } from 'next/server'


export const GET = async (req: NextRequest) => {
  const response: ActionGetResponse = {
    icon: 'https://crypto-economy.com/es//wp-content/uploads/sites/4/2024/05/SolanaGovernance-1024x576.jpg',
    title: 'Solana Vote App',
    description: 'A simple app to vote using Solana. [Made for Learning purpose]',
    label: 'Vote with Solana',
    links: {
      actions: [
        {
          type: "transaction",
          href: req.nextUrl.origin + '/api/actions?poll_id={poll_id}',
          label: "Init Poll",
          parameters: [
            {
              type: "number",
              name: "poll_id",
              required: true,
              label: "unique poll id",
              pattern: "^[0-9]+$",
              patternDescription: "Only numbers are allowed",
              min: 1,
              max: 9999,
            }
          ]
        },
        {
          type: "transaction",
          href: req.nextUrl.origin + '/api/actions?poll_id={poll_id}&candidate_name={candidate_name}',
          label: "Init Candidate",
          parameters: [
            {
              type: "number",
              name: "poll_id",
              required: true,
              label: "your poll id to create candidate for...",
              pattern: "^[0-9]+$",
              patternDescription: "Only numbers are allowed",
              min: 1,
              max: 9999,
            },
            {
              type: "text",
              name: "candidate_name",
              required: true,
              label: "Candidate Name",
            }
          ]
        },
        {
          type: "transaction",
          href: req.nextUrl.origin + '/api/actions?poll_id={poll_id}&candidate_name={candidate_name}',
          label: "Cast Vote",
          parameters: [
            {
              type: "number",
              name: "poll_id",
              required: true,
              label: "your poll id to create candidate for...",
              pattern: "^[0-9]+$",
              patternDescription: "Only numbers are allowed",
              min: 1,
              max: 9999,
            },
            {
              type: "text",
              name: "candidate_name",
              required: true,
              label: "Candidate Name",
            }
          ]
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


// export const POST = async (req: NextRequest) => {
//   const body: ActionPostRequest = await req.json()

//   const response: ActionPostResponse = {
//     transaction: "",
//     data: ""
//   }

//   return Response.json(response, {
//     headers: ACTIONS_CORS_HEADERS,
//   })
// }


export const OPTIONS = async (req: NextRequest) => {
  return Response.json(null, {
    headers: ACTIONS_CORS_HEADERS,
  })
}