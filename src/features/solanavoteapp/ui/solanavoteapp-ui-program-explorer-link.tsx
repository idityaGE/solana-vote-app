import { SOLANAVOTEAPP_PROGRAM_ADDRESS } from '@project/anchor'
import { AppExplorerLink } from '@/components/app-explorer-link'
import { ellipsify } from '@wallet-ui/react'

export function SolanavoteappUiProgramExplorerLink() {
  return <AppExplorerLink address={SOLANAVOTEAPP_PROGRAM_ADDRESS} label={ellipsify(SOLANAVOTEAPP_PROGRAM_ADDRESS)} />
}
