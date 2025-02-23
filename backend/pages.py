import ollama
from typing import List, Dict, Any
import os
from utils.chat_with_history import ChatWithHistory
from utils.chat_with_file import ChatWithFiles
from utils.chat_with_web import WebSearchRAG

class ModelData:
    def __init__(self):
        if not os.path.exists("./temp"):
            os.makedirs("./temp")
        self.model_list = ollama.list()
        self.model_names = [model.model for model in self.model_list.models]
        # Set default model to the last one in the list
        self.current_model = self.model_names[-1] if self.model_names else None

    def get_names(self):
        return self.model_names
    
    def set_model(self, current_model):
        if current_model in self.model_names:
            self.current_model = current_model
            return True
        return False

    def get_current_model(self):
        return self.current_model
   

    
class ChatPage:
    def __init__(self):
        self.model_data = ModelData()
        self.chat_history = ChatWithHistory(self.model_data)
        self.chat_files = ChatWithFiles(self.model_data)
        self.chat_web = WebSearchRAG(self.model_data)
    
    def ask(self, question: str, is_rag: bool = False) -> str:
        if is_rag:
            return self.chat_files.ask(question)
        return self.chat_history.ask(question)
    
    def get_models(self) -> Dict[str, List[str]]:
        return {"models": self.model_data.get_names()}
    
    def set_model(self, current_model):
        success = self.model_data.set_model(current_model)
        if success:
            # Reinitialize chat history with the same ModelData instance
            self.chat_history = ChatWithHistory(self.model_data)
            return {"success": True}
        return {"success": False}
    
    def get_current_model(self) -> Dict[str, str]:
        return {"get_current_model": self.model_data.get_current_model()}
    
    def add_document(self, file_path: str) -> bool:
        return self.chat_files.add_document(file_path)
    

    def perform_web_search(self, query: str) -> str:
        return self.chat_web.ask(query)
    
    def chat_with_file(self, query: str) -> str:
        return self.chat_files.ask(query)


class SettingsPage:
    def __init__(self):
        self.model_data = ModelData()
        self.chat_files = ChatWithFiles(self.model_data)
        self.web_search = WebSearchRAG(self.model_data)
    def get_rag_config(self) -> Dict[str, Any]:
        return {
            "embedding_model": self.chat_files.get_embedding_model(),
            "num_chunks": self.chat_files.get_num_chunks(),
            "chunk_size": self.chat_files.get_chunk_size(),
            "chunk_overlap": self.chat_files.get_chunk_overlap()
        }

    def update_rag_config(self, 
                         embedding_model: str = None,
                         num_chunks: int = None,
                         chunk_size: int = None,
                         chunk_overlap: int = None) -> None:
        if embedding_model:
            self.chat_files.set_embedding_model(embedding_model)
        if num_chunks:
            self.chat_files.set_num_chunks(num_chunks)
        if chunk_size:
            self.chat_files.set_chunk_size(chunk_size)
        if chunk_overlap:
            self.chat_files.set_chunk_overlap(chunk_overlap)

    def clear_vector_db(self):
        try:
            directories = ["../temp/vector_store", "../temp/web_vector_store"]
            for directory in directories:
                print(f"Checking existence of {directory}")
                if os.path.exists(directory):
                    print(f"Directory exists: {directory}")
                    os.rmdir(directory)
                    print(f"Successfully deleted {directory}")
                else:
                    print(f"Directory does not exist: {directory}")

            print("Vector stores removed successfully")

            # reinit vector stores
            self.chat_files.initialize_vector_store()
            self.web_search.initialize_vector_store()

            return True
        
        except Exception as e:
            print(f"Error removing vector stores: {str(e)}")
            return False

        