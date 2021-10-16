module.exports = async function({ getNamedAccounts, deployments, getChainId }) {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = await getChainId();

    if(+chainId === 31337) {
        console.log("Local network deceted! Deploying Mocks ...");
        const LinkToken = await deploy("LinkToken", { from: deployer, log: true });
        const VRFCoorditatorMock = await deploy("VRFCoordinatorMock", { from: deployer, log: true, args: [LinkToken.address] });
        console.log("Mocks deployed");
    }
}

module.exports.tags = ["all", "rsvg", "svg"];