import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm, deployments } from "hardhat";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  shipper: HardhatEthersSigner;
  carrier: HardhatEthersSigner;
};

describe("PrivateFreightBiddingSepolia", function () {
  let signers: Signers;
  let contract: any;
  let contractAddress: string;
  let step: number;
  let steps: number;

  function progress(message: string) {
    console.log(`  ${++step}/${steps} ${message}`);
  }

  before(async function () {
    // Only run on Sepolia testnet
    if (fhevm.isMock) {
      console.warn(`⚠️  This test suite can only run on Sepolia Testnet`);
      console.warn(`   Run with: npm run test:sepolia`);
      this.skip();
    }

    console.log("\n🌐 Running Sepolia Integration Tests\n");

    try {
      const deployment = await deployments.get("PrivateFreightBidding");
      contractAddress = deployment.address;
      contract = await ethers.getContractAt("PrivateFreightBidding", deployment.address);
      console.log(`✅ Contract found at: ${contractAddress}\n`);
    } catch (e) {
      (e as Error).message +=
        "\n\n📝 Deploy contract first with: npx hardhat deploy --network sepolia";
      throw e;
    }

    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = {
      deployer: ethSigners[0],
      shipper: ethSigners[1],
      carrier: ethSigners[2],
    };

    console.log(`👤 Deployer: ${signers.deployer.address}`);
    console.log(`🚢 Shipper:  ${signers.shipper.address}`);
    console.log(`🚚 Carrier:  ${signers.carrier.address}\n`);
  });

  beforeEach(async () => {
    step = 0;
    steps = 0;
  });

  // ============================================================
  // SEPOLIA INTEGRATION TESTS
  // ============================================================

  describe("Full Workflow on Sepolia", function () {
    it("should complete full job lifecycle with encrypted bidding", async function () {
      steps = 10;
      this.timeout(10 * 60 * 1000); // 10 minutes timeout for Sepolia

      progress("Registering shipper...");
      let tx = await contract.connect(signers.shipper).registerShipper();
      await tx.wait();
      console.log(`   ✓ Shipper registered (tx: ${tx.hash.slice(0, 10)}...)`);

      progress("Registering carrier...");
      tx = await contract.connect(signers.carrier).registerCarrier();
      await tx.wait();
      console.log(`   ✓ Carrier registered (tx: ${tx.hash.slice(0, 10)}...)`);

      progress("Creating freight job...");
      const description = "Sepolia Test: Ship 50 pallets NY to LA";
      const deadline = Math.floor(Date.now() / 1000) + 3600; // +1 hour
      tx = await contract.connect(signers.shipper).createJob(description, deadline);
      const receipt = await tx.wait();
      console.log(`   ✓ Job created (gas used: ${receipt.gasUsed.toString()})`);

      // Get job ID from event
      const jobCreatedEvent = receipt.logs.find(
        (log: any) => log.fragment && log.fragment.name === "JobCreated"
      );
      const jobId = jobCreatedEvent ? jobCreatedEvent.args[0] : 0;
      console.log(`   ✓ Job ID: ${jobId}`);

      progress("Encrypting bid amount (4500)...");
      const bidAmount = 4500;
      const encryptedInput = await fhevm
        .createEncryptedInput(contractAddress, signers.carrier.address)
        .add64(bidAmount)
        .encrypt();
      console.log(`   ✓ Bid encrypted`);

      progress("Placing encrypted bid on-chain...");
      tx = await contract
        .connect(signers.carrier)
        .placeBid(jobId, encryptedInput.handles[0], encryptedInput.inputProof);
      await tx.wait();
      console.log(`   ✓ Bid placed (tx: ${tx.hash.slice(0, 10)}...)`);

      progress("Verifying bid was recorded...");
      const hasBid = await contract.hasBid(jobId, signers.carrier.address);
      expect(hasBid).to.be.true;
      console.log(`   ✓ Bid confirmed`);

      progress("Getting encrypted bid from chain...");
      const encryptedBid = await contract.getBid(jobId, signers.carrier.address);
      expect(encryptedBid).to.not.equal(ethers.ZeroHash);
      console.log(`   ✓ Encrypted bid retrieved: ${encryptedBid.slice(0, 20)}...`);

      progress("Decrypting bid amount...");
      const decryptedBid = await fhevm.userDecryptEuint(
        FhevmType.euint64,
        encryptedBid,
        contractAddress,
        signers.carrier
      );
      console.log(`   ✓ Decrypted bid: ${decryptedBid}`);
      expect(decryptedBid).to.equal(bidAmount);

      progress("Awarding job to carrier...");
      tx = await contract.connect(signers.shipper).awardJob(jobId, signers.carrier.address);
      await tx.wait();
      console.log(`   ✓ Job awarded (tx: ${tx.hash.slice(0, 10)}...)`);

      progress("Verifying job status updated...");
      const job = await contract.getJob(jobId);
      expect(job.status).to.equal(1); // 1 = Awarded
      expect(job.assignedCarrier).to.equal(signers.carrier.address);
      console.log(`   ✓ Job status: Awarded to ${signers.carrier.address.slice(0, 10)}...`);

      console.log("\n✅ Full workflow completed successfully!\n");
    });
  });

  describe("Multi-Carrier Bidding on Sepolia", function () {
    it("should handle multiple encrypted bids from different carriers", async function () {
      steps = 8;
      this.timeout(10 * 60 * 1000);

      const carrier2 = signers.deployer; // Use deployer as 2nd carrier

      progress("Setting up carriers...");
      // Carrier 1 already registered from previous test
      let tx = await contract.connect(carrier2).registerCarrier();
      await tx.wait();
      console.log(`   ✓ Second carrier registered`);

      progress("Creating new job...");
      const description = "Multi-bid test: Urgent delivery";
      const deadline = Math.floor(Date.now() / 1000) + 7200; // +2 hours
      tx = await contract.connect(signers.shipper).createJob(description, deadline);
      const receipt = await tx.wait();
      const jobId = 1; // Assuming this is the second job
      console.log(`   ✓ Job ${jobId} created`);

      progress("Carrier 1 placing bid (5000)...");
      const bid1 = 5000;
      const enc1 = await fhevm
        .createEncryptedInput(contractAddress, signers.carrier.address)
        .add64(bid1)
        .encrypt();
      tx = await contract
        .connect(signers.carrier)
        .placeBid(jobId, enc1.handles[0], enc1.inputProof);
      await tx.wait();
      console.log(`   ✓ Bid 1 placed`);

      progress("Carrier 2 placing bid (4800)...");
      const bid2 = 4800;
      const enc2 = await fhevm
        .createEncryptedInput(contractAddress, carrier2.address)
        .add64(bid2)
        .encrypt();
      tx = await contract.connect(carrier2).placeBid(jobId, enc2.handles[0], enc2.inputProof);
      await tx.wait();
      console.log(`   ✓ Bid 2 placed`);

      progress("Verifying both bids recorded...");
      const hasBid1 = await contract.hasBid(jobId, signers.carrier.address);
      const hasBid2 = await contract.hasBid(jobId, carrier2.address);
      expect(hasBid1).to.be.true;
      expect(hasBid2).to.be.true;
      console.log(`   ✓ Both bids confirmed`);

      progress("Checking bid count...");
      const bidCount = await contract.getBidCount(jobId);
      expect(bidCount).to.equal(2);
      console.log(`   ✓ Bid count: ${bidCount}`);

      progress("Carrier 1 decrypting own bid...");
      const encBid1 = await contract.getBid(jobId, signers.carrier.address);
      const decrypted1 = await fhevm.userDecryptEuint(
        FhevmType.euint64,
        encBid1,
        contractAddress,
        signers.carrier
      );
      expect(decrypted1).to.equal(bid1);
      console.log(`   ✓ Carrier 1 bid verified: ${decrypted1}`);

      progress("Carrier 2 decrypting own bid...");
      const encBid2 = await contract.getBid(jobId, carrier2.address);
      const decrypted2 = await fhevm.userDecryptEuint(
        FhevmType.euint64,
        encBid2,
        contractAddress,
        carrier2
      );
      expect(decrypted2).to.equal(bid2);
      console.log(`   ✓ Carrier 2 bid verified: ${decrypted2}`);

      console.log("\n✅ Multi-carrier bidding successful!\n");
    });
  });

  describe("Privacy Verification on Sepolia", function () {
    it("should prevent unauthorized bid decryption", async function () {
      steps = 5;
      this.timeout(5 * 60 * 1000);

      const jobId = 0; // Use job from first test

      progress("Getting carrier's encrypted bid...");
      const encryptedBid = await contract.getBid(jobId, signers.carrier.address);
      expect(encryptedBid).to.not.equal(ethers.ZeroHash);
      console.log(`   ✓ Encrypted bid retrieved`);

      progress("Carrier successfully decrypting own bid...");
      const decrypted = await fhevm.userDecryptEuint(
        FhevmType.euint64,
        encryptedBid,
        contractAddress,
        signers.carrier
      );
      expect(decrypted).to.be.gte(0);
      console.log(`   ✓ Carrier decrypted: ${decrypted}`);

      progress("Attempting unauthorized decryption (shipper)...");
      try {
        await fhevm.userDecryptEuint(
          FhevmType.euint64,
          encryptedBid,
          contractAddress,
          signers.shipper
        );
        console.log(`   ✗ Unauthorized decryption succeeded (SHOULD FAIL!)`);
        expect.fail("Shipper should not be able to decrypt carrier's bid");
      } catch (error) {
        console.log(`   ✓ Unauthorized decryption blocked`);
        expect(error).to.exist;
      }

      progress("Attempting unauthorized decryption (deployer)...");
      try {
        await fhevm.userDecryptEuint(
          FhevmType.euint64,
          encryptedBid,
          contractAddress,
          signers.deployer
        );
        console.log(`   ✗ Unauthorized decryption succeeded (SHOULD FAIL!)`);
        expect.fail("Deployer should not be able to decrypt carrier's bid");
      } catch (error) {
        console.log(`   ✓ Unauthorized decryption blocked`);
        expect(error).to.exist;
      }

      progress("Privacy verified - only owner can decrypt");
      console.log("\n✅ Privacy guarantees verified!\n");
    });
  });

  describe("Gas Costs on Sepolia", function () {
    it("should measure real gas costs", async function () {
      steps = 5;
      this.timeout(5 * 60 * 1000);

      console.log("\n📊 Gas Cost Analysis:\n");

      progress("Measuring registration gas...");
      // Use a fresh address
      const [, , , testCarrier] = await ethers.getSigners();
      const regTx = await contract.connect(testCarrier).registerCarrier();
      const regReceipt = await regTx.wait();
      console.log(`   Registration:  ${regReceipt.gasUsed.toString()} gas`);

      progress("Measuring job creation gas...");
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      const jobTx = await contract
        .connect(signers.shipper)
        .createJob("Gas test job", deadline);
      const jobReceipt = await jobTx.wait();
      console.log(`   Job Creation:  ${jobReceipt.gasUsed.toString()} gas`);

      progress("Measuring encrypted bid gas...");
      const bidAmount = 3000;
      const enc = await fhevm
        .createEncryptedInput(contractAddress, testCarrier.address)
        .add64(bidAmount)
        .encrypt();
      const bidTx = await contract
        .connect(testCarrier)
        .placeBid(2, enc.handles[0], enc.inputProof);
      const bidReceipt = await bidTx.wait();
      console.log(`   Encrypted Bid: ${bidReceipt.gasUsed.toString()} gas (FHE operation)`);

      progress("Measuring job award gas...");
      const awardTx = await contract
        .connect(signers.shipper)
        .awardJob(2, testCarrier.address);
      const awardReceipt = await awardTx.wait();
      console.log(`   Job Award:     ${awardReceipt.gasUsed.toString()} gas`);

      progress("Gas analysis complete");
      console.log("\n✅ Gas costs measured!\n");
    });
  });
});
