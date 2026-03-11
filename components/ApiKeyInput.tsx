'use client';

import { useState, useEffect } from 'react';

interface ApiKeyInputProps {
  onApiKeyChange: (apiKey: string) => void;
}

export default function ApiKeyInput({ onApiKeyChange }: ApiKeyInputProps) {
  const [apiKey, setApiKey] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const savedKey = sessionStorage.getItem('openrouter_api_key');
    const envKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

    if (savedKey) {
      setApiKey(savedKey);
      onApiKeyChange(savedKey);
    } else if (envKey) {
      setApiKey(envKey);
      onApiKeyChange(envKey);
    }
  }, [onApiKeyChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setApiKey(value);
    sessionStorage.setItem('openrouter_api_key', value);
    onApiKeyChange(value);
  };

  const handleClear = () => {
    setApiKey('');
    sessionStorage.removeItem('openrouter_api_key');
    onApiKeyChange('');
  };

  return (
    <div className="w-full max-w-xl mx-auto mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        OpenRouter API Key
      </label>
      <div className="relative">
        <input
          type={isVisible ? 'text' : 'password'}
          value={apiKey}
          onChange={handleChange}
          placeholder="Enter your OpenRouter API key"
          className="w-full px-4 py-3 pr-24 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
          <button
            type="button"
            onClick={() => setIsVisible(!isVisible)}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            {isVisible ? 'Hide' : 'Show'}
          </button>
          {apiKey && (
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-800 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>
      <p className="mt-2 text-xs text-gray-500">
        Get your API key from{' '}
        <a
          href="https://openrouter.ai/keys"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          OpenRouter
        </a>
        . Your key is stored only in your browser session.
      </p>
    </div>
  );
}
