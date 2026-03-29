import React, { useRef, useState } from 'react';
import { Button } from './components/Button';
import { ImageEditor } from './components/ImageEditor';
import { BeforeAfterSlider } from './components/BeforeAfterSlider';
import { PanoramaViewer } from './components/PanoramaViewer';
import { FadeIn } from './components/FadeIn';

// --- DADOS DOS PRODUTOS ---
const PRODUCTS = [
  {
    id: 'capachos',
    title: "Tapetes Clean Kap & Capachos",
    description: "Personalização em Alta Definição ou Vulcanização. Retém até 80% da sujeira.",
    image: "https://github.com/eunicolassilveira-lgtm/Imagem-cia-do-tapete/blob/main/capacho%20grill.jpg?raw=true",
    highlight: true, // Carro chefe
    imageClassName: "object-cover object-center w-full h-full group-hover:scale-105 transition-transform duration-700",
    whatsappLink: "https://wa.me/555197141555?text=Ol%C3%A1!%20Vim%20pelo%20site%20e%20gostaria%20de%20um%20or%C3%A7amento%20de%20capacho",
    badges: ["Retém 80% Sujeira", "Antiderrapante", "Alta Durabilidade"]
  },
  {
    id: 'cortinas',
    title: "Cortinas & Persianas",
    description: "Controle de luz e sofisticação para ambientes corporativos e residenciais.",
    image: "https://lh3.googleusercontent.com/p/AF1QipOrmxS2yEetqd8oaWm_IyRTM_HaUQuAcGlnGgK1=s680-w680-h510-rw",
    highlight: false,
    whatsappLink: "https://wa.me/555197141555?text=Ol%C3%A1!%20Vim%20pelo%20site%20e%20gostaria%20de%20um%20or%C3%A7amento%20de%20cortinas%2Fpersianas",
    badges: ["Sob Medida", "Fácil Limpeza"]
  },
  {
    id: 'windbanners',
    title: "Windbanners",
    description: "Marketing visual de alto impacto com movimento e cores vibrantes.",
    image: "https://github.com/eunicolassilveira-lgtm/Imagem-cia-do-tapete/blob/main/Cia%20do%20Tapete.jpg?raw=true",
    highlight: false,
    whatsappLink: "https://wa.me/555197141555?text=Ol%C3%A1!%20Vim%20pelo%20site%20e%20gostaria%20de%20um%20or%C3%A7amento%20de%20WindBanner",
    badges: ["Alta Visibilidade", "Resistente ao Vento"]
  },
  {
    id: 'grama',
    title: "Grama Sintética",
    description: "Verde o ano todo sem manutenção. Ideal para jardins e playgrounds.",
    image: "https://images.unsplash.com/photo-1558904541-efa843a96f01?q=80&w=2545&auto=format&fit=crop",
    highlight: false,
    whatsappLink: "https://wa.me/555197141555?text=Ol%C3%A1!%20Vim%20pelo%20site%20e%20gostaria%20de%20um%20or%C3%A7amento%20de%20grama%20sint%C3%A9tica",
    badges: ["Zero Manutenção", "Proteção UV"]
  }
];

// --- PERGUNTAS FREQUENTES (FAQ) ---
const FAQS = [
  { q: "Qual o prazo de entrega dos capachos personalizados?", a: "Nosso prazo padrão é de 10 a 12 dias úteis após a aprovação da arte." },
  { q: "Como faço para limpar meu capacho?", a: "A limpeza é simples: basta bater o capacho para tirar a poeira solta e lavar com água e sabão neutro. Não utilize produtos químicos fortes." },
  { q: "Vocês entregam em todo o Brasil?", a: "Sim! Enviamos nossos produtos para todo o território nacional com transportadoras parceiras." },
  { q: "A personalização desbota com o tempo?", a: "Não. Utilizamos tecnologia de vulcanização e pintura de alta definição que garantem cores vivas por muito mais tempo, mesmo com alto tráfego de pessoas." }
];

// --- CONFIGURAÇÃO DAS IMAGENS DO PORTFÓLIO (ANTES E DEPOIS) ---
const PORTFOLIO_ITEMS = [
  {
    id: 1,
    title: "Aladdin Arguilas",
    description: "O tapete virou parte essencial da identidade visual da loja.",
    beforeImage: "https://raw.githubusercontent.com/eunicolassilveira-lgtm/Imagem-cia-do-tapete/main/WhatsApp%20Image%202026-02-09%20at%2020.14.31.jpeg",
    afterImage: "https://raw.githubusercontent.com/eunicolassilveira-lgtm/Imagem-cia-do-tapete/main/WhatsApp%20Image%202026-02-09%20at%2020.14.44.jpeg",
    alt: "Capacho Personalizado Aladdin"
  },
  {
    id: 2,
    title: "Identidade Visual Corporativa",
    description: "A entrada ganhou vida e profissionalismo.",
    beforeImage: "https://raw.githubusercontent.com/eunicolassilveira-lgtm/Imagem-cia-do-tapete/main/WhatsApp%20Image%202026-02-09%20at%2020.15.10.jpeg",
    afterImage: "https://raw.githubusercontent.com/eunicolassilveira-lgtm/Imagem-cia-do-tapete/main/WhatsApp%20Image%202026-02-09%20at%2020.15.23.jpeg",
    alt: "Entrada Corporativa"
  }
];

export function App() {
  const contactRef = useRef<HTMLElement>(null);
  const editorRef = useRef<HTMLElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToContact = () => {
    contactRef.current?.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };
  
  const scrollToEditor = () => {
    editorRef.current?.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-red-100 selection:text-red-900 overflow-x-hidden">
      {/* Header / Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo(0,0)}>
              <span className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight group-hover:text-red-700 transition-colors">Cia do Tapete</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-8 items-center">
              {['Produtos', 'Portfólio', 'Sobre', 'Diferenciais'].map((item) => (
                <a 
                  key={item}
                  href={`#${item.toLowerCase().replace('ó', 'o').replace('í', 'i')}`} 
                  className="relative text-gray-600 hover:text-red-600 font-medium transition-colors text-sm uppercase tracking-wide group py-2"
                >
                  {item}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 transition-all duration-300 group-hover:w-full"></span>
                </a>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button onClick={toggleMobileMenu} className="text-gray-600 hover:text-red-600 focus:outline-none p-2" aria-label="Abrir menu">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-200 animate-fade-in absolute w-full left-0 top-20 shadow-xl z-50">
            <div className="px-4 pt-2 pb-6 space-y-2 flex flex-col">
              <a href="#produtos" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-4 rounded-md text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 border-b border-gray-100">Produtos</a>
              <a href="#portfolio" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-4 rounded-md text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 border-b border-gray-100">Portfólio</a>
              <a href="#sobre" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-4 rounded-md text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 border-b border-gray-100">Sobre</a>
              <a href="#diferenciais" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-4 rounded-md text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 border-b border-gray-100">Diferenciais</a>
            </div>
          </div>
        )}
      </nav>

      {/* 1. Hero Section - IMPACTFUL & MODERN */}
      <section className="relative min-h-[90dvh] flex items-center justify-center overflow-hidden">
        {/* Background Image - Professional Corporate Entrance */}
        <div 
          className="absolute inset-0 z-0"
          style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000&auto=format&fit=crop")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }}
        ></div>
        
        {/* Dark Overlay for text readability and depth */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/70 via-black/80 to-[#0a0a0a]"></div>

        {/* Subtle red glow effect behind the text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/20 rounded-full blur-[120px] pointer-events-none z-0"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center text-center">
          
          {/* Main Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-[1.1] mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Sua empresa merece uma <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700">Entrada Triunfal.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-2xl text-gray-400 max-w-3xl mx-auto mb-10 font-light leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Transforme a entrada do seu negócio com tapetes e capachos personalizados que destacam sua marca e retêm até 80% da sujeira.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            
            {/* WhatsApp Button */}
            <a 
              href="https://wa.me/555197141555?text=Ol%C3%A1!%20Vim%20pelo%20site%20e%20gostaria%20de%20um%20or%C3%A7amento%20de%20capacho" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 text-lg px-8 py-4 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-bold uppercase tracking-wide transition-all transform hover:scale-105 hover:shadow-[0_0_20px_rgba(37,211,102,0.4)]"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Quero um Capacho
            </a>

            {/* Secondary Button */}
            <Button variant="outline" onClick={scrollToEditor} className="text-lg px-8 py-4 border-2 border-white/30 bg-white/5 backdrop-blur-sm text-white hover:bg-white hover:text-black hover:border-white w-full sm:w-auto rounded-xl group uppercase tracking-wide transition-all">
              <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Simular Arte
            </Button>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-10 hidden md:block">
          <svg className="w-6 h-6 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Trusted Brands Section */}
      <section className="py-12 bg-white border-b border-gray-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-8">Empresas que confiam na Cia do Tapete</p>
          <div className="flex animate-marquee gap-16 whitespace-nowrap items-center">
            {/* Brands x2 for seamless loop */}
            {[...["Condomínio Prime", "Rede D'Or", "TechCorp", "Hotel Lux", "Construtora Alpha", "Sicredi", "Ortobom", "Citroën"], ...["Condomínio Prime", "Rede D'Or", "TechCorp", "Hotel Lux", "Construtora Alpha", "Sicredi", "Ortobom", "Citroën"]].map((b, i) => (
              <span key={i} className="text-2xl font-black text-gray-400">{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Social Proof (Before & After Slider) - PORTFOLIO */}
      <section id="portfolio" className="py-20 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="text-red-600 font-bold tracking-widest uppercase text-xs">Portfólio</span>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2">Transformações Reais</h2>
              <p className="mt-4 text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
                Veja o impacto de um capacho personalizado na entrada de um negócio.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {PORTFOLIO_ITEMS.map((item, index) => (
               <FadeIn key={item.id} direction={index % 2 === 0 ? "right" : "left"} delay={index * 200}>
                <div className="space-y-6">
                  <BeforeAfterSlider 
                    beforeImage={item.beforeImage}
                    afterImage={item.afterImage}
                    alt={item.alt}
                  />
                  <div className="px-2 border-l-4 border-red-600 pl-6">
                    <h4 className="font-bold text-xl md:text-2xl text-gray-900">{item.title}</h4>
                    <p className="text-gray-600 mt-2 italic text-base md:text-lg leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 3. PRODUCTS SECTION (NEW) */}
      <section id="produtos" className="py-20 bg-neutral-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
             <div className="text-center mb-16">
              <span className="text-red-600 font-bold tracking-widest uppercase text-xs">Nosso Catálogo</span>
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 mt-2 tracking-tight">Soluções Completas</h2>
              <div className="w-24 h-1 bg-red-600 mx-auto mt-6 rounded-full"></div>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {PRODUCTS.map((product, index) => (
              <FadeIn key={product.id} delay={index * 150} direction="up" className="h-full">
                <div className={`group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 h-full flex flex-col border border-gray-100 ${product.highlight ? 'ring-2 ring-red-500 ring-offset-4 ring-offset-neutral-50' : ''}`}>
                  
                  {/* Image Area */}
                  <div className="relative h-64 overflow-hidden">
                    <div className="absolute inset-0 bg-neutral-900/10 group-hover:bg-neutral-900/0 transition-colors z-10"></div>
                    <img 
                      src={product.image} 
                      alt={product.title} 
                      className={`w-full h-full ${product.imageClassName || 'object-cover'} transform group-hover:scale-105 transition-transform duration-700`}
                      loading="lazy"
                    />
                    {product.highlight && (
                      <div className="absolute top-4 right-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full z-20 shadow-md">
                        Mais Vendido
                      </div>
                    )}
                  </div>

                  {/* Content Area */}
                  <div className="p-8 flex flex-col flex-grow">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {product.badges?.map(badge => (
                        <span key={badge} className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                          {badge}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors">
                      {product.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-6 leading-relaxed flex-grow">
                      {product.description}
                    </p>

                    <Button 
                      variant={product.highlight ? "primary" : "outline"} 
                      fullWidth 
                      onClick={() => product.whatsappLink ? window.open(product.whatsappLink, '_blank') : scrollToContact()} 
                      className="text-sm py-2"
                    >
                      Orçamento
                    </Button>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 4. AI Editor Feature Section - ENGAGEMENT */}
      <section id="simulador" ref={editorRef} className="py-20 md:py-32 bg-neutral-900 relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        
        {/* Decorative Glow */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-red-600/20 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <FadeIn>
              <div className="text-center mb-12 md:mb-16">
                  <span className="text-red-500 font-bold tracking-widest uppercase text-xs border border-red-900 bg-red-900/30 px-3 py-1 rounded-full">Exclusivo para Capachos</span>
                  <h2 className="text-4xl md:text-5xl font-extrabold text-white mt-6 mb-6 tracking-tight">Simulador de Tapetes</h2>
                  <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                      Envie uma foto da sua entrada e visualize como ficaria um capacho personalizado.
                  </p>
              </div>
            </FadeIn>
            <FadeIn delay={200} direction="up">
              <ImageEditor />
            </FadeIn>
        </div>
      </section>

      {/* 5. About Section - AUTHORITY */}
      <section id="sobre" className="py-16 md:py-24 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-20 items-center">
            <FadeIn direction="right" className="mb-12 lg:mb-0 relative group">
               {/* Ajuste visual: rotação reduzida e opacidade ajustada para parecer mais 'centrado' e menos caótico */}
               <div className="absolute inset-0 bg-red-600 rounded-2xl transform rotate-1 scale-[1.02] opacity-10 transition-transform group-hover:rotate-0"></div>
               {/* 360 Panorama Viewer Replacement */}
               <PanoramaViewer 
                  imageUrl="https://lh3.googleusercontent.com/gps-cs-s/AHVAwepO37SOukCHDBIp_UdPHsUtXJGOVayKaqnhdubGKuI2Njx78mjUveIY_dxUpfHAH5BoTx1N3yCaFCqSemJ_lRYnyPDacvvHj1CWt0D7VrFt16XzqxPKVNo1lvgYtifigFFsAwNPrA=w4096-h2048-k-no" 
                  initialPitch={-5}
                  initialHfov={100}
               />
            </FadeIn>
            <FadeIn direction="left">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 md:mb-8 leading-tight">
                Tradição que se vê <br className="hidden md:block" /> <span className="text-red-600">na qualidade.</span>
              </h2>
              <div className="space-y-6 text-base md:text-lg text-gray-600 leading-relaxed text-justify md:text-left">
                <p>
                  Com <strong>mais de 27 anos de mercado</strong>, a Cia do Tapete oferece soluções completas em decoração corporativa e promocional.
                </p>
                <p>
                  Somos parceiros de empresas que buscam unir funcionalidade e beleza, com um compromisso inegociável com a qualidade.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* 6. Differentiators Section - CLOSING ARGUMENT */}
      <section id="diferenciais" className="py-16 md:py-24 bg-neutral-900 text-white relative border-t border-neutral-800">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <FadeIn>
            <div className="text-center mb-16 md:mb-20">
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">Por que a Cia do Tapete?</h2>
              <p className="mt-4 text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-light">
                Não vendemos apenas produtos. Entregamos imagem corporativa e durabilidade.
              </p>
            </div>
          </FadeIn>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Item 1 */}
            <FadeIn delay={100} className="h-full">
              <div className="bg-neutral-800/50 p-8 md:p-10 rounded-2xl border border-neutral-700 hover:border-red-600 transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(220,38,38,0.2)] group h-full">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center mb-6 md:mb-8 shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 md:w-8 md:h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-4 text-white">Durabilidade Extrema</h3>
                <p className="text-gray-400 leading-relaxed text-sm md:text-base">
                  Nossos materiais são projetados para resistir ao alto tráfego por anos sem perder a cor.
                </p>
              </div>
            </FadeIn>

            {/* Item 2 */}
            <FadeIn delay={300} className="h-full">
              <div className="bg-neutral-800/50 p-8 md:p-10 rounded-2xl border border-neutral-700 hover:border-red-600 transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(220,38,38,0.2)] group h-full">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center mb-6 md:mb-8 shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 md:w-8 md:h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-4 text-white">Tecnologia de Ponta</h3>
                <p className="text-gray-400 leading-relaxed text-sm md:text-base">
                  Da vulcanização a laser à impressão HD, utilizamos os melhores processos do mercado.
                </p>
              </div>
            </FadeIn>

            {/* Item 3 */}
            <FadeIn delay={500} className="h-full">
              <div className="bg-neutral-800/50 p-8 md:p-10 rounded-2xl border border-neutral-700 hover:border-red-600 transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(220,38,38,0.2)] group h-full">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center mb-6 md:mb-8 shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 md:w-8 md:h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-4 text-white">Personalização Total</h3>
                <p className="text-gray-400 leading-relaxed text-sm md:text-base">
                  Adaptamos cada produto à identidade visual da sua marca, sob medida para seu projeto.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">Perguntas Frequentes</h2>
            <p className="mt-4 text-gray-600">Tire suas dúvidas rapidamente antes de falar com nosso consultor.</p>
          </div>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <details key={i} className="group bg-white rounded-xl shadow-sm border border-gray-100 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between p-6 cursor-pointer font-medium text-gray-900 hover:text-red-600 transition-colors">
                  {faq.q}
                  <span className="transition duration-300 group-open:rotate-180 text-gray-400 group-hover:text-red-600">
                    <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer ref={contactRef} className="bg-neutral-900 text-gray-300 py-12 md:py-16 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-2">
             <span className="text-2xl font-black text-white tracking-tight">Cia do Tapete</span>
             <p className="mt-4 text-gray-500 text-sm leading-relaxed max-w-sm">
               Soluções completas em tapetes, cortinas e windbanners desde 1996.
             </p>
          </div>
          
          {/* Contact Column */}
          <div className="col-span-1 md:col-span-2 flex flex-col md:items-end">
            <h4 className="text-white font-bold mb-4">Redes Sociais</h4>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <a 
                href="https://www.instagram.com/ciadotapetejp/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 group"
                aria-label="Instagram"
              >
                <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center group-hover:bg-red-600 transition-colors shrink-0">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 6.838c-2.85 0-5.162 2.312-5.162 5.162s2.312 5.162 5.162 5.162 5.162-2.312 5.162-5.162-2.312-5.162-5.162-5.162zm0 8.462c-1.821 0-3.3-1.479-3.3-3.3s1.479-3.3 3.3-3.3 3.3 1.479 3.3 3.3-1.479 3.3-3.3 3.3zm3.406-7.845c-.663 0-1.2.537-1.2 1.2s.537 1.2 1.2 1.2 1.2-.537 1.2-1.2-.537-1.2-1.2-1.2z"/>
                  </svg>
                </div>
                <span className="text-gray-400 group-hover:text-white transition-colors text-sm font-medium max-w-[120px] leading-tight">
                  Conheça nossa empresa
                </span>
              </a>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-neutral-800 flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} Cia do Tapete. Todos os direitos reservados.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
             <a href="#" className="hover:text-red-500 transition-colors">Política de Privacidade</a>
             <a href="#" className="hover:text-red-500 transition-colors">Termos de Uso</a>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.me/555197141555?text=Ol%C3%A1!%20Vim%20pelo%20site%20e%20gostaria%20de%20um%20or%C3%A7amento"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center group"
        aria-label="Falar no WhatsApp"
      >
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap font-bold pl-0 group-hover:pl-3">
          Fale Conosco
        </span>
      </a>
    </div>
  );
}