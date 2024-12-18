import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

const commands = [
  {
    name: 'connect',
    description: 'Connect your wallet'
  },
  {
    name: 'greeting',
    description: 'Get a friendly greeting'
  },
  {
    name: 'claim',
    description: 'Claim your pending rewards'
  },
  {
    name: 'wallet',
    description: 'View connected wallet address',
    options: [
      {
        name: 'user',
        description: 'User to check wallet address for (defaults to yourself)',
        type: 6,
        required: false
      }
    ]
  },
  {
    name: 'send',
    description: 'Send ETH to a user or address',
    options: [
      {
        name: 'amount',
        description: 'Amount of ETH to send',
        type: 10,
        required: true
      },
      {
        name: 'to_address',
        description: 'Recipient address or user mention',
        type: 3,
        required: true
      }
    ]
  },
  {
    name: 'reward',
    description: 'Create a reward for a user',
    options: [
      {
        name: 'amount',
        description: 'Amount of ETH to reward',
        type: 10,
        required: true
      },
      {
        name: 'user',
        description: 'User to reward',
        type: 6,
        required: true
      },
      {
        name: 'message',
        description: 'Message for the reward',
        type: 3,
        required: true
      }
    ]
  },
  {
    name: 'bet',
    description: 'Create a new bet',
    options: [
      {
        name: 'question',
        description: 'The betting question',
        type: 3,
        required: true
      },
      {
        name: 'amount',
        description: 'Amount of ETH for the bet',
        type: 10,
        required: true
      }
    ]
  },
  ];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

async function deployCommands() {
  try {
    console.log('Started refreshing application (/) commands.');
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands },
    );
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('Error deploying commands:', error);
  }
}

deployCommands();