import React, { useState, useEffect, useRef } from "react";
import Navbar from "./Navbar";
import { FiSend, FiSearch, FiImage, FiFile } from "react-icons/fi";

const ChatComponent = ({ darkMode, setDarkMode, toggleSidebar }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedChat, setSelectedChat] = useState(localStorage.getItem("selectedChat") || "");
  const [isWebSearch, setIsWebSearch] = useState(false);
  const [isDocumentQA, setIsDocumentQA] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImageURL, setPreviewImageURL] = useState("");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  // const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const imageInputRef = useRef(null);
  const docInputRef = useRef(null);

  useEffect(() => {
    if (!selectedChat) return;
    const storedMessages = localStorage.getItem(selectedChat);
    if (storedMessages) {
      try {
        const parsedMessages = JSON.parse(storedMessages);
        // Filter out any null messages
        const validMessages = parsedMessages.filter(msg => msg && msg.content);
        setMessages(validMessages);
      } catch (error) {
        console.error("Error parsing stored messages:", error);
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
  }, [selectedChat]);
  useEffect(() => {
    const handleStorageChange = () => {
      setSelectedChat(localStorage.getItem("selectedChat") || "");
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);



  useEffect(() => {
    const storedDocs = localStorage.getItem("uploadedDocuments");
    if (storedDocs) {
      try {
        setUploadedDocuments(JSON.parse(storedDocs));
      } catch (error) {
        console.error("Error parsing stored documents:", error);
      }
    }
  }, []);

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const validImageTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!validImageTypes.includes(file.type)) {
        alert("Only JPG, JPEG, and PNG images are allowed!");
        return;
      }
      setSelectedImage(file);
      setPreviewImageURL(URL.createObjectURL(file));
    }
  };

  const handleDocumentChange = (event) => {
    const file = event.target.files[0];
    console.log(file);
    if (file) {
      if (file.type !== "application/pdf") {
        alert("Only PDF files are allowed!");
        return;
      }
      setSelectedDocument(file);

    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!input.trim() && !selectedImage && !selectedDocument) {
      alert("Please provide some text, image, or document before sending.");
      return;
    }

    try {
      let response;
      let newMessage;
      const userMessage = { role: "user", content: input || "Uploaded a document" };

      if (isWebSearch) {
        response = await fetch("http://192.168.12.1:8000/perform-web-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: input }),
        });
        const data = await response.json();
        newMessage = { role: "assistant", content: data.reply || "No response available." };
      } else if (isDocumentQA ) {
        const response = await fetch("http://192.168.12.1:8000/chat-with-file", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ request: input }),
        });
        const data = await response.json();
        newMessage = { role: "assistant", content: data.response || "No response available." };
      } else {
        if (input) {
          response = await fetch("http://192.168.12.1:8000/ask", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: input }),
          });
          const data = await response.json();
          newMessage = { role: "assistant", content: data.text || "No response available." };
        }

        if (selectedImage) {
          const base64Image = await convertFileToBase64(selectedImage);
          await fetch("http://192.168.12.1:8000/add-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: base64Image }),
          });
        }

        if (selectedDocument) {
          console.log(selectedDocument);
        const formData = new FormData();
        formData.append("file", selectedDocument);
        try {
          const response = await fetch("http://192.168.12.1:8000/add-document", {
            method: "POST",
            body: formData, // Send FormData instead of JSON
          });
        
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);

          }
        
          const data = await response.json(); 
          // if(data.success){
          //   alert("Document uploaded successfully!");
          // }
          console.log(data);// Parse JSON response from backend
          console.log("Server Response:", data);
          newMessage = { role: "assistant", content: "Document Uploaded Successfully, use Document Q&A and ask Further Questions" };
        } catch (error) {
          console.error("Error uploading PDF:", error);
        }
        
        }
      }

      const validMessages = messages.filter(msg => msg && msg.content);
      const newMessages = [
        ...validMessages,
        userMessage,
        newMessage,
      ].filter(msg => msg && msg.content);

      setMessages(newMessages);
      localStorage.setItem(selectedChat, JSON.stringify(newMessages));
      
      setInput("");
      setSelectedImage(null);
      setPreviewImageURL("");
      setSelectedDocument(null);
      
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div
      className={`flex flex-col h-screen ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      <Navbar
            toggleSidebar={toggleSidebar}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
          />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.filter(msg => msg && msg.content).map((message, index) => (
          <div
            key={index}
            className={`flex items-center ${
              message.role === "assistant" ? "justify-start" : "justify-end"
            }`}
          >
            <div
              className={`max-w-xs md:max-w-md p-3 rounded-2xl shadow-md ${
                message.role === "assistant"
                  ? "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white"
                  : "bg-blue-500 text-white dark:bg-blue-600"
              }`}
            >
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        ))}
      </div>

      {(previewImageURL || selectedDocument) && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800">
          {previewImageURL && (
            <div className="relative inline-block">
              <img
                src={previewImageURL}
                alt="Preview"
                className="max-h-32 rounded"
              />
              <button
                onClick={() => {
                  setSelectedImage(null);
                  setPreviewImageURL("");
                }}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
              >
                ×
              </button>
            </div>
          )}
          {selectedDocument && (
            <div className="inline-flex items-center bg-gray-200 dark:bg-gray-700 rounded p-2">
              <FiFile className="mr-2" />
              <span>{selectedDocument.name}</span>
              <button
                onClick={() => setSelectedDocument(null)}
                className="ml-2 text-red-500"
              >
                ×
              </button>
            </div>
          )}
        </div>
      )}

      <div className="p-4 border-t bg-white dark:bg-gray-800">
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              onClick={() => {
                setIsWebSearch(!isWebSearch);
                setIsDocumentQA(false);
              }}
              className={`px-3 py-1 rounded-full text-sm ${
                isWebSearch
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
              <FiSearch className="inline mr-1" />
              {isWebSearch ? "Web Search On" : "Web Search Off"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsDocumentQA(!isDocumentQA);
                setIsWebSearch(false);
              }}
              className={`px-3 py-1 rounded-full text-sm ${
                isDocumentQA
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
              <FiFile className="inline mr-1" />
              {isDocumentQA ? "Doc Q&A On" : "Doc Q&A Off"}
            </button>
            <input
              type="file"
              ref={imageInputRef}
              onChange={handleImageChange}
              accept="image/jpeg,image/png,image/jpg"
              className="hidden"
            />
            <input
              type="file"
              ref={docInputRef}
              onChange={handleDocumentChange}
              accept="application/pdf"
              className="hidden"
            />
            
            <button
              type="button"
              onClick={() => docInputRef.current.click()}
              className="p-2 rounded-full bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
            >
              <FiFile />
            </button>
          </div>
          <div className="relative flex items-center w-full">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full p-3 pr-12 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              placeholder={isDocumentQA ? "Ask a question about your documents..." : "Type your message..."}
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              <FiSend size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatComponent;