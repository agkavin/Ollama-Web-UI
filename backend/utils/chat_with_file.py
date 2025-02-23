import json
import os
from langchain_community.vectorstores import FAISS
from langchain_community.docstore.in_memory import InMemoryDocstore
from langchain_ollama import OllamaEmbeddings, ChatOllama
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_community.document_loaders import PyMuPDFLoader
import faiss

class ChatWithFiles:
    def __init__(self,model_data,vector_store_dir: str = "../temp/vector_store", config_path: str = "../temp/config.json"):
        current_model = model_data.get_current_model()
        if not current_model:
            raise ValueError("No model selected")
        
        self.vector_store_dir = vector_store_dir
        self.config_path = config_path
        self.load_config()
        
        self.embeddings = OllamaEmbeddings(
            model=self.config["embedding_model"],
            base_url="http://localhost:11434"
        )
        
        self.llm = ChatOllama(
            model=current_model,
            base_url="http://localhost:11434"
        )
        
        os.makedirs(vector_store_dir, exist_ok=True)
        self.initialize_vector_store()
        self.setup_rag_chain()

    def load_config(self):
        default_config = {
            "embedding_model": "nomic-embed-text",
            "num_chunks": 3,
            "chunk_size": 1000,
            "chunk_overlap": 100
        }
        
        if os.path.exists(self.config_path):
            with open(self.config_path, 'r') as f:
                self.config = {**default_config, **json.load(f)}
        else:
            self.config = default_config
            self.save_config()

    def save_config(self):
        with open(self.config_path, 'w') as f:
            json.dump(self.config, f)

    def initialize_vector_store(self):
        if os.path.exists(os.path.join(self.vector_store_dir, "index.faiss")):
            self.vector_store = FAISS.load_local(
                self.vector_store_dir,
                self.embeddings,
                allow_dangerous_deserialization=True
            )
        else:
            single_vector = self.embeddings.embed_query("dummy text")
            index = faiss.IndexFlatL2(len(single_vector))
            self.vector_store = FAISS(
                embedding_function=self.embeddings,
                index=index,
                docstore=InMemoryDocstore(),
                index_to_docstore_id={}
            )

    def setup_rag_chain(self):
        prompt = ChatPromptTemplate.from_template("""
            Answer the question based on the provided context. If you can't find 
            the answer in the context, say "I don't have enough information to answer that."
            
            Context: {context}
            Question: {question}
            
            Answer:
        """)

        def format_docs(docs):
            return "\n\n".join([doc.page_content for doc in docs])

        retriever = self.vector_store.as_retriever(
            search_type="similarity",
            search_kwargs={'k': self.config["num_chunks"]}
        )

        self.chain = (
            {
                "context": retriever | format_docs,
                "question": RunnablePassthrough()
            }
            | prompt
            | self.llm
            | StrOutputParser()
        )

    # Configuration getters and setters
    def get_embedding_model(self) -> str:
        return self.config["embedding_model"]

    def set_embedding_model(self, model: str) -> None:
        self.config["embedding_model"] = model
        self.save_config()
        self.embeddings = OllamaEmbeddings(model=model)
        self.initialize_vector_store()
        self.setup_rag_chain()

    def get_num_chunks(self) -> int:
        return self.config["num_chunks"]

    def set_num_chunks(self, num: int) -> None:
        self.config["num_chunks"] = num
        self.save_config()
        self.setup_rag_chain()

    def get_chunk_size(self) -> int:
        return self.config["chunk_size"]

    def set_chunk_size(self, size: int) -> None:
        self.config["chunk_size"] = size
        self.save_config()

    def get_chunk_overlap(self) -> int:
        return self.config["chunk_overlap"]

    def set_chunk_overlap(self, overlap: int) -> None:
        self.config["chunk_overlap"] = overlap
        self.save_config()

    def add_document(self, file_path: str) -> bool:
        try:
            if file_path.endswith(".pdf"):
                loader = PyMuPDFLoader(file_path)
                documents = loader.load()

            if documents is None or len(documents) == 0:
                raise ValueError("No documents found in the PDF file.")
            
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=self.config["chunk_size"],
                chunk_overlap=self.config["chunk_overlap"]
            )
            
            chunks = text_splitter.split_documents(documents)
            self.vector_store.add_documents(documents=chunks)
            self.vector_store.save_local(self.vector_store_dir)
            return True
        except Exception as e:
            print(f"Error processing document: {str(e)}")
            return False

    def ask(self, question: str) -> str:
        try:
            return self.chain.invoke(question)
        except Exception as e:
            return f"Error generating response: {str(e)}"
        

    