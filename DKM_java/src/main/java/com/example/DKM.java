package com.example;

import com.example.models.Node;
import com.example.models.Transaction;
import org.xrpl.xrpl4j.wallet.Wallet;

import java.util.List;

public class DKM {
    private XRPLClient xrplClient;
    private List<Node> nodes;
    private Wallet fundedAccount;

    public DKM(XRPLClient xrplClient) {
        this.xrplClient = xrplClient;
        try {
            this.nodes = Keys.initializeNodes();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void run() throws Exception {
        fundedAccount = xrplClient.createFundedAccount();
        TransactionUtils.disableMasterKey(xrplClient, fundedAccount);
        TransactionUtils.setSignerList(xrplClient, fundedAccount, nodes);
        Transaction transaction = TransactionUtils.createTransaction(fundedAccount);
        List<String> signatures = Signatures.collectSignatures(transaction, nodes);
        Signatures.submitMultiSigTransaction(xrplClient, fundedAccount, transaction, signatures);
    }
}
