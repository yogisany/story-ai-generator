import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Image as ImageIcon, Volume2, Download, RefreshCw, Loader2, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';
import { generateIllustration, generateNarration } from '../lib/gemini';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { cn } from '../lib/utils';

export const BookPreview = () => {
  const { currentBook, updatePage, setLoading, isLoading } = useStore();
  const [currentPage, setCurrentPage] = useState(0); // 0 is cover, 1+ are pages
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);

  if (!currentBook) return null;

  const totalPages = currentBook.pages.length;

  const handleGenerateAllImages = async () => {
    if (!currentBook) return;
    setIsBatchGenerating(true);
    setBatchProgress(0);
    
    const pagesToGenerate = currentBook.pages.filter(p => !p.illustrationUrl);
    if (pagesToGenerate.length === 0) {
      setIsBatchGenerating(false);
      return;
    }

    let completed = 0;
    for (const page of pagesToGenerate) {
      try {
        const url = await generateIllustration(page.illustrationPrompt);
        if (url) {
          updatePage(page.id, { illustrationUrl: url });
        }
      } catch (err) {
        console.error(`Failed to generate image for page ${page.pageNumber}:`, err);
      }
      completed++;
      setBatchProgress(Math.round((completed / pagesToGenerate.length) * 100));
    }
    
    setIsBatchGenerating(false);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrev = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const handleGenerateImage = async (pageIndex: number) => {
    const page = currentBook.pages[pageIndex];
    setIsGeneratingImg(true);
    try {
      const url = await generateIllustration(page.illustrationPrompt);
      if (url) {
        updatePage(page.id, { illustrationUrl: url });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingImg(false);
    }
  };

  const handleNarration = async (pageIndex: number) => {
    const page = currentBook.pages[pageIndex];
    setIsNarrating(true);
    try {
      const url = await generateNarration(page.content);
      if (url) {
        updatePage(page.id, { narrationUrl: url });
        const audio = new Audio(url);
        audio.play();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsNarrating(false);
    }
  };

  const exportToPDF = async () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const element = document.getElementById('book-content');
    if (!element) return;

    setLoading(true);
    try {
      // Simple PDF generation: one page at a time
      // For a real app, we'd loop through all pages and render them off-screen
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL('image/png');
      const imgProps = doc.getImageProperties(imgData);
      const pdfWidth = doc.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      doc.save(`${currentBook.title}.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{currentBook.title}</h1>
          <p className="text-gray-500">Theme: {currentBook.theme} • Age: {currentBook.targetAge}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleGenerateAllImages}
            disabled={isBatchGenerating}
            className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-2xl font-bold hover:bg-amber-600 transition-all disabled:opacity-50"
          >
            {isBatchGenerating ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                {batchProgress}%
              </>
            ) : (
              <>
                <Sparkles size={20} /> Generate All Images
              </>
            )}
          </button>
          <button 
            onClick={exportToPDF}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all"
          >
            <Download size={20} /> Export PDF
          </button>
        </div>
      </div>

      <div className="relative group">
        <div id="book-content" className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border-8 border-white min-h-[600px] flex flex-col md:flex-row">
          <AnimatePresence mode="wait">
            {currentPage === 0 ? (
              <motion.div
                key="cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex flex-col items-center justify-center p-12 bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-center"
              >
                {currentBook.coverUrl ? (
                  <img 
                    src={currentBook.coverUrl} 
                    className="w-full max-w-md aspect-square object-cover rounded-2xl shadow-xl mb-8 border-4 border-white/20"
                    alt="Cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full max-w-md aspect-square bg-white/10 rounded-2xl flex items-center justify-center mb-8">
                    <ImageIcon size={64} className="opacity-20" />
                  </div>
                )}
                <h2 className="text-5xl font-black mb-4 tracking-tight leading-tight">{currentBook.title}</h2>
                <div className="px-6 py-2 bg-white/20 rounded-full text-sm font-bold uppercase tracking-widest">
                  A Story for {currentBook.targetAge} Years Old
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={`page-${currentPage}`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="w-full flex flex-col md:flex-row"
              >
                {/* Illustration Side */}
                <div className="flex-1 bg-gray-50 p-8 flex flex-col items-center justify-center relative min-h-[400px]">
                  {currentBook.pages[currentPage - 1].illustrationUrl ? (
                    <div className="relative group/img w-full h-full">
                      <img 
                        src={currentBook.pages[currentPage - 1].illustrationUrl!} 
                        className="w-full h-full object-cover rounded-3xl shadow-lg border-4 border-white"
                        alt={`Page ${currentPage}`}
                        referrerPolicy="no-referrer"
                      />
                      <button 
                        onClick={() => handleGenerateImage(currentPage - 1)}
                        className="absolute bottom-4 right-4 p-3 bg-white/90 backdrop-blur rounded-xl shadow-lg text-indigo-600 opacity-0 group-hover/img:opacity-100 transition-all hover:scale-110"
                      >
                        <RefreshCw size={20} />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center mx-auto text-indigo-500">
                        <ImageIcon size={48} />
                      </div>
                      <p className="text-gray-500 font-medium">No illustration yet</p>
                      <button 
                        onClick={() => handleGenerateImage(currentPage - 1)}
                        disabled={isGeneratingImg}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {isGeneratingImg ? <Loader2 className="animate-spin" size={20} /> : <Wand2 size={20} />}
                        Generate Illustration
                      </button>
                    </div>
                  )}
                </div>

                {/* Text Side */}
                <div className="flex-1 p-12 flex flex-col justify-center bg-white">
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-sm font-bold text-indigo-500 uppercase tracking-widest">Page {currentPage}</span>
                    <button 
                      onClick={() => handleNarration(currentPage - 1)}
                      disabled={isNarrating}
                      className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all disabled:opacity-50"
                    >
                      {isNarrating ? <Loader2 className="animate-spin" size={20} /> : <Volume2 size={20} />}
                    </button>
                  </div>
                  <p className="text-2xl text-gray-800 leading-relaxed font-medium font-serif">
                    {currentBook.pages[currentPage - 1].content}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Controls */}
        <button 
          onClick={handlePrev}
          disabled={currentPage === 0}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-white/90 backdrop-blur rounded-full shadow-xl text-gray-800 hover:scale-110 disabled:opacity-0 transition-all z-10"
        >
          <ChevronLeft size={32} />
        </button>
        <button 
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-white/90 backdrop-blur rounded-full shadow-xl text-gray-800 hover:scale-110 disabled:opacity-0 transition-all z-10"
        >
          <ChevronRight size={32} />
        </button>
      </div>

      {/* Page Thumbnails */}
      <div className="mt-12 flex gap-4 overflow-x-auto pb-4 px-2">
        <button 
          onClick={() => setCurrentPage(0)}
          className={cn(
            "flex-shrink-0 w-24 aspect-[3/4] rounded-xl border-4 transition-all overflow-hidden",
            currentPage === 0 ? "border-indigo-500 scale-105 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"
          )}
        >
          <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">COVER</div>
        </button>
        {currentBook.pages.map((p, i) => (
          <button 
            key={p.id}
            onClick={() => setCurrentPage(i + 1)}
            className={cn(
              "flex-shrink-0 w-24 aspect-[3/4] rounded-xl border-4 transition-all overflow-hidden relative",
              currentPage === i + 1 ? "border-indigo-500 scale-105 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"
            )}
          >
            {p.illustrationUrl ? (
              <img src={p.illustrationUrl} className="w-full h-full object-cover" alt={`P${i+1}`} />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">{i + 1}</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

const Wand2 = ({ size }: { size: number }) => <Sparkles size={size} />;
