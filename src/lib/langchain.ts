import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { supabase } from "./supabase"; // Assuming this is your Supabase client

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
