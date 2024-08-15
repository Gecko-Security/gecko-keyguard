package com.example;

public class App {
    public static void main(String[] args) {
        try {
            XRPLClient client = new XRPLClient();
            DKM dkm = new DKM(client);
            dkm.run();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
