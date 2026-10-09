import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Printer,
  Leaf,
  Database,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
  Zap,
  Box,
  Clock,
  Gauge,
  Globe,
  Upload,
  PlusCircle,
  Factory,
  RotateCcw,
  Truck,
  Cpu,
  Layers,
  Thermometer,
  ShieldCheck,
  Sparkles,
  Activity
} from 'lucide-react';
import { supabase } from './supabaseClient';

interface FilamentGrade {
  name: string;
  temp: string;
  resistance: string;
  idealFor: string;
  colors: number;
}

const filamentGrades: FilamentGrade[] = [
  {
    name: 'PLA Flexy Green',
    temp: '190 - 225 ºC',
    resistance: '65 MPa (Tração) | Rigidez Elevada',
    idealFor: 'Prototipagem rápida, componentes de acabamento e peças estéticas',
    colors: 15
  },
  {
    name: 'ABS Flexy Green',
    temp: '220 - 245 ºC',
    resistance: 'Térmica até 85 ºC | Impacto 100-300 J/m',
    idealFor: 'Componentes funcionais de motor, protótipos industriais e ferramentas',
    colors: 7
  },
  {
    name: 'ASA Flexy Green',
    temp: '240 - 260 ºC',
    resistance: 'Proteção UV 1000+ hrs | Retenção de cor 98%',
    idealFor: 'Aplicações externas permanentes, carenagens e sinalização',
    colors: 1
  },
  {
    name: 'TPU Flexy Green',
    temp: '200 - 250 ºC',
    resistance: 'Flexibilidade Extrema | Alta Absorção de Impacto',
    idealFor: 'Vedações, buchas de suspensão, coxins e protetores flexíveis',
    colors: 4
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'scanner' | 'cadastro' | 'hub3d' | 'flexy' | 'esg'>('home');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState<any | null>(null);
  const [dbRecords, setDbRecords] = useState<any[]>([]);
  const [loadingDb, setLoadingDb] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const [newPart, setNewPart] = useState({
    nome_peca: '',
    modelo_caminhao: '',
    ano_fabricacao: 2020,
    material_biodegradavel: 'Filamento de Algas Marinhas (Bio-PA)',
    co2_economizado: '12.5 kg CO₂',
    imagem_url: ''
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const fetchRecords = async () => {
    setLoadingDb(true);
    const { data, error } = await supabase
      .from('relatorio_pecas')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setDbRecords(data);
    }
    setLoadingDb(false);
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // Cleanup da câmera ao desmontar / trocar de aba
  useEffect(() => {
    if (activeTab !== 'scanner') {
      stopCamera();
    }
  }, [activeTab]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });

      streamRef.current = stream;

      // Aguarda o próximo frame para garantir que o <video> esteja montado no DOM
      requestAnimationFrame(async () => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          try {
            await videoRef.current.play();
            setCameraActive(true);
          } catch (playErr) {
            console.error('Erro ao dar play no vídeo:', playErr);
            setCameraError('Não foi possível iniciar o vídeo. Tente novamente.');
            stopCamera();
          }
        }
      });
    } catch (err: any) {
      console.error(err);
      let msg = 'Erro ao conectar a câmera.';
      if (err.name === 'NotAllowedError') msg = 'Permissão de câmera negada. Autorize o acesso nas configurações do navegador.';
      if (err.name === 'NotFoundError') msg = 'Nenhuma câmera encontrada neste dispositivo.';
      if (err.name === 'NotReadableError') msg = 'A câmera está sendo usada por outro aplicativo.';
      setCameraError(msg + ' Você pode enviar uma foto como alternativa.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
      stopCamera();
    }
  };

  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScannedResult({
        nome_peca: newPart.nome_peca || 'DEFLETOR DE AR IVECO',
        modelo_caminhao: newPart.modelo_caminhao || 'IVECO Stralis 600',
        ano_fabricacao: newPart.ano_fabricacao || 2025,
        tempo_em_uso: '8 Anos em Operação (~480.000 km)',
        saude_percentual: 35,
        saude_status: '35% - Degradação Crítica',
        motivo_substituicao: 'Peça ressecada, trincada e fora de linha comercial.',
        material_biodegradavel: newPart.material_biodegradavel || 'Flexy Green Pro (Algal-PA)',
        co2_economizado: newPart.co2_economizado || '12.8 kg CO₂',
        imagem_url: filePreview || newPart.imagem_url || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'
      });
      stopCamera();
    }, 2200);
  };

  const handleCreateCatalogPart = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('relatorio_pecas').insert([
      {
        nome_peca: newPart.nome_peca,
        modelo_caminhao: newPart.modelo_caminhao,
        ano_fabricacao: newPart.ano_fabricacao,
        saude_peca: '100% - Novo no Catálogo',
        status_producao: 'Cadastrado no Catálogo',
        material_biodegradavel: newPart.material_biodegradavel,
        co2_economizado: newPart.co2_economizado
      }
    ]);

    if (error) {
      alert('Erro ao cadastrar no Supabase!');
    } else {
      showToast('Nova peça cadastrada no catálogo com sucesso!');
      setNewPart({
        nome_peca: '',
        modelo_caminhao: '',
        ano_fabricacao: 2020,
        material_biodegradavel: 'Filamento de Algas Marinhas (Bio-PA)',
        co2_economizado: '12.5 kg CO₂',
        imagem_url: ''
      });
      fetchRecords();
      setActiveTab('scanner');
    }
  };

  const handleSendToPrinter = async (part: any) => {
    const { error } = await supabase.from('relatorio_pecas').insert([
      {
        nome_peca: part.nome_peca,
        modelo_caminhao: part.modelo_caminhao,
        ano_fabricacao: part.ano_fabricacao,
        saude_peca: part.saude_status,
        status_producao: 'Em Impressão 3D',
        material_biodegradavel: part.material_biodegradavel,
        co2_economizado: part.co2_economizado
      }
    ]);

    if (error) {
      alert('Erro ao registrar no Supabase!');
    } else {
      showToast('Enviado com sucesso para a Fila de Impressão 3D!');
      setScannedResult(null);
      setFilePreview(null);
      fetchRecords();
      setActiveTab('hub3d');
    }
  };

  const navItems: { id: typeof activeTab; label: string; icon: any }[] = [
    { id: 'home', label: 'Início', icon: null },
    { id: 'scanner', label: 'Scanner', icon: Camera },
    { id: 'flexy', label: 'Flexy Green', icon: Layers },
    { id: 'cadastro', label: 'Cadastrar', icon: PlusCircle },
    { id: 'hub3d', label: `Hub 3D (${dbRecords.length})`, icon: Printer },
    { id: 'esg', label: 'ODS & ESG', icon: Leaf },
  ];

  return (
    <div className="min-h-screen bg-[#060A12] text-slate-100 font-sans flex flex-col selection:bg-emerald-500 selection:text-slate-950">

      {/* NOTIFICAÇÃO TOAST */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-500 text-slate-950 font-bold text-sm sm:text-base px-6 py-3.5 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center gap-3 animate-bounce border border-emerald-300">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* CABEÇALHO FUTURISTA */}
      <header className="bg-[#0B111E]/90 border-b border-emerald-500/20 px-4 sm:px-6 lg:px-8 py-3 sticky top-0 z-40 backdrop-blur-md shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-3 lg:gap-6">

          {/* Logo + Título */}
          <div
            className="flex items-center gap-3 cursor-pointer w-full lg:w-auto justify-center lg:justify-start"
            onClick={() => setActiveTab('home')}
          >
            <div className="bg-emerald-500/10 border border-emerald-400/40 text-emerald-400 font-black text-xs px-3.5 py-1.5 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.15)] uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              ECOFICINA 4.0
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-2 border-l border-slate-800 pl-3">
              <span>INOVAÇÃO</span> • <span>SUSTENTABILIDADE</span> • <span className="text-emerald-400 font-bold">IVECO</span>
            </div>
          </div>

          {/* Navegação */}
          <nav className="flex w-full lg:w-auto overflow-x-auto gap-1 bg-[#060A12] p-1.5 rounded-xl border border-emerald-500/20 scrollbar-thin">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`whitespace-nowrap px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-2 justify-center flex-shrink-0 ${
                  activeTab === id
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-400/50 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" />}
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">

        {/* ABA 1: HOME */}
        {activeTab === 'home' && (
          <div className="space-y-8">
            <div className="relative rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-[#0B111E] via-[#0E1729] to-[#0B111E] p-6 sm:p-10 overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.6)]">
              <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-5">
                  <span className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 text-xs font-bold px-3.5 py-1 rounded-full border border-emerald-500/30">
                    <Zap className="w-3.5 h-3.5" /> GESTÃO DIGITAL DE ESTOQUE & DADOS
                  </span>

                  <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                    ESTOQUE <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">INTELLIGENTE</span>
                  </h1>

                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
                    Do armazenamento físico para uma gestão digital e rastreável. Substituição instantânea de componentes obsoletos por meio da manufatura aditiva com filamento orgânico.
                  </p>

                  <div className="flex flex-wrap gap-4 pt-2">
                    <button
                      onClick={() => setActiveTab('scanner')}
                      className="bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-sm px-6 py-3.5 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.35)] flex items-center gap-2 transition"
                    >
                      <Camera className="w-4 h-4" /> INICIAR SCANNER + IA
                    </button>
                    <button
                      onClick={() => setActiveTab('flexy')}
                      className="bg-slate-900/80 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 font-bold text-sm px-6 py-3.5 rounded-xl transition"
                    >
                      VER MATERIAL FLEXY GREEN
                    </button>
                  </div>
                </div>

                {/* Card de Peça Rastreável Simulada estilo Imagem 1 */}
                <div className="lg:col-span-5 bg-[#060A12]/90 border border-emerald-500/30 rounded-2xl p-5 backdrop-blur-md space-y-4 shadow-[0_0_25px_rgba(0,0,0,0.5)]">
                  <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">CÓDIGO DA PEÇA</span>
                      <strong className="text-white font-bold text-base">AC-1587</strong>
                    </div>
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 text-xs font-bold px-2.5 py-1 rounded-md">
                      ● DISPONÍVEL
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">MODELO</span>
                      <span className="text-slate-200 font-bold">Defletor de ar</span>
                    </div>
                    <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">MATERIAL</span>
                      <span className="text-emerald-400 font-bold">PP + Algas Marinhas</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-800 pt-3 flex justify-between items-center text-xs">
                    <span className="text-slate-400">HISTÓRICO DIGITAL:</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5"/> Inspeção OK</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#0B111E] border border-emerald-500/20 rounded-2xl p-6 space-y-3 hover:border-emerald-500/40 transition">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Box className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-white">DISPONIBILIDADE</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Visualizar quais componentes estão disponíveis e quais precisam ser produzidos sob demanda na rede local.
                </p>
              </div>

              <div className="bg-[#0B111E] border border-emerald-500/20 rounded-2xl p-6 space-y-3 hover:border-emerald-500/40 transition">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-white">RASTREABILIDADE</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Registrar modelo, material, lote, parâmetros de impressão, aplicação veicular e histórico completo da peça.
                </p>
              </div>

              <div className="bg-[#0B111E] border border-emerald-500/20 rounded-2xl p-6 space-y-3 hover:border-emerald-500/40 transition">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Printer className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-white">PRODUÇÃO SOB DEMANDA</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Identificar a necessidade e acionar a manufatura aditiva quando necessário, reduzindo estoques físicos desnecessários.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: SCANNER IA */}
        {activeTab === 'scanner' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-[#0B111E] border border-emerald-500/30 p-6 rounded-2xl space-y-2">
              <span className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30 uppercase">
                Reconhecimento Visual & Visão Computacional
              </span>
              <h2 className="text-2xl font-black text-white">Scanner / Upload de Componentes</h2>
              <p className="text-sm text-slate-300">Aponte a câmera ao vivo ou envie uma foto da peça para efetuar a comparação com o catálogo Supabase.</p>
            </div>

            <div className="bg-[#0B111E] border border-slate-800 rounded-2xl p-6 space-y-6">
              {cameraError && (
                <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl text-red-300 text-xs font-medium">
                  {cameraError}
                </div>
              )}

              <div className="bg-[#060A12] border-2 border-dashed border-emerald-500/30 rounded-2xl min-h-[300px] flex flex-col items-center justify-center relative overflow-hidden p-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-72 object-cover rounded-xl ${
                    cameraActive && !isScanning && !filePreview ? 'block' : 'hidden'
                  }`}
                />

                {filePreview && !cameraActive && !isScanning && (
                  <div className="relative w-full h-72 flex items-center justify-center">
                    <img src={filePreview} alt="Preview da peça" className="max-h-full max-w-full object-contain rounded-xl" />
                    <button
                      onClick={() => setFilePreview(null)}
                      className="absolute top-2 right-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow">
                      Remover Foto
                    </button>
                  </div>
                )}

                {!cameraActive && !filePreview && !isScanning && !scannedResult && (
                  <div className="text-center space-y-3 py-8">
                    <div className="w-16 h-16 bg-slate-900 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
                      <Camera className="w-8 h-8" />
                    </div>
                    <p className="text-xs text-slate-300 font-medium">Ligue a câmera ou envie uma foto do componente</p>
                  </div>
                )}

                {isScanning && (
                  <div className="text-center space-y-3 py-12">
                    <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin mx-auto" />
                    <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Comparando imagem no Supabase...</p>
                  </div>
                )}
              </div>

              {!isScanning && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={cameraActive ? stopCamera : startCamera}
                    className="bg-slate-900 hover:bg-slate-800 text-slate-100 font-bold text-xs py-3.5 px-6 rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition">
                    <Camera className="w-4 h-4 text-emerald-400" />
                    <span>{cameraActive ? 'Desligar Câmera' : 'Usar Câmera ao Vivo'}</span>
                  </button>

                  <label className="bg-slate-900 hover:bg-slate-800 text-slate-100 font-bold text-xs py-3.5 px-6 rounded-xl border border-slate-700 flex items-center justify-center gap-2 cursor-pointer transition">
                    <Upload className="w-4 h-4 text-emerald-400" />
                    <span>Enviar Foto da Peça</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              )}

              {(cameraActive || filePreview) && !isScanning && (
                <button
                  onClick={handleSimulateScan}
                  className="w-full bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-sm py-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 transition">
                  <Zap className="w-4 h-4 fill-slate-950" />
                  <span>IDENTIFICAR E ANALISAR COMPONENTE</span>
                </button>
              )}
            </div>

            {scannedResult && (
              <div className="bg-[#0B111E] border border-emerald-500/40 rounded-2xl p-6 space-y-5 shadow-2xl">
                <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase block">RECONHECIDO NO SUPABASE</span>
                    <h3 className="font-bold text-xl text-white">{scannedResult.nome_peca}</h3>
                  </div>
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-400/40 text-xs font-bold px-3 py-1 rounded-lg">
                    {scannedResult.saude_status}
                  </span>
                </div>

                {/* Inspeção em Estilo HUD (Como na Imagem 2) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs border-b border-slate-800 pb-4">
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">Dimensões</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5"/> OK</span>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">Geometria</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5"/> OK</span>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">Encaixe</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5"/> OK</span>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">Acabamento</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5"/> OK</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block font-medium">Veículo</span>
                    <strong className="text-white block font-bold mt-1">{scannedResult.modelo_caminhao}</strong>
                  </div>

                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block font-medium">Uso Acumulado</span>
                    <strong className="text-amber-300 block font-bold mt-1">{scannedResult.tempo_em_uso}</strong>
                  </div>

                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block font-medium">Material Recomendado</span>
                    <strong className="text-emerald-400 block font-bold mt-1">{scannedResult.material_biodegradavel}</strong>
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    onClick={() => { setScannedResult(null); setFilePreview(null); }}
                    className="flex-1 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition">
                    Nova Consulta
                  </button>
                  <button
                    onClick={() => handleSendToPrinter(scannedResult)}
                    className="flex-1 py-3.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs rounded-xl shadow transition flex items-center justify-center gap-2">
                    <Database className="w-4 h-4" />
                    Salvar & Enviar para Fila 3D
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ABA 3: FLEXY GREEN */}
        {activeTab === 'flexy' && (
          <div className="space-y-6">
            <div className="bg-[#0B111E] border border-emerald-500/30 p-6 rounded-2xl space-y-2">
              <span className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30">
                TECNOLOGIA DE ALGAS MARINHAS
              </span>
              <h2 className="text-2xl font-black text-white">Filamento Flexy Green Pro</h2>
              <p className="text-sm text-slate-300">Formulado a partir de biopolímeros biodegradáveis com elevada resistência mecânica para uso automotivo.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filamentGrades.map((grade) => (
                <div key={grade.name} className="bg-[#0B111E] border border-slate-800 p-5 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <h3 className="font-bold text-emerald-400 text-base">{grade.name}</h3>
                    <span className="text-xs bg-slate-900 text-slate-300 px-2.5 py-1 rounded border border-slate-700">
                      {grade.colors} cores
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="text-slate-300"><strong>Temperatura:</strong> {grade.temp}</p>
                    <p className="text-slate-300"><strong>Resistência:</strong> {grade.resistance}</p>
                    <p className="text-slate-400 pt-1">{grade.idealFor}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA 4: CADASTRO */}
        {activeTab === 'cadastro' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-[#0B111E] border border-slate-800 p-6 rounded-2xl space-y-1">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-400" /> Cadastrar Modelo no Catálogo
              </h2>
              <p className="text-xs text-slate-400">Adicione novas especificações para o banco de dados do Supabase.</p>
            </div>

            <form onSubmit={handleCreateCatalogPart} className="bg-[#0B111E] border border-slate-800 p-6 rounded-2xl space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">NOME DA PEÇA</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Defletor de Ar"
                  value={newPart.nome_peca}
                  onChange={(e) => setNewPart({ ...newPart, nome_peca: e.target.value })}
                  className="w-full bg-[#060A12] border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">VEÍCULO / MODELO</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: IVECO Stralis 600"
                    value={newPart.modelo_caminhao}
                    onChange={(e) => setNewPart({ ...newPart, modelo_caminhao: e.target.value })}
                    className="w-full bg-[#060A12] border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">ANO</label>
                  <input
                    type="number"
                    required
                    value={newPart.ano_fabricacao}
                    onChange={(e) => setNewPart({ ...newPart, ano_fabricacao: Number(e.target.value) })}
                    className="w-full bg-[#060A12] border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">MATERIAL BIODEGRADÁVEL</label>
                <select
                  value={newPart.material_biodegradavel}
                  onChange={(e) => setNewPart({ ...newPart, material_biodegradavel: e.target.value })}
                  className="w-full bg-[#060A12] border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-400"
                >
                  <option value="PP + Algas Marinhas (Bio-PA)">PP + Algas Marinhas (Bio-PA)</option>
                  <option value="Flexy Green Pro ABS">Flexy Green Pro ABS</option>
                  <option value="Flexy Green Pro TPU">Flexy Green Pro TPU</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black p-4 rounded-xl shadow transition"
              >
                CADASTRAR NO SUPABASE
              </button>
            </form>
          </div>
        )}

        {/* ABA 5: HUB 3D */}
        {activeTab === 'hub3d' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-[#0B111E] border border-slate-800 p-6 rounded-2xl">
              <div>
                <h2 className="font-bold text-lg text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-400" /> Ordens Registradas no Supabase
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Histórico de peças cadastradas e ordens de impressão.</p>
              </div>
              <button onClick={fetchRecords} className="p-3 bg-slate-900 border border-slate-700 rounded-xl hover:bg-slate-800 transition">
                <RefreshCw className={`w-4 h-4 text-emerald-400 ${loadingDb ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {dbRecords.map((record) => (
                <div key={record.id} className="bg-[#0B111E] border border-slate-800 p-5 rounded-2xl space-y-2">
                  <div className="flex justify-between items-start border-b border-slate-800 pb-2">
                    <strong className="text-white text-sm font-bold">{record.nome_peca}</strong>
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 text-[10px] font-bold px-2 py-0.5 rounded">
                      {record.status_producao}
                    </span>
                  </div>
                  <p className="text-slate-400">Veículo: <span className="text-slate-200">{record.modelo_caminhao}</span></p>
                  <p className="text-slate-400">Material: <span className="text-emerald-400">{record.material_biodegradavel}</span></p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA 6: ESG */}
        {activeTab === 'esg' && (
          <div className="space-y-6">
            <div className="bg-[#0B111E] border border-emerald-500/30 rounded-2xl p-6 space-y-2">
              <span className="text-xs font-bold text-emerald-400 uppercase">Estratégia ESG IVECO</span>
              <h2 className="text-xl font-bold text-white">Objetivos de Desenvolvimento Sustentável (ODS)</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="bg-[#0B111E] border border-slate-800 p-5 rounded-2xl space-y-2">
                <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded font-bold">ODS 9</span>
                <h3 className="text-white font-bold text-sm">Indústria, Inovação e Infraestrutura</h3>
                <p className="text-slate-300 leading-relaxed">Manufatura aditiva e reposição de autopeças descentralizada com alta tecnologia.</p>
              </div>

              <div className="bg-[#0B111E] border border-slate-800 p-5 rounded-2xl space-y-2">
                <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded font-bold">ODS 12</span>
                <h3 className="text-white font-bold text-sm">Consumo e Produção Responsáveis</h3>
                <p className="text-slate-300 leading-relaxed">Uso de materiais biodegradáveis extraídos de biomassa marinha e algas.</p>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}