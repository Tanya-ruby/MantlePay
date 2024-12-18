SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.22;

contract SimpleBetting {
    address public owner;

    struct Bet {
        uint256 betId;
        string question;
        uint256 betAmount;
        bool isResolved;
        bool result;
        address[] yesVoters;
        address[] noVoters;
    }

    mapping(uint256 => Bet) public bets;
    uint256 public nextBetId = 1;

    event BetCreated(uint256 betId, string question, uint256 betAmount);
    event BetPlaced(uint256 betId, address user, bool choice);
    event BetResolved(uint256 betId, bool result);
    event WinningsClaimed(uint256 betId, address winner, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can resolve bets");
        _;
    }

    function createBet(string memory question) external payable {
        require(msg.value > 0, "Bet amount must be greater than 0");

        Bet storage newBet = bets[nextBetId];
        newBet.betId = nextBetId;
        newBet.question = question;
        newBet.betAmount = msg.value;
        newBet.isResolved = false;
        
        emit BetCreated(nextBetId, question, msg.value);
        
        nextBetId++;
    }

    function placeBet(uint256 betId, bool choice) external payable {
        Bet storage bet = bets[betId];
        
        require(!bet.isResolved, "Bet is already resolved");
        require(msg.value == bet.betAmount, "Must bet exact amount");

        if (choice) {
            bet.yesVoters.push(msg.sender);
        } else {
            bet.noVoters.push(msg.sender);
        }

        emit BetPlaced(betId, msg.sender, choice);
    }

    function resolveBet(uint256 betId, bool result) external onlyOwner {
        Bet storage bet = bets[betId];
        
        require(!bet.isResolved, "Bet already resolved");
        
        bet.isResolved = true;
        bet.result = result;

        address[] memory winners = result ? bet.yesVoters : bet.noVoters;
        uint256 totalPool = (bet.yesVoters.length + bet.noVoters.length) * bet.betAmount;

        if (winners.length > 0) {
            uint256 winningsPerPerson = totalPool / winners.length;
            for (uint256 i = 0; i < winners.length; i++) {
                payable(winners[i]).transfer(winningsPerPerson);
                emit WinningsClaimed(betId, winners[i], winningsPerPerson);
            }
        }

        emit BetResolved(betId, result);
    }

    function getBetInfo(uint256 betId) external view returns (
        string memory question,
        uint256 betAmount,
        bool isResolved,
        bool result,
        uint256 yesCount,
        uint256 noCount
    ) {
        Bet storage bet = bets[betId];
        return (
            bet.question,
            bet.betAmount,
            bet.isResolved,
            bet.result,
            bet.yesVoters.length,
            bet.noVoters.length
        );
    }
}