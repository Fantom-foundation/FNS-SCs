const namehash = require('eth-ens-namehash');
const toBN = require('web3-utils').toBN;
const { ethers } = require('hardhat');

const DummyOracle = artifacts.require('./DummyOracle');
const StablePriceOracle = artifacts.require('./StablePriceOracle');

const ZERO_HASH =
  '0x0000000000000000000000000000000000000000000000000000000000000000';

module.exports = async ({ getNamedAccounts, deployments, network }) => {
  const { deploy } = deployments;
  const { deployer, owner } = await getNamedAccounts();

  const registry = await ethers.getContract('ENSRegistry');

  if (network.tags.legacy) {
    const baseContract = await deploy('BaseRegistrarImplementation', {
      from: deployer,
      args: [registry.address, namehash.hash('eth')],
      log: true,
      contract: await deployments.getArtifact('BaseRegistrarImplementation')
    });

    const dummyOracle = await DummyOracle.new(toBN(100000000));
    const priceOracle = await StablePriceOracle.new(dummyOracle.address, [1]);

    await deploy('ETHRegistrarController', {
      from: deployer,
      args: [baseContract.address, priceOracle.address, 600, 86400],
      log: true,
      contract: await deployments.getArtifact('ETHRegistrarController')
    });
  }

  // if (!network.tags.use_root) {
  //   const registry = await ethers.getContract('ENSRegistry');
  //   const rootOwner = await registry.owner(ZERO_HASH);
  //   switch (rootOwner) {
  //     case deployer:
  //       const tx = await registry.setOwner(ZERO_HASH, owner, {
  //         from: deployer
  //       });
  //       console.log(
  //         'Setting final owner of root node on registry (tx:${tx.hash})...'
  //       );
  //       await tx.wait();
  //       break;
  //     case owner:
  //       break;
  //     default:
  //       console.log(
  //         `WARNING: ENS registry root is owned by ${rootOwner}; cannot transfer to owner`
  //       );
  //   }
  // }

  return true;
};
module.exports.tags = ['registrar'];
module.exports.id = 'eth-registrar';
