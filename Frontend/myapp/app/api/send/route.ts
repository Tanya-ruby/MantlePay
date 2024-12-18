import { NextRequest, NextResponse } from 'next/server';
import SendLink from '@/models/SendLink'; 
import mongoose from 'mongoose';


if (!mongoose.connections[0].readyState) {
  mongoose.connect(process.env.MONGODB_URI || '');
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sendautolink = searchParams.get('sendautolink');

    if (!sendautolink) {
      return NextResponse.json({ error: 'Send link is required' }, { status: 400 });
    }

    const sendLink = await SendLink.findOne({ sendautolink });

    if (!sendLink) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json({
      to_address: sendLink.to_address,
      amount: sendLink.amount,
      user: sendLink.user
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json({ error: 'Failed to fetch transaction' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sendautolink, transactionHash } = body;

    if (!sendautolink || !transactionHash) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const updatedSendLink = await SendLink.findOneAndUpdate(
      { sendautolink },
      { 
        transactionHash,
       
      },
      { new: true }
    );

    if (!updatedSendLink) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Transaction updated successfully',
      transaction: updatedSendLink 
    }, { status: 200 });

  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
  }
}