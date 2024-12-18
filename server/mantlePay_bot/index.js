import { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { publicClient, walletClient,account } from './client/client.js';



import { CONTRACT_ABI } from './abi/abi.js';
import { betABI } from './abi/bet.js';
import mongoose from 'mongoose';
import UserLink from './models/UserLink.js';
import SendLink from './models/SendLink.js';
import BetLink from './models/BetLink.js';
import PlaceBetLink from './models/PlaceBetLink.js';
import RewardLink from './models/RewardLink.js';  // Add this import
import dotenv from 'dotenv';
dotenv.config();
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const BET_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_BET_CONTRACT_ADDRESS; 

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

const sendLinkChangeStream = SendLink.watch([
  { $match: { operationType: "update" } }
]);
const rewardLinkChangeStream = RewardLink.watch([
  { $match: { operationType: "update" } }
]);
  
const betLinkChangeStream = BetLink.watch([
  { $match: { operationType: "update" } }
]);
sendLinkChangeStream.on("change", async (change) => {
  if (change.operationType === "update" && change.updateDescription.updatedFields.transactionHash) {
    const id = change.documentKey._id;
    const sendLink = await SendLink.findById(id);
    
    try {
      // Explorer URL for Mantle Sepolia
      const explorerBaseUrl = 'https://sepolia.mantlescan.xyz/tx/';
      const explorerUrl = `${explorerBaseUrl}${sendLink.transactionHash}`;

      // Notify sender
      const sender = await client.users.fetch(sendLink.user);
      await sender.send(
        `Your transaction of ${sendLink.amount} ETH to ${sendLink.to_address} was successful!\n` +
        `Transaction Hash: ${sendLink.transactionHash}\n` +
        `Explorer Link: ${explorerUrl}`
      );

      // Try to notify receiver if they're a Discord user
      try {
        const receiverUserLink = await UserLink.findOne({ 
          address: sendLink.to_address,
          address: { $ne: '0x' }
        }).sort({ generateTIME: -1 });
        
        if (receiverUserLink) {
          const receiver = await client.users.fetch(receiverUserLink.user);
          await receiver.send(
            `You received ${sendLink.amount} ETH!\n` +
            `Transaction Hash: ${sendLink.transactionHash}\n` +
            `Explorer Link: ${explorerUrl}`
          );
        }
      } catch (error) {
        console.error('Error notifying receiver:', error);
      }
    } catch (error) {
      console.error('Error in change stream notification:', error);
    }
  }
});

rewardLinkChangeStream.on("change", async (change) => {
  if (change.operationType === "update" && change.updateDescription.updatedFields.transactionHash) {
    const id = change.documentKey._id;
    const rewardLink = await RewardLink.findById(id);
    
    try {
      // Explorer URL for Mantle Sepolia
      const explorerBaseUrl = 'https://sepolia.mantlescan.xyz/tx/';
      const explorerUrl = `${explorerBaseUrl}${rewardLink.transactionHash}`;

      // Get the guild (server) the rewarder is in
      const rewarder = await client.users.fetch(rewardLink.rewarder);
      const recipient = await client.users.fetch(rewardLink.recipient);
      
      // Find a mutual guild between the bot and the users
      const mutualGuild = client.guilds.cache.find(guild => 
        guild.members.cache.has(rewardLink.rewarder) && 
        guild.members.cache.has(rewardLink.recipient)
      );

      if (mutualGuild) {
        // Find a suitable channel to send the message
        const channel = mutualGuild.channels.cache.find(
          channel => channel.type === 0 && // Text channel
          channel.permissionsFor(mutualGuild.members.me).has(['SendMessages', 'ViewChannel'])
        );

        if (channel) {
          await channel.send(
            `🎉 ${rewarder} has rewarded ${recipient} with ${rewardLink.amount} ETH!\n` +
            `Message: "${rewardLink.message}"\n` +
            `Transaction: ${explorerUrl}`
          );
        }
      }

      // DM the recipient
      await recipient.send(
        `You received a reward of ${rewardLink.amount} ETH from ${rewarder.username}!\n` +
        `Message: "${rewardLink.message}"\n` +
        `Transaction Hash: ${rewardLink.transactionHash}\n` +
        `Explorer Link: ${explorerUrl}`
      );

    } catch (error) {
      console.error('Error in reward change stream notification:', error);
    }
  }
});

betLinkChangeStream.on("change", async (change) => {
  if (change.operationType === "update" && change.updateDescription.updatedFields.transactionHash) {
    const id = change.documentKey._id;
    const betLink = await BetLink.findById(id);
    
    try {
      const explorerBaseUrl = 'https://sepolia.mantlescan.xyz/tx/';
      const explorerUrl = `${explorerBaseUrl}${betLink.transactionHash}`;

      // Get creator's info
      const creator = await client.users.fetch(betLink.creator);
      
      // Generate a universal placeautolink for this bet
      const placeautolink = betLink.betautolink;
      
      // Create a new PlaceBetLink document for the general bet placement
      await PlaceBetLink.createNewPlaceBetLink(
        betLink.creator, // Use the creator as the initial placer
        placeautolink,
        betLink.betautolink
      );

      // Find a suitable channel to announce the bet
      const guild = client.guilds.cache.first();
      if (guild) {
        const channel = guild.channels.cache.find(
          channel => channel.type === 0 && 
          channel.permissionsFor(guild.members.me).has(['SendMessages', 'ViewChannel'])
        );

        if (channel) {
          await channel.send({
            content: `🎲 New Bet Created by ${creator}!\n\n` +
                     `Question: "${betLink.question}"\n` +
                     `Initial Bet Amount: ${betLink.amount} ETH\n` +
                     `Transaction: ${explorerUrl}`,
            components: [
              new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                  .setLabel('Place Bet 🎲')
                  .setStyle(ButtonStyle.Link)
                  .setURL(`${process.env.NEXT_PUBLIC_APP_URL}/placebet/${placeautolink}`)
              )
            ]
          });
        }
      }

      // DM the creator
      await creator.send(
        `Your bet "${betLink.question}" has been created successfully!\n` +
        `Initial Bet Amount: ${betLink.amount} ETH\n` +
        `Transaction Hash: ${betLink.transactionHash}\n` +
        `Explorer Link: ${explorerUrl}\n\n` +
        `Universal Bet Link: ${process.env.NEXT_PUBLIC_APP_URL}/placebet/${placeautolink}`
      );

    } catch (error) {
      console.error('Error in bet change stream notification:', error);
    }
  }
});

// Connect to MongoDB when the bot starts
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// When the client is ready, run this code (only once)
client.once('ready', () => {
  console.log('Bot is Ready! 🚀');
});

// Listen for interactions (slash commands)
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'connect') {
    try {
      // Generate a unique session ID
      const sessionId = Math.random().toString(36).substring(2, 15);
      // Create new UserLink document using the helper method
      const newLink = await UserLink.createNewLink(
        interaction.user.id,
        sessionId
      );
      console.log(`Created new link for user ${interaction.user.id} with sessionId ${sessionId}`);
      // Send the connection link
      await interaction.reply({
        content: 'Connect your wallet:',
        components: [{
          type: 1,
          components: [{
            type: 2,
            style: 5,
            label: 'Connect 🔗',
            url: `${process.env.NEXT_PUBLIC_APP_URL}/connect/${sessionId}`,
          }],
        }],
        ephemeral: true
      });
    } catch (error) {
      console.error('Error:', error);
      await interaction.reply({
        content: 'There was an error processing your request.',
        ephemeral: true
      });
    }
  }

  if (interaction.commandName === 'wallet') {
    try {
      // Get the target user (either mentioned user or command user)
      const targetUser = interaction.options.getUser('user') || interaction.user;
      
      // Find the most recent wallet for this user
      // Note: Changed discordId to user and removed verified check
      const userLink = await UserLink.findOne({ 
        user: targetUser.id,
        address: { $ne: '0x' }  // Only find entries where address has been set
      }).sort({ generateTIME: -1 }); // Sort by your existing timestamp field
  
      if (!userLink || !userLink.address || userLink.address === '0x') {
        await interaction.reply({
          content: targetUser.id === interaction.user.id 
            ? "You haven't connected a wallet address to WMantlePay yet!"
            : `${targetUser.username} hasn't connected a wallet address to WMantlePay yet!`,
          ephemeral: true
        });
        return;
      }
  
      // Format the address (show first 6 and last 4 characters)
      const formattedAddress = `${userLink.address}`;
      
      await interaction.reply({
        content: targetUser.id === interaction.user.id
          ? `Your connected wallet address: ${formattedAddress}`
          : `${targetUser.username}'s connected wallet address: ${formattedAddress}`,
        ephemeral: true
      });
    } catch (error) {
      console.error('Error checking wallet:', error);
      await interaction.reply({
        content: 'There was an error checking the wallet address.',
        ephemeral: true
      });
    }
  }
  if (interaction.commandName === 'send') {
    try {
      const amount = interaction.options.getNumber('amount');
      const to_address = interaction.options.getString('to_address');

      if (!amount || !to_address) {
        await interaction.reply({
          content: "Please specify both amount and recipient.",
          ephemeral: true
        });
        return;
      }

      // Handle if to_address is a user mention or an Ethereum address
      let recipientAddress = to_address;
      if (to_address.startsWith('<@')) {
        // Extract user ID from the mention
        const userId = to_address.replace(/[<@!>]/g, '');

        // Find the most recent valid address for the user
        const userLink = await UserLink.findOne({ 
          user: userId,
          address: { $ne: '0x' }  // Only find entries where address has been set
        }).sort({ generateTIME: -1 });

        if (!userLink || !userLink.address) {
          await interaction.reply({
            content: "No valid address connected for the mentioned user.",
            ephemeral: true
          });
          return;
        }
        recipientAddress = userLink.address;
      } else if (!to_address.startsWith('0x')) {
        await interaction.reply({
          content: "Invalid address or user mention.",
          ephemeral: true
        });
        return;
      }

      // Create new send link
      const sendautolink = Math.random().toString(36).substring(2, 15);
      const newSendLink = new SendLink({
        user: interaction.user.id,
        sendautolink: sendautolink,
        generateTIME: new Date(),
        amount: amount,
        to_address: recipientAddress
      });

      await newSendLink.save();

      // Reply with the send button
      await interaction.reply({
        content: `${amount} ETH to ${recipientAddress}`,
        components: [
          new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setLabel('Send 💸')
                .setStyle(ButtonStyle.Link)
                .setURL(`${process.env.NEXT_PUBLIC_APP_URL}/send/${sendautolink}`)
            )
        ],
        ephemeral: true
      });

    } catch (error) {
      console.error('Error processing send command:', error);
      await interaction.reply({
        content: 'Failed to process send request.',
        ephemeral: true
      });
    }
  }
  if (interaction.commandName === 'reward') {
    try {
      const amount = interaction.options.getNumber('amount');
      const recipient = interaction.options.getUser('user');
      const message = interaction.options.getString('message');
      
      if (!amount || !recipient || !message) {
        await interaction.reply({
          content: "Please specify amount, user, and message for the reward.",
          ephemeral: true
        });
        return;
      }
  
      // Generate a unique session ID for this reward
      const sessionId = Math.random().toString(36).substring(2, 15);
      
      // Create new RewardLink document with amount and message
      const newRewardLink = new RewardLink({
        rewarder: interaction.user.id,
        recipient: recipient.id,
        rewardautolink: sessionId,
        amount: amount,
        message: message
      });
  
      await newRewardLink.save();
  
      // Send the reward creation link
      await interaction.reply({
        content: `Create reward of ${amount} MNT for ${recipient.username}:\nMessage: "${message}"`,
        components: [{
          type: 1,
          components: [{
            type: 2,
            style: 5,
            label: 'Create Reward 🎁',
            url: `${process.env.NEXT_PUBLIC_APP_URL}/reward/${sessionId}`,
          }],
        }],
        ephemeral: true
      });
  
    } catch (error) {
      console.error('Error processing reward command:', error);
      await interaction.reply({
        content: 'Failed to create reward link.',
        ephemeral: true
      });
    }
  }

  

  if (interaction.commandName === 'claim') {
    try {
      // 1. Check contract for pending rewards
      const { result: pendingAmount } = await publicClient.simulateContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getPendingAmount',
        args: [interaction.user.id]
      });
  
      if (pendingAmount === 0n) {
        await interaction.reply({
          content: "You don't have any rewards to claim!",
          ephemeral: true
        });
        return;
      }
  
      // 2. Check if user has a connected wallet
      const userLink = await UserLink.findOne({ 
        user: interaction.user.id,
        address: { $ne: '0x' }
      }).sort({ generateTIME: -1 });
  
      if (!userLink || !userLink.address) {
        const ethAmount = Number(pendingAmount) / 1e18;
        await interaction.reply({
          content: `You have ${ethAmount} MNT in rewards to claim! Please connect a wallet first using /connect to claim them.`,
          ephemeral: true
        });
        return;
      }
  
      await interaction.reply({
        content: "Processing your claim...",
        ephemeral: true
      });
  
      // Prepare and send the transaction
      const { request } = await publicClient.simulateContract({
        account,
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'transferRewardsToUser',
        args: [interaction.user.id, userLink.address]
      });
  
      const hash = await walletClient.writeContract(request);

// Wait for confirmation
const receipt = await publicClient.waitForTransactionReceipt({ hash });

const ethAmount = Number(pendingAmount) / 1e18;
const explorerBaseUrl = 'https://sepolia.mantlescan.xyz/tx/';

try {
  const user = await client.users.fetch(interaction.user.id);
  await user.send(
      `Your claim of ${ethAmount} MNT has been processed!\n` +
      `Transaction Hash: ${receipt.transactionHash}\n` +
      `Explorer Link: ${explorerBaseUrl}${receipt.transactionHash}`
  );
} catch (dmError) {
  console.error('Failed to send DM:', dmError);
}

await interaction.followUp({
  content: `Successfully claimed ${ethAmount} MNT in rewards!\nTransaction: ${explorerBaseUrl}${receipt.transactionHash}`,
  ephemeral: true
});
  
    } catch (error) {
      console.error('Error in claim command:', error);
      await interaction.followUp({
        content: 'An error occurred while processing your claim.',
        ephemeral: true
      });
    }
  }

  if (interaction.commandName === 'greeting') {
    await interaction.reply('Hi! 👋');
  }

  if (interaction.commandName === 'bet') {
    try {
        const question = interaction.options.getString('question');
        const amount = interaction.options.getNumber('amount');

        if (!question || !amount) {
            await interaction.reply({
                content: "Please specify both question and amount for the bet.",
                ephemeral: true
            });
            return;
        }

        // Generate a unique session ID for this bet
        const betautolink = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        
        // Create new BetLink document
        const newBetLink = await BetLink.createNewBetLink(
            interaction.user.id,
            betautolink,
            question,
            amount
        );

        // Send the bet creation link
        await interaction.reply({
            content: `Create bet: "${question}" for ${amount} ETH\nBet ID: ${betautolink}`,
            components: [{
                type: 1,
                components: [{
                    type: 2,
                    style: 5,
                    label: 'Create Bet 🎲',
                    url: `${process.env.NEXT_PUBLIC_APP_URL}/bet/${betautolink}`,
                }],
            }],
            ephemeral: true
        });

    } catch (error) {
        console.error('Error processing bet command:', error);
        await interaction.reply({
            content: 'Failed to create bet link.',
            ephemeral: true
        });
    }
}




    
    
    
  
   
  
   
}
);

// Login to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);