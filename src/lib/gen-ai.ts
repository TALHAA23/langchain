import { PromptTemplate } from "@langchain/core/prompts";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { supabaseVectoreRetriver } from "./langchain";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
  RunnablePassthrough,
  RunnableSequence,
  type RunnableInterface,
} from "@langchain/core/runnables";

const history: any[] = [];
export const chatGenAI = async (userQuestion: string) => {
  history.push({ user: userQuestion });
  const llm = new ChatGoogleGenerativeAI({
    apiKey: import.meta.env.VITE_GOOGLE_GEN_AI_API,
    model: "gemini-2.0-flash",
  });

  const standaloneQuestionTemplate = `Generate a standalone question for the question: {user_question}.
  You can make use of the history too: \n {convo_history}
  `;

  const standaloneQuestionPrompt = PromptTemplate.fromTemplate(
    standaloneQuestionTemplate
  );

  const answerTemplate = `
  Instruction: You have to answer the users question based on the data only. if an answer is not possible apologise in response.
  You also have access to converstion hisotry so make sure to make use of that to make the converation even more effective.
  user: {user_question}
  data: {relevent_data}
  history: {convo_history}
  `;

  const answerTemplatePrompt = PromptTemplate.fromTemplate(answerTemplate);

  const retriver = supabaseVectoreRetriver();
  const combinedDocs = (docs: Array<{ pageContent: string }>) =>
    docs.map((item) => item.pageContent).join("\n\n");

  const standaloneQuestionChain = standaloneQuestionPrompt
    .pipe(llm as RunnableInterface)
    .pipe(new StringOutputParser());
  const retriverChain = RunnableSequence.from([
    (prev) => prev.context,
    retriver as RunnableInterface,
    combinedDocs,
  ]);

  const answerChain = answerTemplatePrompt
    .pipe(llm as RunnableInterface)
    .pipe(new StringOutputParser());

  const chain = RunnableSequence.from([
    {
      context: standaloneQuestionChain,
      original: new RunnablePassthrough(),
    },
    {
      relevent_data: retriverChain,
      user_question: (prev) => prev.original.user_question,
      convo_history: (prev) => prev.original.convo_history,
    },
    answerChain,
  ]);

  const result = await chain.invoke({
    user_question: userQuestion,
    convo_history: JSON.stringify(history),
  });

  history.push({ model: result });

  return result;
};
