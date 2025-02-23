from langchain_ollama import OllamaLLM
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

class ChatWithHistory:
    def __init__(self, model_data):  # Accept ModelData instance as parameter
        current_model = model_data.get_current_model()
        if not current_model:
            raise ValueError("No model selected")
            
        self.llm = OllamaLLM(model=current_model)
        self.chat_history = []

        self.prompt_template = ChatPromptTemplate.from_messages([
            ("system", "You are an AI named Marcus, you answer questions with simple answers"),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{input}"),
        ])

        self.chain = self.prompt_template | self.llm

    def ask(self, question):
        response = self.chain.invoke({"input": question, "chat_history": self.chat_history})
        self.chat_history.append(HumanMessage(content=question))
        self.chat_history.append(AIMessage(content=response))
        return response