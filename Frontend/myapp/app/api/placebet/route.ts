import { NextRequest, NextResponse } from 'next/server';
import PlaceBetLink from '@/models/PlaceBetLink';
import mongoose from 'mongoose';

// Ensure mongoose connection
if (!mongoose.connections[0].readyState) {
  mongoose.connect(process.env.MONGODB_URI || '');
}

export async function POST(request: NextRequest) {
    try {
      const body = await request.json();
      const { 
        betautolink,
        transactionHash,
        choice,
        placer 
      } = body;
  
      if (!betautolink || !transactionHash || choice === undefined || !placer) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }
  
      try {
        const placeBetLink = await PlaceBetLink.createNewPlaceBetLink(
          placer,
          betautolink,
          betautolink
        );
  
        // Update with transaction hash and choice
        await PlaceBetLink.findByIdAndUpdate(placeBetLink._id, {
          transactionHash,
          choice
        });
  
        return NextResponse.json({ 
          message: 'Bet placement recorded successfully',
          placeBetLink
        }, { status: 200 });
  
      } catch (error: any) {
        console.error('Error recording bet placement:', error);
        return NextResponse.json({ 
          message: 'Blockchain transaction successful',
          success: true
        }, { status: 200 });
      }
  
    } catch (error: any) {
      console.error('Error processing bet placement request:', error);
      return NextResponse.json({ 
        error: 'Failed to process bet placement',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }
  }

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const betautolink = searchParams.get('betautolink');

    if (!betautolink) {
      return NextResponse.json({ error: 'Bet link is required' }, { status: 400 });
    }

    const placeBetLinks = await PlaceBetLink.find({ originalbetautolink: betautolink });

    return NextResponse.json({
      placeBetLinks
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching bet placements:', error);
    return NextResponse.json({ error: 'Failed to fetch bet placements' }, { status: 500 });
  }
}