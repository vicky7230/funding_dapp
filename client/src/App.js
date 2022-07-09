import { useState, useEffect } from 'react'
import './App.css';
import Web3 from "web3"
import detectEthereumProvider from '@metamask/detect-provider';
import { loadContract } from './utils/load-contract';

function App() {

  const [web3Api, setweb3Api] = useState({ provider: null, web3: null, contract: null })

  const [account, setAccount] = useState(null)
  const [balance, setBalance] = useState(null)
  const [reload, shouldReload] = useState(false)

  const reloadEffect = () => shouldReload(!reload)

  useEffect(() => {

    const loadProvider = async () => {
      //console.log(window.web3)
      //console.log(window.ethereum)

      let currentAccount = null;

      function handleAccountsChanged(accounts) {
        if (accounts.length === 0) {
          // MetaMask is locked or the user has not connected any accounts
          console.log('Please connect to MetaMask.');
        } else if (accounts[0] !== currentAccount) {
          currentAccount = accounts[0]
          setAccount(accounts[0])

          // Do any other work!
        }
      }

      const provider = await detectEthereumProvider();

      if (provider) {
        console.log('Ethereum successfully detected!')

        // From now on, this should always be true:
        // provider === window.ethereum
        // Access the decentralized web!

        const contract = await loadContract("Funder", provider)

        setweb3Api({ provider, web3: new Web3(provider), contract })

        provider.on('accountsChanged', handleAccountsChanged);

        //print the metamask account connected to this website, same as  provider.enable() which is depreciated now
        provider.request({ method: "eth_requestAccounts", })
          .then(handleAccountsChanged)
          .catch((err) => {
            if (err.code === 4001) {
              // EIP-1193 userRejectedRequest error
              // If this happens, the user rejected the connection request.
              console.log('Please connect to MetaMask.');
            } else {
              console.error(err);
            }
          });


      } else {
        // if the provider is not detected, detectEthereumProvider resolves to null
        console.error('Please install MetaMask!')
      }

      // if (window.ethereum) {
      //   provider = window.ethereum

      //   try {
      //     await provider.enable()
      //   }
      //   catch {
      //     console.error("User is not allowed")
      //   }
      // } else if (window.web3) {
      //   provider = window.web3.currentProvider
      // } else if (!process.env.production) {
      //   provider = new Web3.providers.HttpProvider("http://localhost:7545")
      // }



    }

    loadProvider()
  }, []);

  // useEffect(() => {
  //   if (web3Api.web3 != null) {
  //     console.log(web3Api.web3)
  //   }

  //   const getAccounts = async () => {
  //     const accounts = await web3Api.web3.eth.getAccounts()
  //     console.log(accounts[0])
  //     setAccount(accounts[0])
  //   }

  //   web3Api.web3 && getAccounts()
  // }, [web3Api.web3]);

  useEffect(() => {
    const loadBalance = async () => {
      const { contract, web3 } = web3Api
      const balance = await web3.eth.getBalance(contract.address)
      setBalance(web3.utils.fromWei(balance, "ether"))
    }
    web3Api.contract && loadBalance()
  }, [web3Api, reload])

  const transferFunds = async () => {
    const { contract, web3 } = web3Api
    await contract.transfer({
      from: account,
      value: web3.utils.toWei("2", "ether")
    })
    reloadEffect()
  }

  const withdrawFunds = async () => {
    const { contract, web3 } = web3Api
    await contract.withdraw(
      web3.utils.toWei("2", "ether"),
      {
        from: account
      })
    reloadEffect()
  }

  return (
    <>
      <div className="card text-center">
        <div className="card-header">Funding</div>
        <div className="card-body">
          <h5 className="card-title">Balance: {balance} ETH </h5>
          <p className="card-text">Account : {account ? account : "not connected"}</p>
          {/* <button type="button" className="btn btn-success " onClick={async () => {
            //print the metamask account connected to this website, same as  provider.enable() which depreciated now
            const accounts = await window.ethereum.request({
              method: "eth_requestAccounts",
            });
            console.log(accounts);
          }}>
            Connect to Mtamask
          </button> */}
          &nbsp;
          <button type="button" className="btn btn-success " onClick={transferFunds}>
            Transfer
          </button>
          &nbsp;
          <button type="button" className="btn btn-primary " onClick={withdrawFunds}>
            Withdraw
          </button>
        </div>
        <div className="card-footer text-muted">Code Eater</div>
      </div>
    </>
  );
}

export default App;
