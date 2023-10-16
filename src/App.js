

import React,{useState,useEffect} from 'react';
import {Wallet, ethers} from 'ethers';
import './App.css';


import CryptoDevsNFT from './abi/CryptoDevsNFT.json';
import FakeNFTMarketplace from './abi/FakeNFTMarketplace.json'
import CryptoDevsDAO from './abi/CryptoDevsDAO.json'

const CryptoDevsNFTABI = CryptoDevsNFT.abi;
const FakeNFTMarketplaceABI = FakeNFTMarketplace.abi;
const CryptoDevsDAOABI = CryptoDevsDAO.abi;

const CryptoDevsNFTAddress =      "0x5F289388F0a3Fd324D128B159Ece13193Bd97c94";
const FakeNFTMarketplaceAddress = "0x075917877eDDCAF94b381A5d543be8282F4B6bbF";
const CryptoDevsDAOAddress =      "0xE968A3aC3c34B41aaf411a64e3c54d3700ff8882";

function App() {

  const[walletConnected,setWalletConnected]=useState(false);
  const[accountAddress,setAccountAddress]=useState();
  const[ownerAddress,setOwnerAddress]=useState();
  const[owner,setOwner]=useState(false);

  const[contractBalance,setContractBalance]=useState("");
  const[numProposals,setNumProposals]=useState(null);
  const[nftBalance,setNFTBalance]=useState(null);

  const[tokenId,setTokenId]=useState();
  const[available,setAvailable]=useState();
  const[sestAvailable,setsetAvailable]=useState(false);

  const[createProposalId,setCreateProposalId]=useState("");
  const[title,setTitle]=useState("");
  const[proposalCreated,setProposalCreated]=useState(false);

  const[fetchProposalId,setFetchProposalId]=useState("");
  const[xyz,setxyz]=useState();
  const[showProposalDetails,setShowProposalDetails]=useState(false);
  const[proposal,setProposal]=useState(null);

  const[getAllProposal,setGetAllProposal]=useState([]);
  const[revert,setRevert]=useState(false);

  const[proposalIndex,setProposalIndex]=useState("");
  const[vote,setVote]=useState("YAY");

  const[hasVoted,setHasVoted]=useState(false);

  const[mounted,setMounted]=useState(false);
  const[loading,setLoading]=useState(false);

 

  const[selectedTab,setSelectedTab]=useState("createProposal");
  const[isEtherIsWithdrawled,setIsEtherIsWithdrawled]=useState(false);

  

 

  const[tokenAddress,setTokenAddress]=useState();

 
  const handleTabClick = (tabName) => {
    setSelectedTab(tabName);
    
  }

  const walletConnectHandler = async() => {
    if(window.ethereum){
      try{
        const accounts = await window.ethereum.request({method:"eth_requestAccounts"});
        setWalletConnected(true);
        setAccountAddress(accounts[0]);
      }catch(error){
        console.log(error);
      }
    }else{
      console.log("Please install metamask");
      alert("Please install metamask");
    }
  }

  const ownerHandler = async() => {
    if(window.ethereum){
      try{
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(CryptoDevsDAOAddress,CryptoDevsDAOABI,provider);
  
        const owner = await contract.owner();
        setOwnerAddress(owner);
        if(owner.toLowerCase() == accountAddress.toLowerCase()){
          setOwner(true);
        }
      }catch(error){
        console.log(error);
      }

    }else{
      console.log("Please install wallet");
      alert("No Wallet provided");
    }
  }

  const contractBalanceHandler = async() => {

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balanceInWei = await provider.getBalance(CryptoDevsDAOAddress);
    const balanceInEther = ethers.utils.formatEther(balanceInWei);

    const balanceInDecimals = Number(balanceInEther).toFixed(5);

    setContractBalance(balanceInDecimals);
    

  }

  const numProposalsHandler  = async() => {
    try{
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(CryptoDevsDAOAddress,CryptoDevsDAOABI,provider);

      const numP = await contract.numProposals();
      setNumProposals(numP.toNumber());
    }catch(error){
      console.log(error);
    }
  }

  const nftBalanceHandler = async() => {
    try{
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(CryptoDevsNFTAddress,CryptoDevsNFTABI,provider);

      const balance = await contract.balanceOf(accountAddress);
      setNFTBalance(balance.toNumber());
    }catch(error){
      console.log(error);
    }
  }

  const createProposalHandler = async() => {
    try{
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CryptoDevsDAOAddress,CryptoDevsDAOABI,signer);
     
      const txn = await contract.createProposal(createProposalId,title);
     
      await txn.wait();
      await numProposalsHandler();
      setProposalCreated(true);
    }catch(error) {
      console.log(error);
    }
  }

  const fetchProposalHandler = async() => {
    try{
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(CryptoDevsDAOAddress,CryptoDevsDAOABI,provider);

      const proposalDetails = await contract.proposals(fetchProposalId);

      if(proposalDetails){
        setProposal({
          title:proposalDetails[0].toString(),
          nftTokenId : proposalDetails[1].toNumber(),
          deadline:proposalDetails[2].toNumber(),
          yayVotes:proposalDetails[3].toNumber(),
          nayVotes :proposalDetails[4].toNumber(),
          executed: proposalDetails[5],
        });
      }
     setShowProposalDetails(true);
     setxyz(fetchProposalId);
    }catch(error){
      console.log(error);
    }
  }

  const getAllProposalHandler = async() => {
    try{
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(CryptoDevsDAOAddress,CryptoDevsDAOABI,provider);

      const numTotalProposals = await contract.numProposals();
      const tempArray = [];

      for(let i=numTotalProposals.toNumber()-1;i>=0;i--){
        const proposalDetails = await contract.proposals(i);

        tempArray.push({
          proposalId: i,
               title: proposalDetails[0].toString(),
          nftTokenId: proposalDetails[1].toNumber(),
            deadline: proposalDetails[2].toNumber(),
            yayVotes: proposalDetails[3].toNumber(),
            nayVotes: proposalDetails[4].toNumber(),
            executed: proposalDetails[5],
        });
      }

      setGetAllProposal(tempArray);
    }catch(error){
      console.log(error);
    }
  }

  const voteOnProposalHandler = async(fetchProposalId,vote) => {
    try{
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CryptoDevsDAOAddress,CryptoDevsDAOABI,signer);
      let _vote = vote === "YAY" ?0:1;
      console.log(_vote);
      const txn = await contract.voteOnProposal(fetchProposalId,_vote);
      await txn.wait();
      await fetchProposalHandler();
     


    }catch(error){
      console.log(error);
    }
  }

  const executeProposalHandler = async() => {
    try{
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(CryptoDevsDAOAddress,CryptoDevsDAOABI,provider.getSigner());

      const txn = await contract.executeProposal(xyz);
      await txn.wait();
      await fetchProposalHandler();
    }catch(error){
      console.log(error);
    }
  }

  const withdrawEther = async() =>{
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(CryptoDevsDAOAddress,CryptoDevsDAOABI,provider.getSigner());

    const txn = await contract.withdrawEther();
    await txn.wait();
    setIsEtherIsWithdrawled(true);
  }

  const availability = async() => {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(FakeNFTMarketplaceAddress,FakeNFTMarketplaceABI,provider);

        const txn1 = await contract.available(tokenId);
        

        setAvailable(txn1);
        setsetAvailable(true);
      } catch (error) {
          console.log(error);
      }
  }

  const mintNFT = async() => {
    try{
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CryptoDevsNFTAddress,CryptoDevsNFTABI,signer);

      const txn = await contract.mint();

      await txn.wait();
      nftBalanceHandler();
      alert("NFT Minted Successfully");
    }catch(error){
      console.log(error);
    }
  }

  const sendEtherToAContract = async() => {
    try{
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
     
      const etherAmount = ethers.utils.parseEther('0.0005');

      const txn = await signer.sendTransaction({
        to:CryptoDevsDAOAddress,
        value:etherAmount,
      });

      await txn.wait();
      console.log('Transaction Confirmed');

    }catch(error){
      console.log(error);
    }
  }

  const formatUnixTimestamp = (timestamp) => {
    const date = new Date(timestamp * 1000);

    const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;

  return formattedDate;
    

  }

  const renderProposalDetails = () => {
    if(!proposal){
      return null;
    }
    return(
      <div className='fetched'>
         
         {fetchProposalId >=numProposals ? (<h4>No Proposol exit for this ID</h4>) :(<div>
          <h2>Proposal ID : {xyz}</h2>
            <h4>{proposal.title}</h4>
              
            <div className='proposal-details'>
  <p data-label="NFT Token Id"><span>{proposal.nftTokenId}</span></p>
  <p data-label="Deadline"><span>{formatUnixTimestamp(proposal.deadline)}</span></p>
  <p data-label="Yay Votes"><span>{proposal.yayVotes}</span></p>
  <p data-label="Nay Votes"><span>{proposal.nayVotes}</span></p>
  <p data-label="Executed"><span>{proposal.executed ? "Yes" : "No"}</span></p>
</div>

               <div>
                {proposal.deadline *1000 > Date.now() && !proposal.executed ? (

                <div className='voting'>
                  <button onClick={() =>{ if(!hasVoted){voteOnProposalHandler(fetchProposalId,"YAY");setHasVoted(true)}else{alert('You have Already voted on this Proposal')}}}>Vote YAY</button>
                  <button onClick={() =>{if(!hasVoted){voteOnProposalHandler(fetchProposalId,"NAY"); setHasVoted(true)}else{alert('You have Already voted on this Proposal')} }}>Vote NAY</button>
                  </div>

                ) : (
                  
                  proposal.deadline <Date.now() && !proposal.executed ? (

                     <div className='execute-proposal-button'>
                    <button onClick={() => executeProposalHandler(xyz)}> Execute Proposal {" "}

                    {proposal.yayVotes > proposal.nayVotes ? "(YAY)" : "(NAY)"}

                    </button>
                      </div>

                  ) : (<div className='proposal-executed'><p>Proposal Executed</p></div>)
                )}  
            

              </div>
             


         </div>)}
          
      </div>
    );
  }

useEffect(() => {
  
  if(accountAddress){
    nftBalanceHandler();
  }
  ownerHandler();
  contractBalanceHandler();
  numProposalsHandler();
  
},[accountAddress])

  return(
    <div className='body'>

      <div className='container-1'>

        <div className='bahedi' >
      {walletConnected? (<p className='connect-button-heading'>Connected : {accountAddress ? `${accountAddress.substring(0, 4)}...${accountAddress.slice(-4)}` : ''}</p>
) :(
        <button onClick={walletConnectHandler} className='connect-button'>Connect Wallet</button>
      )}
        </div>

        <div className='title-heading'>
          <h1>NFT-powered on-chain DAO</h1>

          <h3>Empowering Crypto Devs NFT Holders to Shape the Future of the Organization</h3>
        </div>
      
        <div className = 'mint-nft' >
         
          
          <button  onClick={mintNFT}>Mint NFT</button>
          
          </div>

        <div className='information'>

          <div className='info-item'>
            <h2>Contract Balance </h2>
            <p>{contractBalance} ETH</p>
          </div>

          <div className='info-item'>
          <h2>Number of Proposals </h2>
          <p>{numProposals}</p>
          </div>
      
        <div className='info-item'>
        <h2>NFT Balance</h2>
        <p>{nftBalance}</p>
        </div>
      
      </div>

        <div className='heading-tab-content'>
          <h1 >Tab Content</h1>
        </div>

         

      <div className='tab-buttons'>
        <button  onClick={() => handleTabClick('createProposal')}>Create Proposal</button>
        <button  onClick={() => handleTabClick('fetchProposal')}>Fetch Proposal</button>
        <button  onClick={() => {handleTabClick('allProposal');
                                setRevert(true)}}>Recent Proposals</button>
        <button  onClick={() => handleTabClick('actions')}>Actions</button>
      </div>

      <div className='tab-content'>

      

        {selectedTab == 'createProposal' ? 
        (
          
          <div>
            
            <div className='create-proposal-heading'>
            <h1>Create Proposal</h1>
            
            </div>

          {proposalCreated? (<div className='proposal-created'><p>Proposal Created ! proposal index : {numProposals -1}</p></div> ): (
            
            
            <div>
            
            <br />

            <div className='inputandlabel'>
          <div className=''>
          <label>NFT TokenId </label>
          <br/>
          <input placeholder='Enter NFT TokenId' type='number' value={createProposalId} onChange={(e) => setCreateProposalId(e.target.value)} />
       
         
          </div>
          
          
          <div className=''>
          <label>Proposal Title</label>
          <br/>
             <input placeholder='Enter Proposal Title' type='text' value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          </div>

          <div className = 'create-proposol-button'>
          <button onClick={createProposalHandler}>Create Proposal</button>
            </div>

          <div>

            <div className='check'>
      <h2>Check Availability </h2>
      
        <input placeholder='Enter nftToken Id' type='number' value={tokenId} onChange={(e) =>setTokenId(e.target.value)} /> 
        <button onClick={() => {availability();}}>Check</button>
        </div>

            <div className='availability'>
        {sestAvailable?(<div>
          
          <h3 style={{ backgroundColor: available ? 'green' : '#ae093d', color: 'white' }}>
  {available ? 'Available' : 'Not Available'}
</h3>

        </div>):(null)}
          </div>

       </div>

        </div>


          )}
          
          </div>
        ):null  }



        <br/>

          <div className='fetch-proposal-container'>
        {selectedTab == 'fetchProposal' ? (
          <div>

          <h1>Fetch Proposal by Id</h1>
          <br/>

            <div className='fetch-proposal-details'>
            
            <input type='number' step="10" value={fetchProposalId} onChange={(e) => setFetchProposalId(e.target.value)} placeholder='Enter Proposal id' />
            <button onClick={fetchProposalHandler}>Fetch Proposal</button>
          </div>

          {showProposalDetails?renderProposalDetails():null}
        </div>
        ):null}
          </div>


        {selectedTab == 'allProposal' ? (
          <div className='all-proposals'><h1>All Proposals</h1>
       
         
          {getAllProposal.length > 0 ? (
            <div className='all-proposals-ul'>
              <ul>
              {getAllProposal.map((proposal,index) => (
                <li key={index}>
                  <h4>Proposal ID  : {proposal.proposalId}</h4>
                  <h3> {proposal.title}</h3>

                  <div className='proposal-details-details'>
  <p data-label="NFT Token Id"><span>{proposal.nftTokenId}</span></p>
  <p data-label="Deadline"><span>{formatUnixTimestamp(proposal.deadline)}</span></p>
  <p data-label="Yay Votes"><span>{proposal.yayVotes}</span></p>
  <p data-label="Nay Votes"><span>{proposal.nayVotes}</span></p>
  <p data-label="Executed"><span>{proposal.executed ? "Yes" : "No"}</span></p>
</div>

                </li>
              ))}
            </ul>
              </div>
          ) :( <div className='fetch-all-prop'><button onClick={getAllProposalHandler} >Fetch all proposals</button></div>)}
          </div>
        ):null}


{selectedTab === 'actions' ? (
  <div className='owner-address'>
    <h2>Owner Address : {`${ownerAddress.substring(0, 4)}...${ownerAddress.slice(-4)}`}</h2>
    <br/>
    {owner ? (
      <div className='withdrawEther'>
        <h3>you're the owner, you can withdraw Ether</h3>
        {isEtherIsWithdrawled ? (
          <h3 >Ether Is Withdrawled</h3>
        ) : (
          <div className='initiate-withdrawl'>
          <button onClick={withdrawEther} >Initiate Withdrawal</button>
          </div>
        )}
      </div>
    ) : (
      <div><h3>You are not an owner,
        you can't withdraw money</h3>
      </div>
    )}
    <div className='send-contract'><button onClick={sendEtherToAContract}>Send Ether To Contract</button></div>
  </div>
) : null}

</div>
      

      

        

        

        

       

       
      </div>
          
     
    </div>
  );
}

export default App;

