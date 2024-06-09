const fs = require('fs');
const crypto = require('crypto');
const xrpl = require("xrpl");
const compare = require('underscore');
const EventEmitter = require("events");
const VerifySignature = require("verify-xrpl-signature").verifySignature;

const datasetEmitter = new EventEmitter(); 

function GetClient(network, index) {
	const ClientURL = JSON.parse(fs.readFileSync(__dirname+'/DKM/setup/bootstrap_state.json').toString());
	if (index === undefined) {var index = Math.abs(Math.floor(Math.random() * ClientURL.node[network].length - 1)); }
	const node_URL = ClientURL.node[network][index];
	return node_URL;
}

function GetSignerCredentials(ctx) {
	const KeyFile = `../${ctx.publicKey}-signerKey.json`;

	if (!fs.existsSync(KeyFile)) {
        const node_wallet = xrpl.Wallet.generate(),
			  file_data = {
				"seed": node_wallet.seed,
            	"address": node_wallet.classicAddress
			  };

        fs.writeFileSync(path=KeyFile, data=JSON.stringify(file_data));
    }

	const signer_credentials = JSON.parse(fs.readFileSync(KeyFile).toString());
	return signer_credentials;
}

function GetAccountCredentials() {
	const account_credentials = JSON.parse(fs.readFileSync(__dirname+"/DKM/dApp/XRPL_account.json").toString());
	return account_credentials;
}

function GetNPLTimeoutValue(type) {
	return JSON.parse(fs.readFileSync(__dirname+'/DKM/setup/bootstrap_state.json').toString()).config.NPL_round_timeout[type];
}

function Log(type, message) {
	message = `DKM ${type}: ${message}`;
	console.log(message);

	fs.appendFileSync(path=`../GENERAL-logs.txt`, data=message);
	if (type === "FTL") { fs.appendFileSync(path=`../${type}-logs.txt`, data=message); } // FATAL
	if (type === "ERR") { fs.appendFileSync(path=`../${type}-logs.txt`, data=message); } // ERROR
	if (type === "WRN") { fs.appendFileSync(path=`../${type}-logs.txt`, data=message); } // WARN
	if (type === "INF") { fs.appendFileSync(path=`../${type}-logs.txt`, data=message); } // INFO
	if (type === "DBG") { fs.appendFileSync(path=`../${type}-logs.txt`, data=message); } // DEBUG
}

function GetVoteCount({votes, unl_size}) {

	const quorum = JSON.parse(fs.readFileSync(__dirname+'/DKM/setup/bootstrap_state.json').toString()).config.quorum.voting_quorum;

	if (votes.length >= Math.ceil(unl_size * quorum)) {
		const key_votes = {};
		votes.forEach(proposal => {
			const indexed_keys = [];
			proposal.forEach(key => {
				if (!indexed_keys.includes(key)) {
					if (key in key_votes) {
						key_votes[key] += 1;
					} else {
						key_votes[key] = 1;
					}
					indexed_keys.push(key);
				}
			});
		});

		const valid_key = [];
		Object.keys(key_votes).forEach(key => {
			if (key_votes[key] >= Math.ceil(votes.length * quorum)) {
				valid_key.push(key);
			}
		});

		return valid_key;
	} else {
		Log(type="INF", message="GetVoteCount(): Low proposals, unable to return keys with enough votes");
		return [];
	}
}

 function PackageTxAPI({account, destination, amount, signer_list_quorum, MEMO}) {
	if (amount === undefined || typeof amount != "string" || typeof Number(amount) != "number") {
		amount = "1"; 
	}

	return {
        TransactionType: "Payment",
		Account: account,
		Destination: destination,
		Amount: amount,
		Fee: ((signer_list_quorum + 1) * 11).toString(),
		Memos: [{
				Memo: {
					MemoType: Buffer.from(MEMO.memo_type, 'utf8').toString('hex'),
					MemoData: Buffer.from(MEMO.memo_data, 'utf8').toString('hex'),
            		MemoFormat: Buffer.from(MEMO.memo_format, 'utf8').toString('hex') 
				}
		}]
	};
}

async function AutofillTx({tx, signer_count, fee, client}) {
	try {
		if (signer_count >= 1) {
			if (tx.Fee === undefined) {
				if (fee === undefined) {
					fee = 11;
				}
				tx.Fee = ((signer_count + 1) * fee).toString();
			}
			var prepared_tx = await client.autofill(tx, signer_count);
		} else {
			var prepared_tx = await client.autofill(tx);
		}
	} catch (err) {
		return err;
	}
	return prepared_tx;
}

async function SubmitTx({tx, client}) {
	if (typeof tx == "number") {
		Log(type="INF", message="SubmitTx(): No signed transaction blob was provided");
	} else {
		try {
			await client.submit(tx);
		} catch (err) {
			Log(type="ERR", message=`SubmitTx(): Error submitting transaction to rippled node. Error: ${err}`);
		}
	}
}


async function RequestRippled({request, client}) {
	try {
	  	var response = await client.request(request);
	} catch (err) {
		return err;
	}
    return response;
}

async function GetSignerList({account_address, client}) {
	const dApp_signer_list = await RequestRippled({
		request: {
			"command": "account_objects",
			"account": account_address,
			"ledger_index": "validated",
			"type": "signer_list"
		},
		client: client
	});

	try {
		const signer_list = dApp_signer_list.result.account_objects[0].SignerEntries;
		const dApp_signers = [],
			signer_weight = [];
		signer_list.forEach(signer => {
			dApp_signers.push(signer.SignerEntry.Account);
			signer_weight.push({account: signer.SignerEntry.Account, weight: signer.SignerEntry.SignerWeight});
		});

		return {
			signers: dApp_signers,
			signer_weight: signer_weight,
			quorum: dApp_signer_list.result.account_objects[0].SignerQuorum
		};
	} catch(err) {
		Log(type="WRN", message=`GetSignerList(): dApp's account ${account_address} does not have a SignerList`);
		return [];
	}
}

async function CheckTxPayment({account_credentials, client}) {
	const request = await RequestRippled({
		request: {
			command: 'account_tx',
			account: account_credentials.address,
			ledger_index_min: account_credentials.sequence+1,
			ledger_index_max: -1,
			binary: false,
			forward: true
		},
		client: client
	});

	if (request.result.transactions.length >= 1) {
		account_credentials.sequence = request.result.transactions[request.result.transactions.length-1].tx.ledger_index;
        fs.writeFileSync(path=__dirname+"/DKM/dApp/XRPL_account.json", data=JSON.stringify(account_credentials));
		return request.result.transactions;
	} else {
		return [];
	}
}


function SetupNPL({ctx, debug}) {
	const rounds = {};
	ctx.unl.onMessage((node, msg) => {
        const { roundName, data } = JSON.parse(msg.toString()); 
		if (!(roundName in rounds)) {
			rounds[roundName] = [node.publicKey];
			datasetEmitter.emit(roundName, data);
		} else {
			if (!(node in rounds[roundName])) {
				rounds[roundName].push(node.publicKey);
				datasetEmitter.emit(roundName, data);
			} else {
				Log(type="WRN", message=`NPL: Warning - ${node.publicKey} sent more than 1 message in a NPL round!`);
			}
		}

		if (debug) {
			console.log("NPL: Rounds' participants -", rounds);
		}
	});
}


async function NPLResponse({content, desired_count, ctx, timeout, strict, debug}) {
	const NPL = (roundName, desired_count, timeout) => {
		return new Promise((resolve) => {
			const collected = [];

			const timer = setTimeout(() => {
				if (debug === true) {
                    Log(type="INF", message=`NPL: TIMEOUT ROUND @ Round Name -> ${roundName} in Ledger ${ctx.lclSeqNo}`);
					console.log(`Content: ${collected}`);
                    console.log(`Messages received: ${collected.length}`);
                    console.log(`Desired msg count: ${desired_count}`);
                }
				if (collected.length < desired_count && strict === true) {
					resolve([]);
				} else if (collected.length < desired_count && strict === false) {
					resolve(collected);
				}
			}, timeout);
	
			datasetEmitter.on(roundName, (data) => {
				collected.push(data);
					if (collected.length === desired_count) {
					clearTimeout(timer);
                    if (debug === true) {
    					Log(type="INF", message=`NPL: FULL ROUND @ Round Name -> ${roundName} in Ledger ${ctx.lclSeqNo}`);
						console.log(`Content: ${collected}`);
                    }
                    resolve(collected);
				}
			});
		});
	};

	const { roundName, data } = JSON.parse(content);
	await ctx.unl.send(content);
    return await NPL(roundName, desired_count, timeout);
}

 async function SetSignerList({ctx, account_seed, new_dApp_signers, client}) {	
	const account_wallet = xrpl.Wallet.fromSecret(account_seed);

	if (new_dApp_signers.length >= 1) {
		if (new_dApp_signers.length >= 33) {
			new_dApp_signers.length = 32;
		}

		const Signers = [];
		new_dApp_signers.forEach(key => {
			Signers.push({
				"SignerEntry": {
					"Account": key,
					"SignerWeight": 1
				}
			});
		});

		const signer_quorum = JSON.parse(fs.readFileSync(__dirname+'/DKM/setup/bootstrap_state.json').toString()).config.quorum.signer_quorum;

		const SetSignerList_tx = await AutofillTx({
			tx: {
				TransactionType: "SignerListSet",
				Account: account_wallet.classicAddress,
				SignerEntries: Signers,
				SignerQuorum: Math.round(Signers.length * signer_quorum),
				Memos: [{
					Memo: {
						MemoType: Buffer.from("Evernode", 'utf8').toString('hex'),
						MemoData: Buffer.from("DKM: HotPocket Cluster Setup", 'utf8').toString('hex'),
						MemoType: Buffer.from("text/plain", 'utf8').toString('hex')
				}
			}]
			},
			client: client
		});
		const SetSignerList_tx_signed = account_wallet.sign(SetSignerList_tx);

		await SubmitTx({
			tx: SetSignerList_tx_signed.tx_blob, 
			client: client
		});

		const DisableMasterKey_tx = await AutofillTx({
			tx: {
				TransactionType: "AccountSet",
				Account: account_wallet.classicAddress,
				SetFlag: xrpl.AccountSetAsfFlags.asfDisableMaster,
				Memos: [{Memo:{
					MemoType: Buffer.from("Evernode", 'utf8').toString('hex'),
					MemoData: Buffer.from("DKM: This XRPL account is now fully controlled by its signers", 'utf8').toString('hex'),
					MemoType: Buffer.from("text/plain", 'utf8').toString('hex')
				}}]
			},
			client: client
		});
		const DisableMasterKey_tx_signed = account_wallet.sign(DisableMasterKey_tx);

		await SubmitTx({
			tx: DisableMasterKey_tx_signed.tx_blob,
			client: client
		});

		Log(type="INF", message="SetSignerList(): dApp's XRPL account is now controlled by its HotPocket nodes, the master key has been disabled");
	} else {
		Log(type="INF", message=`SetSignerList(): This node failed to receive all ${ctx.unl.count()} nodes' keys, it will not partake in setting up the dApp's XRPL Account @ ${account_wallet.classicAddress}...`);
	}
}


 async function SetupAccount({ctx, node_address, client}) {

    const bootstrap_state = JSON.parse(fs.readFileSync(__dirname+"/DKM/setup/bootstrap_state.json"));

	const dApp_account_seed = bootstrap_state.config.account_seed;
	const dApp_account_address = xrpl.Wallet.fromSecret(dApp_account_seed).classicAddress;

	const cluster_signer_keys = await NPLResponse({
		content: JSON.stringify({
			roundName: `node-key-setup-${dApp_account_address}`,
			data: node_address
		}),
		desired_count: ctx.unl.count(),
		ctx: ctx,
		timeout: GetNPLTimeoutValue(type="signerlist_setup"),
		strict: true
	});
	
	const request = await RequestRippled({
		request: {
			command: 'account_tx',
			account: dApp_account_address,
			ledger_index_min: -1,
			ledger_index_max: -1,
			binary: false,
			forward: true
		},
		client: client
	});

    const account_creds = {
        seed: dApp_account_seed,
        address: dApp_account_address,
        sequence: request.result.transactions[0].tx.ledger_index
    };

    fs.writeFileSync(path=__dirname+"/DKM/dApp/XRPL_account.json", data=JSON.stringify(account_creds));

	await SetSignerList({
		ctx: ctx,
		account_seed: dApp_account_seed,
		new_dApp_signers: cluster_signer_keys,
		client: client
	});

	Log(type= "INF", message=`SetupAccount(): dApp's XRPL account is now setup @ ${dApp_account_address}`);
}

async function SignTx({ctx, tx, node_seed, signer_list}) {
	const node_wallet = xrpl.Wallet.fromSecret(node_seed);

	if (signer_list.signers.includes(node_wallet.classicAddress)) {
		const { tx_blob: signed_tx_blob } = node_wallet.sign(tx, multisign=true);
		const roundname = crypto.createHash('sha256').update(JSON.stringify(tx)).digest('hex');

		const signatures = await NPLResponse({
			content: JSON.stringify({
				roundName: `signature-${roundname}`,
				data: JSON.stringify({
					account: node_wallet.classicAddress,
					tx: signed_tx_blob
				})
			}),
			desired_count: signer_list.quorum,
			ctx: ctx,
			timeout: GetNPLTimeoutValue(type="signing"),
			strict: true 
		});
		
		const dApp_signers_signature = [];
		var collected_quorum = 0;
		signatures.forEach(signature => {
			signature = JSON.parse(signature);
			if (signer_list.signers.includes(signature.account)) {
				const verification = VerifySignature(signature.tx, signature.account);
				if (verification.signedBy === signature.account
					&& verification.signatureValid === true 
					&& verification.signatureMultiSign === true
					) {
						if (collected_quorum < signer_list.quorum) {
							dApp_signers_signature.push(signature.tx);
							signer_list.signer_weight.forEach(signer => {
								if (signer.account === signature.account) {
									collected_quorum += signer.weight;
								}
							});
						}
				} else {
					if (verification.signedBy != signature.account) { var reason = "Transaction was not signed by the specified signer key"; }
					if (verification.signatureValid !== true)       { var reason = "Transaction's signature was not valid"; }
					if (verification.signatureMultiSign !== true)   { var reason = "Transaction was not a multi-sig transaction"; }
					Log(type="WRN", message=`SignTx(): Signer ${signature.account} did not provide a valid signature. Reason: ${reason}`);
				}
			}
		});

		if (dApp_signers_signature.length >= 1) {
			return xrpl.multisign(dApp_signers_signature);
		} else {
			return NaN;
		}
	}
}

async function AddSignerKey({ctx, account_address, node_seed, signers, fee, client}) {
	const current_signer_list = await GetSignerList({account_address: account_address, client: client});

	const add = compare.difference(signers, current_signer_list);

	if (add.length >= 1) {
		const new_signer_list = [];
		current_signer_list.signers.forEach(key => {
			new_signer_list.push({
				"SignerEntry": {
					"Account": key,
					"SignerWeight": 1
				}
			});
		});
		add_signers.forEach(key => {
			new_signer_list.push({
				"SignerEntry": {
					"Account": key,
					"SignerWeight": 1
				}
			});
		});

		const tx = {
			TransactionType: "SignerListSet",
			Account: account_address,
			SignerEntries: new_signer_list,
			Memos: [{
				Memo: {
					MemoType: Buffer.from("Evernode", 'utf8').toString('hex'),
					MemoFormat: Buffer.from("text/plain", "utf8").toString('hex')
				}
			}]
		};

		const SetSignerList_tx_signed = await SignTx({
			ctx: ctx,
			tx: await AutofillTx({
				tx: tx,
				signer_count: current_signer_list.quorum,
				fee: fee,
				client: client
			}),
			node_seed: node_seed,
			client: client
		});

		await SubmitTx({
			tx: SetSignerList_tx_signed,
			client: client
		});
	}
}


async function RemoveSignerKey({ctx, account_seed, node_seed, signers, fee, client}) {
	const account_wallet = xrpl.Wallet.fromSecret(account_seed);
    const node_wallet = xrpl.Wallet.fromSecret(node_seed);

	const current_signer_list = await GetSignerList({
		account_address: account_wallet.classicAddress,
		client: client
	});

	const new_dApp_signers = [];
	signers.forEach(key => {
		if (!current_signer_list.includes(key)) {
			new_dApp_signers.push(key);
		}
	});

	if (new_dApp_signers != current_signer_list) {
		const NewSignerEntires = [];
		new_dApp_signers.forEach(key => {
			NewSignerEntires.push({
				"SignerEntry": {
					"Account": key,
					"SignerWeight": 1
				}
			});
		});

		const tx = {
			TransactionType: "SignerListSet",
			Account: account_wallet.classicAddress,
			SignerEntries: NewSignerEntires,
			Memos: [{
				Memo: {
					MemoType: Buffer.from("Evernode", 'utf8').toString('hex'),
					MemoData: Buffer.from("DKM: HotPocket Cluster SignerList Update (Removal)", 'utf8').toString('hex'),
					MemoFormat: Buffer.from("text/plain", "utf8").toString('hex')
				}
			}]
		};

		const SetSignerList_tx_signed = await SignTx({
			ctx: ctx,
			tx: await AutofillTx({
				tx: tx,
				signer_count: current_signer_list.quorum,
				fee: fee,
				client: client
			}),
            node_seed: node_wallet.seed,
			client: client
		});

		await SubmitTx({
			tx: SetSignerList_tx_signed,
			client: client
		});
	}
}

module.exports = {
	GetClient, GetSignerCredentials, GetAccountCredentials, GetNPLTimeoutValue, GetVoteCount, PackageTxAPI, // Miscellaneous
	AutofillTx, SubmitTx, RequestRippled, GetSignerList, CheckTxPayment, // API Requests
	SetupNPL, NPLResponse, SetSignerList, SetupAccount, // Setup
	SignTx, // Transaction
	ClusterKeyCheckup, AddSignerKey, RemoveSignerKey // Cluster SignerList Management
};