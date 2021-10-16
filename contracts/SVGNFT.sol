// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "base64-sol/base64.sol";

contract SVGNFT is ERC721URIStorage {

    uint256 public tokenCounter;
    event CreatedNFT(uint256 indexed tokenId, string tokenURI);
    
    constructor() ERC721("Modular", "MDR") public {
        tokenCounter = 0;
    }

    function create(string memory _svg) public {
        _safeMint(msg.sender, tokenCounter);
        string memory imageURI = svgToImageURI(_svg);
        string memory tokenURI = formatTokenURI(imageURI);
        _setTokenURI(tokenCounter, tokenURI);
        emit CreatedNFT(tokenCounter, tokenURI);
        tokenCounter++;
    }

    function svgToImageURI(string memory _svg) public pure returns(string memory) {
        string memory baseURL = "data:image/svg+xml;base64,";
        string memory svgBase64Encoded = Base64.encode(bytes(string(abi.encodePacked(_svg))));
        string memory imageURI = string(abi.encodePacked(baseURL, svgBase64Encoded));
        return imageURI;
    }

    function formatTokenURI(string memory _imageURI) public pure returns (string memory) {
        string memory baseURL = "data:application/json;base64,";

        string memory json = Base64.encode(bytes(abi.encodePacked(
            '{"name": "Modular", ', 
            '"description": "A random NFT for a modular community", ', 
            '"image": "',
            _imageURI, 
            '"}'
        )));

        return(string(abi.encodePacked(baseURL, json)));
    }
}