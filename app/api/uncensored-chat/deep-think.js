import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ status: "error", error: "Method not allowed" });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ status: "error", error: "Invalid input format" });
  }

  try {
    // Call OpenAI's GPT model for reasoning
    const openaiResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4", // Use GPT-4 or another advanced model
        messages: messages, // Chat history
        max_tokens: 200, // Limit response length
        temperature: 0.7, // Adjust creativity
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, // Use env variable for security
        },
      }
    );

    // Extract response from OpenAI API
    const reasoningResponse = openaiResponse.data.choices[0].message.content;

    res.status(200).json({ status: "success", message: reasoningResponse });
  } catch (error) {
    console.error("Error in deep reasoning:", error);
    res.status(500).json({ status: "error", error: error.message });
  }
}
