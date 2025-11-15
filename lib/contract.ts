import { ethers } from 'ethers'
import abi from '../public/abi.json'

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || ''

export function getContract(providerOrSigner: ethers.Signer | ethers.providers.Provider) {
  return new ethers.Contract(CONTRACT_ADDRESS, abi, providerOrSigner)
}