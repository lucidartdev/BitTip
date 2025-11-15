# TipJar — Decentralized ETH Tipping Dapp

A fully on-chain ETH tipping application built with **Solidity**, **Next.js**,  and **Tailwind CSS**.

Users can tip creators directly on-chain, and creators can view their tip history and withdraw accumulated ETH.

---

## 🚀 Features

* **Smart Contract Storage** of all tips (amount, message, sender, timestamp)
* **Creator dashboard**: total tips, history, withdraw button
* **Tip form** to send ETH + optional message
* **Supports any EVM chain** (Base, Sepolia, Polygon, etc.)
* Fully decentralized — no backend required

---

### Key Functions

| Function                                   | Description                   |
| ------------------------------------------ | ----------------------------- |
| `sendTip(address creator, string message)` | Send ETH + message to creator |
| `getTip(address creator, uint index)`      | Read a single tip             |
| `getTipCount(address creator)`             | Number of tips stored         |
| `totalTips(address creator)`               | Total ETH tipped              |
| `withdraw()`                               | Creator withdraws their tips  |

### Events

* `TipSent(address indexed from, address indexed creator, uint amount, string message)`
* `Withdraw(address indexed creator, uint amount)`

---

### Technology Used

* **Next.js App Router** (server components + client components)
* **Tailwind CSS** styled UI
* **Ethers.js v6** to handle contract calls
* **Wallet connection Wallet connect Appkit**

---

## 📝 License

MIT — free to use, modify, and deploy your own version.


