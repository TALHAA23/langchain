import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from "@langchain/google-genai";
import { supabase } from "./supabase"; // Assuming this is your Supabase client
import { PromptTemplate } from "@langchain/core/prompts";
import {
  RunnablePassthrough,
  RunnableSequence,
  type RunnableInterface,
} from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";

export const textSplitter = async () => {
  try {
    const response = await fetch("/scrimba-info.txt");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 50,
    });

    const docs = await splitter.createDocuments([text]);

    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: import.meta.env.VITE_GOOGLE_GEN_AI_API, // Make sure you provide this key properly
      model: "text-embedding-004", // or your desired model name
    });

    await SupabaseVectorStore.fromDocuments(docs, embeddings, {
      client: supabase,
      tableName: "documents", // make sure this table exists
    });

    console.log("Documents successfully added to Supabase vector store");
  } catch (error) {
    console.error("Error in textSplitter:", error);
  }
};

export const supabaseVectoreRetriver = () => {
  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: import.meta.env.VITE_GOOGLE_GEN_AI_API,
    model: "text-embedding-004",
  });
  const vectoreStore = new SupabaseVectorStore(embeddings, {
    client: supabase,
    tableName: "documents",
    queryName: "match_documents",
  });

  const retriver = vectoreStore.asRetriever();
  return retriver;
};

export async function runnableSequence() {
  const llm = new ChatGoogleGenerativeAI({
    apiKey: import.meta.env.VITE_GOOGLE_GEN_AI_API,
    model: "gemini-2.0-flash",
  });

  const punctuationTemplate = `Given a sentence, add punctuation where needed. Do not correct grammer
    sentence: {sentence}
    sentence with punctuation:  
    `;
  const punctuationPrompt = PromptTemplate.fromTemplate(punctuationTemplate);

  const grammarTemplate = `Given a sentence correct the grammar.
    sentence: {punctuated_sentence}
    sentence with correct grammar: 
    `;
  const grammarPrompt = PromptTemplate.fromTemplate(grammarTemplate);

  const translationTemplate = `Given a sentence, translate that sentence into {language}
    sentence: {grammatically_correct_sentence}
    translated sentence:
    `;

  const translationPrompt = PromptTemplate.fromTemplate(translationTemplate);

  const punctuationChain = RunnableSequence.from([
    punctuationPrompt as RunnableInterface,
    llm as RunnableInterface,
    new StringOutputParser(),
  ]);

  const grammerChain = RunnableSequence.from([
    grammarPrompt as RunnableInterface,
    llm as RunnableInterface,
    new StringOutputParser(),
  ]);

  const translationChain = RunnableSequence.from([
    translationPrompt as RunnableInterface,
    llm as RunnableInterface,
    new StringOutputParser(),
  ]);

  const chain = RunnableSequence.from([
    {
      punctuated_sentence: punctuationChain,
      original: new RunnablePassthrough(),
    },
    {
      grammatically_correct_sentence: grammerChain,
      language: (prevResult) => prevResult.original.language,
    },
    translationChain,
  ]);

  const result = await chain.invoke({
    sentence: "i dont liked mondays",
    language: "urdu",
  });

  console.log(result);
}
