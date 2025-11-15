'use client'
import React, { useState } from 'react'
import { ethers } from 'ethers'
import { getContract } from '../lib/contract'

export default function TipForm({
  provider,
}: {
  provider?: ethers.providers.Web3Provider
}) {
  const [amount, setAmount] = useState('0.01')
  const [creator, setCreator] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function sendTip() {
    if (!provider) return alert('Connect wallet')
    if (!creator) return alert('Provide creator address')
    try {
      setLoading(true)
      const signer = provider.getSigner()
      const contract = getContract(signer)
      const value = ethers.parseEther(amount)
      const tx = await contract.sendTip(creator, message, { value })
      await tx.wait()
      alert('Tipped!')
      setMessage('')
    } catch (err: any) {
      console.error(err)
      alert(err?.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 border rounded space-y-3">
      <label className="block">Creator address</label>
      <input
        value={creator}
        onChange={(e) => setCreator(e.target.value)}
        className="w-full p-2 border rounded"
      />

      <label>Amount (ETH)</label>
      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full p-2 border rounded"
      />

      <label>Message (optional)</label>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full p-2 border rounded"
      />

      <button
        disabled={loading}
        onClick={sendTip}
        className="px-4 py-2 bg-emerald-600 text-white rounded"
      >
        {loading ? 'Sending...' : 'Send Tip'}
      </button>
    </div>
  )
}
