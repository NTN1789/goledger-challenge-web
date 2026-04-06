import type { SchemaField, SelectOption } from '../types/assets'
import { humanizeAssetType } from '../utils/formatters'

type EditorPanelProps = {
  isBusy: boolean
  isEditMode: boolean
  selectedAssetType: string
  schemaFields: SchemaField[]
  formData: Record<string, string>
  tvShowOptions: SelectOption[]
  onFieldChange: (field: string, value: string) => void
  onReset: () => void
  onSubmit: () => void
  onDelete: () => void
}

export function EditorPanel({
  isBusy,
  isEditMode,
  selectedAssetType,
  schemaFields,
  formData,
  tvShowOptions,
  onFieldChange,
  onReset,
  onSubmit,
  onDelete,
}: EditorPanelProps) {
  const keyField = schemaFields.find((field) => field.isKey)

  return (
    <div className="panel stack">
      <div className="panel-heading compact-heading">
        <div>
          <p className="section-kicker">Editor</p>
          <h2>{isEditMode ? 'Atualizar registo' : 'Criar registo'}</h2>
        </div>
        <button className="ghost-button" type="button" onClick={onReset}>
          Limpar
        </button>
      </div>

      <div className="editor-banner">
        <strong>{humanizeAssetType(selectedAssetType)}</strong>
        <span>{isEditMode ? 'Modo updateAsset' : 'Modo createAsset'}</span>
      </div>

      {keyField ? (
        <div className="hint-banner">
          <strong>Campo chave:</strong>
          <span>
            {keyField.label}
            {isEditMode
              ? ' identifica este registo.'
              : ' precisa de um valor unico para criar um novo registo.'}
          </span>
        </div>
      ) : null}

      <div className="field-grid editor-grid">
        {schemaFields.map((field) => (
          <label key={field.key}>
            <span>
              {field.label}
              {field.required ? ' *' : ''}
              {field.isKey ? ' [chave unica]' : ''}
            </span>
            {selectedAssetType === 'seasons' && field.key === 'tvShow' ? (
              <select
                value={formData[field.key] ?? ''}
                onChange={(event) => onFieldChange(field.key, event.target.value)}
                disabled={field.readOnly}
              >
                <option value="">Seleciona um TV Show</option>
                {tvShowOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : field.dataType === 'number' || field.key === 'recommendedAge' || (selectedAssetType === 'seasons' && field.key === 'number') ? (
              <input
                type="number"
                value={formData[field.key] ?? ''}
                onChange={(event) => onFieldChange(field.key, event.target.value)}
                placeholder={
                  field.key === 'recommendedAge'
                    ? 'numero entre 0 e 18'
                    : 'numero'
                }
                readOnly={field.readOnly}
                min={field.key === 'recommendedAge' ? 0 : undefined}
                max={field.key === 'recommendedAge' ? 18 : undefined}
              />
            ) : (
              <textarea
                value={formData[field.key] ?? ''}
                onChange={(event) => onFieldChange(field.key, event.target.value)}
                rows={field.dataType.includes('[]') || field.dataType.includes('@') ? 4 : 2}
                placeholder={
                  field.key === 'recommendedAge'
                    ? 'numero entre 0 e 18'
                    : field.dataType
                }
                readOnly={field.readOnly}
              />
            )}
            {field.key === 'recommendedAge' ? (
              <small className="field-help">
                Usa apenas valores de 0 a 18 para classificacao etaria.
              </small>
            ) : null}
            {selectedAssetType === 'seasons' && field.key === 'tvShow' ? (
              <small className="field-help">
                A referencia do TV Show sera gerada automaticamente.
              </small>
            ) : null}
          </label>
        ))}
      </div>

      {schemaFields.length === 0 ? (
        <div className="empty-state">
          O schema ainda nao trouxe campos legiveis. Mesmo assim, podes usar o editor
          depois de fazer <code>readAsset</code> ou pesquisa.
        </div>
      ) : null}

      <div className="inline-actions action-row">
        <button className="primary-button" type="button" onClick={onSubmit} disabled={isBusy}>
          {isEditMode ? 'Guardar alteracao' : 'Criar asset'}
        </button>
        <button className="danger-button" type="button" onClick={onDelete} disabled={isBusy}>
          Apagar asset
        </button>
      </div>
    </div>
  )
}
