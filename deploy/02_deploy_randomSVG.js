let { networkConfig } = require("../helper-hardhat-config");

module.exports = async function({ getNamedAccounts, deployments, getChainId }) {
    const { deploy, get } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = await getChainId();

    let linkTokenAddress, vrfCoordinatorAddress;

    if(+chainId === 31337) {
         let linkToken = await get("LinkToken");
        linkTokenAddress = linkToken.address;
        let vrfCoordinatorMock = await get("VRFCoordinatorMock");
        vrfCoordinatorAddress = vrfCoordinatorMock.address;
    } else {
        linkTokenAddress = networkConfig[chainId]["linkToken"];
        vrfCoordinatorAddress = networkConfig[chainId]["vrfCoordinator"];
    }
    const keyHash = networkConfig[chainId]["keyHash"];
    const fee = networkConfig[chainId]["fee"];
    const args = [vrfCoordinatorAddress, linkTokenAddress, keyHash, fee];
    console.log("---------------------------------------");

    const RandomSVG = await deploy("RandomSVG", { from: deployer, args: args, log: true });
    console.log("You have deployed your NFT contract!");
    const networkName = networkConfig[chainId]["name"];
    console.log(`\n verify with: hh verify --network ${networkName} ${RandomSVG.address} ${args.toString().replace(/,/g, " ")}`);
    
    const linkTokenContract = await ethers.getContractFactory("LinkToken");
    const accounts = await hre.ethers.getSigners();
    const signer = accounts[0];

    const linkToken = new ethers.Contract(linkTokenAddress, linkTokenContract.interface, signer);

    const fund_tx = await linkToken.transfer(RandomSVG.address, fee);
    await fund_tx.wait(1);
    
    console.log("\n Lets create an NFT now!");
    const RandomSVGContract = await ethers.getContractFactory("RandomSVG");
    const randomSVG = new ethers.Contract(RandomSVG.address, RandomSVGContract.interface, signer);
    const creation_tx = await randomSVG.create({ gasLimit: 300000 });
    const receipt = await creation_tx.wait(1);
    const tokenId = receipt.events[3].topics[2]; 
    console.log(`You've made your NFT! This is token number ${tokenId.toString()}`);
    console.log(`Let's wait for the Chainlink node to respond ...`);

    if(+chainId !== 31337) {
        await new Promise(r => setTimeout(r, 180000));
        console.log(`\n Now lets finish the mint ...`);
        const finished_tx = await randomSVG.finishMint(tokenId, { gasLimit: 2000000 });
        await finished_tx.wait(1);
        console.log(`You can view your tokenURI here: ${await randomSVG.tokenURI(tokenId)}`);
    } else {
        const VRFCoordinatorMock = await get("VRFCoordinatorMock");
        vrfCoordinator = await ethers.getContractAt("VRFCoordinatorMock", VRFCoordinatorMock.address, signer);
        let vrf_tx = await vrfCoordinator.callBackWithRandomness(receipt.logs[3].topics[1], 77778, randomSVG.address);
        await vrf_tx.wait(1);
        console.log(`\n now lets finish the mint!`);
        let finish_tx = await randomSVG.finishMint(tokenId, { gasLimit: 2000000 });
        await finish_tx.wait(1);
        console.log(`You can view the tokenURI here: ${await randomSVG.tokenURI(tokenId)}`);
    }
}

module.exports.tags = ["all", "rsvg"];