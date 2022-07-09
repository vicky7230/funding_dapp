const Migrations = artifacts.require("Migrations");
const Funder = artifacts.require("Funder");

module.exports = function (deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(Funder);
};
