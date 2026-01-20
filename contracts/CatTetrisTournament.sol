// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title CatTetris Tournament + Tip Jar (ETH on Base)
/// @notice Minimal contract: tip jar + daily top-score tournament with entry fee.
contract CatTetrisTournament {
    struct DayInfo {
        address leader;
        uint256 bestScore;
        uint256 prizePool;
    }

    address public owner;
    uint256 public entryFee; // wei
    mapping(uint256 => DayInfo) public dayInfo; // dayId => info

    event Tipped(address indexed from, uint256 amount);
    event Entered(address indexed player, uint256 dayId, uint256 score, uint256 amount);
    event Settled(uint256 dayId, address indexed winner, uint256 prize);
    event EntryFeeUpdated(uint256 newEntryFee);

    constructor(uint256 _entryFee) {
        owner = msg.sender;
        entryFee = _entryFee;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    function currentDay() public view returns (uint256) {
        return block.timestamp / 1 days;
    }

    /// @notice Donate to the developer (does not affect tournament).
    function tip() external payable {
        require(msg.value > 0, "no value");
        emit Tipped(msg.sender, msg.value);
    }

    /// @notice Enter today's tournament and submit your score.
    function enterTournament(uint256 score) external payable {
        require(msg.value >= entryFee, "fee");
        uint256 dayId = currentDay();
        DayInfo storage d = dayInfo[dayId];

        d.prizePool += msg.value;

        if (score > d.bestScore) {
            d.bestScore = score;
            d.leader = msg.sender;
        }

        emit Entered(msg.sender, dayId, score, msg.value);
    }

    /// @notice Owner settles a past day (recommended: settle yesterday).
    function settleDay(uint256 dayId) external onlyOwner {
        DayInfo storage d = dayInfo[dayId];
        require(d.prizePool > 0, "no pool");
        require(d.leader != address(0), "no leader");

        uint256 amount = d.prizePool;
        d.prizePool = 0;

        (bool ok, ) = d.leader.call{value: amount}("");
        require(ok, "transfer failed");

        emit Settled(dayId, d.leader, amount);
    }

    function setEntryFee(uint256 _fee) external onlyOwner {
        entryFee = _fee;
        emit EntryFeeUpdated(_fee);
    }

    function withdraw(uint256 amount) external onlyOwner {
        (bool ok, ) = owner.call{value: amount}("");
        require(ok, "withdraw failed");
    }
}

