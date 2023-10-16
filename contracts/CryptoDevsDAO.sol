//SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";

//Interface for the fakeNFTMarketplace
interface IFakeNFTMarketplace {
    function getPrice() external view returns(uint);
    function available(uint _tokenId) external view returns(bool);
    function purchase(uint _tokenId) external payable ;
}

interface ICryptoDevsNFT{

    //The purpose of this function is to query the balance of NFT's owned by a specific address
    //It returns the number of NFT owned
    function balanceOf(address owner) external view returns(uint);
    function tokenOfOwnerByIndex(address owner,uint index) external view returns(uint);
}

contract CryptoDevsDAO is Ownable{

    struct Proposal {
        string title;
        uint nftTokenId;
        uint deadline;
        uint yayVotes;
        uint nayVotes;
        bool executed;

        mapping(uint => bool) voters;
    }

    mapping(uint => Proposal) public proposals;
    uint public numProposals;

    IFakeNFTMarketplace nftMarketplace;
    ICryptoDevsNFT cryptoDevsNFT;

    constructor(address _nftMarketplace,address _cryptoDevsNFT) payable{
        nftMarketplace = IFakeNFTMarketplace(_nftMarketplace);
        cryptoDevsNFT = ICryptoDevsNFT(_cryptoDevsNFT);
    }

    //Create a modifier which allows a function to be 
    //called by someone who owns at least 1 CryptoDevsNFT

    modifier nftHolderOnly() {
        require(cryptoDevsNFT.balanceOf(msg.sender) > 0,"NOT_A_DAO_MEMBER");
        _;
    }

    function createProposal(uint _nftTokenId,string memory _title) external nftHolderOnly returns(uint) {
        require(nftMarketplace.available(_nftTokenId),"NFT_NOT_FOR_SALE");
        Proposal storage proposal = proposals[numProposals];
        proposal.title = _title;
        proposal.nftTokenId = _nftTokenId;
        proposal.deadline = block.timestamp + 5 minutes;

        numProposals++;

        return numProposals -1;
    }

    modifier activeProposalOnly(uint proposalIndex) {
        require(proposals[proposalIndex].deadline > block.timestamp,"DEADLINE_EXCEEDED");
        _;
    }

    enum Vote{
        YAY,
        NAY
    }

    function voteOnProposal(uint proposalIndex,Vote vote) external nftHolderOnly activeProposalOnly(proposalIndex){
        Proposal storage proposal = proposals[proposalIndex];

        uint voteNFTBalance = cryptoDevsNFT.balanceOf(msg.sender);
        uint numVotes = 0;

        //Calculate how many NFT's are owned by the voter
        //that haven't already been used for voting on this proposal

        //or each NFT, the code checks if the current sender has already voted on the proposal.
        for(uint i=0;i<voteNFTBalance;i++){
            uint tokenId = cryptoDevsNFT.tokenOfOwnerByIndex(msg.sender,i);
            if(proposal.voters[tokenId]== false){
                numVotes++;
                proposal.voters[tokenId] = true;
            }
        }

        if(vote == Vote.YAY){
            proposal.yayVotes +=numVotes;
        }else{
            proposal.nayVotes += numVotes;
        }

    }

    modifier inactiveProposalOnly (uint proposalIndex) {
        require(proposals[proposalIndex].deadline <= block.timestamp,"Deadline_not_exceeded");
        require(proposals[proposalIndex].executed == false,"Proposal_already_executed");
        _;
    }

    function executeProposal(uint proposalIndex) external nftHolderOnly inactiveProposalOnly(proposalIndex){
        Proposal storage proposal = proposals[proposalIndex];

        if(proposal.yayVotes > proposal.nayVotes){
            uint nftPrice = nftMarketplace.getPrice();
            require(address(this).balance >= nftPrice,"NOT_ENOUGH_FUNDS");
            nftMarketplace.purchase{value:nftPrice}(proposal.nftTokenId);
        }
        proposal.executed = true;
    }

    function withdrawEther() external onlyOwner{
        uint amount  = address(this).balance;
        require(amount >0,"Nothing to withdraw,contract balance empty");

        (bool sent,) = payable(owner()).call{value:amount}("");
        require(sent,"FAILED_TO_WITHDRAW_ETHER");
    }

    receive() external payable{}

    fallback() external payable{}


}

