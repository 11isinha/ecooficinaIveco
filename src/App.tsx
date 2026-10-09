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
  Activity,
  Maximize2
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
      if (err.name === 'NotAllowedError') msg = 'Permissão de câmera negada.';
      if (err.name === 'NotFoundError') msg = 'Nenhuma câmera encontrada.';
      if (err.name === 'NotReadableError') msg = 'A câmera está sendo usada por outro app.';
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
        material_biodegradavel: newPart.material_biodegradavel || 'PP + Algas Marinhas (Bio-PA)',
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
      showToast('Nova peça cadastrada no catálogo!');
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
      showToast('Enviado com sucesso para a Fila 3D!');
      setScannedResult(null);
      setFilePreview(null);
      fetchRecords();
      setActiveTab('hub3d');
    }
  };

  const navItems: { id: typeof activeTab; label: string; icon: any }[] = [
    { id: 'home', label: 'Dashboard', icon: Activity },
    { id: 'scanner', label: 'Scanner + IA', icon: Camera },
    { id: 'flexy', label: 'Materiais (Algas)', icon: Layers },
    { id: 'cadastro', label: 'Cadastrar CAD', icon: PlusCircle },
    { id: 'hub3d', label: `Fila 3D (${dbRecords.length})`, icon: Printer },
    { id: 'esg', label: 'ESG / ODS', icon: Leaf },
  ];

  return (
    <div className="min-h-screen bg-[#05080E] text-slate-100 font-sans flex flex-col selection:bg-emerald-500 selection:text-slate-950">

      {/* NOTIFICAÇÃO HUD */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-500/90 text-slate-950 font-black text-sm px-5 py-3 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.5)] flex items-center gap-3 border border-emerald-300 backdrop-blur-md animate-bounce">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="tracking-wide uppercase font-mono">{toastMessage}</span>
        </div>
      )}

      {/* CABEÇALHO HUD / CYBERPUNK */}
      <header className="bg-[#0A0E17]/90 border-b border-emerald-500/20 px-4 sm:px-6 lg:px-8 py-3 sticky top-0 z-40 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-3">

          {/* Logo Cyber */}
          <div
            className="flex items-center gap-3 cursor-pointer w-full lg:w-auto justify-center lg:justify-start"
            onClick={() => setActiveTab('home')}
          >
            <div className="bg-emerald-500/10 border border-emerald-400/50 text-emerald-400 font-black text-xs px-3 py-1.5 rounded tracking-widest uppercase shadow-[0_0_10px_rgba(16,185,129,0.2)] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              ECOFICINA 4.0
            </div>
            <div className="text-xs font-mono text-slate-400 flex items-center gap-2 border-l border-slate-800 pl-3">
              <span>INOVAÇÃO</span> • <span>SUSTENTABILIDADE</span> • <span className="text-emerald-400 font-bold">IVECO</span>
            </div>
          </div>

          {/* Nav de Abas Futurista */}
          <nav className="flex w-full lg:w-auto overflow-x-auto gap-1 bg-[#05080E] p-1 rounded-xl border border-emerald-500/20 scrollbar-thin">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`whitespace-nowrap px-3.5 py-2 rounded-lg text-xs font-mono font-semibold transition-all duration-200 flex items-center gap-2 justify-center flex-shrink-0 border ${
                  activeTab === id
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border-transparent'
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

        {/* ABA 1: DASHBOARD / HOME */}
        {activeTab === 'home' && (
          <div className="space-y-8">
            
            {/* Banner de Destaque / Hero */}
            <div className="relative rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-[#0A0F1D] via-[#0D1527] to-[#0A0F1D] p-6 sm:p-10 overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.8)]">
              <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-5">
                  <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono px-3 py-1 rounded-full">
                    <Zap className="w-3.5 h-3.5" /> GESTÃO DIGITAL DE ESTOQUE & DADOS
                  </div>
                  <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                    ESTOQUE <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">INTEELIGENTE</span>
                  </h1>
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-light">
                    Do armazenamento físico para uma gestão digital e rastreável. Manufatura aditiva descentralizada utilizando polímeros com base em biomassa e algas marinhas.
                  </p>

                  <div className="flex flex-wrap gap-4 pt-2">
                    <button
                      onClick={() => setActiveTab('scanner')}
                      className="bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-sm px-6 py-3.5 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center gap-2 transition"
                    >
                      <Camera className="w-4 h-4" /> SCANNER + IA DESK
                    </button>
                    <button
                      onClick={() => setActiveTab('flexy')}
                      className="bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 font-mono text-sm px-6 py-3.5 rounded-xl transition"
                    >
                      VER ESPECIFICAÇÃO TÉCNICA
                    </button>
                  </div>
                </div>

                {/* Card de Peça Rastreável Simulada */}
                <div className="lg:col-span-5 bg-[#080C15]/90 border border-emerald-500/30 rounded-2xl p-5 backdrop-blur-md space-y-4 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                  <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block">CÓDIGO DA PEÇA</span>
                      <strong className="text-white font-mono text-base">AC-1587</strong>
                    </div>
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 text-[10px] font-mono px-2.5 py-1 rounded-md font-bold">
                      ● DISPONÍVEL
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                    <div className="bg-slate-900/50 p-2.5 rounded border border-slate-800">
                      <span className="text-slate-500 text-[10px] block">MODELO</span>
                      <span className="text-slate-200 font-bold">Defletor de ar</span>
                    </div>
                    <div className="bg-slate-900/50 p-2.5 rounded border border-slate-800">
                      <span className="text-slate-500 text-[10px] block">MATERIAL</span>
                      <span className="text-emerald-400 font-bold">PP + Algas Marinhas</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-800 pt-3 flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-400">HISTÓRICO DIGITAL:</span>
                    <span className="text-emerald-400 flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5"/> Inspeção OK</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid 3 Colunas Industriais */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#0A0E17] border border-emerald-500/20 rounded-2xl p-6 space-y-3 hover:border-emerald-500/50 transition">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Box className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-white font-mono">DISPONIBILIDADE</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Visualizar quais componentes estão disponíveis e quais precisam ser produzidos sob demanda na rede local.
                </p>
              </div>

              <div className="bg-[#0A0E17] border border-emerald-500/20 rounded-2xl p-6 space-y-3 hover:border-emerald-500/50 transition">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-white font-mono">RASTREABILIDADE</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Registrar modelo, material, lote, parâmetros de impressão, aplicação veicular e histórico completo da peça.
                </p>
              </div>

              <div className="bg-[#0A0E17] border border-emerald-500/20 rounded-2xl p-6 space-y-3 hover:border-emerald-500/50 transition">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Printer className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-white font-mono">PRODUÇÃO SOB DEMANDA</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Identificar a necessidade e acionar a manufatura aditiva quando necessário, reduzindo estoques físicos desnecessários.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* ABA 2: SCANNER IA / INSPEÇÃO CAD */}
        {activeTab === 'scanner' && (
          <div className="space-y-6">
            
            {/* Header da Seção */}
            <div className="bg-[#0A0E17] border border-emerald-500/30 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 tracking-widest block uppercase">MÓDULO DE INSPEÇÃO TÉCNICA</span>
                <h2 className="text-xl font-bold text-white font-mono">ANÁLISE DE COMPARAÇÃO CAD + VISÃO IA</h2>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono rounded-md">
                  SISTEMA PRONTO
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Área Principal de Câmera/Upload */}
              <div className="lg:col-span-7 bg-[#0A0E17] border border-slate-800 rounded-2xl p-6 space-y-6">
                
                {cameraError && (
                  <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg text-red-400 text-xs font-mono">
                    {cameraError}
                  </div>
                )}

                <div className="relative bg-[#05080E] border-2 border-dashed border-emerald-500/30 rounded-xl min-h-[320px] flex flex-col items-center justify-center overflow-hidden p-3">
                  
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-80 object-cover rounded-lg ${
                      cameraActive && !isScanning && !filePreview ? 'block' : 'hidden'
                    }`}
                  />

                  {cameraActive && !isScanning && !filePreview && (
                    <div className="absolute inset-4 border border-emerald-400/50 rounded-lg pointer-events-none flex items-center justify-center">
                      <div className="w-12 h-12 border-t-2 border-l-2 border-emerald-400 absolute top-2 left-2"></div>
                      <div className="w-12 h-12 border-t-2 border-r-2 border-emerald-400 absolute top-2 right-2"></div>
                      <div className="w-12 h-12 border-b-2 border-l-2 border-emerald-400 absolute bottom-2 left-2"></div>
                      <div className="w-12 h-12 border-b-2 border-r-2 border-emerald-400 absolute bottom-2 right-2"></div>
                      <span className="bg-slate-950/80 text-emerald-400 text-[10px] font-mono px-3 py-1 rounded border border-emerald-500/40">
                        ALINHAMENTO CAD DIGITAL
                      </span>
                    </div>
                  )}

                  {filePreview && !cameraActive && !isScanning && (
                    <div className="relative w-full h-80 flex items-center justify-center">
                      <img src={filePreview} alt="Preview" className="max-h-full max-w-full object-contain rounded-lg" />
                      <button
                        onClick={() => setFilePreview(null)}
                        className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-600 text-white text-xs font-mono px-3 py-1 rounded shadow"
                      >
                        REMOVER
                      </button>
                    </div>
                  )}

                  {!cameraActive && !filePreview && !isScanning && !scannedResult && (
                    <div className="text-center space-y-3 p-6">
                      <div className="w-16 h-16 bg-slate-900 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-400 mx-auto shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                        <Camera className="w-8 h-8" />
                      </div>
                      <p className="text-xs font-mono text-slate-400">Ative a câmera visual ou selecione uma imagem técnica</p>
                    </div>
                  )}

                  {isScanning && (
                    <div className="text-center space-y-3">
                      <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin mx-auto" />
                      <p className="text-xs font-mono text-emerald-400 tracking-wider">PROCESSANDO MALHA CAD 3D...</p>
                    </div>
                  )}
                </div>

                {!isScanning && (
                  <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                    <button
                      onClick={cameraActive ? stopCamera : startCamera}
                      className="bg-slate-900 hover:bg-slate-800 text-slate-200 p-3.5 rounded-xl border border-slate-700 flex items-center justify-center gap-2"
                    >
                      <Camera className="w-4 h-4 text-emerald-400" />
                      {cameraActive ? 'DESLIGAR CÂMERA' : 'CÂMERA AO VIVO'}
                    </button>

                    <label className="bg-slate-900 hover:bg-slate-800 text-slate-200 p-3.5 rounded-xl border border-slate-700 flex items-center justify-center gap-2 cursor-pointer">
                      <Upload className="w-4 h-4 text-emerald-400" />
                      UPLOAD ARQUIVO
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                )}

                {(cameraActive || filePreview) && !isScanning && (
                  <button
                    onClick={handleSimulateScan}
                    className="w-full bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-sm p-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 font-mono"
                  >
                    <Zap className="w-4 h-4 fill-slate-950" /> EXECUTAR INSPEÇÃO VISUAL
                  </button>
                )}
              </div>

              {/* Resultado da Inspeção (Estilo Imagem 2) */}
              <div className="lg:col-span-5 bg-[#0A0E17] border border-slate-800 rounded-2xl p-6 space-y-5">
                <h3 className="font-mono text-sm text-slate-400 border-b border-slate-800 pb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" /> CHECKLIST DE COMPARAÇÃO
                </h3>

                {scannedResult ? (
                  <div className="space-y-4 font-mono text-xs">
                    <div className="bg-slate-900/60 p-3.5 rounded-xl border border-emerald-500/30 space-y-1">
                      <span className="text-[10px] text-slate-500 block">PEÇA DETECTADA</span>
                      <strong className="text-white text-sm block">{scannedResult.nome_peca}</strong>
                      <span className="text-emerald-400 text-[10px]">{scannedResult.modelo_caminhao}</span>
                    </div>

                    <div className="space-y-2 border-t border-b border-slate-800 py-3">
                      <div className="flex justify-between items-center text-slate-300">
                        <span>Dimensões</span>
                        <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5"/> OK</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-300">
                        <span>Geometria</span>
                        <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5"/> OK</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-300">
                        <span>Encaixe</span>
                        <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5"/> OK</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-300">
                        <span>Acabamento</span>
                        <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5"/> OK</span>
                      </div>
                    </div>

                    <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/30 text-slate-200">
                      <span className="text-[10px] text-emerald-400 block font-bold mb-1">PROPRIEDADES DO MATERIAL</span>
                      <p>Resistência térmica: OK</p>
                      <p>Resistência mecânica: OK</p>
                    </div>

                    <button
                      onClick={() => handleSendToPrinter(scannedResult)}
                      className="w-full bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black p-3.5 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] transition"
                    >
                      REGISTRAR NO SUPABASE & IMPRIMIR 3D
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-16 text-slate-500 font-mono text-xs space-y-2">
                    <Maximize2 className="w-8 h-8 text-slate-700 mx-auto" />
                    <p>Aguardando dados da inspeção...</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ABA 3: MATERIAIS / FLEXY GREEN PRO */}
        {activeTab === 'flexy' && (
          <div className="space-y-6">
            <div className="bg-[#0A0E17] border border-emerald-500/30 rounded-2xl p-6 sm:p-8 space-y-3">
              <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full">
                BIOMASSA & ALGAS MARINHAS
              </span>
              <h2 className="text-2xl font-black text-white font-mono">FILAMENTO FLEXY GREEN PRO</h2>
              <p className="text-slate-300 text-sm leading-relaxed max-w-3xl font-light">
                Desenvolvido para substituição de plásticos fósseis na manufatura aditiva industrial com alta rigidez mecânica e estabilidade dimensional.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filamentGrades.map((grade) => (
                <div key={grade.name} className="bg-[#0A0E17] border border-slate-800 hover:border-emerald-500/40 p-6 rounded-2xl space-y-3 transition">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <h3 className="font-mono font-bold text-emerald-400 text-base">{grade.name}</h3>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-700">
                      {grade.colors} CORES
                    </span>
                  </div>

                  <div className="space-y-2 text-xs font-mono">
                    <p className="text-slate-300"><span className="text-slate-500">TEMPERATURA:</span> {grade.temp}</p>
                    <p className="text-slate-300"><span className="text-slate-500">RESISTÊNCIA:</span> {grade.resistance}</p>
                    <p className="text-slate-400 text-[11px] leading-relaxed pt-2 border-t border-slate-900">{grade.idealFor}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA 4: CADASTRO DE PEÇAS NO SUPABASE */}
        {activeTab === 'cadastro' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-[#0A0E17] border border-slate-800 p-6 rounded-2xl">
              <h2 className="text-xl font-bold font-mono text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-400" /> CADASTRAR MODELO CAD
              </h2>
            </div>

            <form onSubmit={handleCreateCatalogPart} className="bg-[#0A0E17] border border-slate-800 p-6 rounded-2xl space-y-4 font-mono text-xs">
              <div className="space-y-1">
                <label className="text-slate-400">NOME DO COMPONENTE</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Defletor de Ar"
                  value={newPart.nome_peca}
                  onChange={(e) => setNewPart({ ...newPart, nome_peca: e.target.value })}
                  className="w-full bg-[#05080E] border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400">VEÍCULO / MODELO</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: IVECO Stralis 600"
                    value={newPart.modelo_caminhao}
                    onChange={(e) => setNewPart({ ...newPart, modelo_caminhao: e.target.value })}
                    className="w-full bg-[#05080E] border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">ANO</label>
                  <input
                    type="number"
                    required
                    value={newPart.ano_fabricacao}
                    onChange={(e) => setNewPart({ ...newPart, ano_fabricacao: Number(e.target.value) })}
                    className="w-full bg-[#05080E] border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">MATERIAL BIODEGRADÁVEL</label>
                <select
                  value={newPart.material_biodegradavel}
                  onChange={(e) => setNewPart({ ...newPart, material_biodegradavel: e.target.value })}
                  className="w-full bg-[#05080E] border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-400"
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
                REGISTRAR NO BANCO SUPABASE
              </button>
            </form>
          </div>
        )}

        {/* ABA 5: FILA DE IMPRESSÃO 3D (SUPABASE) */}
        {activeTab === 'hub3d' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-[#0A0E17] border border-slate-800 p-6 rounded-2xl">
              <div>
                <h2 className="font-mono font-bold text-lg text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-400" /> FILA DE IMPRESSÃO REGISTRADA
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-1">Registros síncronos no banco Supabase.</p>
              </div>
              <button onClick={fetchRecords} className="p-3 bg-slate-900 border border-slate-700 rounded-xl hover:bg-slate-800 transition">
                <RefreshCw className={`w-4 h-4 text-emerald-400 ${loadingDb ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dbRecords.map((record) => (
                <div key={record.id} className="bg-[#0A0E17] border border-slate-800 p-5 rounded-2xl space-y-3 font-mono text-xs">
                  <div className="flex justify-between items-start border-b border-slate-800 pb-2">
                    <strong className="text-white text-sm font-bold">{record.nome_peca}</strong>
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 text-[10px] px-2 py-0.5 rounded">
                      {record.status_producao}
                    </span>
                  </div>
                  <p className="text-slate-400">VEÍCULO: <span className="text-slate-200">{record.modelo_caminhao}</span></p>
                  <p className="text-slate-400">MATERIAL: <span className="text-emerald-400">{record.material_biodegradavel}</span></p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA 6: ESG & ODS */}
        {activeTab === 'esg' && (
          <div className="space-y-6">
            <div className="bg-[#0A0E17] border border-emerald-500/30 rounded-2xl p-6 space-y-2">
              <span className="text-xs font-mono text-emerald-400">AGENDA SUSTENTÁVEL</span>
              <h2 className="text-xl font-bold font-mono text-white">OBJETIVOS DE DESENVOLVIMENTO SUSTENTÁVEL</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
              <div className="bg-[#0A0E17] border border-slate-800 p-5 rounded-2xl space-y-2">
                <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded font-bold">ODS 9</span>
                <h3 className="text-white font-bold text-sm">INDÚSTRIA E INOVAÇÃO</h3>
                <p className="text-slate-400 leading-relaxed">Desenvolvimento de tecnologia de manufatura aditiva e peças sob demanda na rede de concessionárias.</p>
              </div>

              <div className="bg-[#0A0E17] border border-slate-800 p-5 rounded-2xl space-y-2">
                <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded font-bold">ODS 12</span>
                <h3 className="text-white font-bold text-sm">CONSUMO E PRODUÇÃO RESPONSÁVEL</h3>
                <p className="text-slate-400 leading-relaxed">Uso de materiais biodegradáveis derivados de biomassa marinha reduzindo o impacto ambiental.</p>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}