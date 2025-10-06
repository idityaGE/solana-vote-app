import { useSolana } from '@/components/solana/use-solana'
import { WalletDropdown } from '@/components/wallet-dropdown'
import { AppHero } from '@/components/app-hero'
import { SolanavoteappUiProgramExplorerLink } from './ui/solanavoteapp-ui-program-explorer-link'
import { SolanavoteappUiCreate } from './ui/solanavoteapp-ui-create'
import { SolanavoteappUiProgram } from '@/features/solanavoteapp/ui/solanavoteapp-ui-program'

export default function SolanavoteappFeature() {
  const { account } = useSolana()

  if (!account) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="hero py-[64px]">
          <div className="hero-content text-center">
            <WalletDropdown />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <AppHero title="Solanavoteapp" subtitle={'Run the program by clicking the "Run program" button.'}>
        <p className="mb-6">
          <SolanavoteappUiProgramExplorerLink />
        </p>
        <SolanavoteappUiCreate account={account} />
      </AppHero>
      <SolanavoteappUiProgram />
    </div>
  )
}
