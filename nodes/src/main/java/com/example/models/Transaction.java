package com.example.models;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.UUID;

public class Transaction {
    private String hash;

    public Transaction() {
        this.hash = generateHash();
    }

    private String generateHash() {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            String uuid = UUID.randomUUID().toString();
            byte[] hashBytes = digest.digest(uuid.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }

    public String getHash() {
        return hash;
    }
}
