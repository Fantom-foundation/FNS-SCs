const namehash = require('eth-ens-namehash');
const toBN = require('web3-utils').toBN;
const { ethers } = require('hardhat');

const DummyOracle = artifacts.require('./DummyOracle');
const StablePriceOracle = artifacts.require('./StablePriceOracle');

const ZERO_HASH =
  '0x0000000000000000000000000000000000000000000000000000000000000000';

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log('Deploying contracts with the account:', deployer.address);
  console.log('Account balance:', (await deployer.getBalance()).toString());

  const registry = await ethers.getContract('ENSRegistry');

  const BaseRegistrarImplementation = await ethers.getContractFactory(
    'BaseRegistrarImplementation'
  );

  const ETHRegistrarController = await ethers.getContractFactory(
    'ETHRegistrarController'
  );

  if (network.tags.legacy) {
    const baseContract = await BaseRegistrarImplementation.deploy(
      registry.address,
      namehash.hash('ftm')
    );

    const dummyOracle = await DummyOracle.new(toBN(100000000));
    const priceOracle = await StablePriceOracle.new(dummyOracle.address, [1]);

    const ethContract = await ETHRegistrarController.deploy(
      baseContract.address,
      priceOracle.address,
      60,
      86400
    );

    console.log(
      'BaseRegistrarImplementation deployed to:',
      baseContract.address
    );
    console.log('EthRegistrar deployed to:', ethContract.address);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
