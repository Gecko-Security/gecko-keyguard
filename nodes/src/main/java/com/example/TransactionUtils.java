package com.example;

import com.example.models.Node;
import com.example.models.Transaction;
import org.xrpl.xrpl4j.client.XrplClient;
import org.xrpl.xrpl4j.model.client.transactions.SubmitMultiSignedTransactionRequest;
import org.xrpl.xrpl4j.model.client.transactions.SubmitMultiSignedTransactionResponse;
import org.xrpl.xrpl4j.model.transactions.*;

import java.util.List;

public class TransactionUtils {

    public static void disableMasterKey(XRPLClient xrplClient, Wallet account) throws Exception {
        XrplClient client = xrplClient.getClient();
        AccountSet accountSet = AccountSet.builder()
                .account(account.classicAddress())
                .setFlag(AccountSet.AccountSetFlag.DISABLE_MASTER)
                .fee(XrpCurrencyAmount.ofDrops(12))
                .sequence(client.accountInfo(account.classicAddress()).accountData().sequence())
                .build();

        SignedTransaction<AccountSet> signedAccountSet = accountSet.sign(account.privateKey().get());
        SubmitMultiSignedTransactionRequest<AccountSet> request = SubmitMultiSignedTransactionRequest.of(signedAccountSet);
        SubmitMultiSignedTransactionResponse response = client.submit(request);

        if (!response.result().isValidated()) {
            throw new RuntimeException("Failed to disable master key: " + response.result().engineResult());
        }
        System.out.println("Master key disabled");
    }

    public static void setSignerList(XRPLClient xrplClient, Wallet account, List<Node> nodes) throws Exception {
        XrplClient client = xrplClient.getClient();
        List<SignerEntryWrapper> signerEntries = nodes.stream()
                .map(node -> SignerEntryWrapper.builder()
                        .account(node.getAccountAddress())
                        .signerWeight(UnsignedInteger.valueOf(1))
                        .build())
                .collect(Collectors.toList());

        SignerListSet signerListSet = SignerListSet.builder()
                .account(account.classicAddress())
                .signerEntries(signerEntries)
                .signerQuorum(UnsignedInteger.valueOf(5))
                .fee(XrpCurrencyAmount.ofDrops(12))
                .sequence(client.accountInfo(account.classicAddress()).accountData().sequence())
                .build();

        SignedTransaction<SignerListSet> signedSignerListSet = signerListSet.sign(account.privateKey().get());
        SubmitMultiSignedTransactionRequest<SignerListSet> request = SubmitMultiSignedTransactionRequest.of(signedSignerListSet);
        SubmitMultiSignedTransactionResponse response = client.submit(request);

        if (!response.result().isValidated()) {
            throw new RuntimeException("Failed to set signer list: " + response.result().engineResult());
        }
        System.out.println("Signer list set");
    }

    public static Transaction createTransaction(Wallet account) {
        Payment payment = Payment.builder()
                .account(account.classicAddress())
                .destination(Address.of("rDestinationAddress"))
                .amount(XrpCurrencyAmount.ofDrops(1000))
                .fee(XrpCurrencyAmount.ofDrops(12))
                .sequence(account.sequence().get())
                .build();

        return new Transaction(payment);
    }
}
