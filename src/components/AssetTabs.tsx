import { humanizeAssetType } from '../utils/formatters'

type AssetTabsProps = {
  assetTypes: string[]
  selectedAssetType: string
  onSelect: (assetType: string) => void
}

export function AssetTabs({
  assetTypes,
  selectedAssetType,
  onSelect,
}: AssetTabsProps) {
  return (
    <section className="panel">
      <div className="panel-heading compact-heading">
        <div>
          <p className="section-kicker">Assets</p>
          <h2>Seleciona a colecao</h2>
        </div>
      </div>

      <div className="asset-tabs" role="tablist" aria-label="Tipos de asset">
        {assetTypes.map((assetType) => (
          <button
            key={assetType}
            type="button"
            className={assetType === selectedAssetType ? 'asset-tab active' : 'asset-tab'}
            onClick={() => onSelect(assetType)}
          >
            {humanizeAssetType(assetType)}
          </button>
        ))}
      </div>
    </section>
  )
}
