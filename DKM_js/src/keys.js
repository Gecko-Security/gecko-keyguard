const crypto = require('crypto');

const nodes = [];

function initializeNodes() {
  for (let i = 0; i < 10; i++) {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
      namedCurve: 'secp256k1'
    });
    nodes.push({ id: i, publicKey: publicKey.export({ type: 'spki', format: 'pem' }), privateKey: privateKey.export({ type: 'pkcs8', format: 'pem' }) });
  }
}

module.exports = { nodes, initializeNodes };
