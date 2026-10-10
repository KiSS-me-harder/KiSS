export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const { message, systemPrompt, teacherName } = body

  if (!message || !systemPrompt) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Message and systemPrompt are required'
    })
  }

  // Check for OpenAI API key
  const apiKey = useRuntimeConfig(event).openaiApiKey

  if (!apiKey) {
    // Return a placeholder response when no API key is configured
    return {
      reply: `${teacherName} says: Thank you for your message. The AI chat service is not yet configured. Please add your OpenAI API key to enable chat functionality.`
    }
  }

  try {
    // Call OpenAI API
    const response = await $fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500
      }
    })

    const reply = (response as any).choices?.[0]?.message?.content || 'Sorry, I could not generate a response.'
    return { reply }
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get AI response'
    })
  }
})
