# Reflection on AI-Assisted Development

## 🧠 Learning Experience
Using AI agents for this assignment significantly accelerated my understanding of **Hexagonal Architecture**. Instead of struggling with folder structures and interface definitions, the agent provided a clear, opinionated scaffold immediately. This allowed me to focus on the *domain logic* (Compliance Balance, Pooling) rather than the wiring.

I learned that AI is excellent at **enforcing consistency**. Once we established the pattern (Controller -> UseCase -> Port -> Adapter), the agent replicated it perfectly across all four features (Routes, Compliance, Banking, Pooling).

## ⚡ Efficiency Gains
The speed of development was the most notable advantage.
-   **Boilerplate**: CRUD operations and DTO mappings were generated in seconds.
-   **Testing**: Writing unit tests is often tedious. The agent generated comprehensive test suites (68 backend tests!) that caught real bugs (like the missing `percentDiff` field).
-   **Refactoring**: When I needed to move the Comparison logic to its own tab, the agent refactored the code and updated the tests much faster than I could have manually.

## 🔧 Areas for Improvement
1.  **Specification Clarity**: I realized that vague prompts lead to vague code. For example, I initially didn't specify that "Compare" should be its own tab, so the agent built it inline. Explicit requirements upfront would have saved time.
2.  **Context Management**: The agent sometimes "forgot" small details from previous turns if I didn't remind it. Learning to pin important context (like the `types.ts` file) is crucial.
3.  **Visual Polish**: While the code was functional, the initial UI was plain. I had to explicitly ask for "Coastal Warmth" and "Premium Design" to get the result I wanted.

## 🚀 Conclusion
AI agents are powerful **force multipliers** for developers. They don't replace the need to understand the code (I still had to debug the `undefined` error), but they remove the friction of writing it. This assignment was completed with higher quality (97 tests, clean architecture) and in less time than a manual approach would permit.
