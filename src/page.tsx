import ConnectWallet from "./components/ConnectWallet";

const Page = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-green-800 p-4 sm:p-6 md:p-8 lg:p-12">
      <header className="text-center bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-lg max-w-lg w-full mx-4 sm:mx-6 md:mx-8 lg:mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4 sm:mb-6">
          My Crypto Wallet
        </h1>

        <ConnectWallet />
      </header>
    </div>
  );
};

export default Page;
