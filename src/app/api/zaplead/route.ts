import { NextRequest, NextResponse } from 'next/server';
import { StreamingTextResponse } from 'ai';

export async function POST(req: NextRequest) {
  try {
    const { messages = [] }: Partial<{ messages: Array<{ role: string; content: string }> }> = await req.json();

    console.log('Received messages:', messages);

    const lastMessage = messages[messages.length - 1];
    console.log('Last message:', lastMessage);

    const zapleadAIRequest = async (content: string) => {
      console.log('Sending request to Zaplead AI:', content);
    
      try {
        const response = await fetch(
          'https://dev.zaplead.ai/new/api/v1/agents/4524cc6c-069a-4da9-8d94-b3ecfdff1aa8/sessions/b13426a7-86f0-45a1-9afd-ccf0ed8c1248',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_ZAPLEAD_API_KEY}`,
            },
            body: JSON.stringify({
              message: content,
              action: 'chat',
              metadata: null,
            }),
          }
        );
    
        console.log('Response status:', response.status);
    
        // Check for a plain text response
        const contentType = response.headers.get('content-type');
        const rawText = await response.text();
        console.log('Raw response text:', rawText);
    
        if (contentType?.includes('application/json')) {
          try {
            const jsonResponse = JSON.parse(rawText);
            console.log('Zaplead AI response:', jsonResponse);
            return jsonResponse;
          } catch (jsonError) {
            console.error('Failed to parse JSON:', jsonError);
            throw new Error(`Invalid JSON response: ${rawText}`);
          }
        } else {
          // Return plain text response as is
          return { choices: [{ message: { content: rawText } }] };
        }
      } catch (fetchError) {
        console.error('Fetch error:', fetchError);
        throw fetchError;
      }
    };
    

    // Use only the content of the last message
    const messageContent = lastMessage.content;

    // Send only the content to the AI API
    const apiResponse = await zapleadAIRequest(messageContent);

    // Extract only the content from the AI's response
    const aiMessageContent = apiResponse.choices[0].message.content;

    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(aiMessageContent));
        controller.close();
      },
    });

    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error('Error in Zaplead API handler:', error as Error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: (error as Error).message },
      { status: 500 }
    );
  }
}

export const GET = () => {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
};
