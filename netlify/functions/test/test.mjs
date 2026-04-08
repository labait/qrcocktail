
const output = () => {
 return process.env.OPENAI_KEY
}



// Docs on request and context https://docs.netlify.com/functions/build/#code-your-function-2
export default (request, context) => {
  try {
    return new Response(output().toString())
  } catch (error) {
    return new Response(error.toString(), {
      status: 500,
    })
  }
}
