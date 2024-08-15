package com.example;

import com.example.models.Node;
import com.example.models.Transaction;
import org.xrpl.xrpl4j.client.XrplClient;
import org.xrpl.xrpl4j.crypto.signing.Signature;
import org.xrpl.xrpl4j.crypto.signing.SignedTransaction;
import org.xrpl.xrpl4j.crypto.signing.Signer;
import org.xrpl.xrpl4j.crypto.signing.SignerWrapper;
import org.xrpl.xrpl4j.wallet.Wallet;
import org.xrpl.xrpl4j.model.transactions.Payment;
import org.xrpl.xrpl4j.model.transactions.SubmitMultiSignedTransactionRequest;
import org.xrpl.xrpl4j.model.transactions.SubmitMultiSignedTransactionResponse;

import java.util.List;
import java.util.stream.Collectors;

public class Signatures {

    public static List<String> collectSignatures(Transaction transaction, List<Node> nodes) throws Exception {
        String txHash = transaction.getHash();
        return nodes.stream()
                .map(node -> signTransaction(txHash, node.getKeyPair().getPrivate()))
                .collect(Collectors.toList());
    }

    private static String signTransaction(String transactionHash, PrivateKey privateKey) {
        try {
            Signature ecdsaSign = Signature.getInstance("SHA256withECDSA", "BC");
            ecdsaSign.initSign(privateKey);
            ecdsaSign.update(transactionHash.getBytes());
            byte[] signature = ecdsaSign.sign();
            StringBuilder sb = new StringBuilder();
            for (byte b : signature) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public static void submitMultiSigTransaction(XRPLClient xrplClient, Wallet account, Transaction transaction, List<String> signatures) throws Exception {
        XrplClient client = xrplClient.getClient();
        Payment payment = (Payment) transaction.getTransactionObject();

        List<SignerWrapper> signers = signatures.stream()
                .map(signature -> SignerWrapper.builder()
                        .account(account.classicAddress())
                        .signingPubKey(account.publicKey().get())
                        .transactionSignature(signature)
                        .build())
                .collect(Collectors.toList());

        SignedTransaction<Payment> signedPayment = SignedTransaction.<Payment>builder()
                .transaction(payment)
                .signers(signers)
                .build();

        SubmitMultiSignedTransactionRequest<Payment> request = SubmitMultiSignedTransactionRequest.of(signedPayment);
        SubmitMultiSignedTransactionResponse response = client.submit(request);

        if (!response.result().isValidated()) {
            throw new RuntimeException("Failed to submit multi-signature transaction: " + response.result().engineResult());
        }
        System.out.println("Multi-signature transaction submitted");
    }
}
