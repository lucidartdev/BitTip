'use client'
import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { getContract, getReadOnlyContract } from '../lib/contract'

type Props = {
  provider?: ethers.providers.Web3Provider
  defaultCreator?: string
  onTipSent?: () => void
}

export default function TipForm({
  provider,
  defaultCreator = '',
  onTipSent,
}: Props) {
  const [amount, setAmount] = useState('0.01')
  const [creator, setCreator] = useState(defaultCreator)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [ensResolveLoading, setEnsResolveLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // if defaultCreator changes (e.g. route param) update field
    setCreator(defaultCreator)
  }, [defaultCreator])

  async function tryResolveENS(nameOrAddress: string) {
    if (!nameOrAddress) return nameOrAddress
    if (!provider) return nameOrAddress
    if (ethers.isAddress(nameOrAddress)) return nameOrAddress
    try {
      setEnsResolveLoading(true)
      const resolved = await provider.resolveName(nameOrAddress)
      return resolved || nameOrAddress
    } catch {
      return nameOrAddress
    } finally {
      setEnsResolveLoading(false)
    }
  }

  async function sendTip() {
    setError(null)
    if (!provider) return setError('Connect wallet first')
    if (!creator) return setError('Provide creator address or ENS name')
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0)
      return setError('Invalid amount')

    try {
      setLoading(true)
      const signer = provider.getSigner()
      const contract = getContract(signer)

      // resolve ENS if user typed it
      const resolvedCreator = await tryResolveENS(creator)
      if (!ethers.isAddress(resolvedCreator)) {
        setError('Creator address is invalid (ENS failed to resolve)')
        setLoading(false)
        return
      }

      const value = ethers.parseEther(amount)

      const tx = await contract.sendTip(resolvedCreator, message, { value })
      setTxHash(tx.hash)

      // wait for confirmation
      await tx.wait()

      // success
      setMessage('')
      setAmount('0.01')
      setTxHash(null)
      onTipSent?.()
      alert('Tip sent — thank you!')
    } catch (err: any) {
      console.error(err)
      setError(err?.message || 'Transaction failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Creator (address or ENS)</label>
        <input
          value={creator}
          onChange={(e) => setCreator(e.target.value)}
          placeholder="0xabc... or alice.eth"
          className="w-full p-2 border rounded"
        />

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-sm font-medium">Amount (ETH)</label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2 border rounded"
              inputMode="decimal"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Optional message</label>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Nice content!"
            />
          </div>
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}

        <div className="flex items-center gap-2">
          <button
            onClick={sendTip}
            disabled={loading || ensResolveLoading}
            className="px-4 py-2 bg-emerald-600 text-white rounded disabled:opacity-60"
          >
            {loading ? 'Sending...' : 'Send Tip'}
          </button>

          {txHash && (
            <a
              href={`${
                process.env.NEXT_PUBLIC_EXPLORER_BASE ||
                'https://sepolia.etherscan.io'
              }/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              className="text-sm underline"
            >
              View tx
            </a>
          )}
        </div>

        <div className="text-xs text-gray-500">
          TipJar uses on-chain storage for small messages — avoid extremely long
          messages to save gas.
        </div>
      </div>
    </div>
  )
}
