┌──────────────────────────────────────────────┐
│ Input: { sentence: "i dont liked mondays" }   │
└──────────────────────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────┐
│ Punctuation PromptTemplate                    │
│ → fills template with sentence                │
└──────────────────────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────┐
│ ChatGoogleGenerativeAI                        │
│ → LLM generates punctuated sentence           │
└──────────────────────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────┐
│ StringOutputParser                            │
│ → Extracts plain text from AIMessage          │
└──────────────────────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────┐
│ { punctuated_sentence: (prev) => prev }       │
│ → Maps previous output as punctuated_sentence │
└──────────────────────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────┐
│ Grammar PromptTemplate                        │
│ → Fills template with punctuated_sentence     │
└──────────────────────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────┐
│ ChatGoogleGenerativeAI                        │
│ → LLM generates grammar-corrected sentence    │
└──────────────────────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────┐
│ StringOutputParser                            │
│ → Extracts plain text final output            │
└──────────────────────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────┐
│ Final corrected sentence                      │
└──────────────────────────────────────────────┘
