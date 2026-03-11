'use client';

import { useState } from 'react';
import Image from 'next/image';
import FileUpload from '@/components/FileUpload';
import QuestionDisplay from '@/components/QuestionDisplay';
import { parseFile } from '@/lib/fileParser';
import { generateQuestions } from '@/lib/gemini';
import { Question } from '@/lib/types';

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '';
    setIsLoading(true);
    setError(null);
    setQuestions([]);

    try {
      const parsedFile = await parseFile(file);
      if (parsedFile.type === 'text' && !parsedFile.content) {
        throw new Error('Could not extract text from the file.');
      }
      const generatedQuestions = await generateQuestions(apiKey, parsedFile);
      if (generatedQuestions.length === 0) {
        throw new Error('No questions could be generated from this content.');
      }
      setQuestions(generatedQuestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const hasQuestions = questions.length > 0;

  if (hasQuestions) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <nav className="border-b border-white/10 px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl font-black bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Keleme
            </span>
            <span className="text-white/40 text-sm font-medium">Gibson Student Tool</span>
          </div>
          <button
            onClick={() => { setQuestions([]); setError(null); }}
            className="px-5 py-2 text-sm font-medium bg-white/10 hover:bg-white/20 rounded-full transition-colors border border-white/10"
          >
            ← New Exam
          </button>
        </nav>
        <div className="max-w-3xl mx-auto px-6 py-10 animate-fade-in">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white">Your Exam</h2>
            <p className="text-white/50 mt-1">{questions.length} questions generated</p>
          </div>
          <QuestionDisplay questions={questions} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden">

      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] bg-cyan-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-fuchsia-600/10 rounded-full blur-3xl" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 px-8 py-5 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <span className="text-4xl font-black bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
            Keleme
          </span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-sm text-white/60 font-medium">Science Fair Project</span>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left — Text */}
          <div className="animate-slide-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-full mb-6">
              <span className="text-violet-400 text-sm font-semibold">✦ Gibson High School</span>
            </div>

            <h1 className="text-6xl lg:text-7xl font-black leading-none mb-2">
              <span className="block text-white">Study</span>
              <span className="block bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                Smarter.
              </span>
            </h1>

            <div className="mt-4 mb-6">
              <span className="text-5xl lg:text-6xl font-black text-white/10 tracking-widest uppercase">
                KELEME
              </span>
            </div>

            <p className="text-lg text-white/60 leading-relaxed mb-8 max-w-md">
              Upload your notes, slides, or textbook pages — Keleme turns them into exam-ready multiple choice questions instantly.
            </p>

            {/* Stats */}
            <div className="flex gap-8 mb-10">
              {[
                { value: 'AI', label: 'Powered' },
                { value: '10+', label: 'File formats' },
                { value: 'Free', label: 'For students' },
              ].map(stat => (
                <div key={stat.label}>
                  <p className="text-2xl font-black text-white">{stat.value}</p>
                  <p className="text-sm text-white/40">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Format badges */}
            <div className="flex flex-wrap gap-2">
              {['PDF', 'PPTX', 'DOCX', 'TXT', 'JPG', 'PNG'].map(fmt => (
                <span key={fmt} className="px-3 py-1 bg-white/5 border border-white/10 text-white/50 text-xs font-bold rounded-full tracking-wider">
                  {fmt}
                </span>
              ))}
            </div>
          </div>

          {/* Right — Image */}
          <div className="animate-slide-right">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl animate-float">
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent z-10" />
              <div className="absolute inset-0 ring-1 ring-white/10 rounded-3xl z-20" />
              <Image
                src="https://images.unsplash.com/photo-1529390079861-591de354faf5?w=800&q=80"
                alt="Students studying"
                width={800}
                height={600}
                className="w-full h-[420px] object-cover"
                priority
              />
              {/* Floating badge on image */}
              <div className="absolute bottom-6 left-6 z-20 flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-xl flex items-center justify-center text-lg font-black">
                  K
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Keleme AI</p>
                  <p className="text-white/50 text-xs">Gibson Student Tool</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upload section */}
      <section className="relative z-10 max-w-3xl mx-auto px-8 py-12">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 animate-fade-up-delay2">
          <h2 className="text-2xl font-bold text-white text-center mb-2">
            Generate Your Exam Now
          </h2>
          <p className="text-white/40 text-center text-sm mb-8">
            Drop your study material below and get questions in seconds
          </p>

          {isLoading ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-14 w-14 border-4 border-violet-500 border-t-transparent mb-4" />
              <p className="text-white/60">Analyzing your document...</p>
              <p className="text-white/30 text-sm mt-1">This usually takes a few seconds</p>
            </div>
          ) : (
            <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
              {error}
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 max-w-4xl mx-auto px-8 py-12 animate-fade-up-delay3">
        <h2 className="text-3xl font-black text-center text-white mb-10">
          How it <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">works</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: '01', title: 'Upload', desc: 'Drop your PDF, PPTX, DOCX, or image file', icon: '📄' },
            { step: '02', title: 'AI Analyzes', desc: 'Keleme reads and understands your content', icon: '🤖' },
            { step: '03', title: 'Get Questions', desc: 'Receive ready-to-use multiple choice questions', icon: '✅' },
          ].map(item => (
            <div key={item.step} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-colors">
              <div className="text-3xl mb-4">{item.icon}</div>
              <div className="text-violet-400 text-xs font-black tracking-widest mb-2">STEP {item.step}</div>
              <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-white/40 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 text-center">
        <p className="text-4xl font-black bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent mb-1">
          GIBSON
        </p>
        <p className="text-white/30 text-sm">Keleme — Student Helping Tool — Science Fair Project</p>
      </footer>
    </div>
  );
}
