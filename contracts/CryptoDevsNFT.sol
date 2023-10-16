//SPDX-License-Identifier:MIT
pragma solidity^0.8.18;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract CryptoDevsNFT is ERC721Enumerable {
    //Initializing the ERC-721 Contract
    constructor() ERC721("CryptoDevs","CD"){}

    //Having a public mint function anyone can call to get an NFT
    function mint() public {
        _safeMint(msg.sender,totalSupply());
    }
}