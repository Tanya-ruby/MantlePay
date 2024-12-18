import { NextRequest, NextResponse } from 'next/server';
import BetLink from '@/models/BetLink';
import mongoose from 'mongoose';


if (!mongoose.connections[0].readyState) {
  mongoose.connect(process.env.MONGODB_URI || '');
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const betautolink = searchParams.get('betautolink');

    if (!betautolink) {
      return NextResponse.json({ error: 'Bet link is required' }, { status: 400 });
    }

    const betLink = await BetLink.findOne({ betautolink });

    if (!betLink) {
      return NextResponse.json({ error: 'Bet not found' }, { status: 404 });
    }

    return NextResponse.json({
      creator: betLink.creator,
      question: betLink.question,
      amount: betLink.amount,
      transactionHash: betLink.transactionHash,
      isResolved: betLink.isResolved
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching bet:', error);
    return NextResponse.json({ error: 'Failed to fetch bet' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { betautolink, transactionHash } = body;

    if (!betautolink || !transactionHash) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const updatedBetLink = await BetLink.findOneAndUpdate(
      { betautolink },
      { transactionHash },
      { new: true }
    );

    if (!updatedBetLink) {
      return NextResponse.json({ error: 'Bet not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Bet updated successfully',
      bet: updatedBetLink 
    }, { status: 200 });

  } catch (error) {
    console.error('Error updating bet:', error);
    return NextResponse.json({ error: 'Failed to update bet' }, { status: 500 });
  }
}