import setupChatbot from "./components/chatbot";
import { chatGenAI } from "./lib/gen-ai";
import { runnableSequence } from "./lib/langchain";
import "./style.css";
// chatGenAI();
// runnableSequence();
setupChatbot(document.querySelector("#app") as HTMLDivElement);
