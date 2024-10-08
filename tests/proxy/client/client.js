/* eslint-disable no-undef */
/* eslint-disable indent */
const Node = require("node-js-client");
const prompt = require("prompt-sync")();
const fs = require("fs");

// A simple client to interact with the "proxy" test dApp
async function GetKey(readable = false) {
    if (!fs.existsSync("user.key")) {
        const newKeyPair = await Node.generateKeys();
        const saveData = Buffer.from(newKeyPair.privateKey).toString("hex");
        fs.writeFileSync("user.key", saveData);
    }
    var savedPrivateKeyHex = fs.readFileSync("user.key").toString();
    var userKeyPair = await Node.generateKeys(savedPrivateKeyHex);

    if (!readable) {
        return userKeyPair;
    } else {
        return savedPrivateKeyHex;
    }
}

async function Connect() {
    const client = await Node.createClient(["wss://localhost:8081"], await GetKey());

    if (!await client.connect()) {
            console.log("Connection failed.");
            return;
    }

    client.on(Node.events.contractOutput, (result) => {
        result.outputs.forEach((o) => console.log(o));
    });
    return client;
}

async function RelayTx({TransactionType, Destination, Amount}) {
    const request = {
        TransactionType: TransactionType,
        Destination: Destination,
        Amount: Amount
    };

    var client = await Connect();
    client.submitContractInput(JSON.stringify(request));
}

async function clientApp() {
    console.log("1. Relay transaction to dApp");
    console.log("2. Exit");

    const code = prompt("ENTER CODE: ");

    if (code == 1) {
        console.log("\nYou will be relaying a Payment transaction to the dApp.\n");
        const destination = prompt("Destination: ");
        const amount = prompt("Amount: ");

        RelayTx({
            TransactionType: "Payment",
            Destination: destination,
            Amount: amount
        });

    } else {
        return;
    }
}

clientApp();