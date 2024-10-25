import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateOpenAIStreamingCompletion(
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  streamCallback: (content: string) => void
) {
  const stream = await openai.chat.completions.create({
    model: "gpt-4",  // Asegúrate de usar el modelo correcto
    messages: messages,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || "";
    if (content) {
      streamCallback(content);
    }
  }
}