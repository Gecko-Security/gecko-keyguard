
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

## What is KeyGuard?
KeyGuard is a decentralized key management infrastructure designed for dApps and users to securely manage account signer keys on the XRP Ledger. This addresses the vulnerabilities associated with centralized key management systems, which have historically led to significant financial losses.


## Features
- **Signer Key Management**: Allows dApps to manage their account signer keys in a secure decentralized way.
- **Transaction Signing**: Provides foundational features to sign XRPL transactions securely.
- **NPL Round**: Facilitates sub-consensus rounds on the P2P network for signature distribution and collection.

## Images


<img width="1510" style="border-radius: 50px;" src="https://github.com/user-attachments/assets/1a4c49be-a61a-40f6-995a-a8c87b5e6a22">
<img width="1510" style="border-radius: 50px;" src="https://github.com/user-attachments/assets/2ad1cf56-6043-443d-b0a2-1bd71ecada70">


## How it Works 
 (*KeyGuard is currently in alpha and is not suitable for production*)



<img width="1510" alt="Architecture" src="https://github.com/user-attachments/assets/f7a27e04-01cd-49a5-a9df-c6db849b9d49">
<br><br>

1. **Nodes**: KeyGuard generates a network of decentralized nodes, each operating independently with its own private key. 
2. **Account Creation**: An XRPL account is created and funded using the XRPL faucet. This account serves as the dApp's primary XRPL account.
3. **Security Configuration**:
    - An `AccountSet` transaction disables the master key of the XRPL account, ensuring only listed signer keys can authorize transactions.
    - A `SignerListSet` transaction updates the SignerList to include keys from all nodes, granting each node the authority to participate in transaction signing.
4. **Transaction Process**:
    - Each node constructs identical transaction details (sender, destination, amount).
    - The transaction data is hashed before signing to ensure uniformity across nodes.
    - Nodes use their private keys to generate digital signatures of the transaction hash.
    - These signed hashes are broadcast to all participating nodes in the network.
5. **Signature Collection and Verification**:
    - Nodes collect signatures from other nodes until a sufficient number meet the required quorum.
    - Each node verifies the collected signatures to ensure validity and integrity.
6. **Multi-Signature Creation**:
    - Valid signatures are combined into a single multi-signature transaction using the [`combine`](https://xrpl.org/docs/tutorials/how-tos/manage-account-settings/send-a-multi-signed-transaction/#4.-combine-signatures-and-submit)function.
    - This process creates a transaction blob containing all valid signatures.
7. **Submission and Validation**:
    - The combined multi-signature transaction is submitted to a Ripple node for validation.
    - The XRPL validates the transaction against the signer list and other rules before including it in the ledger.

KeyGuard leverages XRPL.js for its core decentralized key management module and uses Java with XRPL4J for simulated nodes to manage signer lists and handle transactions. 

## How to Run

#### Requirements
- JDK 1.8 or higher
- A Java project manager such as Maven or Gradle


To run the frontend, enter the `frontend` folder and install all necessary `node.js` dependencies

    npm i

and then run the MVP of KeyGuard locally using

    npm run dev

which will create an endpoint at `localhost:3000`, please proceed to `localhost:3000/dashboard` to interact with the MVP. 

To locally run the simulated Java nodes using Gradle or build using Docker and simply create a boostrap config file with the XRPL.js API and the relevant node settings and list the transactions to run.


    mvn clean install



Demo: [https://www.youtube.com/watch?v=ZjeqdT0yWF8](https://www.youtube.com/watch?v=ZjeqdT0yWF8)


### Roadmap
- [x] Working MVP Prototype
- [ ] Developing the core DKMI using XRPL.js
- [ ] Production nodes using XRPL4J
- [ ] Imeplementation of decentralized signer key management and transaction signing
- [ ] Completed sub-consensus rounds (NPL) for signature distribution for the nodes.
- [ ] JS SDK for developers
- [ ] Developer APIs
- [ ] Node SDK
- [ ] Security and Scalability Testing
- [ ] Documentation



### License
KeyGuard is an open-source software licensed under the [MIT License](https://github.com/Gecko-Security/gecko-keyguard/blob/main/MIT_LICENSE.txt)
