## Rick & Morty AI Challenge

### Objective
Over two hours, build a lightweight app or script that demonstrates your ability to retrieve, reason over, and evaluate structured and unstructured data using the Rick & Morty API. The goal is not just to display data, but to show your approach to generating and evaluating AI-augmented outputs (summaries, explanations, or embeddings) grounded in that data.

### Tasks
#### 1. Data retrieval
- Fetch and structure the list of locations, including each location’s type and residents (with their names, statuses, species, and images).
- Use either the REST or GraphQL endpoints and explain your choice (trade-offs in flexibility, query efficiency, or developer ergonomics).
#### 2. Interaction & notes
- Enable viewing of character details and allow adding persistent notes about each character (e.g., insights from model generations or user evaluations).
- You may use SQLite, JSON, local storage, or any persistence layer. Communicate your reasoning for the chosen method.
#### 3. Generative layer
- Use an LLM (of your choice) to implement a user facing generative AI powered feature of your choice (e.g., “Summarize this location in the tone of a Rick & Morty narrator” or “Generate a short dialogue between two characters”).
- Implement lightweight evaluation scaffolding to measure or compare the generative quality of outputs. For example:
    - A scoring or ranking function for factual consistency, creativity, or completeness.
    - Use of a simple embedding-based metric, prompt rubric, or heuristic evaluation.
#### 4. Search & filtering (bonus)
Implement AI-augmented search, such as a semantic or fuzzy retrieval powered by embeddings.


### Guidelines
- Document your choices when deciding between different architectural approaches, such as GraphQL or REST endpoints, and explain other technical architecture decisions.
- Include a GIF and video of a functional demo of your submission.
- Use the tools that allow you to do your best work, including AI editors.
- Please host your code in a public repository (e.g. GitHub) and reply all to this email with the link to your submission.