// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, euint64, ebool, einput, inEuint32, inEuint64 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import { Gateway } from "@fhevm/solidity/gateway/Gateway.sol";

/**
 * @title PrivateFreightBiddingEnhanced
 * @notice Privacy-preserving freight bidding platform using Fully Homomorphic Encryption
 * @dev Implements multi-FHE types, Gateway callbacks, pausable mechanism, and comprehensive access control
 */
contract PrivateFreightBiddingEnhanced is SepoliaConfig, Gateway {

    // ============ State Variables ============

    address public owner;
    address public pauser;
    bool public paused;
    uint256 public jobCounter;

    // Platform statistics
    uint256 public totalBidsSubmitted;
    uint256 public totalJobsCompleted;
    uint256 public totalActiveCarriers;

    // ============ Enums ============

    enum JobStatus { Open, BiddingClosed, Awarded, Completed, Cancelled }
    enum BidEvaluationStatus { Pending, UnderReview, Approved, Rejected }

    // ============ Structs ============

    struct FreightJob {
        string origin;
        string destination;
        string cargoType;
        euint64 encryptedWeight;        // Encrypted cargo weight
        euint64 encryptedVolume;        // Encrypted cargo volume
        uint256 deadline;
        uint256 biddingEndTime;
        address shipper;
        JobStatus status;
        euint64 encryptedFinalPrice;    // Encrypted final price
        uint64 revealedFinalPrice;      // Revealed final price after callback
        bool isPriceRevealed;
        ebool isUrgent;                 // Encrypted urgency flag
        bool urgentRevealed;
        uint256 createdAt;
    }

    struct Bid {
        euint64 encryptedPrice;         // Main bid price
        euint32 encryptedDeliveryDays;  // Estimated delivery time
        euint32 encryptedReliabilityScore; // Carrier reliability (0-100)
        ebool isExpressService;         // Express delivery option
        bool hasSubmitted;
        bool isRevealed;
        uint64 revealedPrice;
        uint32 revealedDeliveryDays;
        uint32 revealedReliability;
        bool revealedExpress;
        uint256 timestamp;
        BidEvaluationStatus evaluationStatus;
        address carrier;
    }

    struct CarrierProfile {
        bool isVerified;
        uint256 totalBids;
        uint256 wonBids;
        uint256 completedJobs;
        euint32 encryptedRating;        // Private rating
        uint256 joinedAt;
        bool isActive;
    }

    struct ShipperProfile {
        bool isVerified;
        uint256 totalJobsPosted;
        uint256 totalJobsCompleted;
        uint256 joinedAt;
        bool isActive;
    }

    // ============ Mappings ============

    mapping(uint256 => FreightJob) public freightJobs;
    mapping(uint256 => mapping(address => Bid)) public jobBids;
    mapping(uint256 => address[]) public jobBidders;
    mapping(uint256 => address) public jobWinners;

    mapping(address => CarrierProfile) public carrierProfiles;
    mapping(address => ShipperProfile) public shipperProfiles;

    // Gateway callback tracking
    mapping(uint256 => uint256) public callbackJobIds;        // requestId => jobId
    mapping(uint256 => address) public callbackCarriers;       // requestId => carrier
    mapping(uint256 => CallbackType) public callbackTypes;     // requestId => type

    enum CallbackType {
        RevealJobPrice,
        RevealBidPrice,
        RevealUrgency,
        CompareBids,
        RevealWeight,
        RevealVolume
    }

    // ============ Events ============

    event JobPosted(uint256 indexed jobId, address indexed shipper, uint256 timestamp);
    event BidSubmitted(uint256 indexed jobId, address indexed carrier, uint256 timestamp);
    event BidRevealed(uint256 indexed jobId, address indexed carrier, uint64 price, uint32 deliveryDays);
    event JobAwarded(uint256 indexed jobId, address indexed carrier, uint256 timestamp);
    event JobCompleted(uint256 indexed jobId, address indexed carrier, uint256 timestamp);
    event JobCancelled(uint256 indexed jobId, address indexed shipper, string reason);
    event BiddingClosed(uint256 indexed jobId, uint256 totalBids);

    event CarrierVerified(address indexed carrier, uint256 timestamp);
    event ShipperVerified(address indexed shipper, uint256 timestamp);
    event CarrierDeactivated(address indexed carrier, string reason);
    event ShipperDeactivated(address indexed shipper, string reason);

    event PriceRevealRequested(uint256 indexed jobId, uint256 requestId);
    event PriceRevealed(uint256 indexed jobId, uint64 price);
    event UrgencyRevealed(uint256 indexed jobId, bool isUrgent);

    event Paused(address indexed pauser, uint256 timestamp);
    event Unpaused(address indexed pauser, uint256 timestamp);
    event PauserChanged(address indexed oldPauser, address indexed newPauser);

    event BidEvaluationStarted(uint256 indexed jobId, uint256 totalBids);
    event BidComparisonCompleted(uint256 indexed jobId, address indexed winner);

    event ErrorOccurred(uint256 indexed jobId, string errorMessage, uint256 timestamp);

    // ============ Modifiers ============

    modifier onlyOwner() {
        require(msg.sender == owner, "PrivateFreightBidding: caller is not owner");
        _;
    }

    modifier onlyPauser() {
        require(msg.sender == pauser || msg.sender == owner, "PrivateFreightBidding: caller is not pauser");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "PrivateFreightBidding: contract is paused");
        _;
    }

    modifier whenPaused() {
        require(paused, "PrivateFreightBidding: contract is not paused");
        _;
    }

    modifier onlyVerifiedShipper() {
        require(shipperProfiles[msg.sender].isVerified, "PrivateFreightBidding: not verified shipper");
        require(shipperProfiles[msg.sender].isActive, "PrivateFreightBidding: shipper is not active");
        _;
    }

    modifier onlyVerifiedCarrier() {
        require(carrierProfiles[msg.sender].isVerified, "PrivateFreightBidding: not verified carrier");
        require(carrierProfiles[msg.sender].isActive, "PrivateFreightBidding: carrier is not active");
        _;
    }

    modifier validJobId(uint256 _jobId) {
        require(_jobId > 0 && _jobId <= jobCounter, "PrivateFreightBidding: invalid job ID");
        _;
    }

    modifier onlyJobShipper(uint256 _jobId) {
        require(freightJobs[_jobId].shipper == msg.sender, "PrivateFreightBidding: caller is not job shipper");
        _;
    }

    modifier jobInStatus(uint256 _jobId, JobStatus _status) {
        require(freightJobs[_jobId].status == _status, "PrivateFreightBidding: invalid job status");
        _;
    }

    // ============ Constructor ============

    constructor() {
        owner = msg.sender;
        pauser = msg.sender;
        paused = false;
        jobCounter = 0;
        totalBidsSubmitted = 0;
        totalJobsCompleted = 0;
        totalActiveCarriers = 0;
    }

    // ============ Admin Functions ============

    /**
     * @notice Verify and activate a carrier
     * @param _carrier Address of the carrier to verify
     */
    function verifyCarrier(address _carrier) external onlyOwner whenNotPaused {
        require(_carrier != address(0), "PrivateFreightBidding: invalid carrier address");
        require(!carrierProfiles[_carrier].isVerified, "PrivateFreightBidding: carrier already verified");

        if (!carrierProfiles[_carrier].isVerified) {
            totalActiveCarriers++;
        }

        carrierProfiles[_carrier] = CarrierProfile({
            isVerified: true,
            totalBids: 0,
            wonBids: 0,
            completedJobs: 0,
            encryptedRating: FHE.asEuint32(100), // Start with max rating
            joinedAt: block.timestamp,
            isActive: true
        });

        emit CarrierVerified(_carrier, block.timestamp);
    }

    /**
     * @notice Verify and activate a shipper
     * @param _shipper Address of the shipper to verify
     */
    function verifyShipper(address _shipper) external onlyOwner whenNotPaused {
        require(_shipper != address(0), "PrivateFreightBidding: invalid shipper address");
        require(!shipperProfiles[_shipper].isVerified, "PrivateFreightBidding: shipper already verified");

        shipperProfiles[_shipper] = ShipperProfile({
            isVerified: true,
            totalJobsPosted: 0,
            totalJobsCompleted: 0,
            joinedAt: block.timestamp,
            isActive: true
        });

        emit ShipperVerified(_shipper, block.timestamp);
    }

    /**
     * @notice Deactivate a carrier
     * @param _carrier Address of the carrier to deactivate
     * @param _reason Reason for deactivation
     */
    function deactivateCarrier(address _carrier, string calldata _reason) external onlyOwner {
        require(carrierProfiles[_carrier].isVerified, "PrivateFreightBidding: carrier not verified");
        require(carrierProfiles[_carrier].isActive, "PrivateFreightBidding: carrier already inactive");

        carrierProfiles[_carrier].isActive = false;
        totalActiveCarriers--;

        emit CarrierDeactivated(_carrier, _reason);
    }

    /**
     * @notice Deactivate a shipper
     * @param _shipper Address of the shipper to deactivate
     * @param _reason Reason for deactivation
     */
    function deactivateShipper(address _shipper, string calldata _reason) external onlyOwner {
        require(shipperProfiles[_shipper].isVerified, "PrivateFreightBidding: shipper not verified");
        require(shipperProfiles[_shipper].isActive, "PrivateFreightBidding: shipper already inactive");

        shipperProfiles[_shipper].isActive = false;

        emit ShipperDeactivated(_shipper, _reason);
    }

    /**
     * @notice Set the pauser address
     * @param _newPauser Address of the new pauser
     */
    function setPauser(address _newPauser) external onlyOwner {
        require(_newPauser != address(0), "PrivateFreightBidding: invalid pauser address");
        address oldPauser = pauser;
        pauser = _newPauser;
        emit PauserChanged(oldPauser, _newPauser);
    }

    /**
     * @notice Pause the contract
     */
    function pause() external onlyPauser whenNotPaused {
        paused = true;
        emit Paused(msg.sender, block.timestamp);
    }

    /**
     * @notice Unpause the contract
     */
    function unpause() external onlyPauser whenPaused {
        paused = false;
        emit Unpaused(msg.sender, block.timestamp);
    }

    // ============ Core Freight Functions ============

    /**
     * @notice Post a new freight job with encrypted parameters
     * @param _origin Origin location
     * @param _destination Destination location
     * @param _cargoType Type of cargo
     * @param _encryptedWeight Encrypted weight input proof
     * @param _encryptedVolume Encrypted volume input proof
     * @param _isUrgent Encrypted urgency flag input proof
     * @param _biddingDuration Duration for bidding in seconds
     */
    function postJob(
        string memory _origin,
        string memory _destination,
        string memory _cargoType,
        einput _encryptedWeight,
        einput _encryptedVolume,
        einput _isUrgent,
        uint256 _biddingDuration
    ) external onlyVerifiedShipper whenNotPaused returns (uint256) {
        require(bytes(_origin).length > 0, "PrivateFreightBidding: origin cannot be empty");
        require(bytes(_destination).length > 0, "PrivateFreightBidding: destination cannot be empty");
        require(_biddingDuration >= 1 hours && _biddingDuration <= 7 days, "PrivateFreightBidding: invalid bidding duration");

        jobCounter++;

        // Input proof verification (ZKPoK) - asEuint performs verification
        euint64 weight = FHE.asEuint64(_encryptedWeight);
        euint64 volume = FHE.asEuint64(_encryptedVolume);
        ebool urgent = FHE.asEbool(_isUrgent);

        freightJobs[jobCounter] = FreightJob({
            origin: _origin,
            destination: _destination,
            cargoType: _cargoType,
            encryptedWeight: weight,
            encryptedVolume: volume,
            deadline: block.timestamp + 30 days,
            biddingEndTime: block.timestamp + _biddingDuration,
            shipper: msg.sender,
            status: JobStatus.Open,
            encryptedFinalPrice: FHE.asEuint64(0),
            revealedFinalPrice: 0,
            isPriceRevealed: false,
            isUrgent: urgent,
            urgentRevealed: false,
            createdAt: block.timestamp
        });

        // Grant permissions
        FHE.allowThis(weight);
        FHE.allowThis(volume);
        FHE.allowThis(urgent);
        FHE.allow(weight, msg.sender);
        FHE.allow(volume, msg.sender);
        FHE.allow(urgent, msg.sender);

        shipperProfiles[msg.sender].totalJobsPosted++;

        emit JobPosted(jobCounter, msg.sender, block.timestamp);
        return jobCounter;
    }

    /**
     * @notice Submit an encrypted bid for a job
     * @param _jobId ID of the freight job
     * @param _encryptedPrice Encrypted price input proof
     * @param _encryptedDeliveryDays Encrypted delivery days input proof
     * @param _encryptedReliability Encrypted reliability score input proof
     * @param _isExpress Encrypted express service flag input proof
     */
    function submitBid(
        uint256 _jobId,
        einput _encryptedPrice,
        einput _encryptedDeliveryDays,
        einput _encryptedReliability,
        einput _isExpress
    ) external validJobId(_jobId) onlyVerifiedCarrier whenNotPaused
        jobInStatus(_jobId, JobStatus.Open) {

        require(block.timestamp < freightJobs[_jobId].biddingEndTime, "PrivateFreightBidding: bidding period ended");
        require(!jobBids[_jobId][msg.sender].hasSubmitted, "PrivateFreightBidding: bid already submitted");
        require(msg.sender != freightJobs[_jobId].shipper, "PrivateFreightBidding: shipper cannot bid on own job");

        // Input proof verification (ZKPoK)
        euint64 price = FHE.asEuint64(_encryptedPrice);
        euint32 deliveryDays = FHE.asEuint32(_encryptedDeliveryDays);
        euint32 reliability = FHE.asEuint32(_encryptedReliability);
        ebool isExpress = FHE.asEbool(_isExpress);

        jobBids[_jobId][msg.sender] = Bid({
            encryptedPrice: price,
            encryptedDeliveryDays: deliveryDays,
            encryptedReliabilityScore: reliability,
            isExpressService: isExpress,
            hasSubmitted: true,
            isRevealed: false,
            revealedPrice: 0,
            revealedDeliveryDays: 0,
            revealedReliability: 0,
            revealedExpress: false,
            timestamp: block.timestamp,
            evaluationStatus: BidEvaluationStatus.Pending,
            carrier: msg.sender
        });

        jobBidders[_jobId].push(msg.sender);

        // Grant permissions
        FHE.allowThis(price);
        FHE.allowThis(deliveryDays);
        FHE.allowThis(reliability);
        FHE.allowThis(isExpress);
        FHE.allow(price, freightJobs[_jobId].shipper);
        FHE.allow(deliveryDays, freightJobs[_jobId].shipper);
        FHE.allow(reliability, freightJobs[_jobId].shipper);
        FHE.allow(isExpress, freightJobs[_jobId].shipper);

        carrierProfiles[msg.sender].totalBids++;
        totalBidsSubmitted++;

        emit BidSubmitted(_jobId, msg.sender, block.timestamp);
    }

    /**
     * @notice Close bidding for a job
     * @param _jobId ID of the freight job
     */
    function closeBidding(uint256 _jobId)
        external
        validJobId(_jobId)
        onlyJobShipper(_jobId)
        jobInStatus(_jobId, JobStatus.Open)
        whenNotPaused {

        require(jobBidders[_jobId].length > 0, "PrivateFreightBidding: no bids submitted");

        freightJobs[_jobId].status = JobStatus.BiddingClosed;

        emit BiddingClosed(_jobId, jobBidders[_jobId].length);
        emit BidEvaluationStarted(_jobId, jobBidders[_jobId].length);
    }

    /**
     * @notice Request decryption of a bid price via Gateway
     * @param _jobId ID of the freight job
     * @param _carrier Address of the carrier
     */
    function requestBidPriceReveal(uint256 _jobId, address _carrier)
        external
        validJobId(_jobId)
        onlyJobShipper(_jobId)
        whenNotPaused
        returns (uint256) {

        require(jobBids[_jobId][_carrier].hasSubmitted, "PrivateFreightBidding: no bid from carrier");
        require(!jobBids[_jobId][_carrier].isRevealed, "PrivateFreightBidding: bid already revealed");
        require(
            freightJobs[_jobId].status == JobStatus.BiddingClosed ||
            block.timestamp >= freightJobs[_jobId].biddingEndTime,
            "PrivateFreightBidding: bidding still active"
        );

        uint256 requestId = Gateway.requestDecryption(
            Gateway.toUint256(jobBids[_jobId][_carrier].encryptedPrice),
            this.callbackBidPriceReveal.selector,
            0, // No gas limit override
            block.timestamp + 1 hours,
            false // Not instant
        );

        callbackJobIds[requestId] = _jobId;
        callbackCarriers[requestId] = _carrier;
        callbackTypes[requestId] = CallbackType.RevealBidPrice;

        emit PriceRevealRequested(_jobId, requestId);
        return requestId;
    }

    /**
     * @notice Gateway callback for bid price reveal
     * @param requestId The decryption request ID
     * @param decryptedPrice The decrypted price value
     */
    function callbackBidPriceReveal(uint256 requestId, uint64 decryptedPrice)
        external
        onlyGateway
        returns (bool) {

        require(callbackTypes[requestId] == CallbackType.RevealBidPrice, "PrivateFreightBidding: invalid callback type");

        uint256 jobId = callbackJobIds[requestId];
        address carrier = callbackCarriers[requestId];

        require(jobBids[jobId][carrier].hasSubmitted, "PrivateFreightBidding: no bid found");

        jobBids[jobId][carrier].isRevealed = true;
        jobBids[jobId][carrier].revealedPrice = decryptedPrice;
        jobBids[jobId][carrier].evaluationStatus = BidEvaluationStatus.UnderReview;

        emit BidRevealed(jobId, carrier, decryptedPrice, jobBids[jobId][carrier].revealedDeliveryDays);

        // Cleanup
        delete callbackJobIds[requestId];
        delete callbackCarriers[requestId];
        delete callbackTypes[requestId];

        return true;
    }

    /**
     * @notice Award job to winning carrier
     * @param _jobId ID of the freight job
     * @param _carrier Address of the winning carrier
     */
    function awardJob(uint256 _jobId, address _carrier)
        external
        validJobId(_jobId)
        onlyJobShipper(_jobId)
        whenNotPaused {

        require(
            freightJobs[_jobId].status == JobStatus.BiddingClosed,
            "PrivateFreightBidding: bidding not closed"
        );
        require(jobBids[_jobId][_carrier].hasSubmitted, "PrivateFreightBidding: no bid from carrier");
        require(jobBids[_jobId][_carrier].isRevealed, "PrivateFreightBidding: bid not revealed");

        freightJobs[_jobId].status = JobStatus.Awarded;
        freightJobs[_jobId].encryptedFinalPrice = jobBids[_jobId][_carrier].encryptedPrice;
        freightJobs[_jobId].revealedFinalPrice = jobBids[_jobId][_carrier].revealedPrice;
        freightJobs[_jobId].isPriceRevealed = true;

        jobWinners[_jobId] = _carrier;
        jobBids[_jobId][_carrier].evaluationStatus = BidEvaluationStatus.Approved;

        carrierProfiles[_carrier].wonBids++;

        emit JobAwarded(_jobId, _carrier, block.timestamp);
        emit BidComparisonCompleted(_jobId, _carrier);
    }

    /**
     * @notice Mark job as completed
     * @param _jobId ID of the freight job
     */
    function completeJob(uint256 _jobId)
        external
        validJobId(_jobId)
        onlyJobShipper(_jobId)
        whenNotPaused {

        require(freightJobs[_jobId].status == JobStatus.Awarded, "PrivateFreightBidding: job not awarded");

        freightJobs[_jobId].status = JobStatus.Completed;

        address winner = jobWinners[_jobId];
        carrierProfiles[winner].completedJobs++;
        shipperProfiles[msg.sender].totalJobsCompleted++;
        totalJobsCompleted++;

        emit JobCompleted(_jobId, winner, block.timestamp);
    }

    /**
     * @notice Cancel a job
     * @param _jobId ID of the freight job
     * @param _reason Reason for cancellation
     */
    function cancelJob(uint256 _jobId, string calldata _reason)
        external
        validJobId(_jobId)
        onlyJobShipper(_jobId)
        whenNotPaused {

        require(
            freightJobs[_jobId].status == JobStatus.Open ||
            freightJobs[_jobId].status == JobStatus.BiddingClosed,
            "PrivateFreightBidding: cannot cancel awarded or completed job"
        );

        freightJobs[_jobId].status = JobStatus.Cancelled;

        emit JobCancelled(_jobId, msg.sender, _reason);
    }

    // ============ Complex FHE Comparison Logic ============

    /**
     * @notice Compare two bids using FHE operations
     * @param _jobId ID of the freight job
     * @param _carrier1 First carrier address
     * @param _carrier2 Second carrier address
     * @return Result of comparison (true if carrier1 is better)
     */
    function compareBidsEncrypted(uint256 _jobId, address _carrier1, address _carrier2)
        external
        view
        validJobId(_jobId)
        onlyJobShipper(_jobId)
        returns (ebool) {

        require(jobBids[_jobId][_carrier1].hasSubmitted, "PrivateFreightBidding: carrier1 no bid");
        require(jobBids[_jobId][_carrier2].hasSubmitted, "PrivateFreightBidding: carrier2 no bid");

        Bid storage bid1 = jobBids[_jobId][_carrier1];
        Bid storage bid2 = jobBids[_jobId][_carrier2];

        // Lower price is better
        ebool priceBetter = FHE.lt(bid1.encryptedPrice, bid2.encryptedPrice);

        // Lower delivery days is better
        ebool deliveryBetter = FHE.lt(bid1.encryptedDeliveryDays, bid2.encryptedDeliveryDays);

        // Higher reliability is better
        ebool reliabilityBetter = FHE.gt(bid1.encryptedReliabilityScore, bid2.encryptedReliabilityScore);

        // Combine factors: price is most important, then delivery, then reliability
        ebool result = FHE.or(
            priceBetter,
            FHE.and(
                FHE.eq(bid1.encryptedPrice, bid2.encryptedPrice),
                FHE.or(deliveryBetter, reliabilityBetter)
            )
        );

        return result;
    }

    /**
     * @notice Check if bid meets job requirements using FHE
     * @param _jobId ID of the freight job
     * @param _carrier Carrier address
     * @return Whether bid meets requirements
     */
    function checkBidMeetsRequirements(uint256 _jobId, address _carrier)
        external
        view
        validJobId(_jobId)
        returns (ebool) {

        require(jobBids[_jobId][_carrier].hasSubmitted, "PrivateFreightBidding: no bid from carrier");

        Bid storage bid = jobBids[_jobId][_carrier];
        FreightJob storage job = freightJobs[_jobId];

        // Check if delivery is before deadline
        euint32 maxDeliveryDays = FHE.asEuint32(uint32((job.deadline - block.timestamp) / 1 days));
        ebool meetsDeadline = FHE.lte(bid.encryptedDeliveryDays, maxDeliveryDays);

        // Check minimum reliability score (e.g., > 50)
        euint32 minReliability = FHE.asEuint32(50);
        ebool meetsReliability = FHE.gte(bid.encryptedReliabilityScore, minReliability);

        // If urgent, must be express service
        ebool meetsUrgency = FHE.or(
            FHE.not(job.isUrgent),
            bid.isExpressService
        );

        return FHE.and(FHE.and(meetsDeadline, meetsReliability), meetsUrgency);
    }

    // ============ View Functions ============

    /**
     * @notice Get job information
     * @param _jobId ID of the freight job
     */
    function getJobInfo(uint256 _jobId) external view validJobId(_jobId) returns (
        string memory origin,
        string memory destination,
        string memory cargoType,
        address shipper,
        JobStatus status,
        uint256 biddingEndTime,
        uint256 totalBids
    ) {
        FreightJob storage job = freightJobs[_jobId];
        return (
            job.origin,
            job.destination,
            job.cargoType,
            job.shipper,
            job.status,
            job.biddingEndTime,
            jobBidders[_jobId].length
        );
    }

    /**
     * @notice Get bid information
     * @param _jobId ID of the freight job
     * @param _carrier Address of the carrier
     */
    function getBidInfo(uint256 _jobId, address _carrier) external view returns (
        bool hasSubmitted,
        bool isRevealed,
        uint64 revealedPrice,
        uint32 revealedDeliveryDays,
        uint32 revealedReliability,
        bool revealedExpress,
        BidEvaluationStatus evaluationStatus
    ) {
        Bid storage bid = jobBids[_jobId][_carrier];
        return (
            bid.hasSubmitted,
            bid.isRevealed,
            bid.revealedPrice,
            bid.revealedDeliveryDays,
            bid.revealedReliability,
            bid.revealedExpress,
            bid.evaluationStatus
        );
    }

    /**
     * @notice Get all bidders for a job
     * @param _jobId ID of the freight job
     */
    function getBidders(uint256 _jobId) external view validJobId(_jobId) returns (address[] memory) {
        return jobBidders[_jobId];
    }

    /**
     * @notice Get carrier profile
     * @param _carrier Address of the carrier
     */
    function getCarrierProfile(address _carrier) external view returns (
        bool isVerified,
        bool isActive,
        uint256 totalBids,
        uint256 wonBids,
        uint256 completedJobs,
        uint256 joinedAt
    ) {
        CarrierProfile storage profile = carrierProfiles[_carrier];
        return (
            profile.isVerified,
            profile.isActive,
            profile.totalBids,
            profile.wonBids,
            profile.completedJobs,
            profile.joinedAt
        );
    }

    /**
     * @notice Get shipper profile
     * @param _shipper Address of the shipper
     */
    function getShipperProfile(address _shipper) external view returns (
        bool isVerified,
        bool isActive,
        uint256 totalJobsPosted,
        uint256 totalJobsCompleted,
        uint256 joinedAt
    ) {
        ShipperProfile storage profile = shipperProfiles[_shipper];
        return (
            profile.isVerified,
            profile.isActive,
            profile.totalJobsPosted,
            profile.totalJobsCompleted,
            profile.joinedAt
        );
    }

    /**
     * @notice Get platform statistics
     */
    function getPlatformStats() external view returns (
        uint256 _totalJobs,
        uint256 _totalBids,
        uint256 _totalCompleted,
        uint256 _totalActiveCarriers
    ) {
        return (
            jobCounter,
            totalBidsSubmitted,
            totalJobsCompleted,
            totalActiveCarriers
        );
    }

    /**
     * @notice Get job winner
     * @param _jobId ID of the freight job
     */
    function getJobWinner(uint256 _jobId) external view validJobId(_jobId) returns (address) {
        require(
            freightJobs[_jobId].status == JobStatus.Awarded ||
            freightJobs[_jobId].status == JobStatus.Completed,
            "PrivateFreightBidding: job not awarded yet"
        );
        return jobWinners[_jobId];
    }

    // ============ Permission Management for FHE ============

    /**
     * @notice Allow address to access encrypted bid data
     * @param _jobId ID of the freight job
     * @param _carrier Carrier address
     * @param _allowedAddress Address to grant permission
     */
    function allowBidAccess(uint256 _jobId, address _carrier, address _allowedAddress)
        external
        validJobId(_jobId)
        onlyJobShipper(_jobId) {

        require(jobBids[_jobId][_carrier].hasSubmitted, "PrivateFreightBidding: no bid from carrier");

        Bid storage bid = jobBids[_jobId][_carrier];
        FHE.allow(bid.encryptedPrice, _allowedAddress);
        FHE.allow(bid.encryptedDeliveryDays, _allowedAddress);
        FHE.allow(bid.encryptedReliabilityScore, _allowedAddress);
        FHE.allow(bid.isExpressService, _allowedAddress);
    }
}
