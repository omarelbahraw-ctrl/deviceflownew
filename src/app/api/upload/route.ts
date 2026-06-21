import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Here we could check user session for authentication
        // We will allow uploads for now assuming they are logged in
        return {
          maximumSizeInBytes: 50 * 1024 * 1024, // 50MB limit
          tokenPayload: JSON.stringify({
            // optional metadata
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Run after upload
        console.log('blob upload completed', blob, tokenPayload);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 } // The webhook will retry 5 times waiting for a 200
    );
  }
}
