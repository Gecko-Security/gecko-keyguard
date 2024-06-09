package com.example;

import org.xrpl.xrpl4j.client.JsonRpcClient;
import org.xrpl.xrpl4j.client.XrplClient;
import org.xrpl.xrpl4j.wallet.Wallet;
import org.xrpl.xrpl4j.wallet.WalletFactory;

import java.net.URI;

public class XRPLClient {
    private XrplClient client;

    public XRPLClient() throws Exception {
        client = new XrplClient(URI.create("https://s.altnet.rippletest.net:51234"));
    }

    public Wallet createFundedAccount() throws Exception {
        Wallet wallet = WalletFactory.getInstance().randomWallet(true).wallet();
        client.fundAccount(wallet.classicAddress());
        System.out.println("Funded account: " + wallet.classicAddress());
        return wallet;
    }

    public XrplClient getClient() {
        return client;
    }
}
