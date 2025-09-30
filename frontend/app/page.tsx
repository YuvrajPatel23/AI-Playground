'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [models, setModels] = useState([]);
  const [selectedModels, setSelectedModels] = useState([]);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('http://localhost:8000/api/comparison/models/available')
      .then(res => res.json())
      .then(data => {
        setModels(data);
        setSelectedModels([data[0].id, data[1].id]);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setResponses({});

    const res = await fetch('http://localhost:8000/api/comparison/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, models: selectedModels }),
    });

    const { sessionId } = await res.json();

    const eventSource = new EventSource(`http://localhost:8000/api/comparison/stream/${sessionId}`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      setResponses(prev => ({
        ...prev,
        [data.model]: {
          text: data.fullResponse || prev[data.model]?.text || '',
          status: data.status,
          tokens: data.tokensUsed || prev[data.model]?.tokens || 0,
          time: data.timeTaken || prev[data.model]?.time || 0,
          cost: data.cost || prev[data.model]?.cost || 0,
          error: data.error,
        }
      }));
    };

    eventSource.onerror = () => {
      eventSource.close();
      setLoading(false);
    };
  };

  const toggleModel = (modelId) => {
    if (selectedModels.includes(modelId)) {
      setSelectedModels(selectedModels.filter(id => id !== modelId));
    } else {
      setSelectedModels([...selectedModels, modelId]);
    }
  };

  return (
    <div style={{ padding: '30px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '10px', color: '#1a1a1a' }}>
          AI Model Playground
        </h1>
        <p style={{ fontSize: '16px', color: '#666' }}>
          Compare responses from multiple AI models side-by-side in real-time
        </p>
      </div>

      {/* Model Selection */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: '1px solid #e0e0e0'
      }}>
        <h3 style={{ fontSize: '16px', marginBottom: '15px', color: '#333' }}>
          Select Models to Compare:
        </h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {models.map(model => (
            <button
              key={model.id}
              onClick={() => toggleModel(model.id)}
              style={{
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: '500',
                backgroundColor: selectedModels.includes(model.id) ? '#2563eb' : '#f3f4f6',
                color: selectedModels.includes(model.id) ? 'white' : '#374151',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {model.name}
              <span style={{ marginLeft: '8px', opacity: 0.8, fontSize: '12px' }}>
                ({model.provider})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Prompt Input */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '30px' }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          border: '1px solid #e0e0e0'
        }}>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt here... (e.g., 'Explain quantum computing in simple terms')"
            style={{ 
              width: '100%', 
              height: '120px', 
              padding: '15px', 
              fontSize: '15px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
          />
          <button
            type="submit"
            disabled={loading || !prompt.trim() || selectedModels.length === 0}
            style={{
              marginTop: '15px',
              padding: '12px 30px',
              fontSize: '16px',
              fontWeight: '600',
              backgroundColor: loading ? '#9ca3af' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? '⏳ Processing...' : '🚀 Compare Models'}
          </button>
        </div>
      </form>

      {/* Responses */}
      {Object.keys(responses).length > 0 && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: selectedModels.length === 2 ? '1fr 1fr' : 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '20px',
        }}>
          {selectedModels.map(modelId => {
            const model = models.find(m => m.id === modelId);
            const response = responses[modelId];
            
            return (
              <div 
                key={modelId} 
                style={{ 
                  backgroundColor: 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  overflow: 'hidden',
                }}
              >
                {/* Model Header */}
                <div style={{ 
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  color: 'white',
                  padding: '20px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>
                      {model?.name}
                    </h3>
                    <span style={{ 
                      fontSize: '12px',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255,255,255,0.2)',
                    }}>
                      {response?.status === 'typing' && '💭 Thinking...'}
                      {response?.status === 'streaming' && '✨ Streaming...'}
                      {response?.status === 'complete' && '✅ Complete'}
                      {response?.status === 'error' && '❌ Error'}
                      {!response?.status && '⏳ Waiting...'}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', opacity: 0.9, margin: 0 }}>
                    {model?.provider}
                  </p>
                </div>

                {/* Response Content */}
                <div style={{ padding: '20px' }}>
                  {response?.error ? (
                    <div style={{ color: '#dc2626', fontSize: '14px' }}>
                      <strong>Error:</strong> {response.error}
                    </div>
                  ) : response?.text ? (
                    <div style={{ 
                      fontSize: '15px', 
                      lineHeight: '1.6',
                      color: '#374151',
                    }}>
                      <ReactMarkdown>{response.text}</ReactMarkdown>
                    </div>
                  ) : (
                    <div style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '14px' }}>
                      Waiting for response...
                    </div>
                  )}
                </div>

                {/* Metrics Footer */}
                {response?.status === 'complete' && (
                  <div style={{ 
                    borderTop: '1px solid #f3f4f6',
                    padding: '15px 20px',
                    backgroundColor: '#f9fafb',
                    display: 'flex',
                    justifyContent: 'space-around',
                    fontSize: '13px',
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#6b7280', marginBottom: '4px' }}>Tokens</div>
                      <div style={{ fontWeight: '600', color: '#2563eb' }}>
                        {response.tokens}
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#6b7280', marginBottom: '4px' }}>Time</div>
                      <div style={{ fontWeight: '600', color: '#059669' }}>
                        {(response.time / 1000).toFixed(2)}s
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#6b7280', marginBottom: '4px' }}>Cost</div>
                      <div style={{ fontWeight: '600', color: '#7c3aed' }}>
                        ${response.cost.toFixed(4)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}