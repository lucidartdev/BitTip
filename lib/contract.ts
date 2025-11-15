import { ethers } from 'ethers'
import abi from '../public/abi.json'

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || ''

/**
 * providerOrSigner: ethers.Signer | ethers.Provider
 * returns a contract instance bound to the provided signer/provider
 */
export function getContract(
  providerOrSigner: ethers.Signer | ethers.providers.Provider
) {
  return new ethers.Contract(
    CONTRACT_ADDRESS,
    abi as any,
    providerOrSigner as any
  )
}

/**
 * Creates a read-only contract using either the NEXT_PUBLIC_RPC or the default provider
 */
export function getReadOnlyContract(rpcProvider?: ethers.providers.Provider) {
  const provider =
    rpcProvider ||
    (typeof window !== 'undefined' && (window as any).ethereum
      ? new ethers.BrowserProvider((window as any).ethereum)
      : ethers.getDefaultProvider())
  return new ethers.Contract(CONTRACT_ADDRESS, abi as any, provider as any)
}
