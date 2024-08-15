
<p align="center">
<br />
    <img src="https://github.com/user-attachments/assets/bb4f9421-7c22-4273-9404-8171a10f11bf" width="500" alt=""/>
<br />
</p>
<p align="center"><strong style="font-size: 24px;">Decentralized Key Management Infrastructure for XRPL</strong></p>
<p align="center" style="display: flex; justify-content: center; align-items: center;">
    <span style="display: inline-flex; align-items: center; background-color: #1c1c1c; padding: 5px; border-radius: 6px;">
    </span>
</p>


---

### What is KeyGuard?
KeyGuard is a decentralized key management infrastructure designed for dApps and users to securely manage account signer keys on the XRP Ledger. 

### Features
- **Signer Key Management**: Allows dApps to manage their XRPL account signer keys in a decentralized manner.
- **Transaction Signing**: Provides foundational features to sign XRPL transactions securely.
- **NPL Round**: Facilitates sub-consensus rounds on the P2P network for signature distribution and collection.

## Images
Demo: [https://youtu.be/8y31W2issvc](https://youtu.be/8y31W2issvc)

<img width="1510" style="border-radius: 50px;" src="https://github.com/user-attachments/assets/1a4c49be-a61a-40f6-995a-a8c87b5e6a22">
<img width="1510" style="border-radius: 50px;" src="https://github.com/user-attachments/assets/2ad1cf56-6043-443d-b0a2-1bd71ecada70">


## How it Works 
 (*KeyGuard is currently in alpha ans is not suitable for production*)
- A network of decentralised nodes is generated (e.g. 5 nodes), each operating independently with its own private key.
- A funded account is generated using the XRPL faucet, which will be used as the dApp's XRPL account.
- `accountSet` transaction: The master key is disabled to ensure only the listed signer keys can authorize transactions.
- `signerListSet` transaction: The SignerList is updated to include the keys of all the nodes, giving each node the authority to participate in signing transactions.
- To create a transaction, each node in the network constructs the same transaction details (sender, destination, amount).
- The transaction data is hashed before signing to ensure each node signs the exact same transaction data.
- Each node uses its private key to generate a digital signature of the transaction hash.
- Each node broadcasts its signed transaction hash to all other participating nodes in the network.
- Nodes receive signatures from other nodes and store them until a sufficient number of valid signatures are met to meet the required quorum.
- Each node verifies the collected signatures using the private keys, ensuring the signatures are valid and untampered.
- The signatures are combined into a single multi-signature transaction. The [`combine`](https://xrpl.org/docs/tutorials/how-tos/manage-account-settings/send-a-multi-signed-transaction/#4.-combine-signatures-and-submit)function is used to create a transaction blob that includes all valid signatures
- The combined multi-signature transaction is submitted to a ripple node for validation. The XRPL validates the transaction against the signer list and other rules before including it in the ledger.
<img width="1510" alt="Architecture" src="https://github.com/user-attachments/assets/f7a27e04-01cd-49a5-a9df-c6db849b9d49">


## Technical
The core technology includes a decentralised key management module developed in JavaScript using XRPL.js and simulated nodes developed in Java with XRPL4J to manage signer lists and handle transactions. KeyGuard starts by generating a network of decentralised nodes, each operating independently with its own private key. This setup ensures that no single point of failure exists, distributing trust and security across the network. A funded account can then generated using the XRPL faucet to serve as the dApp's XRPL account.

To enhance security, an `AccountSet` transaction was employed to disable the master key of the XRPL account, ensuring that only the listed signer keys could authorise transactions. The `SignerListSet` transaction was then used to update the `SignerList` with the keys of all the nodes, allowing each node to participate in signing transactions, promoting a decentralised decision-making process.

Each node constructs the same transaction details, such as sender, destination, and amount. The transaction data is hashed before signing to ensure uniformity. Each node uses its private key to generate a digital signature of the transaction hash and broadcasts this signed transaction hash to all other participating nodes. Nodes receive signatures from other nodes and stores them until the required quorum of valid signatures is met. Each node verifies the collected signatures to ensure they are valid and untampered.

Valid signatures are then combined into a single multi-signature transaction using the `combine` function, creating a transaction blob that includes all signatures. This multi-signature transaction is submitted to a ripple node for validation. The XRP Ledger validates the transaction against the signer list and other rules before including it in the ledger, ensuring the integrity and security of the transaction process.

### Roadmap
Alpha Prototype
- [x] Working MVP Prototype


Beta Version
- [ ] Developing the core DKMI using XRPL.js
- [ ] Production nodes using XRPL4J
- [ ] Imeplementation of decentralized signer key management and transaction signing
- [ ] Completed sub-consensus rounds (NPL) for signature distribution for the nodes.
- [ ] JS SDK for developers
- [ ] Developer APIs


Production Release
- [ ] Node SDK
- [ ] Security and Scalability Testing
- [ ] Documentation



### License
KeyGuard is an open-source software licensed under the [MIT License](https://github.com/Gecko-Security/gecko-keyguard/blob/main/MIT_LICENSE.txt)
