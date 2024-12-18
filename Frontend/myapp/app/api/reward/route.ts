import { NextRequest, NextResponse } from 'next/server';
import RewardLink from '@/models/RewardLink';
import mongoose from 'mongoose';


if (!mongoose.connections[0].readyState) {
  mongoose.connect(process.env.MONGODB_URI || '');
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rewardautolink = searchParams.get('rewardautolink');

    if (!rewardautolink) {
      return NextResponse.json({ error: 'Reward link is required' }, { status: 400 });
    }

    const rewardLink = await RewardLink.findOne({ rewardautolink });

    if (!rewardLink) {
      return NextResponse.json({ error: 'Reward not found' }, { status: 404 });
    }

    return NextResponse.json({
      recipient: rewardLink.recipient,
      amount: rewardLink.amount,
      message: rewardLink.message,
      rewarder: rewardLink.rewarder
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching reward:', error);
    return NextResponse.json({ error: 'Failed to fetch reward' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rewardautolink, transactionHash } = body;

    if (!rewardautolink || !transactionHash) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const updatedRewardLink = await RewardLink.findOneAndUpdate(
      { rewardautolink },
      { transactionHash },
      { new: true }
    );

    if (!updatedRewardLink) {
      return NextResponse.json({ error: 'Reward not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Reward updated successfully',
      reward: updatedRewardLink 
    }, { status: 200 });

  } catch (error) {
    console.error('Error updating reward:', error);
    return NextResponse.json({ error: 'Failed to update reward' }, { status: 500 });
  }
}