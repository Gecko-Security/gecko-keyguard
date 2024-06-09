# KeyGuard
KeyGuard is the first decentralized key management (DKM) infrastructure built on the XRP Ledger. It enables dApps to efficiently and securely manage account signer keys in a decentralized manner.

## Why
When designing decentralized applications on the XRP Ledger, managing signer keys for the dApp's XRPL account is a critical issue. Each dApp requires ownership and management of its XRPL account in a decentralized manner to ensure no single entity has complete control. This decentralization enhances security and trustlessness, avoiding costly exploits like the GateHub attack on the XRPL, where $23 million XRP was lost due to centralized key management.

## Key Features
- **Signer Key Management**: Allows dApps to manage their XRPL account signer keys in a decentralized manner.
- **Transaction Signing**: Provides foundational features to sign XRPL transactions securely.
- **NPL Round**: Facilitates sub-consensus rounds on the P2P network for signature distribution and collection.

## How it Works 
(example of generating an account and singing a transaction)
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
## Contributing

KeyGuard is open-source and a community effort. Contributions are welcome to improve and expand the framework.

## License

KeyGuard is released under the MIT License.
