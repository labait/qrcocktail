const promptTemplate = `
Devo fare un quiz ad un utente, 
il quiz riguarda il cocktail {{cocktail}}. 
Restituiscimi tre domande ognuna con tre opzioni, 
solo una delle quali valide in modo che possa proporre questo quiz ad una platea di gente comune. 
Restituiscimi i dati in questo formato.

{
   cocktail: "{{cocktail}}", 
   questions: [
      {
         text: "cos'è quell'ingrediente bianco che si mette ne white russian"
         answers: [
             {
                 correct: true,
                 text: "panna" 
             },
             {
                correct: false,
                text: "latte intero"
             },
             {
                correct: false,
                text: "latte in polvere"
             }
         ]
      }
       ...
}
`


const OPENAI_URL = "https://api.openai.com/v1/responses"
const MODEL = "gpt-4.1-mini"

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
  })
}

export default async (request) => {
  try {
    // if querystring key debug is present, return debug.json file
    const url = new URL(request.url)
    const debug = url.searchParams.has("debug")
    if (debug) return jsonResponse(require("./debug.json"), 200)

    const apiKey = process.env.OPENAI_KEY
    const cocktail = (url.searchParams.get("cocktail") || "").trim()

    if (!apiKey) {
      return jsonResponse(
        { error: "Missing OPENAI_KEY environment variable" },
        500,
      )
    }

    if (!cocktail) {
      return jsonResponse(
        { error: 'Missing required query param "cocktail"' },
        400,
      )
    }

    const prompt = promptTemplate
    .replaceAll("{{cocktail}}", cocktail)

    const openaiResponse = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        input: prompt,
      }),
    })

    const openaiJson = await openaiResponse.json()

    if (!openaiResponse.ok) {
      return jsonResponse(
        {
          error: "OpenAI request failed",
          details: openaiJson,
        },
        openaiResponse.status,
      )
    }

    const modelOutputText = openaiJson?.output_text ?? ""
    let modelOutputJson = null

    // Assumiamo output JSON come richiesto: proviamo il parse e ritorniamo il raw in fallback.
    try {
      modelOutputJson = JSON.parse(modelOutputText)
    } catch {
      modelOutputJson = null
    }

    return jsonResponse({
      prompt,
      cocktail,
      model: MODEL,
      output: modelOutputJson ?? modelOutputText,
      raw: openaiJson,
    })
  } catch (error) {
    return jsonResponse(
      {
        error: "Internal server error",
        details: error?.message ?? String(error),
      },
      500,
    )
  }
}
