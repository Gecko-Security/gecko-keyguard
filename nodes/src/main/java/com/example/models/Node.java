package com.example.models;

import java.security.KeyPair;

public class Node {
    private int id;
    private KeyPair keyPair;

    public Node(int id, KeyPair keyPair) {
        this.id = id;
        this.keyPair = keyPair;
    }

    public int getId() {
        return id;
    }

    public KeyPair getKeyPair() {
        return keyPair;
    }
}
