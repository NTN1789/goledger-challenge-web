import type { AssetRecord } from '../types/assets'
import { RecordCard } from './RecordCard'

type SearchPanelProps = {
  isBusy: boolean
  selectorText: string
  selectedKey: string
  selectedAssetType: string
  records: AssetRecord[]
  resultCount: number
  onSelectorChange: (value: string) => void
  onSelectedKeyChange: (value: string) => void
  onSearch: () => void
  onReadOne: () => void
  onEditRecord: (record: AssetRecord) => void
}

export function SearchPanel({
  isBusy,
  selectorText,
  selectedKey,
  selectedAssetType,
  records,
  resultCount,
  onSelectorChange,
  onSelectedKeyChange,
  onSearch,
  onReadOne,
  onEditRecord,
}: SearchPanelProps) {
  return (
    <div className="panel stack">
      <div className="panel-heading compact-heading">
        <div>
          <p className="section-kicker">Search</p>
          <h2>Busca e resultados</h2>
        </div>
        <div className="panel-tools">
          <span className="results-pill">{resultCount} resultados</span>
          <button className="primary-button" type="button" onClick={onSearch} disabled={isBusy}>
            Pesquisar
          </button>
        </div>
      </div>

      <details className="accordion-card">
        <summary>Query avancada</summary>
        <label className="block-field">
          <span>Query JSON</span>
          <textarea
            value={selectorText}
            onChange={(event) => onSelectorChange(event.target.value)}
            rows={8}
          />
        </label>
      </details>

      <div className="inline-actions">
        <label className="compact-field">
          <span>Read/Delete key</span>
          <input
            value={selectedKey}
            onChange={(event) => onSelectedKeyChange(event.target.value)}
            placeholder="asset key"
          />
        </label>
        <button className="secondary-button" type="button" onClick={onReadOne} disabled={isBusy}>
          Ler 1 asset
        </button>
      </div>

      <div className="record-grid">
        {records.length === 0 ? (
          <div className="empty-state">
            Nenhum registo carregado ainda. Faz uma pesquisa para popular a lista.
          </div>
        ) : (
          records.map((record, index) => (
            <RecordCard
              key={record['@key']?.toString() ?? `${selectedAssetType}-${index}`}
              assetType={selectedAssetType}
              record={record}
              index={index}
              onEdit={onEditRecord}
            />
          ))
        )}
      </div>
    </div>
  )
}
