"use client";

import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import Web3 from "web3";
import { Connection, PublicKey } from "@solana/web3.js";
import "react-toastify/dist/ReactToastify.css";

declare global {
  interface Window {
    ethereum: any;
    solana: any;
    bitcoin: any;
  }
}
const ConnectWallet = () => {
  const [blockchain, setBlockchain] = useState<string>("Ethereum");
  const [balance, setBalance] = useState<string | null>(null);
  const [dummyBalance, setDummyBalance] = useState<number>(5); // Default dummy balance
  const [account, setAccount] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [wager, setWager] = useState<string>("0.1");
  const [flipResult, setFlipResult] = useState<string | null>(null);
  const [selectedSide, setSelectedSide] = useState<string>("Heads");
  const [isRealAccount, setIsRealAccount] = useState<boolean>(false);

  useEffect(() => {
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        fetchBalance(accounts[0]);
        setIsRealAccount(true);
      } else {
        setAccount(null);
        setBalance(null);
        setIsRealAccount(false);
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  useEffect(() => {
    setAccount(null);
    setBalance(null);
    setIsRealAccount(false);
    setFlipResult(null);
    setError(null);
  }, [blockchain]);

  const connectRealAccount = async () => {
    setLoading(true);
    setError(null);

    try {
      if (blockchain === "Ethereum" || blockchain === "Polygon") {
        if (window.ethereum) {
          const web3 = new Web3(window.ethereum);
          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
          setAccount(accounts[0]);
          fetchBalance(accounts[0]);
          setIsRealAccount(true);
          toast.success("Successfully connected to your real wallet!");
        } else {
          setError("Please install MetaMask to use this feature.");
        }
      } else if (blockchain === "Solana") {
        if (window.solana) {
          const resp = await window.solana.connect();
          setAccount(resp.publicKey.toString());
          fetchBalance(resp.publicKey.toString());
          setIsRealAccount(true);
          toast.success("Successfully connected to your real Solana wallet!");
        } else {
          setError("Please install a Solana wallet extension.");
        }
      } else if (blockchain === "Bitcoin") {
        setError("Bitcoin wallet connection not implemented.");
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setError("Failed to connect real wallet.");
    } finally {
      setLoading(false);
    }
  };

  const connectDummyAccount = () => {
    setAccount("dummy-account");
    setBalance(dummyBalance.toFixed(2));
    setIsRealAccount(false);
    toast.success("Connected to dummy account!");
  };

  const fetchBalance = async (account: string) => {
    try {
      if (blockchain === "Ethereum" || blockchain === "Polygon") {
        if (window.ethereum) {
          const web3 = new Web3(window.ethereum);
          const balanceWei = await web3.eth.getBalance(account);
          const balanceEth = web3.utils.fromWei(balanceWei, "ether");
          setBalance(balanceEth);
        }
      } else if (blockchain === "Solana") {
        if (window.solana) {
          const connection = new Connection(
            "https://api.mainnet-beta.solana.com",
            "confirmed"
          );
          const publicKey = new PublicKey(account);

          const balance = await connection.getBalance(publicKey);

          const balanceInSOL = balance / 1000000000;

          setBalance(balanceInSOL.toFixed(2));
        } else {
          setError("Solana wallet not detected.");
        }
      } else if (blockchain === "Bitcoin") {
        setError("Bitcoin balance fetching not implemented.");
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
      setError(`Failed to fetch ${blockchain} balance.`);
    }
  };

  const flipCoin = () => {
    const currentBalance =
      account === "dummy-account" ? dummyBalance : parseFloat(balance || "0");

    if (currentBalance < parseFloat(wager)) {
      toast.error(
        `Insufficient balance. You need at least ${wager} ${
          blockchain === "Ethereum"
            ? "ETH"
            : blockchain === "Polygon"
            ? "MATIC"
            : blockchain === "Solana"
            ? "SOL"
            : blockchain === "Bitcoin"
            ? "BTC"
            : ""
        } to play.`
      );
      return;
    }

    setLoading(true);
    setFlipResult(null);

    setTimeout(() => {
      const result = Math.random() < 0.5 ? "Heads" : "Tails";
      setFlipResult(result);
      setLoading(false);

      if (result === selectedSide) {
        if (account === "dummy-account") {
          setDummyBalance(dummyBalance * 2);
        } else {
          const newBalance = (parseFloat(balance || "0") * 2).toFixed(4);
          setBalance(newBalance);
        }
        toast.success(`Congratulations! You won the coin flip!`);
      } else {
        if (account === "dummy-account") {
          setDummyBalance(dummyBalance / 2);
        } else {
          const newBalance = (parseFloat(balance || "0") / 2).toFixed(4);
          setBalance(newBalance);
        }
        toast.error(`Sorry, you lost the coin flip.`);
      }
    }, 2000);
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg w-full max-w-lg mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
        Connect Your Wallet
      </h2>

      <div className="flex flex-col mb-4">
        <label
          htmlFor="blockchain"
          className="text-sm font-semibold text-gray-700 mb-2"
        >
          Select Blockchain:
        </label>
        <select
          id="blockchain"
          value={blockchain}
          onChange={(e) => setBlockchain(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md text-gray-700"
        >
          <option value="Ethereum">Ethereum</option>
          <option value="Polygon">Polygon</option>
          <option value="Solana">Solana</option>
          <option value="Bitcoin">Bitcoin</option>
        </select>
      </div>

      {isRealAccount ? (
        <>
          <button
            onClick={connectRealAccount}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition duration-200 ease-in-out ${
              loading ? "bg-gray-400 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Connecting..." : "Connect RealAccount"}
          </button>
          <button
            onClick={connectDummyAccount}
            className={`w-full mt-4 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded transition duration-200 ease-in-out ${
              loading ? "bg-gray-400 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Connecting..." : "Connect DummyAccount"}
          </button>
        </>
      ) : (
        <>
          <button
            onClick={connectRealAccount}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition duration-200 ease-in-out ${
              loading ? "bg-gray-400 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Connecting..." : "Connect RealAccount"}
          </button>
          <button
            onClick={connectDummyAccount}
            className={`w-full mt-4 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded transition duration-200 ease-in-out ${
              loading ? "bg-gray-400 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Connecting..." : "Connect DummyAccount"}
          </button>
        </>
      )}

      {error && <p className="text-red-500 mt-2">{error}</p>}

      {account && (
        <div className="mt-6">
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <p className="font-semibold text-gray-800">Account:</p>
              <p className="text-gray-700 truncate">{account}</p>
            </div>
            <div className="flex justify-between mb-2">
              <p className="font-semibold text-gray-800">Balance:</p>
              <p className="text-gray-700">
                {account === "dummy-account"
                  ? dummyBalance.toFixed(2)
                  : balance}{" "}
                {blockchain === "Ethereum"
                  ? "ETH"
                  : blockchain === "Polygon"
                  ? "MATIC"
                  : blockchain === "Solana"
                  ? "SOL"
                  : blockchain === "Bitcoin"
                  ? "BTC"
                  : ""}
              </p>
            </div>
          </div>

          <div className="mb-4">
            <label
              htmlFor="wager"
              className="text-sm font-semibold text-gray-700 mb-2"
            >
              Enter Wager:
            </label>
            <input
              type="number"
              id="wager"
              value={wager}
              onChange={(e) => setWager(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-gray-700"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="side"
              className="text-sm font-semibold text-gray-700 mb-2"
            >
              Choose Your Side:
            </label>
            <select
              id="side"
              value={selectedSide}
              className="w-full p-2 border border-gray-300 rounded-md text-gray-700"
              onChange={(e) => setSelectedSide(e.target.value)}
            >
              <option value="Heads">Heads</option>
              <option value="Tails">Tails</option>
            </select>
          </div>

          <button
            onClick={flipCoin}
            className={`w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition duration-200 ease-in-out ${
              loading ? "bg-gray-400 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Flipping..." : "Flip Coin"}
          </button>

          {flipResult && (
            <p className="mt-4 text-lg font-semibold text-gray-800">
              Coin Flip Result: {flipResult}
            </p>
          )}
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default ConnectWallet;
