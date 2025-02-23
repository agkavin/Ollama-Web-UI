import json
import os
from typing import List, Dict, Any
from langchain_community.vectorstores import FAISS
from langchain_community.docstore.in_memory import InMemoryDocstore
from langchain_ollama import OllamaEmbeddings, ChatOllama
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain.docstore.document import Document
from langchain_community.document_loaders import PyMuPDFLoader
from duckduckgo_search import DDGS
from bs4 import BeautifulSoup
import requests
import html2text
import re
import faiss

class WebSearchRAG:
    def __init__(self,model_data,vector_store_dir: str = "../temp/web_search_vectors", config_path: str = "../config/config.json"):
        current_model = model_data.get_current_model()
        if not current_model:
            raise ValueError("No model selected")
        
        self.vector_store_dir = vector_store_dir
        self.config_path = config_path

        self.load_config()

        if not os.path.exists(self.config_path):
            self.save_config()
        
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
        self.setup_chain()

    def load_config(self):
        default_config = {
            "embedding_model": "nomic-embed-text",
            "num_chunks": 3,
            "chunk_size": 1000,
            "chunk_overlap": 100,
            "top_k": 3
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

    def setup_chain(self):
        prompt = ChatPromptTemplate.from_template("""
            Analyze the provided context from web search results and provide a comprehensive answer.
            Include relevant source URLs when making specific claims.
            
            Context: {context}
            Question: {question}
            
            Answer:
        """)

        def format_docs(docs):
            return "\n\n".join([f"{doc.page_content}\nSource: {doc.metadata.get('url', 'N/A')}" for doc in docs])

        retriever = self.vector_store.as_retriever(
            search_type="similarity",
            search_kwargs={'k': self.config["top_k"]}
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

    def get_top_k(self) -> int:
        return self.config["top_k"]

    def set_top_k(self, k: int) -> None:
        self.config["top_k"] = k
        self.save_config()
        self.setup_chain()

    def clean_text(self, text: str) -> str:
        """Clean extracted text"""
        text = re.sub(r"(\w)-\n(\w)", r"\1\2", text)
        text = re.sub(r"(?<!\n)\n(?!\n)", " ", text)
        text = re.sub(r"\n{2,}", "\n", text)
        return text

    def perform_web_search(self, query: str) -> List[Dict]:
        """Perform web search using DuckDuckGo"""
        search_results = []
        with DDGS() as ddgs:
            results = ddgs.text(query, backend="lite", max_results=self.config["top_k"])
            for r in results:
                search_results.append({
                    "title": r["title"],
                    "link": r["href"],
                    "snippet": r["body"]
                })
        return search_results

    def extract_web_content(self, url: str) -> tuple:
        """Extract and process web content"""
        try:
            response = requests.get(url, timeout=10)
            if response.status_code != 200:
                return None, None

            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Remove scripts and styles
            for script in soup(["script", "style"]):
                script.extract()

            # Convert to markdown
            h2t = html2text.HTML2Text()
            h2t.ignore_links = False
            h2t.ignore_images = True
            text = h2t.handle(str(soup))
            
            # Get metadata
            title = soup.title.string if soup.title else url
            metadata = {
                'title': title,
                'url': url
            }
            
            return self.clean_text(text), metadata
            
        except Exception as e:
            print(f"Error extracting content from {url}: {e}")
            return None, None

    def process_query(self, query: str, status_callback=None) -> dict:
        try:
            results = self.perform_web_search(query)
            print("websearch over , now extracting content")
            
            documents = []
            for result in results:
                url = result['link']
                content, metadata = self.extract_web_content(url)
                if content:
                    text_splitter = RecursiveCharacterTextSplitter(
                        chunk_size=1000,
                        chunk_overlap=200
                    )
                    chunks = text_splitter.split_text(content)
                    
                    for chunk in chunks:
                        doc = Document(page_content=chunk, metadata=metadata)
                        documents.append(doc)
            
            print("content extracted, adding to vector store")
            
            if documents:
                texts = [doc.page_content for doc in documents]
                metadatas = [doc.metadata for doc in documents]
                self.vector_store.add_texts(texts, metadatas=metadatas)
            
            res = self.chain.invoke(query)
            print("response: ", res)
            return res
            
        except Exception as e:
            return {"error": f"Error processing web search: {str(e)}"}

    def ask(self, question: str) -> dict:
        try:
            return self.process_query(question)
        except Exception as e:
            return {"error": f"Error generating response: {str(e)}"}

