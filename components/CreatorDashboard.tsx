'use client'
import React, { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { getContract, getReadOnlyContract } from '../lib/contract'

type Tip = {
  from: string
  amount: string // ETH string
  message: string
  timestamp: number
}

type Props = {
  creatorAddress: string
  provider?: ethers.providers.Web3Provider
  rpcUrl?: string // optional: custom RPC for read-only provider
}

export default function CreatorDashboard({
  creatorAddress,
  provider,
  rpcUrl,
}: Props) {
  const [tips, setTips] = useState<Tip[]>([])
  const [total, setTotal] = useState('0')
  const [loading, setLoading] = useState(false)
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null)
  const [withdrawLoading, setWithdrawLoading] = useState(false)

  useEffect(() => {
    ;(async () => {
      if (!creatorAddress) return
      await loadTips()
      // detect connected account if provider exists
      if (provider) {
        try {
          const signer = provider.getSigner()
          const addr = await signer.getAddress()
          setConnectedAddress(addr)
        } catch {
          setConnectedAddress(null)
        }
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creatorAddress, provider])

  async function loadTips() {
    setLoading(true)
    try {
      // prefer a read-only provider so we do not require wallet
      const readProvider = rpcUrl
        ? new ethers.JsonRpcProvider(rpcUrl)
        : provider
        ? provider
        : ethers.getDefaultProvider()
      const contract = getReadOnlyContract(readProvider)

      const countBN = await contract.getTipCount(creatorAddress)
      const count = Number(countBN.toString())
      const arr: Tip[] = []
      for (let i = 0; i < count; i++) {
        const res = await contract.getTip(creatorAddress, i)
        arr.push({
          from: res.from,
          amount: ethers.formatEther(res.amount),
          message: res.message,
          timestamp: Number(res.timestamp.toString()),
        })
      }

      const tot = await contract.totalTips(creatorAddress)
      setTips(arr.reverse()) // most recent first
      setTotal(ethers.formatEther(tot))
    } catch (err) {
      console.error('Failed to load tips:', err)
    } finally {
      setLoading(false)
    }
  }

  async function withdraw() {
    if (!provider) return alert('Connect wallet as the creator to withdraw')
    try {
      setWithdrawLoading(true)
      const signer = provider.getSigner()
      const contract = getContract(signer)
      const tx = await contract.withdraw()
      await tx.wait()
      alert('Withdrawn successfully')
      await loadTips()
    } catch (err: any) {
      console.error(err)
      alert(err?.message || 'Withdraw failed')
    } finally {
      setWithdrawLoading(false)
    }
  }

  const isCreatorConnected =
    connectedAddress &&
    connectedAddress.toLowerCase() === creatorAddress.toLowerCase()

  return (
    <div className="space-y-4">
      <div className="p-4 border rounded bg-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">Creator</div>
            <div className="font-mono">{creatorAddress}</div>
            <div className="text-xs text-gray-600">
              Total tipped: <strong>{total} ETH</strong>
            </div>
          </div>

          <div>
            <button
              onClick={withdraw}
              disabled={!isCreatorConnected || withdrawLoading}
              className="px-4 py-2 rounded bg-indigo-600 text-white disabled:opacity-60"
            >
              {withdrawLoading ? 'Withdrawing...' : 'Withdraw'}
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Recent tips</h3>
        {loading ? (
          <div className="text-sm text-gray-500">Loading tips…</div>
        ) : tips.length === 0 ? (
          <div className="text-sm text-gray-500">
            No tips yet — share your creator link!
          </div>
        ) : (
          <div className="space-y-2">
            {tips.map((t, i) => (
              <div key={i} className="p-3 border rounded bg-white">
                <div className="flex justify-between items-start">
                  <div className="text-sm font-mono">{t.from}</div>
                  <div className="text-sm font-semibold">{t.amount} ETH</div>
                </div>
                <div className="text-sm mt-1">
                  {t.message || (
                    <span className="text-gray-400">— no message —</span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {new Date(t.timestamp * 1000).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
