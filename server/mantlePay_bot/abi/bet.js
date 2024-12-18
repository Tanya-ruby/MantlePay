export const betABI=[
	[
		{
			"inputs": [],
			"stateMutability": "nonpayable",
			"type": "constructor"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": false,
					"internalType": "string",
					"name": "betId",
					"type": "string"
				},
				{
					"indexed": false,
					"internalType": "string",
					"name": "question",
					"type": "string"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "betAmount",
					"type": "uint256"
				}
			],
			"name": "BetCreated",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": false,
					"internalType": "string",
					"name": "betId",
					"type": "string"
				},
				{
					"indexed": false,
					"internalType": "address",
					"name": "user",
					"type": "address"
				},
				{
					"indexed": false,
					"internalType": "bool",
					"name": "choice",
					"type": "bool"
				}
			],
			"name": "BetPlaced",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": false,
					"internalType": "string",
					"name": "betId",
					"type": "string"
				},
				{
					"indexed": false,
					"internalType": "bool",
					"name": "result",
					"type": "bool"
				}
			],
			"name": "BetResolved",
			"type": "event"
		},
		{
			"inputs": [
				{
					"internalType": "string",
					"name": "betId",
					"type": "string"
				},
				{
					"internalType": "string",
					"name": "question",
					"type": "string"
				}
			],
			"name": "createBet",
			"outputs": [],
			"stateMutability": "payable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "string",
					"name": "betId",
					"type": "string"
				},
				{
					"internalType": "bool",
					"name": "choice",
					"type": "bool"
				}
			],
			"name": "placeBet",
			"outputs": [],
			"stateMutability": "payable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "string",
					"name": "betId",
					"type": "string"
				},
				{
					"internalType": "bool",
					"name": "result",
					"type": "bool"
				}
			],
			"name": "resolveBet",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": false,
					"internalType": "string",
					"name": "betId",
					"type": "string"
				},
				{
					"indexed": false,
					"internalType": "address",
					"name": "winner",
					"type": "address"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "amount",
					"type": "uint256"
				}
			],
			"name": "WinningsClaimed",
			"type": "event"
		},
		{
			"inputs": [
				{
					"internalType": "string",
					"name": "",
					"type": "string"
				}
			],
			"name": "bets",
			"outputs": [
				{
					"internalType": "string",
					"name": "betId",
					"type": "string"
				},
				{
					"internalType": "string",
					"name": "question",
					"type": "string"
				},
				{
					"internalType": "uint256",
					"name": "betAmount",
					"type": "uint256"
				},
				{
					"internalType": "bool",
					"name": "isResolved",
					"type": "bool"
				},
				{
					"internalType": "bool",
					"name": "result",
					"type": "bool"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "string",
					"name": "betId",
					"type": "string"
				}
			],
			"name": "getBetInfo",
			"outputs": [
				{
					"internalType": "string",
					"name": "question",
					"type": "string"
				},
				{
					"internalType": "uint256",
					"name": "betAmount",
					"type": "uint256"
				},
				{
					"internalType": "bool",
					"name": "isResolved",
					"type": "bool"
				},
				{
					"internalType": "bool",
					"name": "result",
					"type": "bool"
				},
				{
					"internalType": "uint256",
					"name": "yesCount",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "noCount",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "owner",
			"outputs": [
				{
					"internalType": "address",
					"name": "",
					"type": "address"
				}
			],
			"stateMutability": "view",
			"type": "function"
		}
	]
];