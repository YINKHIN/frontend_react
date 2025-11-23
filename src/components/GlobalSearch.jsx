import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, Loader2, Box, Users, ShoppingCart, CreditCard, Truck, X as XIcon } from 'lucide-react'
import { request } from '../utils/request'
import { useNavigate } from 'react-router-dom'

const debounce = (fn, delay) => {
  let t
  return (...args) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), delay)
  }
}

const ENTITY_META = {
  product: { icon: Box, route: '/products', labelKey: 'pro_name' },
  user: { icon: Users, route: '/users', labelKey: 'name' },
  order: { icon: ShoppingCart, route: '/orders', labelKey: 'id' },
  payment: { icon: CreditCard, route: '/payments', labelKey: 'id' },
  supplier: { icon: Truck, route: '/suppliers', labelKey: 'supplier' },
  customer: { icon: Users, route: '/customers', labelKey: 'cus_name' },
}

export default function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [recent, setRecent] = useState(() => {
    try { return JSON.parse(localStorage.getItem('global_search_recent') || '[]') } catch { return [] }
  })
  const inputRef = useRef(null)
  const navigate = useNavigate()

  const clearRecent = () => {
    setRecent([])
    try { localStorage.removeItem('global_search_recent') } catch {}
  }

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(o => !o)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0)
  }, [open])

  const doSearch = useMemo(() => debounce(async (term) => {
    if (!term || term.trim().length < 2) { setResults([]); setLoading(false); return }
    setLoading(true)
    try {
      const endpoints = [
        { key: 'product', url: '/products' },
        { key: 'user', url: '/users' },
        { key: 'order', url: '/orders' },
        { key: 'payment', url: '/payments' },
        { key: 'supplier', url: '/suppliers' },
        { key: 'customer', url: '/customers' },
      ]
      const qs = { q: term, search: term }
      const qLower = term.toLowerCase()
      const promises = endpoints.map(async ({ key, url }) => {
        try {
          const res = await request.get(url, { params: qs })
          const arr = res?.data?.data || res?.data || res || []
          // Basic client-side filter to reduce noise if backend ignores q
          const filtered = arr.filter((item) => {
            const cand = [
              item.pro_name,
              item.name,
              item.cus_name,
              item.supplier,
              item.email,
              String(item.id || ''),
            ]
              .filter(Boolean)
              .join(' ')
              .toLowerCase()
            return cand.includes(qLower)
          })
          return filtered.slice(0, 5).map(item => ({ key, item }))
        } catch {
          return []
        }
      })
      const groups = await Promise.all(promises)
      setResults(groups.flat())
    } finally {
      setLoading(false)
    }
  }, 300), [])

  useEffect(() => { setLoading(query.length >= 2); doSearch(query) }, [query, doSearch])

  const onPick = (r) => {
    const meta = ENTITY_META[r.key]
    if (!meta) return
    const label = r.item[meta.labelKey] ?? `#${r.item.id}`
    const entry = { q: query, key: r.key, label, ts: Date.now() }
    const next = [entry, ...recent.filter(x => x.label !== label)].slice(0, 8)
    setRecent(next)
    localStorage.setItem('global_search_recent', JSON.stringify(next))
    setOpen(false)
    navigate(meta.route)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20 rounded-md border border-white/20"
        title="Global search (Ctrl+K)"
      >
        <Search className="w-4 h-4 mr-2" />
        <span>Search...</span>
        <span className="ml-2 text-xs opacity-70">Ctrl+K</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setOpen(false)}>
          <div className="mx-auto mt-20 max-w-2xl" onClick={e => e.stopPropagation()}>
            <div className="bg-white text-black rounded-lg shadow-lg overflow-hidden">
              <div className="flex items-center px-4 py-3 border-b">
                <Search className="w-4 h-4 text-black mr-2" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products, users, orders..."
                  className="w-full outline-none text-sm text-black"
                />
                {query && !loading && (
                  <button
                    onClick={() => { setQuery(''); setResults([]); setLoading(false) }}
                    aria-label="Clear search"
                    className="ml-2 p-1 rounded hover:bg-gray-100"
                  >
                    <XIcon className="w-4 h-4 text-gray-400" />
                  </button>
                )}
                {loading && <Loader2 className="w-4 h-4 animate-spin text-gray-400 ml-2" />}
              </div>
              <div className="max-h-80 overflow-auto">
                {query.length < 2 && recent.length > 0 && (
                  <div className="flex items-center justify-between px-3 py-2 text-xs text-gray-500">
                    <div>Recent</div>
                    <button
                      className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 text-gray-500"
                      onClick={clearRecent}
                      title="Clear recent"
                    >
                      <XIcon className="w-3 h-3" />
                      <span>Clear</span>
                    </button>
                  </div>
                )}
                {query.length < 2 && recent.map((r, i) => (
                  <div key={i} className="px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer" onClick={() => setQuery(r.label)}>
                    {r.label}
                  </div>
                ))}
                {query.length >= 2 && results.length === 0 && !loading && (
                  <div className="px-4 py-6 text-center text-sm text-gray-500">No results</div>
                )}
                {results.map((r, i) => {
                  const meta = ENTITY_META[r.key]
                  const Icon = meta?.icon || Search
                  const primary = r.item?.[meta?.labelKey]
                  const label = (primary && String(primary).trim())
                    || r.item.name
                    || r.item.pro_name
                    || r.item.cus_name
                    || r.item.supplier
                    || (r.item.id ? `#${r.item.id}` : 'Unknown')
                  const sub = r.key === 'user' ? r.item.email
                    : r.key === 'product' ? (r.item.barcode || r.item.category?.name)
                    : r.key === 'order' ? `Total: ${r.item.total ?? ''}`
                    : r.key === 'payment' ? `Deposit: ${r.item.deposit ?? ''}`
                    : r.key === 'customer' ? (r.item.cus_contact || '')
                    : r.key === 'supplier' ? (r.item.sup_con || '')
                    : ''
                  return (
                    <div key={i} className="px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer flex items-center" onClick={() => onPick(r)}>
                      <Icon className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="truncate text-black">
                        {label}
                        {sub ? <span className="ml-2 text-xs text-gray-400">{sub}</span> : null}
                      </span>
                      <span className="ml-auto text-xs text-gray-400 capitalize">{r.key}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}


