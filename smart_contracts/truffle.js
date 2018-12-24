var HDWalletProvider = require('truffle-hdwallet-provider');

var mnemonic = 'stock govern liberty lottery festival share once rail section subway defense divide';

module.exports = {
  networks: { 
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: "*"
    }, 
    rinkeby: {
      provider: function() { 
        return new HDWalletProvider(mnemonic, 'https://rinkeby.infura.io/v3/79c3f13d9cf5449ab1d020895bd09420') 
      },
      network_id: 4,
      gas: 4500000,
      gasPrice: 10000000000,
    }
  }
};
