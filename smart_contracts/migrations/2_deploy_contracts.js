var contract = artifacts.require("./StarNotary");

module.exports = function(deployer) {
  deployer.deploy(contract);
};
