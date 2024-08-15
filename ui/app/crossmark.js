// Step 1 - Import package
import sdk from '@crossmarkio/sdk';
 
const example = async () => {
 
    // Step 2 - Signin using Crossmark
    let signIn = await sdk.methods.signInAndWait();
 
    // log address
    console.log(signIn.response.address);
 
    // Step 3 - Issues an XRPL transaction for signing
    let {
        request,
        response,
        createdAt,
        resolvedAt
      } = await sdk.methods.signAndSubmitAndWait({
            TransactionType: 'Payment',
            Account: signIn.response.address,
            Destination: 'rG8cNQNhmdscr8a19w9X34WNd55H84R4ny',
            Amount: "1000000"
        });
 
    // log payload response
    console.log(response.data.resp);
 
    // Step 4 - Review hash
    // log transaction hash response
    console.log(response.data.resp.result.hash);
    }
 
  // Mount function
  example()