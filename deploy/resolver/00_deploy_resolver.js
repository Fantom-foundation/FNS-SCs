const namehash = require('eth-ens-namehash');
const toBN = require('web3-utils').toBN;
const { ethers } = require('hardhat');

const NameWrapper = artifacts.require('DummyNameWrapper.sol');

const ZERO_HASH =
  '0x0000000000000000000000000000000000000000000000000000000000000000';

module.exports = async ({ getNamedAccounts, deployments, network }) => {
  const { deploy } = deployments;
  const { deployer, owner } = await getNamedAccounts();

  const registry = await ethers.getContract('ENSRegistry');

  if (network.tags.legacy) {
    const nameWrapper = await NameWrapper.new();

    await deploy('DefaultReverseResolver', {
      from: deployer,
      args: [registry.address],
      log: true,
      contract: await deployments.getArtifact('DefaultReverseResolver')
    });

    const publicResolver = await deploy('PublicResolver', {
      from: deployer,
      args: [registry.address, nameWrapper.address],
      log: true,
      contract: await deployments.getArtifact('PublicResolver')
    });

    await deploy('ReverseRegistrar', {
      from: deployer,
      args: [registry.address, publicResolver.address],
      log: true,
      contract: await deployments.getArtifact('ReverseRegistrar')
    });
  }

  //   if (!network.tags.use_root) {
  //     const registry = await ethers.getContract('ENSRegistry');
  //     const rootOwner = await registry.owner(ZERO_HASH);
  //     switch (rootOwner) {
  //       case deployer:
  //         const tx = await registry.setOwner(ZERO_HASH, owner, {
  //           from: deployer
  //         });
  //         console.log(
  //           'Setting final owner of root node on registry (tx:${tx.hash})...'
  //         );
  //         await tx.wait();
  //         break;
  //       case owner:
  //         break;
  //       default:
  //         console.log(
  //           `WARNING: ENS registry root is owned by ${rootOwner}; cannot transfer to owner`
  //         );
  //     }
  //   }

  return true;
};
module.exports.tags = ['resolver'];
module.exports.id = 'resolver';
