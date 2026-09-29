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
  Sparkles
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
        nome_peca: newPart.nome_peca || 'SUPORTE DO CABO DE ACELERADOR',
        modelo_caminhao: newPart.modelo_caminhao || 'IVECO TurboDaily 3510',
        ano_fabricacao: newPart.ano_fabricacao || 1998,
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
    { id: 'scanner', label: 'Scanner ', icon: Camera },
    { id: 'flexy', label: 'Flexy Green', icon: Layers },
    { id: 'cadastro', label: 'Cadastrar', icon: PlusCircle },
    { id: 'hub3d', label: `Hub 3D (${dbRecords.length})`, icon: Printer },
    { id: 'esg', label: 'ODS & ESG', icon: Leaf },
  ];

  return (
    <div className="min-h-screen bg-[#0A0E17] text-slate-100 font-sans flex flex-col selection:bg-emerald-500 selection:text-slate-950">

      {/* NOTIFICAÇÃO TOAST */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-400 text-slate-950 font-black text-sm sm:text-base px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce border-2 border-white">
          <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* CABEÇALHO */}
      <header className="bg-[#111827] border-b border-slate-700 px-4 sm:px-6 lg:px-8 py-3 sticky top-0 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-3 lg:gap-6">

          {/* Logo + Título */}
          <div
            className="flex items-center gap-3 cursor-pointer w-full lg:w-auto justify-center lg:justify-start"
            onClick={() => setActiveTab('home')}
          >
            <div className="bg-gradient-to-r from-blue-600 to-emerald-500 font-black text-white text-base px-3.5 py-1.5 rounded-lg shadow-lg border border-white/20 tracking-wider flex-shrink-0">
              IVECO
            </div>
            <div className="min-w-0">
              <h1 className="font-black text-sm sm:text-base text-white flex items-center gap-2 tracking-wide whitespace-nowrap">
                ECOOFICINA
                <span className="hidden sm:inline bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full border border-emerald-400/40">
                  3D & ALGAS
                </span>
              </h1>
              <p className="text-[10px] text-slate-400 font-mono tracking-wider">MANUFATURA ADITIVA ESG</p>
            </div>
          </div>

          {/* Navegação */}
          <nav className="flex w-full lg:w-auto overflow-x-auto gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-700 items-center justify-start lg:justify-center scrollbar-thin">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`whitespace-nowrap px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 justify-center flex-shrink-0 ${
                  activeTab === id
                    ? 'bg-emerald-400 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
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
      <main className="flex-1 w-full">

        {/* ABA 1: HOME */}
        {activeTab === 'home' && (
          <div className="relative min-h-[calc(100vh-73px)] flex flex-col justify-between overflow-hidden">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-25 filter brightness-90">
              <source src="./video.mp4" type="video/mp4" />
            </video>

            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E17] via-[#0A0E17]/70 to-transparent"></div>

            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-8 text-center space-y-8 pt-12 md:pt-20 pb-12 my-auto">
              <span className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 text-xs sm:text-sm font-extrabold px-6 py-2.5 rounded-full border border-emerald-400/40 backdrop-blur-md uppercase tracking-wider">
                <Zap className="w-4 h-4 text-emerald-400" /> Manufatura Aditiva Descentralizada
              </span>

              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight break-words">
                Peças de Reposição IVECO com <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">Filamento de Algas</span>
              </h1>

              <p className="text-base sm:text-xl text-slate-100 max-w-3xl mx-auto leading-relaxed break-words font-normal">
                Substituição instantânea de componentes obsoletos por meio de escaneamento tridimensional, upload de fotos e impressão 3D ecológica.
              </p>

              <div className="pt-6 flex flex-col sm:flex-row justify-center items-center gap-5 max-w-2xl mx-auto">
                <button
                  onClick={() => setActiveTab('scanner')}
                  className="w-full sm:w-auto bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-base sm:text-lg px-10 py-5 rounded-2xl shadow-2xl flex items-center justify-center gap-3 transition transform hover:scale-105 border border-white/50 tracking-wide">
                  <Camera className="w-6 h-6 flex-shrink-0" />
                  <span>INICIAR SCANNER </span>
                  <ArrowRight className="w-6 h-6 flex-shrink-0" />
                </button>

                <button
                  onClick={() => setActiveTab('flexy')}
                  className="w-full sm:w-auto bg-slate-800/90 hover:bg-slate-700 text-white font-bold text-base sm:text-lg px-8 py-5 rounded-2xl border-2 border-slate-500 transition shadow-lg tracking-wide flex items-center justify-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-400" />
                  Conhecer Flexy Green Pro
                </button>
              </div>
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 pb-12 w-full grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900/90 border-2 border-slate-600 p-6 rounded-3xl space-y-3 backdrop-blur-md shadow-2xl">
                <div className="w-12 h-12 bg-blue-500/20 text-blue-300 rounded-2xl flex items-center justify-center border border-blue-400/30">
                  <Box className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-lg text-white">Peças Descontinuadas</h3>
                <p className="text-sm text-slate-200 leading-relaxed break-words">
                  Elimina longos períodos de paralisação da frota gerando arquivos CAD digitais prontos para produção local.
                </p>
              </div>

              <div className="bg-slate-900/90 border-2 border-slate-600 p-6 rounded-3xl space-y-3 backdrop-blur-md shadow-2xl">
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-300 rounded-2xl flex items-center justify-center border border-emerald-400/30">
                  <Leaf className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-lg text-white">Bio-Filamento de Algas</h3>
                <p className="text-sm text-slate-200 leading-relaxed break-words">
                  Matéria-prima renovável de base biológica com altíssima resistência térmica e tolerância mecânica.
                </p>
              </div>

              <div className="bg-slate-900/90 border-2 border-slate-600 p-6 rounded-3xl space-y-3 backdrop-blur-md shadow-2xl">
                <div className="w-12 h-12 bg-cyan-500/20 text-cyan-300 rounded-2xl flex items-center justify-center border border-cyan-400/30">
                  <Database className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-lg text-white">Nuvem Supabase</h3>
                <p className="text-sm text-slate-200 leading-relaxed break-words">
                  Registro em tempo real de diagnósticos, relatórios de emissões salvas e ordens de impressão na oficina.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: SCANNER IA */}
        {activeTab === 'scanner' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-8">
            <div className="bg-[#111827] border-2 border-slate-600 p-6 sm:p-8 rounded-3xl space-y-3 shadow-xl">
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3.5 py-1.5 rounded-full border border-emerald-400/40 uppercase">
                Reconhecimento Visual & Visão Computacional
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">Scanner / Upload de Componentes</h2>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed break-words">
                Aponte a câmera ao vivo ou envie uma foto/arquivo da peça para efetuar a comparação com o catálogo cadastrado no Supabase.
              </p>
            </div>

            <div className="bg-[#111827] border-2 border-slate-600 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
              {cameraError && (
                <div className="bg-red-500/10 border-2 border-red-500/40 p-4 rounded-2xl text-red-200 text-sm font-medium">
                  {cameraError}
                </div>
              )}

              <div className="bg-slate-950 border-2 border-dashed border-slate-600 rounded-2xl min-h-[300px] flex flex-col items-center justify-center relative overflow-hidden p-4">

                {/* Vídeo SEMPRE montado (mesmo escondido) para permitir o ref */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-72 object-cover rounded-xl bg-slate-900 ${
                    cameraActive && !isScanning && !filePreview ? 'block' : 'hidden'
                  }`}
                />

                {/* Overlay de enquadramento */}
                {cameraActive && !isScanning && !filePreview && (
                  <div className="absolute inset-4 border-2 border-dashed border-emerald-400 rounded-xl pointer-events-none flex items-end justify-center pb-4">
                    <span className="bg-slate-900/90 text-emerald-300 text-xs font-bold px-4 py-1.5 rounded-full border border-emerald-400/40">
                      Enquadre a peça no centro
                    </span>
                  </div>
                )}

                {filePreview && !cameraActive && !isScanning && (
                  <div className="relative w-full h-72 flex items-center justify-center">
                    <img src={filePreview} alt="Preview da peça" className="max-h-full max-w-full object-contain rounded-xl" />
                    <button
                      onClick={() => setFilePreview(null)}
                      className="absolute top-2 right-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-lg transition">
                      Remover Foto
                    </button>
                  </div>
                )}

                {!cameraActive && !filePreview && !isScanning && !scannedResult && (
                  <div className="text-center space-y-4 py-8">
                    <div className="w-20 h-20 bg-slate-900 border border-slate-600 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto">
                      <Camera className="w-10 h-10" />
                    </div>
                    <p className="text-sm text-slate-200 font-medium">Ligue a câmera ou selecione uma imagem do seu computador</p>
                  </div>
                )}

                {isScanning && (
                  <div className="text-center space-y-4 py-12">
                    <RefreshCw className="w-12 h-12 text-emerald-400 animate-spin mx-auto" />
                    <p className="text-sm font-black text-emerald-400 uppercase tracking-widest">
                      Comparando imagem com o Catálogo Supabase...
                    </p>
                  </div>
                )}
              </div>

              {!isScanning && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={cameraActive ? stopCamera : startCamera}
                    className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm py-4 px-6 rounded-2xl border border-slate-500 flex items-center justify-center gap-2 transition">
                    <Camera className="w-5 h-5 text-emerald-400" />
                    <span>{cameraActive ? 'Desligar Câmera' : 'Usar Câmera ao Vivo'}</span>
                  </button>

                  <label className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm py-4 px-6 rounded-2xl border border-slate-500 flex items-center justify-center gap-2 cursor-pointer transition">
                    <Upload className="w-5 h-5 text-emerald-400" />
                    <span>Enviar Foto da Peça</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              )}

              {(cameraActive || filePreview) && !isScanning && (
                <button
                  onClick={handleSimulateScan}
                  className="w-full bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-base py-4 px-8 rounded-2xl shadow-xl flex items-center justify-center gap-2 border border-white/40 transition">
                  <Zap className="w-5 h-5 fill-slate-950" />
                  <span>IDENTIFICAR E ANALISAR AGORA</span>
                </button>
              )}
            </div>

            {scannedResult && (
              <div className="bg-[#111827] border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
                <div className="flex flex-wrap items-start justify-between border-b border-slate-700 pb-5 gap-4">
                  <div>
                    <span className="text-xs text-emerald-400 font-mono font-bold block">RECONHECIDO NO CATÁLOGO SUPABASE</span>
                    <h3 className="font-black text-xl sm:text-2xl text-white">{scannedResult.nome_peca}</h3>
                  </div>
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-400/40 text-xs sm:text-sm font-extrabold px-4 py-2 rounded-xl">
                    {scannedResult.saude_status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-900 p-4 rounded-2xl border border-slate-600 space-y-1">
                    <span className="text-xs text-slate-200 font-bold flex items-center gap-1.5">
                      <Box className="w-4 h-4 text-blue-400" /> Modelo / Veículo
                    </span>
                    <strong className="text-white text-sm sm:text-base block font-bold">{scannedResult.modelo_caminhao}</strong>
                    <span className="text-xs text-slate-300">Ano: {scannedResult.ano_fabricacao}</span>
                  </div>

                  <div className="bg-slate-900 p-4 rounded-2xl border border-slate-600 space-y-1">
                    <span className="text-xs text-slate-200 font-bold flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-400" /> Tempo em Uso
                    </span>
                    <strong className="text-amber-300 text-sm sm:text-base block font-bold">{scannedResult.tempo_em_uso}</strong>
                  </div>

                  <div className="bg-slate-900 p-4 rounded-2xl border border-slate-600 space-y-2">
                    <span className="text-xs text-slate-200 font-bold flex items-center gap-1.5">
                      <Gauge className="w-4 h-4 text-emerald-400" /> Saúde Estrutural
                    </span>
                    <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-700">
                      <div className="bg-amber-400 h-full" style={{ width: `${scannedResult.saude_percentual}%` }}></div>
                    </div>
                    <span className="text-xs text-slate-200">{scannedResult.saude_percentual}% Restante</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative rounded-2xl overflow-hidden border-2 border-slate-600 bg-slate-950 h-[220px] flex items-center justify-center p-2">
                    <img src={scannedResult.imagem_url} alt="Peça Reconhecida" className="max-h-full max-w-full object-contain rounded-lg" />
                  </div>

                  <div className="space-y-4">
                    <div className="bg-slate-900 p-4 rounded-2xl border border-slate-600 space-y-1">
                      <span className="text-xs text-slate-300 font-bold block">DIAGNÓSTICO TÉCNICO</span>
                      <p className="text-xs sm:text-sm text-slate-100 leading-relaxed">{scannedResult.motivo_substituicao}</p>
                    </div>

                    <div className="bg-emerald-950/40 border border-emerald-500/40 p-4 rounded-2xl space-y-1">
                      <span className="text-xs text-emerald-300 font-bold block">MATERIAL SUSTENTÁVEL RECOMENDADO</span>
                      <strong className="text-white text-sm flex items-center gap-2 font-bold">
                        <Leaf className="w-4 h-4 text-emerald-400 flex-shrink-0" /> {scannedResult.material_biodegradavel}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <button
                    onClick={() => { setScannedResult(null); setFilePreview(null); }}
                    className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs sm:text-sm rounded-2xl transition border border-slate-500">
                    Escanear Outro Componente
                  </button>
                  <button
                    onClick={() => handleSendToPrinter(scannedResult)}
                    className="flex-1 py-4 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-lg transition flex items-center justify-center gap-2 border border-white/40">
                    <Database className="w-4 h-4" />
                    Salvar no Supabase & Imprimir em 3D
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ABA 3: FLEXY GREEN PRO */}
        {activeTab === 'flexy' && (
          <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-8">
            <div className="bg-[#111827] border-2 border-emerald-500/40 p-6 sm:p-10 rounded-3xl space-y-4 shadow-2xl relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-extrabold px-4 py-1.5 rounded-full border border-emerald-400/40 uppercase tracking-wider inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Tecnologia Algaplastic América Latina
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                Filamento Flexy Green Pro
              </h2>
              <p className="text-sm sm:text-base text-slate-100 leading-relaxed max-w-3xl">
                O primeiro filamento para impressão 3D da América Latina formulado a partir de extrato de algas marinhas. Desenvolvido para entregar máxima performance mecânica na reposição de autopeças automotivas.
              </p>
            </div>

            {/* Painel de Diferenciais */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#111827] border-2 border-slate-600 p-6 rounded-3xl space-y-3 shadow-xl">
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-300 rounded-2xl flex items-center justify-center border border-emerald-400/30">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-lg text-white">Cristalização 40% Mais Rápida</h3>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  Permite maior velocidade de produção sem deformações, reduzindo o tempo de máquina parada.
                </p>
              </div>

              <div className="bg-[#111827] border-2 border-slate-600 p-6 rounded-3xl space-y-3 shadow-xl">
                <div className="w-12 h-12 bg-blue-500/20 text-blue-300 rounded-2xl flex items-center justify-center border border-blue-400/30">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-lg text-white">Zero Pelos (Stringing)</h3>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  Elevada fluidez e retração perfeita, entregando peças limpas diretamente da mesa de impressão.
                </p>
              </div>

              <div className="bg-[#111827] border-2 border-slate-600 p-6 rounded-3xl space-y-3 shadow-xl">
                <div className="w-12 h-12 bg-purple-500/20 text-purple-300 rounded-2xl flex items-center justify-center border border-purple-400/30">
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-lg text-white">Compatibilidade 99%</h3>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  Testado e aprovado em impressoras FDM/FFF industriais e de mesa no mercado.
                </p>
              </div>
            </div>

            {/* Catálogo das Grades */}
            <div className="bg-[#111827] border-2 border-slate-600 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl">
              <h3 className="font-black text-xl text-white flex items-center gap-2">
                <Layers className="w-6 h-6 text-emerald-400" /> Grades do Filamento Disponíveis
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filamentGrades.map((grade) => (
                  <div key={grade.name} className="bg-slate-900 border border-slate-600 p-5 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                      <h4 className="font-black text-emerald-400 text-lg">{grade.name}</h4>
                      <span className="text-xs font-bold bg-emerald-500/10 text-emerald-300 px-3 py-1 rounded-lg border border-emerald-500/20">
                        {grade.colors} cores
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs sm:text-sm">
                      <p className="text-slate-200 flex items-center gap-2">
                        <Thermometer className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        <strong>Extrusão:</strong> {grade.temp}
                      </p>
                      <p className="text-slate-200">
                        <strong>Performance:</strong> {grade.resistance}
                      </p>
                      <p className="text-slate-300">
                        <strong>Aplicações:</strong> {grade.idealFor}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Impacto Blue Carbon */}
            <div className="bg-gradient-to-r from-emerald-950/60 to-slate-900 border-2 border-emerald-500/40 p-6 sm:p-8 rounded-3xl space-y-3 shadow-xl">
              <h3 className="font-black text-xl text-white flex items-center gap-2">
                <Leaf className="w-6 h-6 text-emerald-400" /> Compromisso Blue Carbon
              </h3>
              <p className="text-sm text-slate-100 leading-relaxed">
                Cada carretel de 1 kg do filamento compensa ativamente <strong>2 kg de CO₂</strong> da atmosfera. O material é totalmente biodegradável em um prazo de 180 a 240 dias conforme a norma ISO 14855, contando com rastreabilidade total via QR Code na embalagem.
              </p>
            </div>
          </div>
        )}

        {/* ABA 4: CADASTRO DE PEÇAS NO CATÁLOGO */}
        {activeTab === 'cadastro' && (
          <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8 space-y-6">
            <div className="bg-[#111827] border-2 border-slate-600 p-6 sm:p-8 rounded-3xl space-y-2 shadow-xl">
              <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
                <PlusCircle className="w-7 h-7 text-emerald-400" /> Cadastrar Peça no Catálogo
              </h2>
              <p className="text-sm text-slate-200 leading-relaxed">
                Cadastre peças para expandir o banco de dados do Supabase. Assim, o scanner e a câmera conseguirão reconhecê-las instantaneamente.
              </p>
            </div>

            <form onSubmit={handleCreateCatalogPart} className="bg-[#111827] border-2 border-slate-600 p-6 sm:p-8 rounded-3xl space-y-5 shadow-2xl">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-200 uppercase">Nome do Componente / Peça</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Bucha da Suspensão Traseira"
                  value={newPart.nome_peca}
                  onChange={(e) => setNewPart({ ...newPart, nome_peca: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-200 uppercase">Modelo do Veículo IVECO</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: IVECO Stralis 600"
                    value={newPart.modelo_caminhao}
                    onChange={(e) => setNewPart({ ...newPart, modelo_caminhao: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-200 uppercase">Ano de Fabricação</label>
                  <input
                    type="number"
                    required
                    value={newPart.ano_fabricacao}
                    onChange={(e) => setNewPart({ ...newPart, ano_fabricacao: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-200 uppercase">Material de Impressão 3D Recomendado</label>
                <select
                  value={newPart.material_biodegradavel}
                  onChange={(e) => setNewPart({ ...newPart, material_biodegradavel: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-400">
                  <option value="Flexy Green Pro (Algae Bio-PA)">Flexy Green Pro (Algae Bio-PA)</option>
                  <option value="Flexy Green Pro ABS (Resistente Termicamente)">Flexy Green Pro ABS (Resistente Termicamente)</option>
                  <option value="Flexy Green Pro TPU (Flexível)">Flexy Green Pro TPU (Flexível)</option>
                  <option value="PLA Biodegradável Reforçado">PLA Biodegradável Reforçado</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-base py-4 rounded-2xl shadow-xl transition border border-white/40 flex items-center justify-center gap-2">
                <PlusCircle className="w-5 h-5" />
                <span>CADASTRAR E REGISTRAR NO SUPABASE</span>
              </button>
            </form>
          </div>
        )}

        {/* ABA 5: HUB DE IMPRESSÃO 3D */}
        {activeTab === 'hub3d' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-6">
            <div className="flex justify-between items-center bg-[#111827] p-6 rounded-3xl border-2 border-slate-600 shadow-xl">
              <div>
                <h2 className="font-black text-lg sm:text-xl text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-400" /> Ordens Registradas no Supabase
                </h2>
                <p className="text-xs text-slate-300 mt-1">Histórico de componentes cadastrados e fila de impressão 3D.</p>
              </div>
              <button onClick={fetchRecords} className="p-3 bg-slate-800 rounded-2xl hover:bg-slate-700 transition border border-slate-500">
                <RefreshCw className={`w-4 h-4 text-slate-100 ${loadingDb ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="space-y-4">
              {dbRecords.length === 0 && !loadingDb && (
                <div className="bg-[#111827] border-2 border-dashed border-slate-600 p-10 rounded-3xl text-center">
                  <p className="text-slate-300 text-sm">Nenhuma ordem registrada ainda. Cadastre ou escaneie uma peça para começar.</p>
                </div>
              )}

              {dbRecords.map((record) => (
                <div key={record.id} className="bg-[#111827] border-2 border-slate-600 p-6 rounded-3xl space-y-4 shadow-xl">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <h3 className="font-black text-white text-lg break-words">{record.nome_peca}</h3>
                      <p className="text-slate-300 text-xs mt-0.5">Veículo: <strong className="text-white">{record.modelo_caminhao}</strong> ({record.ano_fabricacao})</p>
                    </div>
                    <span className="bg-emerald-500/20 text-emerald-300 font-bold px-3.5 py-1.5 rounded-full text-xs border border-emerald-400/40">
                      {record.status_producao}
                    </span>
                  </div>

                  <div className="bg-slate-900 p-4 rounded-2xl border border-slate-600 text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <span className="text-slate-200 flex items-center gap-2">
                      <Leaf className="w-4 h-4 text-emerald-400" /> Material Ecológico:
                    </span>
                    <strong className="text-emerald-400 font-bold break-words">{record.material_biodegradavel}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA 6: ODS DA ONU & SUSTENTABILIDADE */}
        {activeTab === 'esg' && (
          <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-8">
            <div className="bg-[#111827] border-2 border-slate-600 p-6 sm:p-10 rounded-3xl space-y-4 shadow-2xl">
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-4 py-1.5 rounded-full border border-emerald-400/40 uppercase tracking-wider">
                Estratégia ESG IVECO
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight break-words">
                Fundamentos Tecnológicos & Sustentáveis
              </h2>
              <p className="text-sm sm:text-base text-slate-100 leading-relaxed break-words">
                A união da Manufatura Aditiva e dos Biopolímeros de Algas atende aos principais pilares da indústria moderna e aos Objetivos de Desenvolvimento Sustentável da ONU.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-[#111827] border-2 border-slate-600 p-6 rounded-3xl space-y-3 shadow-xl">
                <div className="w-12 h-12 bg-amber-500/20 text-amber-300 rounded-2xl flex items-center justify-center border border-amber-400/30">
                  <Factory className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-lg text-white">Lean Manufacturing</h3>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed break-words">
                  Eliminação completa de desperdícios na produção, produzindo apenas as peças necessárias no momento exato (Just-In-Time) e sem estoques físicos.
                </p>
              </div>

              <div className="bg-[#111827] border-2 border-slate-600 p-6 rounded-3xl space-y-3 shadow-xl">
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-300 rounded-2xl flex items-center justify-center border border-emerald-400/30">
                  <RotateCcw className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-lg text-white">Os 3Rs (Reduzir, Reutilizar, Reciclar)</h3>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed break-words">
                  Redução no consumo de matéria-prima fóssil, reutilização de moldes digitais e reciclagem de biopolímeros biodegradáveis de algas.
                </p>
              </div>

              <div className="bg-[#111827] border-2 border-slate-600 p-6 rounded-3xl space-y-3 shadow-xl">
                <div className="w-12 h-12 bg-blue-500/20 text-blue-300 rounded-2xl flex items-center justify-center border border-blue-400/30">
                  <Globe className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-lg text-white">Economia Circular</h3>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed break-words">
                  Ciclo produtivo fechado onde os componentes descontinuados ganham novas vidas através de filamentos orgânicos renováveis.
                </p>
              </div>

              <div className="bg-[#111827] border-2 border-slate-600 p-6 rounded-3xl space-y-3 shadow-xl">
                <div className="w-12 h-12 bg-cyan-500/20 text-cyan-300 rounded-2xl flex items-center justify-center border border-cyan-400/30">
                  <Truck className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-lg text-white">Logística Verde</h3>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed break-words">
                  Substituição do frete e envio de autopeças pesadas pela transmissão de dados digitais, reduzindo drasticamente a pegada de carbono.
                </p>
              </div>

              <div className="bg-[#111827] border-2 border-slate-600 p-6 rounded-3xl space-y-3 shadow-xl md:col-span-2 lg:col-span-2">
                <div className="w-12 h-12 bg-purple-500/20 text-purple-300 rounded-2xl flex items-center justify-center border border-purple-400/30">
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-lg text-white">Indústria 4.0</h3>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed break-words">
                  Integração total de Inteligência Artificial para reconhecimento de peças, conexão via nuvem com Supabase e impressão 3D automatizada nas concessionárias.
                </p>
              </div>
            </div>

            <div className="bg-[#111827] border-2 border-slate-600 p-6 sm:p-10 rounded-3xl space-y-6 shadow-2xl">
              <div className="flex items-center gap-3">
                <Globe className="w-8 h-8 text-emerald-400 flex-shrink-0" />
                <div>
                  <h3 className="font-black text-xl sm:text-2xl text-white">Objetivos de Desenvolvimento Sustentável (ODS)</h3>
                  <p className="text-xs sm:text-sm text-slate-300">Impacto direto nos pilares selecionados da ONU Agenda 2030.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="bg-slate-900/90 p-6 rounded-2xl border-2 border-amber-500/30 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="bg-amber-500 text-slate-950 font-black text-sm px-3.5 py-1 rounded-xl">ODS 7</span>
                    <h4 className="font-extrabold text-base text-white">Energia Acessível e Limpa</h4>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed break-words">
                    Produção com baixo consumo energético em comparação ao derretimento de metais tradicionais, impulsionando processos de manufatura sustentável e eficientes.
                  </p>
                </div>

                <div className="bg-slate-900/90 p-6 rounded-2xl border-2 border-blue-500/30 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="bg-blue-500 text-white font-black text-sm px-3.5 py-1 rounded-xl">ODS 9</span>
                    <h4 className="font-extrabold text-base text-white">Indústria, Inovação e Infraestrutura</h4>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed break-words">
                    Transformação digital da rede automotiva por meio da Indústria 4.0, escaneamento tridimensional inteligente e impressão 3D sob demanda.
                  </p>
                </div>

                <div className="bg-slate-900/90 p-6 rounded-2xl border-2 border-cyan-500/30 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="bg-cyan-500 text-slate-950 font-black text-sm px-3.5 py-1 rounded-xl">ODS 11</span>
                    <h4 className="font-extrabold text-base text-white">Cidades e Comunidades Sustentáveis</h4>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed break-words">
                    Descentralização do suprimento de autopeças através de Logística Verde, eliminando congestionamentos e emissões de carbono com transporte de peças.
                  </p>
                </div>

                <div className="bg-slate-900/90 p-6 rounded-2xl border-2 border-emerald-500/30 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="bg-emerald-500 text-slate-950 font-black text-sm px-3.5 py-1 rounded-xl">ODS 12</span>
                    <h4 className="font-extrabold text-base text-white">Consumo e Produção Responsáveis</h4>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed break-words">
                    Aplicação direta dos conceitos de Lean Manufacturing, Economia Circular e 3Rs utilizando biopolímeros biodegradáveis extraídos de algas marinhas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}