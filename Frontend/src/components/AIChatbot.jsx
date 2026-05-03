import React, { useState, useRef, useEffect } from 'react';
import { API_ENDPOINTS, apiRequest } from '../config/api';
import './AIChatbot.css';

// 🎨 Custom SVG Logo: Represents "Observation (Problem) -> Verification (Solution)"
const BrandLogo = ({ className = "logo-icon", checkColor = "#2563eb" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="45" cy="45" r="35" stroke="currentColor" strokeWidth="8" />
    <line x1="70" y1="70" x2="90" y2="90" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
    <path d="M30 45L40 55L65 35" stroke={checkColor} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const AIChatbot = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hello ${user?.name || 'there'}! I am CivicSense AI. How can I help you today?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      console.log('🤖 AI Chat request via apiRequest...');
      const data = await apiRequest(API_ENDPOINTS.AI_CHAT, {
        method: 'POST',
        body: JSON.stringify({
          messages: [...messages, userMessage]
        })
      });

      if (data.success) {
        // Add a small delay for natural feeling
        setTimeout(() => {
          setMessages(prev => [...prev, { role: 'assistant', content: data.data.reply }]);
          setIsLoading(false);
        }, 600);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.message || 'Sorry, I encountered an error. Please try again later.' }]);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: `Connection error: ${error.message}. Please check if the server is running.` }]);
      setIsLoading(false);
    }
  };

  return (
    <div className={`ai-chatbot-container ${isOpen ? 'open' : ''}`}>
      {/* Floating Toggle Button */}
      <button 
        className="chatbot-toggle" 
        onClick={() => setIsOpen(!isOpen)}
        title="CivicSense AI Assistant"
      >
        {isOpen ? '✕' : '🤖'}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-header-logo">
              <BrandLogo className="chatbot-logo-svg" checkColor="white" />
              <h3>CivicSense AI</h3>
            </div>
            <p>Your Civic Assistant</p>
          </div>

          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message-bubble ${msg.role}`}>
                {msg.content}
              </div>
            ))}
            {isLoading && (
              <div className="message-bubble assistant typing">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-area" onSubmit={handleSend}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about civic issues..."
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || !input.trim()}>
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AIChatbot;
