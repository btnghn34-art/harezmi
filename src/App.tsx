import { useState } from 'react';
import { Search, Book, Music, Film, Tv, AlertTriangle, ShieldCheck, Info, Loader2, ChevronRight, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeMedia } from './services/geminiService';
import { AnalysisResult, MediaType } from './types';
import { cn } from './lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import ReactMarkdown from 'react-markdown';

const MEDIA_TYPES: { value: MediaType; label: string; icon: any }[] = [
  { value: 'movie', label: 'Film', icon: Film },
  { value: 'tv-show', label: 'Dizi', icon: Tv },
  { value: 'book', label: 'Kitap', icon: Book },
  { value: 'song', label: 'Şarkı', icon: Music },
];

export default function App() {
  const [query, setQuery] = useState('');
  const [mediaType, setMediaType] = useState<MediaType>('movie');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeMedia(query, mediaType);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Analiz sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-emerald-500 bg-emerald-50 border-emerald-100';
    if (score < 60) return 'text-amber-500 bg-amber-50 border-amber-100';
    return 'text-rose-500 bg-rose-50 border-rose-100';
  };

  const getRiskLevel = (score: number) => {
    if (score < 30) return 'Düşük Risk';
    if (score < 60) return 'Orta Risk';
    return 'Yüksek Risk';
  };

  const chartData = result ? [
    { name: 'Zorbalık', score: result.categories.bullying.score, fill: '#f43f5e' },
    { name: 'Şiddet', score: result.categories.violence.score, fill: '#e11d48' },
    { name: 'Psikolojik', score: result.categories.psychological.score, fill: '#f59e0b' },
    { name: 'Kültürel', score: result.categories.cultural.score, fill: '#d97706' },
    { name: 'Hakaret', score: result.categories.insult.score, fill: '#ef4444' },
  ] : [];

  const [showAbout, setShowAbout] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] font-sans selection:bg-rose-100 selection:text-rose-900 scroll-smooth">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-8 h-8 bg-rose-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-rose-200">
              <ShieldCheck size={20} />
            </div>
            <h1 className="font-bold text-xl tracking-tight">Medya<span className="text-rose-600">Analiz</span></h1>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-gray-500">
            <button onClick={() => scrollToSection('nasil-calisir')} className="hover:text-rose-600 transition-colors">Nasıl Çalışır?</button>
            <button onClick={() => scrollToSection('kriterler')} className="hover:text-rose-600 transition-colors">Kriterler</button>
            <button onClick={() => setShowAbout(true)} className="hover:text-rose-600 transition-colors">Hakkımızda</button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* About Modal */}
        <AnimatePresence>
          {showAbout && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAbout(false)}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl"
              >
                <h3 className="text-2xl font-black mb-4">Hakkımızda</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  MedyaAnaliz, dijital dünyadaki içeriklerin çocuklar ve gençler üzerindeki etkilerini daha iyi anlamak için geliştirilmiş bir sosyal sorumluluk projesidir. 
                  Yapay zeka teknolojisini kullanarak, medya içeriklerindeki zorbalık ve şiddet unsurlarını sadece kelime bazlı değil, kültürel ve anlamsal bağlamda analiz ediyoruz.
                </p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 mt-1">
                      <ShieldCheck size={14} />
                    </div>
                    <p className="text-sm text-gray-500"><span className="font-bold text-gray-700">Güvenli Medya:</span> İçeriklerin risk seviyelerini şeffaf bir şekilde sunuyoruz.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-1">
                      <Info size={14} />
                    </div>
                    <p className="text-sm text-gray-500"><span className="font-bold text-gray-700">Kültürel Farkındalık:</span> Türkçe dilinin inceliklerini ve kültürel baskı unsurlarını dikkate alıyoruz.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAbout(false)}
                  className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Kapat
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        {/* Hero Section */}
        <section className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-center mb-6">
              <span className="px-4 py-1.5 bg-green-100 text-green-700 text-sm font-semibold rounded-full border border-green-200 shadow-sm flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Tamamen Ücretsiz Analiz
              </span>
            </div>
            <span className="inline-block px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-bold uppercase tracking-wider mb-4">
              Yapay Zeka Destekli Analiz
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold mb-6 tracking-tight leading-tight">
              Medya İçeriklerindeki <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-amber-600">
                Görünmez Riskleri Keşfedin
              </span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">
              Kitap, şarkı, film veya dizilerdeki zorbalık, şiddet ve kültürel baskı unsurlarını 
              Türkçe dilinin inceliklerini anlayan yapay zekamızla analiz edin.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div 
            className="mt-10 max-w-3xl mx-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <form onSubmit={handleSearch} className="relative group">
              <div className="flex flex-col sm:flex-row gap-3 p-2 bg-white rounded-2xl shadow-2xl shadow-gray-200 border border-gray-100 focus-within:border-rose-200 transition-all">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-rose-500 transition-colors" size={20} />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="İçerik adını yazın (Örn: Çalıkuşu, Fight Club...)"
                    className="w-full pl-12 pr-4 py-4 bg-transparent outline-none text-lg placeholder:text-gray-300"
                  />
                </div>
                <div className="flex gap-2 p-1 bg-gray-50 rounded-xl">
                  {MEDIA_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setMediaType(type.value)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                        mediaType === type.value 
                          ? "bg-white text-rose-600 shadow-sm" 
                          : "text-gray-500 hover:text-gray-700"
                      )}
                    >
                      <type.icon size={16} />
                      <span className="hidden md:inline">{type.label}</span>
                    </button>
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-4 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-rose-200"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : 'Analiz Et'}
                </button>
              </div>
            </form>
          </motion.div>
        </section>

        {/* Loading State */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 border-4 border-rose-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-rose-600 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <h3 className="text-xl font-bold mb-2">İçerik İnceleniyor...</h3>
              <p className="text-gray-500 animate-pulse">Yapay zeka verileri topluyor ve kültürel bağlamı analiz ediyor.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error State */}
        {error && (
          <div className="max-w-2xl mx-auto p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-4 text-rose-600">
            <AlertTriangle className="shrink-0 mt-1" size={20} />
            <div>
              <p className="font-bold">Hata Oluştu</p>
              <p className="text-sm opacity-90">{error}</p>
            </div>
          </div>
        )}

        {/* Results Section */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Summary Card */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-100">
                  <div className="flex items-start justify-between mb-8">
                    <div>
                      <h3 className="text-3xl font-black mb-2">{result.title}</h3>
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        {MEDIA_TYPES.find(t => t.value === result.type)?.icon({ size: 16 })}
                        <span className="capitalize">{result.type === 'tv-show' ? 'Dizi' : result.type === 'movie' ? 'Film' : result.type === 'book' ? 'Kitap' : 'Şarkı'}</span>
                      </div>
                    </div>
                    <div className={cn(
                      "px-6 py-3 rounded-2xl border-2 flex flex-col items-center justify-center",
                      getRiskColor(result.overallRisk)
                    )}>
                      <span className="text-4xl font-black leading-none">{result.overallRisk}%</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Genel Risk</span>
                    </div>
                  </div>

                  <div className="prose prose-rose max-w-none">
                    <h4 className="text-lg font-bold flex items-center gap-2 mb-4">
                      <Info size={18} className="text-rose-600" />
                      Analiz Özeti
                    </h4>
                    <div className="text-gray-600 leading-relaxed">
                      <ReactMarkdown>{result.detailedExplanation}</ReactMarkdown>
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-gray-50">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Riskli İfadeler & Temalar</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.riskyPhrases.map((phrase, i) => (
                        <span key={i} className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-sm border border-gray-100 italic">
                          "{phrase}"
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Age Recommendation */}
                  <div className="bg-rose-600 rounded-3xl p-8 text-white shadow-xl shadow-rose-200">
                    <h4 className="text-sm font-bold uppercase tracking-widest opacity-80 mb-4">Yaş Tavsiyesi</h4>
                    <p className="text-2xl font-black leading-tight">{result.ageRecommendation}</p>
                    <div className="mt-6 flex items-center gap-2 text-sm opacity-80">
                      <ShieldCheck size={16} />
                      <span>Ebeveyn denetimi önerilir</span>
                    </div>
                  </div>

                  {/* Category Breakdown Chart */}
                  <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl shadow-gray-100">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <BarChart3 size={16} />
                      Kategori Dağılımı
                    </h4>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical" margin={{ left: -20 }}>
                          <XAxis type="number" hide domain={[0, 100]} />
                          <YAxis 
                            dataKey="name" 
                            type="category" 
                            axisLine={false} 
                            tickLine={false}
                            tick={{ fontSize: 12, fontWeight: 600 }}
                          />
                          <Tooltip 
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          />
                          <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={20}>
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(result.categories).map(([key, cat]) => (
                  <div key={key} className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-rose-100 transition-all group">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="font-bold text-gray-900">{cat.label}</h5>
                      <span className={cn(
                        "text-xs font-bold px-2 py-1 rounded-md",
                        getRiskColor(cat.score)
                      )}>
                        {cat.score}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full mb-4 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${cat.score}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className={cn(
                          "h-full rounded-full",
                          cat.score < 30 ? "bg-emerald-500" : cat.score < 60 ? "bg-amber-500" : "bg-rose-500"
                        )}
                      />
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {cat.reason}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Initial Info / How it Works */}
        <div id="nasil-calisir" className="scroll-mt-24">
          {!result && !loading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
              <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
                  <Info size={24} />
                </div>
                <h4 className="text-lg font-bold mb-3">Kültürel Bağlam</h4>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Türkçedeki örtük zorbalık ifadelerini ve toplumsal baskı unsurlarını (mahalle baskısı, otoriter dil vb.) analiz eder.
                </p>
              </div>
              <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-6">
                  <AlertTriangle size={24} />
                </div>
                <h4 className="text-lg font-bold mb-3">Risk Tespiti</h4>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Sadece kelimelere değil, bağlama bakar. Şiddetin normalleştirilip normalleştirilmediğini ayırt eder.
                </p>
              </div>
              <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                  <ShieldCheck size={24} />
                </div>
                <h4 className="text-lg font-bold mb-3">Ebeveyn Rehberi</h4>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Çocuklar ve gençler için uygunluk değerlendirmesi yaparak ebeveynlere bilinçli tercihler için yol gösterir.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Criteria Section */}
        <section id="kriterler" className="mt-32 scroll-mt-24">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-black mb-4">Analiz Kriterlerimiz</h3>
            <p className="text-gray-500 max-w-xl mx-auto">Risk skorlaması yapılırken kullanılan temel eşikler ve anlamları.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-emerald-50/50 border border-emerald-100 p-6 rounded-2xl">
              <div className="text-emerald-600 font-black text-xl mb-2">0 - 30</div>
              <div className="font-bold text-emerald-800 mb-2">Düşük Risk</div>
              <p className="text-sm text-emerald-700/70">İçerik genel olarak güvenlidir. Zorbalık veya şiddet unsurları ya hiç yoktur ya da eğitici/eleştirel bir bağlamda sunulmuştur.</p>
            </div>
            <div className="bg-amber-50/50 border border-amber-100 p-6 rounded-2xl">
              <div className="text-amber-600 font-black text-xl mb-2">31 - 60</div>
              <div className="font-bold text-amber-800 mb-2">Orta Risk</div>
              <p className="text-sm text-amber-700/70">Bazı riskli ifadeler veya temalar mevcuttur. Ebeveynlerin çocuklarıyla birlikte değerlendirmesi önerilir.</p>
            </div>
            <div className="bg-rose-50/50 border border-rose-100 p-6 rounded-2xl">
              <div className="text-rose-600 font-black text-xl mb-2">61 - 100</div>
              <div className="font-bold text-rose-800 mb-2">Yüksek Risk</div>
              <p className="text-sm text-rose-700/70">Yoğun zorbalık, şiddet veya psikolojik baskı unsurları içerir. Genç izleyiciler için olumsuz rol model oluşturabilir.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-100 py-12 bg-white mt-20">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6 opacity-50">
            <ShieldCheck size={20} />
            <span className="font-bold">MedyaAnaliz</span>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Bu uygulama yapay zeka tarafından üretilen analizler sunar. <br />
            Sonuçlar bilgilendirme amaçlıdır ve kesin yargı içermez.
          </p>
          <div className="flex items-center justify-center gap-6 text-xs font-bold text-gray-300 uppercase tracking-widest">
            <a href="#" className="hover:text-rose-600 transition-colors">Gizlilik</a>
            <a href="#" className="hover:text-rose-600 transition-colors">Kullanım Şartları</a>
            <a href="#" className="hover:text-rose-600 transition-colors">API</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
