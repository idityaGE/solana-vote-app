import { SolanavoteappIDL } from '@project/anchor'
import { AppExplorerLink } from '@/components/app-explorer-link'
import { ellipsify } from '@wallet-ui/react'

export function SolanavoteappUiProgramExplorerLink() {
  return <AppExplorerLink address={SolanavoteappIDL.address} label={ellipsify(SolanavoteappIDL.address)} />
}
