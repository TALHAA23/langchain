import { chatGenAI } from "../lib/gen-ai";

export default function setupChatbot(element: HTMLDivElement) {
  element.innerHTML = `
        <div class="chatbot-container">
            <div class="chat-messages"></div>
            <form class="chat-input-form">
                <input type="text" class="chat-input" placeholder="Type your message..." autocomplete="off" />
                <button type="submit" class="chat-send-btn">Send</button>
            </form>
        </div>
    `;

  const messagesDiv = element.querySelector(".chat-messages") as HTMLDivElement;
  const form = element.querySelector(".chat-input-form") as HTMLFormElement;
  const input = element.querySelector(".chat-input") as HTMLInputElement;

  function appendMessage(content: string, sender: "user" | "bot") {
    const msgDiv = document.createElement("div");
    msgDiv.className = `chat-message ${sender}`;
    msgDiv.textContent = content;
    messagesDiv.appendChild(msgDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const userMsg = input.value.trim();
    if (!userMsg) return;
    input.value = "";
    appendMessage(userMsg, "user");
    const response = await chatGenAI(userMsg);
    appendMessage(response, "bot");
  });
}
