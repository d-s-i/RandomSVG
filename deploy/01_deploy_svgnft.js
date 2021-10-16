const fs = require("fs"); 
const { networkConfig } = require("../helper-hardhat-config");
// const { abi: SVGNFTAbi } = require("../artifacts/contracts/SVGNFT.sol/SVGNFT.json") ;

module.exports = async(hhObject) => {
    const deploy = hhObject.deployments.deploy;
    // const { deploy, log } = deployements;
    const { deployer } = await getNamedAccounts();
    const chainId = await getChainId();

    console.log("--------------------------------------");

    const SVGNFT = await deploy("SVGNFT", {
        from: deployer,
        log: true
    });

    console.log(`You deployed an NFT contract to ${SVGNFT.address}`);
    const filepath = "./img/elipse.svg";
    const svg = fs.readFileSync(filepath, { encoding: "utf8" });

    const svgNFTContract = await ethers.getContractFactory("SVGNFT");
    const accounts = await hre.ethers.getSigners();
    const signer = accounts[0];

    const svgNFT = new ethers.Contract(SVGNFT.address, svgNFTContract.interface, signer);
    const networkName = networkConfig[chainId]["name"];

    console.log(`Verify with : \n npx hardhat verify --network ${networkName} ${svgNFT.address}`);

    const transactionResponse = await svgNFT.create(svg);
    let receipt = await transactionResponse.wait(1);
    console.log(`You've made an NFT !`);
    console.log(`You can view the tokenURI here ${await svgNFT.tokenURI(0)}`);
};

module.exports.tags = ["all", "svg"];