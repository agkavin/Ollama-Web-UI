import ollama
from langchain_ollama import OllamaLLM
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

class ModelList:
    def __init__(self):
        self.model_list = ollama.list()
        self.model_names = [model.model for model in self.model_list.models]

    def get_names(self):
        return self.model_names
    
class ChatWithHistory:
    def __init__(self,model):
        self.llm_model = model
        self.llm = OllamaLLM(model=self.llm_model)
        self.chat_history = []

        self.prompt_template = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    "You are an AI named Marcus, you answer questions with simple answers",
                ),
                MessagesPlaceholder(variable_name="chat_history"),
                ("human", "{input}"),
            ]
        )

        self.chain = self.prompt_template | self.llm

    def ask(self, question):
            response = self.chain.invoke({"input": question, "chat_history": self.chat_history})
            self.chat_history.append(HumanMessage(content=question))
            self.chat_history.append(AIMessage(content=response))

            return response
    

class ChatPage:
    def __init__(self):
        self.llm_model_fallback = "llama3.1" 
        self.model_list = ModelList()
        self.chat_history = ChatWithHistory(model=self.llm_model_fallback)

    def ask(self, question):
        return self.chat_history.ask(question)
    
    def get_models(self):
        return {"models": self.model_list.get_names()}