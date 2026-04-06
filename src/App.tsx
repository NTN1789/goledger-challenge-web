import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { AssetTabs } from './components/AssetTabs'
import { ConnectionPanel } from './components/ConnectionPanel'
import { DebugPanel } from './components/DebugPanel'
import { EditorPanel } from './components/EditorPanel'
import { SearchPanel } from './components/SearchPanel'
import { ToastViewport } from './components/ToastViewport'
import {
  DEFAULT_API_BASE_URL,
  DEFAULT_API_PASSWORD,
  DEFAULT_API_USERNAME,
  DEFAULT_ASSET_TYPES,
} from './constants/assets'
import { callGoLedgerApi } from './services/goLedgerApi'
import type { AssetRecord, SchemaDefinition, SelectOption, ToastMessage, ToastTone } from './types/assets'
import {
  formatError,
  getRecordKey,
  humanizeAssetType,
  normalizeAssetType,
  stringifyForDisplay,
} from './utils/formatters'
import { asObject } from './utils/guards'
import {
  buildFormData,
  deriveSchemaFields,
  extractAssetTypes,
  extractRecords,
  parseFormData,
} from './utils/schema'
import { loadStoredSettings, saveStoredSettings } from './utils/storage'

function App() {
  const [apiBaseUrl, setApiBaseUrl] = useState(DEFAULT_API_BASE_URL)
  const [username, setUsername] = useState(DEFAULT_API_USERNAME)
  const [password, setPassword] = useState(DEFAULT_API_PASSWORD)
  const [assetTypes, setAssetTypes] = useState<string[]>(DEFAULT_ASSET_TYPES)
  const [selectedAssetType, setSelectedAssetType] = useState('tvShows')
  const [schema, setSchema] = useState<SchemaDefinition | null>(null)
  const [records, setRecords] = useState<AssetRecord[]>([])
  const [tvShowOptions, setTvShowOptions] = useState<SelectOption[]>([])
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [selectorText, setSelectorText] = useState(
    JSON.stringify({ selector: { '@assetType': 'tvShows' } }, null, 2),
  )
  const [selectedKey, setSelectedKey] = useState('')
  const [schemaPreview, setSchemaPreview] = useState('')
  const [responsePreview, setResponsePreview] = useState('')
  const [status, setStatus] = useState('Preenche as credenciais do email e carrega o schema.')
  const [isBusy, setIsBusy] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  useEffect(() => {
    const saved = loadStoredSettings()
    if (!saved) return

    if (saved.apiBaseUrl) setApiBaseUrl(saved.apiBaseUrl)
    if (saved.username) setUsername(saved.username)
    if (saved.assetTypes?.length) {
      const normalizedAssetTypes = saved.assetTypes.map(normalizeAssetType)
      setAssetTypes(normalizedAssetTypes)
      setSelectedAssetType(normalizedAssetTypes[0] ?? 'tvShows')
    }
  }, [])

  useEffect(() => {
    saveStoredSettings({
      apiBaseUrl,
      username,
      assetTypes,
    })
  }, [apiBaseUrl, username, assetTypes])

  useEffect(() => {
    setSelectorText(
      JSON.stringify({ selector: { '@assetType': selectedAssetType } }, null, 2),
    )
    setSelectedKey('')
    setFormData({})
    setIsEditMode(false)
  }, [selectedAssetType])

  const schemaFields = useMemo(
    () => deriveSchemaFields(schema, records, selectedAssetType),
    [records, schema, selectedAssetType],
  )

  function dismissToast(id: number) {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }

  function pushToast(tone: ToastTone, title: string, description?: string) {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    setToasts((current) => [...current, { id, tone, title, description }])
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id))
    }, 4500)
  }

  function describeError(error: unknown) {
    const message = formatError(error)

    if (message.includes('asset already exists')) {
      const keyField = schemaFields.find((field) => field.isKey)
      const keyFieldLabel = keyField?.label
      return {
        title: 'Esse registo ja existe',
        description: keyFieldLabel
          ? `O campo ${keyFieldLabel} precisa de um valor unico para criar um novo registo.`
          : 'Usa um identificador unico para criar um novo registo.',
      }
    }

    if (message.includes('invalid argument')) {
      return {
        title: 'Dados invalidos para a API',
        description: 'Revê os campos obrigatorios e o formato esperado antes de tentar novamente.',
      }
    }

    return {
      title: 'Ocorreu um erro',
      description: message,
    }
  }

  function validateFormBeforeSubmit() {
    const recommendedAgeValue = formData.recommendedAge?.trim()

    if (recommendedAgeValue) {
      const parsedAge = Number(recommendedAgeValue)

      if (Number.isNaN(parsedAge) || parsedAge < 0 || parsedAge > 18) {
        const feedback = {
          title: 'Idade recomendada invalida',
          description: 'O campo Recommended Age deve ficar entre 0 e 18.',
        }

        setStatus(feedback.description)
        pushToast('error', feedback.title, feedback.description)
        return false
      }
    }

    if (selectedAssetType === 'seasons') {
      const seasonNumberValue = formData.number?.trim()
      if (!seasonNumberValue || Number.isNaN(Number(seasonNumberValue))) {
        const feedback = {
          title: 'Number invalido',
          description: 'O campo Number precisa ser numerico para criar uma season.',
        }

        setStatus(feedback.description)
        pushToast('error', feedback.title, feedback.description)
        return false
      }

      if (!formData.tvShow?.trim()) {
        const feedback = {
          title: 'TV Show obrigatorio',
          description: 'Seleciona um TV Show para gerar a referencia correta da season.',
        }

        setStatus(feedback.description)
        pushToast('error', feedback.title, feedback.description)
        return false
      }
    }

    return true
  }

  async function loadTvShowOptions() {
    try {
      const result = await callGoLedgerApi<unknown>(
        apiBaseUrl,
        username,
        password,
        '/api/query/search',
        {
          query: {
            selector: {
              '@assetType': 'tvShows',
            },
          },
        },
      )

      const options = extractRecords(result)
        .map((record) => {
          const key = getRecordKey(record)
          if (!key) return null

          return {
            value: JSON.stringify({
              '@assetType': 'tvShows',
              '@key': key,
            }),
            label: `${record.title ?? key}`,
          } satisfies SelectOption
        })
        .filter((option): option is SelectOption => Boolean(option))

      setTvShowOptions(options)
    } catch {
      setTvShowOptions([])
    }
  }

  async function loadSchemaOverview() {
    if (!username.trim() || !password) {
      setStatus('Faltam as credenciais do Basic Auth.')
      return
    }

    setIsBusy(true)
    setStatus('A carregar o schema geral da blockchain...')

    try {
      const result = await callGoLedgerApi<unknown>(
        apiBaseUrl,
        username,
        password,
        '/api/query/getSchema',
      )
      const discoveredTypes = extractAssetTypes(result)
      const nextTypes = (discoveredTypes.length ? discoveredTypes : DEFAULT_ASSET_TYPES).map(
        normalizeAssetType,
      )

      setAssetTypes(nextTypes)
      setSelectedAssetType((current) =>
        nextTypes.includes(current) ? current : (nextTypes[0] ?? 'tvShows'),
      )
      setSchemaPreview(stringifyForDisplay(result))
      setStatus('Schema geral carregado. Agora podes abrir qualquer tipo de asset.')
    } catch (error) {
      setStatus(formatError(error))
    } finally {
      setIsBusy(false)
    }
  }

  async function loadAssetSchema(assetType = selectedAssetType) {
    setIsBusy(true)
    setStatus(`A carregar o schema de ${humanizeAssetType(assetType)}...`)

    try {
      const result = await callGoLedgerApi<unknown>(
        apiBaseUrl,
        username,
        password,
        '/api/query/getSchema',
        { assetType: normalizeAssetType(assetType) },
      )
      setSchema(asObject(result))
      setSchemaPreview(stringifyForDisplay(result))
      setStatus(`Schema de ${humanizeAssetType(assetType)} carregado.`)
    } catch (error) {
      setStatus(formatError(error))
    } finally {
      setIsBusy(false)
    }
  }

  async function searchAssets() {
    setIsBusy(true)
    setStatus(`A pesquisar ${humanizeAssetType(selectedAssetType)}...`)

    try {
      const query = JSON.parse(selectorText) as Record<string, unknown>
      const result = await callGoLedgerApi<unknown>(
        apiBaseUrl,
        username,
        password,
        '/api/query/search',
        { query },
      )
      const nextRecords = extractRecords(result)

      setRecords(nextRecords)
      setResponsePreview(stringifyForDisplay(result))
      setStatus(`${nextRecords.length} registos carregados para ${humanizeAssetType(selectedAssetType)}.`)
    } catch (error) {
      setStatus(formatError(error))
    } finally {
      setIsBusy(false)
    }
  }

  async function readOneAsset() {
    if (!selectedKey.trim()) {
      setStatus('Escolhe ou escreve uma key antes de fazer readAsset.')
      return
    }

    setIsBusy(true)
    setStatus('A ler asset individual...')

    try {
      const result = await callGoLedgerApi<unknown>(
        apiBaseUrl,
        username,
        password,
        '/api/query/readAsset',
        {
          key: selectedKey.trim(),
          resolve: true,
        },
      )
      const record = asObject(result)
      setResponsePreview(stringifyForDisplay(result))
      setStatus(`Asset ${selectedKey.trim()} carregado.`)
      if (record) startEdit(record)
    } catch (error) {
      setStatus(formatError(error))
    } finally {
      setIsBusy(false)
    }
  }

  async function submitCreate() {
    if (!validateFormBeforeSubmit()) {
      return
    }

    setIsBusy(true)
    setStatus(`A criar ${humanizeAssetType(selectedAssetType)}...`)

    try {
      const payloadAsset = {
        '@assetType': normalizeAssetType(selectedAssetType),
        ...parseFormData(formData),
      }

      const result = await callGoLedgerApi<unknown>(
        apiBaseUrl,
        username,
        password,
        '/api/invoke/createAsset',
        { asset: [payloadAsset] },
      )
      const createdRecords = extractRecords(result)
      const createdKey = createdRecords[0] ? getRecordKey(createdRecords[0]) : ''

      setResponsePreview(stringifyForDisplay(result))
      setFormData({})
      setSelectedKey(createdKey)
      setIsEditMode(false)
      setStatus(`${humanizeAssetType(selectedAssetType)} criado com sucesso.`)
      pushToast('success', 'Registo criado', createdKey ? `Key criada: ${createdKey}` : 'O novo asset foi enviado para a ledger.')
      await searchAssets()
    } catch (error) {
      setStatus(formatError(error))
      const feedback = describeError(error)
      pushToast('error', feedback.title, feedback.description)
      setIsBusy(false)
    }
  }

  async function submitUpdate() {
    if (!selectedKey.trim()) {
      setStatus('Falta a key do registo para fazer update.')
      return
    }

    if (!validateFormBeforeSubmit()) {
      return
    }

    setIsBusy(true)
    setStatus(`A atualizar ${humanizeAssetType(selectedAssetType)}...`)

    try {
      const update = {
        '@assetType': normalizeAssetType(selectedAssetType),
        '@key': selectedKey.trim(),
        ...parseFormData(formData),
      }

      const result = await callGoLedgerApi<unknown>(
        apiBaseUrl,
        username,
        password,
        '/api/invoke/updateAsset',
        { update },
      )

      setResponsePreview(stringifyForDisplay(result))
      setStatus(`${humanizeAssetType(selectedAssetType)} atualizado com sucesso.`)
      pushToast('success', 'Alteracoes guardadas', 'O registo foi atualizado com sucesso.')
      await searchAssets()
    } catch (error) {
      setStatus(formatError(error))
      const feedback = describeError(error)
      pushToast('error', feedback.title, feedback.description)
      setIsBusy(false)
    }
  }

  async function submitDelete() {
    if (!selectedKey.trim()) {
      setStatus('Falta a key do registo para apagar.')
      return
    }

    if (!window.confirm(`Queres mesmo apagar o asset com a key "${selectedKey.trim()}"?`)) {
      return
    }

    setIsBusy(true)
    setStatus(`A apagar ${humanizeAssetType(selectedAssetType)}...`)

    try {
      const result = await callGoLedgerApi<unknown>(
        apiBaseUrl,
        username,
        password,
        '/api/invoke/deleteAsset',
        { key: selectedKey.trim() },
      )

      setResponsePreview(stringifyForDisplay(result))
      setSelectedKey('')
      setFormData({})
      setIsEditMode(false)
      setStatus(`${humanizeAssetType(selectedAssetType)} removido com sucesso.`)
      pushToast('success', 'Registo apagado', 'O asset foi removido da ledger.')
      await searchAssets()
    } catch (error) {
      setStatus(formatError(error))
      const feedback = describeError(error)
      pushToast('error', feedback.title, feedback.description)
      setIsBusy(false)
    }
  }

  function startEdit(record: AssetRecord) {
    setSelectedKey(getRecordKey(record))
    setIsEditMode(true)
    setFormData(buildFormData(record))
    setStatus(`Modo de edicao ativado para ${getRecordKey(record) || 'asset selecionado'}.`)
  }

  function resetEditor() {
    setSelectedKey('')
    setFormData({})
    setIsEditMode(false)
    setStatus('Editor limpo e pronto para criar um novo registo.')
  }

  function handleAssetTypeSelect(assetType: string) {
    const normalizedAssetType = normalizeAssetType(assetType)
    setSelectedAssetType(normalizedAssetType)
    if (normalizedAssetType === 'seasons') {
      void loadTvShowOptions()
    }
    void loadAssetSchema(normalizedAssetType)
  }

  return (
    <main className="app-shell">
      <section className="topbar">
        <div className="topbar-copy">
          <p className="eyebrow">GoLedger Challenge</p>
          <h1>TV Shows Dashboard</h1>
          <p className="lead">
            CRUD, busca e leitura para <code>{selectedAssetType}</code> com Basic Auth.
          </p>
        </div>

        <div className="topbar-metrics">
          <div className="metric compact-metric">
            <span className="metric-label">Endpoint</span>
            <strong>{apiBaseUrl}</strong>
          </div>
          <div className="metric compact-metric">
            <span className="metric-label">Assets</span>
            <strong>{assetTypes.length}</strong>
          </div>
          <div className="metric compact-metric">
            <span className="metric-label">Estado</span>
            <strong>{isBusy ? 'A processar' : 'Pronto'}</strong>
          </div>
        </div>
      </section>

      <ConnectionPanel
        apiBaseUrl={apiBaseUrl}
        username={username}
        password={password}
        isBusy={isBusy}
        onApiBaseUrlChange={setApiBaseUrl}
        onUsernameChange={setUsername}
        onPasswordChange={setPassword}
        onLoadSchemaOverview={() => void loadSchemaOverview()}
      />

      <AssetTabs
        assetTypes={assetTypes}
        selectedAssetType={selectedAssetType}
        onSelect={handleAssetTypeSelect}
      />

      <section className="workspace">
        <SearchPanel
          isBusy={isBusy}
          selectorText={selectorText}
          selectedKey={selectedKey}
          selectedAssetType={selectedAssetType}
          records={records}
          resultCount={records.length}
          onSelectorChange={setSelectorText}
          onSelectedKeyChange={setSelectedKey}
          onSearch={() => void searchAssets()}
          onReadOne={() => void readOneAsset()}
          onEditRecord={startEdit}
        />

        <EditorPanel
          isBusy={isBusy}
          isEditMode={isEditMode}
          selectedAssetType={selectedAssetType}
          schemaFields={schemaFields}
          formData={formData}
          tvShowOptions={tvShowOptions}
          onFieldChange={(field, value) =>
            setFormData((current) => ({ ...current, [field]: value }))
          }
          onReset={resetEditor}
          onSubmit={() => void (isEditMode ? submitUpdate() : submitCreate())}
          onDelete={() => void submitDelete()}
        />
      </section>

      <DebugPanel
        schemaPreview={schemaPreview}
        responsePreview={responsePreview}
      />

      <section className="status-bar" aria-live="polite">
        {status}
      </section>

      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </main>
  )
}

export default App
