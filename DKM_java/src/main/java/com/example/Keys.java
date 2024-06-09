package com.example;

import com.example.models.Node;
import org.bouncycastle.jce.provider.BouncyCastleProvider;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.Security;
import java.util.ArrayList;
import java.util.List;

public class Keys {
    static {
        Security.addProvider(new BouncyCastleProvider());
    }

    public static List<Node> initializeNodes() throws Exception {
        List<Node> nodes = new ArrayList<>();
        KeyPairGenerator keyGen = KeyPairGenerator.getInstance("ECDSA", "BC");
        keyGen.initialize(256);

        for (int i = 0; i < 10; i++) {
            KeyPair keyPair = keyGen.generateKeyPair();
            nodes.add(new Node(i, keyPair));
        }
        return nodes;
    }
}
