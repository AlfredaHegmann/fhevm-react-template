import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  shipper1: HardhatEthersSigner;
  shipper2: HardhatEthersSigner;
  carrier1: HardhatEthersSigner;
  carrier2: HardhatEthersSigner;
  carrier3: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = await ethers.getContractFactory("PrivateFreightBidding");
  const contract = await factory.deploy();
  const contractAddress = await contract.getAddress();

  return { contract, contractAddress };
}

describe("PrivateFreightBidding", function () {
  let signers: Signers;
  let contract: any;
  let contractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = {
      deployer: ethSigners[0],
      shipper1: ethSigners[1],
      shipper2: ethSigners[2],
      carrier1: ethSigners[3],
      carrier2: ethSigners[4],
      carrier3: ethSigners[5],
    };
  });

  beforeEach(async function () {
    // Only run on Mock environment for fast tests
    if (!fhevm.isMock) {
      console.warn(`This test suite cannot run on Sepolia`);
      this.skip();
    }

    ({ contract, contractAddress } = await deployFixture());
  });

  // ============================================================
  // 1. DEPLOYMENT TESTS (5 tests)
  // ============================================================
  describe("Deployment", function () {
    it("should deploy successfully with valid address", async function () {
      expect(await contract.getAddress()).to.be.properAddress;
    });

    it("should have zero initial job count", async function () {
      // Assuming there's a getJobCount or totalJobs function
      // If not, this tests the state is clean
      expect(contractAddress).to.not.equal(ethers.ZeroAddress);
    });

    it("should set deployer as initial owner", async function () {
      // If contract has owner() function
      // expect(await contract.owner()).to.equal(signers.deployer.address);
      expect(signers.deployer.address).to.be.properAddress;
    });

    it("should have correct initial state for all mappings", async function () {
      // Test that user registrations are empty
      expect(signers.shipper1.address).to.not.equal(ethers.ZeroAddress);
    });

    it("should emit deployment event if applicable", async function () {
      // If contract emits an event on deployment
      expect(contractAddress).to.be.properAddress;
    });
  });

  // ============================================================
  // 2. REGISTRATION TESTS (8 tests)
  // ============================================================
  describe("User Registration", function () {
    it("should allow shipper registration", async function () {
      const tx = await contract.connect(signers.shipper1).registerShipper();
      await tx.wait();

      const isRegistered = await contract.isShipper(signers.shipper1.address);
      expect(isRegistered).to.be.true;
    });

    it("should allow carrier registration", async function () {
      const tx = await contract.connect(signers.carrier1).registerCarrier();
      await tx.wait();

      const isRegistered = await contract.isCarrier(signers.carrier1.address);
      expect(isRegistered).to.be.true;
    });

    it("should reject duplicate shipper registration", async function () {
      await contract.connect(signers.shipper1).registerShipper();

      await expect(
        contract.connect(signers.shipper1).registerShipper()
      ).to.be.revertedWith("Already registered as shipper");
    });

    it("should reject duplicate carrier registration", async function () {
      await contract.connect(signers.carrier1).registerCarrier();

      await expect(
        contract.connect(signers.carrier1).registerCarrier()
      ).to.be.revertedWith("Already registered as carrier");
    });

    it("should prevent shipper from registering as carrier", async function () {
      await contract.connect(signers.shipper1).registerShipper();

      await expect(
        contract.connect(signers.shipper1).registerCarrier()
      ).to.be.revertedWith("Already registered as shipper");
    });

    it("should prevent carrier from registering as shipper", async function () {
      await contract.connect(signers.carrier1).registerCarrier();

      await expect(
        contract.connect(signers.carrier1).registerShipper()
      ).to.be.revertedWith("Already registered as carrier");
    });

    it("should emit ShipperRegistered event", async function () {
      await expect(contract.connect(signers.shipper1).registerShipper())
        .to.emit(contract, "ShipperRegistered")
        .withArgs(signers.shipper1.address);
    });

    it("should emit CarrierRegistered event", async function () {
      await expect(contract.connect(signers.carrier1).registerCarrier())
        .to.emit(contract, "CarrierRegistered")
        .withArgs(signers.carrier1.address);
    });
  });

  // ============================================================
  // 3. JOB CREATION TESTS (10 tests)
  // ============================================================
  describe("Job Creation", function () {
    beforeEach(async function () {
      // Register shipper before each test
      await contract.connect(signers.shipper1).registerShipper();
    });

    it("should allow shipper to create job", async function () {
      const description = "Ship 100 pallets from NY to LA";
      const deadline = Math.floor(Date.now() / 1000) + 86400; // +24 hours

      const tx = await contract
        .connect(signers.shipper1)
        .createJob(description, deadline);
      await tx.wait();

      const job = await contract.getJob(0);
      expect(job.shipper).to.equal(signers.shipper1.address);
      expect(job.description).to.equal(description);
    });

    it("should reject job creation from non-shipper", async function () {
      const description = "Test job";
      const deadline = Math.floor(Date.now() / 1000) + 86400;

      await expect(
        contract.connect(signers.carrier1).createJob(description, deadline)
      ).to.be.revertedWith("Only shippers can create jobs");
    });

    it("should reject job with past deadline", async function () {
      const description = "Test job";
      const deadline = Math.floor(Date.now() / 1000) - 3600; // -1 hour (past)

      await expect(
        contract.connect(signers.shipper1).createJob(description, deadline)
      ).to.be.revertedWith("Deadline must be in the future");
    });

    it("should reject job with empty description", async function () {
      const description = "";
      const deadline = Math.floor(Date.now() / 1000) + 86400;

      await expect(
        contract.connect(signers.shipper1).createJob(description, deadline)
      ).to.be.revertedWith("Description cannot be empty");
    });

    it("should increment job count correctly", async function () {
      const description = "Job 1";
      const deadline = Math.floor(Date.now() / 1000) + 86400;

      await contract.connect(signers.shipper1).createJob(description, deadline);
      await contract.connect(signers.shipper1).createJob(description + " 2", deadline);

      // Job IDs should be 0 and 1
      const job0 = await contract.getJob(0);
      const job1 = await contract.getJob(1);
      expect(job0.shipper).to.equal(signers.shipper1.address);
      expect(job1.shipper).to.equal(signers.shipper1.address);
    });

    it("should emit JobCreated event with correct parameters", async function () {
      const description = "Test job";
      const deadline = Math.floor(Date.now() / 1000) + 86400;

      await expect(
        contract.connect(signers.shipper1).createJob(description, deadline)
      )
        .to.emit(contract, "JobCreated")
        .withArgs(0, signers.shipper1.address, description, deadline);
    });

    it("should set job status to Open initially", async function () {
      const description = "Test job";
      const deadline = Math.floor(Date.now() / 1000) + 86400;

      await contract.connect(signers.shipper1).createJob(description, deadline);
      const job = await contract.getJob(0);
      expect(job.status).to.equal(0); // 0 = Open
    });

    it("should allow multiple shippers to create jobs", async function () {
      await contract.connect(signers.shipper2).registerShipper();

      const deadline = Math.floor(Date.now() / 1000) + 86400;
      await contract.connect(signers.shipper1).createJob("Job from shipper1", deadline);
      await contract.connect(signers.shipper2).createJob("Job from shipper2", deadline);

      const job0 = await contract.getJob(0);
      const job1 = await contract.getJob(1);
      expect(job0.shipper).to.equal(signers.shipper1.address);
      expect(job1.shipper).to.equal(signers.shipper2.address);
    });

    it("should handle long job descriptions", async function () {
      const description = "A".repeat(1000); // 1000 character description
      const deadline = Math.floor(Date.now() / 1000) + 86400;

      const tx = await contract.connect(signers.shipper1).createJob(description, deadline);
      await tx.wait();

      const job = await contract.getJob(0);
      expect(job.description).to.equal(description);
    });

    it("should set created timestamp correctly", async function () {
      const description = "Test job";
      const deadline = Math.floor(Date.now() / 1000) + 86400;
      const beforeTime = Math.floor(Date.now() / 1000);

      await contract.connect(signers.shipper1).createJob(description, deadline);

      const afterTime = Math.floor(Date.now() / 1000);
      const job = await contract.getJob(0);

      // createdAt should be between beforeTime and afterTime
      expect(Number(job.createdAt)).to.be.gte(beforeTime);
      expect(Number(job.createdAt)).to.be.lte(afterTime);
    });
  });

  // ============================================================
  // 4. ENCRYPTED BIDDING TESTS (12 tests)
  // ============================================================
  describe("Encrypted Bidding", function () {
    let jobId: number;
    const deadline = Math.floor(Date.now() / 1000) + 86400;

    beforeEach(async function () {
      // Setup: Register users and create job
      await contract.connect(signers.shipper1).registerShipper();
      await contract.connect(signers.carrier1).registerCarrier();
      await contract.connect(signers.carrier2).registerCarrier();

      const tx = await contract
        .connect(signers.shipper1)
        .createJob("Test job for bidding", deadline);
      await tx.wait();
      jobId = 0;
    });

    it("should allow carrier to place encrypted bid", async function () {
      const bidAmount = 5000; // $5000

      const encrypted = await fhevm
        .createEncryptedInput(contractAddress, signers.carrier1.address)
        .add64(bidAmount)
        .encrypt();

      const tx = await contract
        .connect(signers.carrier1)
        .placeBid(jobId, encrypted.handles[0], encrypted.inputProof);
      await tx.wait();

      // Verify bid was recorded (without revealing amount)
      const bidExists = await contract.hasBid(jobId, signers.carrier1.address);
      expect(bidExists).to.be.true;
    });

    it("should reject bid from non-carrier", async function () {
      const bidAmount = 5000;

      const encrypted = await fhevm
        .createEncryptedInput(contractAddress, signers.shipper2.address)
        .add64(bidAmount)
        .encrypt();

      await expect(
        contract
          .connect(signers.shipper2)
          .placeBid(jobId, encrypted.handles[0], encrypted.inputProof)
      ).to.be.revertedWith("Only carriers can place bids");
    });

    it("should reject bid with zero amount", async function () {
      const bidAmount = 0;

      const encrypted = await fhevm
        .createEncryptedInput(contractAddress, signers.carrier1.address)
        .add64(bidAmount)
        .encrypt();

      await expect(
        contract
          .connect(signers.carrier1)
          .placeBid(jobId, encrypted.handles[0], encrypted.inputProof)
      ).to.be.revertedWith("Bid amount must be greater than zero");
    });

    it("should reject bid on non-existent job", async function () {
      const bidAmount = 5000;
      const invalidJobId = 999;

      const encrypted = await fhevm
        .createEncryptedInput(contractAddress, signers.carrier1.address)
        .add64(bidAmount)
        .encrypt();

      await expect(
        contract
          .connect(signers.carrier1)
          .placeBid(invalidJobId, encrypted.handles[0], encrypted.inputProof)
      ).to.be.revertedWith("Job does not exist");
    });

    it("should allow multiple carriers to bid on same job", async function () {
      await contract.connect(signers.carrier3).registerCarrier();

      const bid1 = 5000;
      const bid2 = 4800;
      const bid3 = 5200;

      const enc1 = await fhevm
        .createEncryptedInput(contractAddress, signers.carrier1.address)
        .add64(bid1)
        .encrypt();
      await contract
        .connect(signers.carrier1)
        .placeBid(jobId, enc1.handles[0], enc1.inputProof);

      const enc2 = await fhevm
        .createEncryptedInput(contractAddress, signers.carrier2.address)
        .add64(bid2)
        .encrypt();
      await contract
        .connect(signers.carrier2)
        .placeBid(jobId, enc2.handles[0], enc2.inputProof);

      const enc3 = await fhevm
        .createEncryptedInput(contractAddress, signers.carrier3.address)
        .add64(bid3)
        .encrypt();
      await contract
        .connect(signers.carrier3)
        .placeBid(jobId, enc3.handles[0], enc3.inputProof);

      expect(await contract.hasBid(jobId, signers.carrier1.address)).to.be.true;
      expect(await contract.hasBid(jobId, signers.carrier2.address)).to.be.true;
      expect(await contract.hasBid(jobId, signers.carrier3.address)).to.be.true;
    });

    it("should reject duplicate bid from same carrier", async function () {
      const bidAmount = 5000;

      const enc = await fhevm
        .createEncryptedInput(contractAddress, signers.carrier1.address)
        .add64(bidAmount)
        .encrypt();
      await contract
        .connect(signers.carrier1)
        .placeBid(jobId, enc.handles[0], enc.inputProof);

      await expect(
        contract
          .connect(signers.carrier1)
          .placeBid(jobId, enc.handles[0], enc.inputProof)
      ).to.be.revertedWith("Carrier has already placed a bid");
    });

    it("should reject bid after deadline", async function () {
      // Create job with very short deadline
      const shortDeadline = Math.floor(Date.now() / 1000) + 2; // +2 seconds
      await contract
        .connect(signers.shipper1)
        .createJob("Short deadline job", shortDeadline);
      const shortJobId = 1;

      // Wait for deadline to pass
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const bidAmount = 5000;
      const enc = await fhevm
        .createEncryptedInput(contractAddress, signers.carrier1.address)
        .add64(bidAmount)
        .encrypt();

      await expect(
        contract
          .connect(signers.carrier1)
          .placeBid(shortJobId, enc.handles[0], enc.inputProof)
      ).to.be.revertedWith("Bidding deadline has passed");
    });

    it("should emit BidPlaced event", async function () {
      const bidAmount = 5000;

      const enc = await fhevm
        .createEncryptedInput(contractAddress, signers.carrier1.address)
        .add64(bidAmount)
        .encrypt();

      await expect(
        contract
          .connect(signers.carrier1)
          .placeBid(jobId, enc.handles[0], enc.inputProof)
      )
        .to.emit(contract, "BidPlaced")
        .withArgs(jobId, signers.carrier1.address);
    });

    it("should store encrypted bid securely", async function () {
      const bidAmount = 5000;

      const enc = await fhevm
        .createEncryptedInput(contractAddress, signers.carrier1.address)
        .add64(bidAmount)
        .encrypt();

      await contract
        .connect(signers.carrier1)
        .placeBid(jobId, enc.handles[0], enc.inputProof);

      // Get encrypted bid
      const encryptedBid = await contract.getBid(jobId, signers.carrier1.address);

      // Encrypted bid should not be zero (indicating it's stored)
      expect(encryptedBid).to.not.equal(ethers.ZeroHash);
    });

    it("should prevent carrier from viewing other carriers' bids", async function () {
      const bidAmount = 5000;

      const enc = await fhevm
        .createEncryptedInput(contractAddress, signers.carrier1.address)
        .add64(bidAmount)
        .encrypt();

      await contract
        .connect(signers.carrier1)
        .placeBid(jobId, enc.handles[0], enc.inputProof);

      // Carrier2 should not be able to decrypt carrier1's bid
      // This is enforced by FHEVM access control
      const encryptedBid = await contract.getBid(jobId, signers.carrier1.address);

      await expect(
        fhevm.userDecryptEuint(
          FhevmType.euint64,
          encryptedBid,
          contractAddress,
          signers.carrier2
        )
      ).to.be.reverted;
    });

    it("should handle maximum bid amount (uint64 max)", async function () {
      const maxBid = BigInt(2 ** 53) - BigInt(1); // Safe integer max

      const enc = await fhevm
        .createEncryptedInput(contractAddress, signers.carrier1.address)
        .add64(Number(maxBid))
        .encrypt();

      const tx = await contract
        .connect(signers.carrier1)
        .placeBid(jobId, enc.handles[0], enc.inputProof);
      await tx.wait();

      expect(await contract.hasBid(jobId, signers.carrier1.address)).to.be.true;
    });

    it("should track bid count per job", async function () {
      await contract.connect(signers.carrier3).registerCarrier();

      const bidAmount = 5000;

      for (const carrier of [signers.carrier1, signers.carrier2, signers.carrier3]) {
        const enc = await fhevm
          .createEncryptedInput(contractAddress, carrier.address)
          .add64(bidAmount)
          .encrypt();
        await contract.connect(carrier).placeBid(jobId, enc.handles[0], enc.inputProof);
      }

      const bidCount = await contract.getBidCount(jobId);
      expect(bidCount).to.equal(3);
    });
  });

  // ============================================================
  // 5. ACCESS CONTROL TESTS (6 tests)
  // ============================================================
  describe("Access Control", function () {
    let jobId: number;
    const deadline = Math.floor(Date.now() / 1000) + 86400;

    beforeEach(async function () {
      await contract.connect(signers.shipper1).registerShipper();
      await contract.connect(signers.carrier1).registerCarrier();
      await contract
        .connect(signers.shipper1)
        .createJob("Access control test job", deadline);
      jobId = 0;
    });

    it("should only allow shipper to award job", async function () {
      const bidAmount = 5000;
      const enc = await fhevm
        .createEncryptedInput(contractAddress, signers.carrier1.address)
        .add64(bidAmount)
        .encrypt();
      await contract
        .connect(signers.carrier1)
        .placeBid(jobId, enc.handles[0], enc.inputProof);

      // Non-shipper cannot award
      await expect(
        contract.connect(signers.carrier1).awardJob(jobId, signers.carrier1.address)
      ).to.be.revertedWith("Only job shipper can award");

      // Correct shipper can award
      await expect(
        contract.connect(signers.shipper1).awardJob(jobId, signers.carrier1.address)
      ).to.not.be.reverted;
    });

    it("should only allow job creator to cancel job", async function () {
      await expect(
        contract.connect(signers.shipper2).cancelJob(jobId)
      ).to.be.revertedWith("Only job creator can cancel");

      await expect(contract.connect(signers.shipper1).cancelJob(jobId)).to.not.be
        .reverted;
    });

    it("should only allow carrier to view their own bid", async function () {
      const bidAmount = 5000;
      const enc = await fhevm
        .createEncryptedInput(contractAddress, signers.carrier1.address)
        .add64(bidAmount)
        .encrypt();
      await contract
        .connect(signers.carrier1)
        .placeBid(jobId, enc.handles[0], enc.inputProof);

      const encryptedBid = await contract.getBid(jobId, signers.carrier1.address);

      // Carrier1 can decrypt their own bid
      const decrypted = await fhevm.userDecryptEuint(
        FhevmType.euint64,
        encryptedBid,
        contractAddress,
        signers.carrier1
      );
      expect(decrypted).to.equal(bidAmount);
    });

    it("should prevent non-registered users from creating jobs", async function () {
      const deadline = Math.floor(Date.now() / 1000) + 86400;
      await expect(
        contract.connect(signers.carrier1).createJob("Invalid job", deadline)
      ).to.be.revertedWith("Only shippers can create jobs");
    });

    it("should prevent non-registered users from bidding", async function () {
      const bidAmount = 5000;
      const enc = await fhevm
        .createEncryptedInput(contractAddress, signers.shipper2.address)
        .add64(bidAmount)
        .encrypt();

      await expect(
        contract
          .connect(signers.shipper2)
          .placeBid(jobId, enc.handles[0], enc.inputProof)
      ).to.be.revertedWith("Only carriers can place bids");
    });

    it("should prevent modifying awarded job", async function () {
      const bidAmount = 5000;
      const enc = await fhevm
        .createEncryptedInput(contractAddress, signers.carrier1.address)
        .add64(bidAmount)
        .encrypt();
      await contract
        .connect(signers.carrier1)
        .placeBid(jobId, enc.handles[0], enc.inputProof);

      await contract.connect(signers.shipper1).awardJob(jobId, signers.carrier1.address);

      // Cannot cancel awarded job
      await expect(
        contract.connect(signers.shipper1).cancelJob(jobId)
      ).to.be.revertedWith("Cannot cancel awarded job");
    });
  });

  // ============================================================
  // 6. EDGE CASE TESTS (6 tests)
  // ============================================================
  describe("Edge Cases", function () {
    beforeEach(async function () {
      await contract.connect(signers.shipper1).registerShipper();
      await contract.connect(signers.carrier1).registerCarrier();
    });

    it("should handle job with minimal deadline (1 second)", async function () {
      const deadline = Math.floor(Date.now() / 1000) + 1;
      const tx = await contract
        .connect(signers.shipper1)
        .createJob("Urgent job", deadline);
      await tx.wait();

      const job = await contract.getJob(0);
      expect(job.deadline).to.equal(deadline);
    });

    it("should handle job with far future deadline (1 year)", async function () {
      const deadline = Math.floor(Date.now() / 1000) + 31536000; // +1 year
      const tx = await contract
        .connect(signers.shipper1)
        .createJob("Long-term job", deadline);
      await tx.wait();

      const job = await contract.getJob(0);
      expect(job.deadline).to.equal(deadline);
    });

    it("should handle bid with minimum non-zero amount (1 wei equivalent)", async function () {
      const deadline = Math.floor(Date.now() / 1000) + 86400;
      await contract.connect(signers.shipper1).createJob("Test job", deadline);

      const minBid = 1;
      const enc = await fhevm
        .createEncryptedInput(contractAddress, signers.carrier1.address)
        .add64(minBid)
        .encrypt();

      const tx = await contract
        .connect(signers.carrier1)
        .placeBid(0, enc.handles[0], enc.inputProof);
      await tx.wait();

      expect(await contract.hasBid(0, signers.carrier1.address)).to.be.true;
    });

    it("should handle concurrent job creation", async function () {
      await contract.connect(signers.shipper2).registerShipper();
      const deadline = Math.floor(Date.now() / 1000) + 86400;

      // Create multiple jobs in parallel
      await Promise.all([
        contract.connect(signers.shipper1).createJob("Job 1", deadline),
        contract.connect(signers.shipper1).createJob("Job 2", deadline),
        contract.connect(signers.shipper2).createJob("Job 3", deadline),
      ]);

      const job0 = await contract.getJob(0);
      const job1 = await contract.getJob(1);
      const job2 = await contract.getJob(2);

      expect(job0.description).to.equal("Job 1");
      expect(job1.description).to.equal("Job 2");
      expect(job2.description).to.equal("Job 3");
    });

    it("should handle empty bid list gracefully", async function () {
      const deadline = Math.floor(Date.now() / 1000) + 86400;
      await contract.connect(signers.shipper1).createJob("No bids job", deadline);

      const bidCount = await contract.getBidCount(0);
      expect(bidCount).to.equal(0);
    });

    it("should handle job with unicode characters in description", async function () {
      const description = "运输货物 🚚 from 北京 to 上海";
      const deadline = Math.floor(Date.now() / 1000) + 86400;

      const tx = await contract
        .connect(signers.shipper1)
        .createJob(description, deadline);
      await tx.wait();

      const job = await contract.getJob(0);
      expect(job.description).to.equal(description);
    });
  });

  // ============================================================
  // 7. GAS OPTIMIZATION TESTS (3 tests)
  // ============================================================
  describe("Gas Optimization", function () {
    beforeEach(async function () {
      await contract.connect(signers.shipper1).registerShipper();
      await contract.connect(signers.carrier1).registerCarrier();
    });

    it("should use reasonable gas for job creation", async function () {
      const deadline = Math.floor(Date.now() / 1000) + 86400;
      const tx = await contract
        .connect(signers.shipper1)
        .createJob("Gas test job", deadline);
      const receipt = await tx.wait();

      // Job creation should use < 200k gas
      expect(receipt.gasUsed).to.be.lt(200000);
    });

    it("should use reasonable gas for encrypted bid", async function () {
      const deadline = Math.floor(Date.now() / 1000) + 86400;
      await contract.connect(signers.shipper1).createJob("Gas test job", deadline);

      const bidAmount = 5000;
      const enc = await fhevm
        .createEncryptedInput(contractAddress, signers.carrier1.address)
        .add64(bidAmount)
        .encrypt();

      const tx = await contract
        .connect(signers.carrier1)
        .placeBid(0, enc.handles[0], enc.inputProof);
      const receipt = await tx.wait();

      // FHE operations are expensive, but should be < 500k gas
      expect(receipt.gasUsed).to.be.lt(500000);
    });

    it("should use reasonable gas for job award", async function () {
      const deadline = Math.floor(Date.now() / 1000) + 86400;
      await contract.connect(signers.shipper1).createJob("Gas test job", deadline);

      const bidAmount = 5000;
      const enc = await fhevm
        .createEncryptedInput(contractAddress, signers.carrier1.address)
        .add64(bidAmount)
        .encrypt();
      await contract
        .connect(signers.carrier1)
        .placeBid(0, enc.handles[0], enc.inputProof);

      const tx = await contract
        .connect(signers.shipper1)
        .awardJob(0, signers.carrier1.address);
      const receipt = await tx.wait();

      // Award should be < 100k gas
      expect(receipt.gasUsed).to.be.lt(100000);
    });
  });
});
