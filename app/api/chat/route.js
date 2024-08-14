import { NextResponse } from "next/server";
import OpenAI from "openai"

const systemPrompt = `You are the Cinewave.ai Customer Service Chatbot, designed to assist users with movie, song, and show recommendations. Your role is to provide helpful, engaging, and accurate responses while maintaining a friendly and professional tone.

Core Responsibilities:
Recommendation Assistance: Help users find movies, songs, or shows based on their preferences, mood, or past interactions.
Content Updates: Inform users about new content, trending recommendations, and upcoming features or promotions.

Interaction Guidelines: Make sure to ask questions one at a time like what genre? Preferred actor in the movie? and others based on your digression.

Tone: Friendly, knowledgeable, and conversational.
Personalization: Tailor recommendations and responses based on the user's preferences and history.
Accuracy: Ensure that all information, especially content recommendations, is accurate and up-to-date.

For movies:
You should provide 3 movie recommendations once you have enough information. The recommendations should be in list form and follow this format:
1. Movie name (Genre): Brief description of the movie. (IMDB rating)
2. Movie name (Genre): Brief description of the movie. (IMDB rating)
3. Movie name (Genre): Brief description of the movie. (IMDB rating)

For shows:
You should provide 3 show recommendations once you have enough information. The recommendations should be in list form and follow this format:
1. Show name (Genre): Brief description of the show. (IMDB rating)
2. Show name (Genre): Brief description of the show. (IMDB rating)
3. Show name (Genre): Brief description of the show. (IMDB rating)

For songs:
You should provide 5 song recommendations once you have enough information. The recommendations should be in list form and follow this format:
1. Song title - Artist name (Genre): The general vibe of the song. (Likeability: a rating out of 10)
2. Song title - Artist name (Genre): The general vibe of the song. (Likeability: a rating out of 10)
3. Song title - Artist name (Genre): The general vibe of the song. (Likeability: a rating out of 10)
4. Song title - Artist name (Genre): The general vibe of the song. (Likeability: a rating out of 10)
5. Song title - Artist name (Genre): The general vibe of the song. (Likeability: a rating out of 10)
`;

export async function POST(req) {
    try {
        const openai = new OpenAI({
            baseURL: "https://openrouter.ai/api/v1",
            apiKey: process.env.OPENROUTER_API_KEY, // Use process.env to access environment variables securely
            defaultHeaders: {
                "HTTP-Referer": 'http://localhost:3000/', // Optional, for including your app on openrouter.ai rankings.
                "X-Title": 'AI Customer Service', // Optional. Shows in rankings on openrouter.ai.
            }
        }); // Create a new instance of the OpenAI client

        const data = await req.json(); // Parse the JSON body of the incoming request
        // console.log("Request data:", data); // Log the request data for debugging

        // Validate that data is an array
        if (!Array.isArray(data)) {
            throw new Error("Invalid input: data should be an array of messages.");
        }

        // Create a chat completion request to the OpenAI API
        const completion = await openai.chat.completions.create({
            messages: [{ role: 'system', content: systemPrompt }, ...data], // Include the system prompt and user messages
            model: 'openai/gpt-3.5-turbo', // Specify the model to use
            stream: true, // Enable streaming responses
        });

        // Create a ReadableStream to handle the streaming response
        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder(); // Create a TextEncoder to convert strings to Uint8Array
                try {
                    // Iterate over the streamed chunks of the response
                    for await (const chunk of completion) {
                        const content = chunk.choices[0]?.delta?.content; // Extract the content from the chunk
                        if (content) {
                            const text = encoder.encode(content); // Encode the content to Uint8Array
                            controller.enqueue(text); // Enqueue the encoded text to the stream
                        }
                    }
                } catch (err) {
                    controller.error(err); // Handle any errors that occur during streaming
                } finally {
                    controller.close(); // Close the stream when done
                }
            },
        });

        return new NextResponse(stream); // Return the stream as the response
    } catch (error) {
        console.error("Error in POST /api/chat:", error); // Log the error for debugging
        return NextResponse.json({ error: error.message }, { status: 400 }); // Return a 400 Bad Request response with the error message
    }
}
// const openai = new OpenAI({
//     baseURL: "https://openrouter.ai/api/v1",
//     apiKey: process.env.OPENROUTER_API_KEY,
// });

// export async function POST(req) {
//     try {
//         const body = await req.json();
//         const completion = await openai.chat.completions.create({
//             model: "openai/gpt-3.5-turbo",
//             messages: body,
//             max_tokens: 1000,
//         });

//         console.log('OpenAI response:', completion);  // Add this line for debugging

//         if (!completion.choices || completion.choices.length === 0) {
//             throw new Error('No choices returned from OpenAI');
//         }

//         return new Response(completion.choices[0].message.content);
//     } catch (error) {
//         console.error('Error:', error);
//         return new Response(JSON.stringify({ error: error.message }), {
//             status: 500,
//             headers: { 'Content-Type': 'application/json' },
//         });
//     }
// }
// export async function POST(req) {
//     // const openai = new OpenAI()
//     const openai = new OpenAI({
//         baseURL: "https://openrouter.ai/api/v1",
//         apiKey: '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',
//         defaultHeaders: {
//             "HTTP-Referer": 'http://localhost:3000/', // Optional, for including your app on openrouter.ai rankings.
//             // "X-Title": $YOUR_SITE_NAME, // Optional. Shows in rankings on openrouter.ai.
//         }
//     })

//     const data = await req.json()

//     const completion = await openai.chat.completion.create({
//         messages: [{
//             role: 'system',
//             content: systemPrompt,
//         },
//         ...data,
//         ],
//         model: 'openai/gpt-3.5-turbo',
//         stream: true
//     })

//     const stream = new ReadableStream({
//         async start(controller) {
//             const encoder = new TextEncoder()
//             try {
//                 for await (const chunk of completion) {
//                     const content = chunk.choices[0]?.delta?.content
//                     if (content) {
//                         const text = encoder.encode(content)
//                         controller.enqueue(text)
//                     }
//                 }
//             }
//             catch (err) {
//                 controller.error(err)
//             } finally {
//                 controller.close()
//             }
//         }
//     })

//     return new NextResponse(stream)
// }