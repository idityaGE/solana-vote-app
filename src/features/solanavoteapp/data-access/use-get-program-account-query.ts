import { SolanavoteappIDL } from '@project/anchor'
import { useSolana } from '@/components/solana/use-solana'
import { useQuery } from '@tanstack/react-query'
import { Address } from 'gill'

export function useGetProgramAccountQuery() {
  const { client, cluster } = useSolana()

  return useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => client.rpc.getAccountInfo(SolanavoteappIDL.address as Address).send(),
  })
}
