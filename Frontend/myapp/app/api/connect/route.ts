import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import UserLink from '@/models/UserLink';
import { ConnectPublicClient } from '@/app/client';

export async function POST(request: Request) {
  try {
    console.log('Connect API Route: Received Request');
    
    const requestBody = await request.json();
    console.log('Request Body:', JSON.stringify(requestBody, null, 2));
    
    const { sessionId, address, signature, message } = requestBody;
    
    
    if (!sessionId || !address || !signature || !message) {
      console.error('Missing required fields');
      return NextResponse.json(
        { error: 'sessionId, address, signature, and message are all required' },
        { status: 400 }
      );
    }

   
    const publicClient = ConnectPublicClient(true); 

   
    try {
      const isValid = await publicClient.verifyMessage({
        address: address as `0x${string}`,
        message,
        signature: signature as `0x${string}`
      });

      if (!isValid) {
        console.error('Invalid signature for address:', address);
        return NextResponse.json(
          { error: 'Invalid signature - verification failed' },
          { status: 400 }
        );
      }
      console.log('Signature verified successfully for address:', address);
    } catch (verifyError) {
      console.error('Error verifying signature:', verifyError);
      return NextResponse.json(
        { error: 'Failed to verify signature' },
        { status: 400 }
      );
    }

    
    try {
      await connectDB();
      console.log('Database connection successful');
    } catch (dbError) {
      console.error('Database Connection Error:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }
    
    const userLink = await UserLink.findOne({ autolink: sessionId });
    
    if (!userLink) {
      console.error(`No UserLink found for sessionId: ${sessionId}`);
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

   
    userLink.address = address;
    userLink.verified = true;

    try {
      await userLink.save();
      console.log(`Verified address updated for sessionId: ${sessionId}`);
    } catch (saveError) {
      console.error('Error saving user link:', saveError);
      return NextResponse.json(
        { error: 'Failed to save wallet address' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Wallet address verified and updated successfully'
    });
  } catch (error) {
    console.error('Unexpected Error in Connect API route:', error);
    return NextResponse.json(
      { error: 'Unexpected error processing request' },
      { status: 500 }
    );
  }
}