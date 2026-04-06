import { RESERVED_FIELDS } from '../constants/assets'
import type { AssetRecord } from '../types/assets'
import { formatValue, getRecordKey, getRecordTitle, humanizeAssetType } from '../utils/formatters'

type RecordCardProps = {
  assetType: string
  record: AssetRecord
  index: number
  onEdit: (record: AssetRecord) => void
}

export function RecordCard({ assetType, record, index, onEdit }: RecordCardProps) {
  const recordKey = getRecordKey(record)

  return (
    <article className="record-card">
      <div className="record-card-head">
        <div>
          <p className="record-type">{humanizeAssetType(assetType)}</p>
          <h3>{getRecordTitle(record, index)}</h3>
        </div>
        <button className="ghost-button" type="button" onClick={() => onEdit(record)}>
          Editar
        </button>
      </div>

      <dl>
        {Object.entries(record)
          .filter(([key]) => !RESERVED_FIELDS.has(key))
          .slice(0, 6)
          .map(([key, value]) => (
            <div key={key}>
              <dt>{key}</dt>
              <dd>{formatValue(value)}</dd>
            </div>
          ))}
      </dl>

      {recordKey ? <p className="record-key">{recordKey}</p> : null}
    </article>
  )
}
