import { useEffect, useState } from 'react';
import sdk from '@crossmarkio/sdk';

const ExampleComponent = () => {
    const [address, setAddress] = useState<string | null>(null);
    const [transactionHash, setTransactionHash] = useState<string | null>(null);

    useEffect(() => {
        const executeTransaction = async () => {
            try {
                // Step 2 - Signin using Crossmark
                const signIn = await sdk.methods.signInAndWait();

                // log address
                console.log(signIn.response.address);
                setAddress(signIn.response.address);

                // Step 3 - Issues an XRPL transaction for signing
                const { response } = await sdk.methods.signAndSubmitAndWait({
                    TransactionType: 'Payment',
                    Account: signIn.response.address,
                    Destination: 'INSERT_DESTINATION_ADDRESS_HERE',
                    Amount: '1000000', // XRP in drops
                });

                // log payload response
                console.log(response.data.resp);

                // Step 4 - Review hash
                // log transaction hash response
                console.log(response.data.resp.result.hash);
                setTransactionHash(response.data.resp.result.hash);
            } catch (error) {
                console.error('Error executing transaction', error);
            }
        };

        executeTransaction();
    }, []);

    return (
        <div>
            <h1>Crossmark Transaction Example</h1>
            {address && <p>Address: {address}</p>}
            {transactionHash && <p>Transaction Hash: {transactionHash}</p>}
        </div>
    );
};

export default ExampleComponent;
