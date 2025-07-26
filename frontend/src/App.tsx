import React, { useState, useEffect } from 'react';
import { WalletConnection } from './components/WalletConnection';
import { 
  ArrowRight, 
  TrendingUp, 
  Shield, 
  Zap, 
  Target, 
  BarChart3, 
  Cpu, 
  Users, 
  Mail, 
  FileText,
  CheckCircle,
  PlayCircle,
  Wallet,
  Settings,
  Activity,
  Star,
  Award,
  Lock,
  Code,
  Database,
  Globe,
  Layers,
  Calendar
} from 'lucide-react';
import { Routes, Route, useNavigate } from 'react-router-dom';

function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Smart DCA++",
      description: "Drawdown-aware laddered buying via 1inch Limit Orders. Automatically adjusts purchase timing based on market volatility and your risk tolerance.",
      tag: "Smart DCA++"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "TWAP Executor",
      description: "Time-weighted average price execution with adaptive slippage protection. Slice large orders intelligently across optimal time windows.",
      tag: "TWAP Adaptive"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Options Hooks",
      description: "Advanced on-chain options strategies, liquidity provision hooks, and perpetual funding capture vaults for sophisticated yield generation.",
      tag: "Options Hooks"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "1inch Fusion+ Execution",
      description: "Optimal price execution powered by 1inch Fusion+ with MEV protection, best routing, and gasless transactions for maximum efficiency.",
      tag: "MEV Protected"
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: "Non-Custodial Vault Roadmap",
      description: "Future-ready architecture for fully non-custodial smart contract vaults with user-controlled keys and transparent on-chain execution.",
      tag: "Non-Custodial"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Copy Strategy Vaults",
      description: "Social investing platform with copy strategy vaults from top performers, risk parity portfolios, and automated rebalancing.",
      tag: "Social Investing"
    }
  ];

  const steps = [
    {
      icon: <Wallet className="w-12 h-12" />,
      title: "Deposit",
      description: "Connect your wallet and deposit funds to your secure, transparent pooled account with full audit trail and real-time reporting."
    },
    {
      icon: <Settings className="w-12 h-12" />,
      title: "Choose Strategy",
      description: "Select from Smart DCA++, TWAP execution, options strategies, or create custom algorithmic approaches tailored to your goals."
    },
    {
      icon: <Activity className="w-12 h-12" />,
      title: "Automate",
      description: "Strategies execute automatically via 1inch APIs with live performance tracking, detailed analytics, and transparent reporting."
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#10141c] font-sans text-[#0D1B2A] dark:text-gray-100">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/95 dark:bg-[#181e29]/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">H</span>
              </div>
              <span className="text-2xl font-bold text-[#0D1B2A] dark:text-gray-100 tracking-tight">Hypervest</span>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-700 dark:text-gray-200 hover:text-[#0D1B2A] dark:hover:text-white transition-colors font-medium">Features</a>
              <a href="#how-it-works" className="text-gray-700 dark:text-gray-200 hover:text-[#0D1B2A] dark:hover:text-white transition-colors font-medium">How It Works</a>
              <a href="#about" className="text-gray-700 dark:text-gray-200 hover:text-[#0D1B2A] dark:hover:text-white transition-colors font-medium">About</a>
              <a href="#contact" className="text-gray-700 dark:text-gray-200 hover:text-[#0D1B2A] dark:hover:text-white transition-colors font-medium">Contact</a>
            </nav>

            <div className="flex items-center space-x-4">
              <WalletConnection />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50/50 to-white dark:from-[#181e29]/80 dark:to-[#10141c]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center lg:items-start">
            <div className={`w-full flex flex-col items-center text-center transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>  {/* Centered */}
              <h1 className="text-5xl lg:text-6xl font-bold text-[#0D1B2A] dark:text-white leading-tight mb-6 tracking-tight">
                Automated Crypto
                <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent"> Investing.</span>
                <br />Simplified.
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed max-w-xl">
                From DCA to advanced on-chain strategies, Hypervest puts your portfolio on autopilot. 
                Your algorithmic crypto investment co-pilot.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-12 justify-center">
                <button
                  className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-gray-900 font-bold drop-shadow-[0_1px_4px_rgba(0,0,0,0.10)] px-8 py-4 rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg"
                  onClick={() => navigate('/dashboard')}
                >
                  <span>Start Investing Now</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="border-2 border-[#0D1B2A] dark:border-gray-700 text-[#0D1B2A] dark:text-gray-100 px-8 py-4 rounded-xl hover:bg-[#0D1B2A] dark:hover:bg-gray-800 hover:text-white dark:hover:text-emerald-400 transition-all flex items-center justify-center space-x-2 font-semibold">
                  <PlayCircle className="w-5 h-5" />
                  <span>Explore Smart Strategies</span>
                </button>
              </div>
              {/* Trust Signals */}
              <div className="flex flex-wrap items-center gap-8 text-sm justify-center">
                <div className="flex items-center space-x-3 bg-white dark:bg-[#23273a] rounded-lg px-4 py-3 shadow-sm border border-gray-100 dark:border-gray-700">
                  <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium text-gray-800 dark:text-gray-100">Built on 1inch Protocol</span>
                </div>
              </div>
            </div>
            {/* Clean Hero Visual - graph on the right */}
            <div className={`transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} lg:mt-0 flex justify-center`}>
              <div className="bg-white dark:bg-[#181e29] rounded-3xl p-10 shadow-2xl border border-gray-100 dark:border-gray-800 max-w-2xl w-full">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-[#23273a] dark:to-[#181e29] rounded-2xl p-8 mb-8">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="font-semibold text-[#0D1B2A] dark:text-gray-100 text-lg">Portfolio Performance</h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold text-lg">+24.7%</span>
                    </div>
                  </div>
                  <div className="h-56 bg-white dark:bg-[#23273a] rounded-xl flex items-end justify-between p-8 shadow-sm">
                    {[40, 65, 45, 80, 95, 70, 85, 92].map((height, i) => (
                      <div
                        key={i}
                        className="bg-gradient-to-t from-emerald-500 to-cyan-400 dark:from-emerald-400 dark:to-cyan-300 rounded-t-lg w-10 transition-all duration-1000 shadow-sm"
                        style={{ 
                          height: `${height}%`,
                          animationDelay: `${i * 150}ms`
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-[#19323c] dark:to-[#23273a] rounded-xl p-6 border border-emerald-200/50 dark:border-emerald-900/50">
                    <div className="text-2xl font-bold text-[#0D1B2A] dark:text-gray-100 mb-1">$12,450</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Invested</div>
                  </div>
                  <div className="bg-gradient-to-br from-cyan-50 to-cyan-100/50 dark:from-[#193c3c] dark:to-[#23273a] rounded-xl p-6 border border-cyan-200/50 dark:border-cyan-900/50">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">+$3,080</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Gains</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white dark:bg-[#181e29]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-[#0D1B2A] dark:text-white mb-6 tracking-tight">
              Advanced Features for Modern Investors
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              From simple DCA to sophisticated algorithmic strategies, all powered by the 1inch Protocol
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {features.map((feature, index) => (
              <div
                key={index}
                className="relative bg-white/10 dark:bg-white/5 backdrop-blur-xl rounded-3xl p-10 shadow-xl border border-white/20 dark:border-cyan-400/10 transition-all duration-300 hover:shadow-emerald-500/30 hover:border-emerald-400/40 group overflow-hidden"
                style={{ boxShadow: '0 8px 32px 0 rgba(16, 185, 129, 0.15)' }}
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="text-emerald-500 group-hover:scale-125 transition-transform duration-300 p-4 bg-emerald-50/60 dark:bg-emerald-400/10 rounded-2xl shadow-lg">
                    {feature.icon}
                  </div>
                  <span className="text-xs bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-4 py-1 rounded-full font-semibold shadow-md">
                    {feature.tag}
                  </span>
                </div>
                <h3 className="text-2xl font-extrabold text-[#0D1B2A] dark:text-white mb-4 tracking-tight drop-shadow-lg">{feature.title}</h3>
                <div className="h-1 w-12 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full mb-6 opacity-70"></div>
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed font-medium drop-shadow-sm">
                  {feature.description}
                </p>
                {/* Optional: Featured badge */}
                {index === 0 && (
                  <span className="absolute top-6 right-6 text-xs font-bold bg-emerald-500 text-white px-3 py-1 rounded-full shadow-lg animate-pulse z-10">Featured</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-gradient-to-b from-gray-50/50 to-white dark:from-[#181e29]/80 dark:to-[#10141c]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-[#0D1B2A] dark:text-white mb-6 tracking-tight">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Get started with automated crypto investing in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 mb-16">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`text-center transform transition-all duration-500 ${
                  activeStep === index ? 'scale-105' : 'scale-100'
                }`}
              >
                <div className={`mx-auto w-28 h-28 rounded-2xl flex items-center justify-center mb-8 transition-all duration-500 shadow-lg ${
                  activeStep === index 
                    ? 'bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-xl shadow-emerald-500/25' 
                    : 'bg-white text-gray-400 border-2 border-gray-200'
                }`}>
                  {step.icon}
                </div>
                <h3 className="text-2xl font-bold text-[#0D1B2A] dark:text-gray-100 mb-4">
                  Step {index + 1}: {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-sm mx-auto">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          {/* Progress Indicator */}
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between mb-4">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                    activeStep >= index 
                      ? 'bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-lg' 
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {index + 1}
                </div>
              ))}
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-500 ease-in-out rounded-full"
                style={{ width: `${((activeStep + 1) / 3) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-[#0D1B2A] text-white dark:bg-[#181e29]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-8 tracking-tight">
                Our Mission
              </h2>
              <blockquote className="text-2xl text-emerald-300 mb-8 leading-relaxed font-medium italic">
                "Most people don't need to day trade — they need automated, proven strategies."
              </blockquote>
              <p className="text-gray-300 leading-relaxed mb-8 text-lg">
                At Hypervest, we believe that sophisticated investment strategies shouldn't be limited to 
                institutional investors. Our platform democratizes access to advanced algorithmic trading, 
                making it simple for anyone to benefit from professional-grade investment automation.
              </p>
              
              <div className="grid grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-emerald-400 mb-2">$50M+</div>
                  <div className="text-gray-400 font-medium">Assets Managed</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-cyan-400 mb-2">10K+</div>
                  <div className="text-gray-400 font-medium">Active Users</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-700">
              <h3 className="text-2xl font-bold mb-8 text-white">Tech & Engineering Excellence</h3>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <Code className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Experienced DeFi Engineers</div>
                    <div className="text-gray-400 text-sm">Built by veterans from top DeFi protocols</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Security-First Architecture</div>
                    <div className="text-gray-400 text-sm">Multi-layer security with formal verification</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Quantitative Trading Background</div>
                    <div className="text-gray-400 text-sm">Proven algorithms from traditional finance</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                    <Database className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Advanced Infrastructure</div>
                    <div className="text-gray-400 text-sm">High-performance execution with 99.9% uptime</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact/Beta Signup Section */}
      <section id="contact" className="py-24 bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-[#181e29]/80 dark:to-[#10141c]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-[#0D1B2A] dark:text-white mb-6 tracking-tight">
            Join Early Access
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-16 max-w-2xl mx-auto leading-relaxed">
            Be among the first to experience the future of automated crypto investing
          </p>

          <div className="bg-white dark:bg-[#181e29] rounded-3xl p-10 shadow-2xl max-w-2xl mx-auto border border-gray-100 dark:border-gray-800">
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg"
              />
              <button className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-8 py-4 rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all transform hover:scale-105 font-semibold shadow-lg">
                Join Waitlist
              </button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button className="flex items-center justify-center space-x-2 text-[#0D1B2A] hover:text-emerald-600 transition-colors font-medium">
                <FileText className="w-5 h-5" />
                <span>Request Whitepaper</span>
              </button>
              <button className="flex items-center justify-center space-x-2 text-[#0D1B2A] hover:text-emerald-600 transition-colors font-medium">
                <Mail className="w-5 h-5" />
                <span>Contact Team</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0D1B2A] text-white py-6 dark:bg-[#181e29]">
        <div className="text-center text-gray-400">
          <p>&copy; 2025 Hypervest. All rights reserved. Built on the 1inch Protocol.</p>
        </div>
      </footer>
    </div>
  );
}

function Dashboard() {
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('USDC');

  const handleDeposit = () => {
    // Handle deposit logic here
    console.log(`Depositing ${depositAmount} ${selectedCurrency}`);
    setShowDepositModal(false);
    setDepositAmount('');
  };

  return (
    <div className="min-h-screen bg-[#10141c] text-gray-100 px-4 py-10">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Top Row: Balance & Quick Deposit */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/10 flex flex-col justify-between">
            <div>
              <div className="text-gray-400 text-sm mb-2">TOTAL BALANCE</div>
              <div className="text-4xl font-extrabold mb-2">$45,723.89</div>
              <div className="text-emerald-400 font-bold flex items-center gap-2 text-sm">
                <ArrowRight className="w-4 h-4 inline-block rotate-90" /> +2.34% <span className="text-gray-400">(24h)</span>
              </div>
            </div>
            <button 
              className="mt-8 bg-gradient-to-r from-emerald-500 to-cyan-500 text-gray-900 font-bold px-6 py-3 rounded-xl shadow-lg hover:from-emerald-600 hover:to-cyan-600 transition-all w-40"
              onClick={() => setShowDepositModal(true)}
            >
              Deposit
            </button>
          </div>
          <div className="bg-gradient-to-br from-emerald-900/40 to-cyan-900/30 rounded-3xl p-8 shadow-xl border border-cyan-400/10 flex flex-col justify-between">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-emerald-500/20 p-3 rounded-full">
                <ArrowRight className="w-6 h-6 text-emerald-400 rotate-90" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">Quick Deposit</div>
                <div className="text-gray-400 text-sm">Add funds instantly</div>
              </div>
            </div>
            <button 
              className="bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:bg-emerald-600 transition-all w-full"
              onClick={() => setShowDepositModal(true)}
            >
              Deposit Funds
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="text-gray-400 text-xs mb-1">Active Strategies</div>
            <div className="text-2xl font-bold">3</div>
            <div className="text-emerald-400 text-xs">+1 this week</div>
          </div>
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="text-gray-400 text-xs mb-1">Monthly Return</div>
            <div className="text-2xl font-bold">12.4%</div>
            <div className="text-emerald-400 text-xs">+2.1% vs last month</div>
          </div>
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="text-gray-400 text-xs mb-1">Next DCA</div>
            <div className="text-2xl font-bold">2 days</div>
            <div className="text-gray-400 text-xs">$500 scheduled</div>
          </div>
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="text-gray-400 text-xs mb-1">Portfolio Target</div>
            <div className="text-2xl font-bold">68%</div>
            <div className="text-emerald-400 text-xs">32% to goal</div>
          </div>
        </div>

        {/* Investment Strategies */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-2xl font-bold text-white mb-1">Investment Strategies</div>
              <div className="text-gray-400">Automate your crypto investments with proven strategies</div>
            </div>
            <button className="px-4 py-2 rounded-lg border border-cyan-500 text-cyan-400 font-semibold hover:bg-cyan-900/20 transition-all">View All</button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
            {/* DCA Card */}
            <div className="bg-gradient-to-br from-emerald-900/40 to-cyan-900/30 rounded-2xl p-6 border border-emerald-400/10 flex flex-col justify-between shadow-lg">
              <div className="flex items-center gap-4 mb-2">
                <Calendar className="w-8 h-8 text-emerald-400" />
                <div>
                  <div className="font-bold text-white text-lg">Dollar Cost Averaging</div>
                  <div className="flex gap-2 mt-1">
                    <span className="bg-emerald-500/80 text-white text-xs px-2 py-0.5 rounded-full font-semibold">active</span>
                    <span className="bg-emerald-900/60 text-emerald-300 text-xs px-2 py-0.5 rounded-full font-semibold">low risk</span>
                  </div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-xs text-gray-400">Performance</div>
                  <div className="text-emerald-400 font-bold">+8.2%</div>
                </div>
              </div>
              <div className="text-gray-300 mb-4">Invest a fixed amount regularly to reduce volatility impact. Perfect for long-term wealth building.</div>
              <button className="bg-white/10 text-emerald-300 font-semibold px-4 py-2 rounded-lg hover:bg-emerald-900/30 transition-all w-32">Configure</button>
            </div>
            {/* TWAP Card */}
            <div className="bg-gradient-to-br from-cyan-900/40 to-emerald-900/30 rounded-2xl p-6 border border-cyan-400/10 flex flex-col justify-between shadow-lg">
              <div className="flex items-center gap-4 mb-2">
                <BarChart3 className="w-8 h-8 text-cyan-400" />
                <div>
                  <div className="font-bold text-white text-lg">TWAP Strategy</div>
                  <div className="flex gap-2 mt-1">
                    <span className="bg-emerald-500/80 text-white text-xs px-2 py-0.5 rounded-full font-semibold">active</span>
                    <span className="bg-yellow-900/60 text-yellow-300 text-xs px-2 py-0.5 rounded-full font-semibold">medium risk</span>
                  </div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-xs text-gray-400">Performance</div>
                  <div className="text-cyan-400 font-bold">+12.7%</div>
                </div>
              </div>
              <div className="text-gray-300 mb-4">Time-Weighted Average Price execution for large orders. Minimize market impact with smart timing.</div>
              <button className="bg-white/10 text-cyan-300 font-semibold px-4 py-2 rounded-lg hover:bg-cyan-900/30 transition-all w-32">Configure</button>
            </div>
            {/* Buy the Dip Card */}
            <div className="bg-gradient-to-br from-gray-900/40 to-emerald-900/20 rounded-2xl p-6 border border-gray-400/10 flex flex-col justify-between shadow-lg">
              <div className="flex items-center gap-4 mb-2">
                <TrendingUp className="w-8 h-8 text-emerald-400" />
                <div>
                  <div className="font-bold text-white text-lg">Buy the Dip</div>
                  <div className="flex gap-2 mt-1">
                    <span className="bg-gray-700/80 text-gray-300 text-xs px-2 py-0.5 rounded-full font-semibold">inactive</span>
                    <span className="bg-yellow-900/60 text-yellow-300 text-xs px-2 py-0.5 rounded-full font-semibold">medium risk</span>
                  </div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-xs text-gray-400">Performance</div>
                  <div className="text-emerald-400 font-bold">+8.2%</div>
                </div>
              </div>
              <div className="text-gray-300 mb-4">Automatically purchase when prices drop below key support levels. Smart dip detection using technical indicators.</div>
              <button className="bg-emerald-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-emerald-600 transition-all w-40">Activate Strategy</button>
            </div>
            {/* Mean Reversion Card */}
            <div className="bg-gradient-to-br from-cyan-900/40 to-gray-900/30 rounded-2xl p-6 border border-cyan-400/10 flex flex-col justify-between shadow-lg">
              <div className="flex items-center gap-4 mb-2">
                <Cpu className="w-8 h-8 text-cyan-400" />
                <div>
                  <div className="font-bold text-white text-lg">Mean Reversion</div>
                  <div className="flex gap-2 mt-1">
                    <span className="bg-cyan-500/80 text-white text-xs px-2 py-0.5 rounded-full font-semibold">new</span>
                    <span className="bg-red-900/60 text-red-300 text-xs px-2 py-0.5 rounded-full font-semibold">high risk</span>
                  </div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-xs text-gray-400">Performance</div>
                  <div className="text-cyan-400 font-bold">+12.7%</div>
                </div>
              </div>
              <div className="text-gray-300 mb-4">Profit from price corrections by buying oversold and selling overbought conditions.</div>
              <button className="bg-emerald-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-emerald-600 transition-all w-40">Activate Strategy</button>
            </div>
          </div>
        </div>

        {/* Market Insights */}
        <div>
          <div className="text-2xl font-bold text-white mb-4 mt-12">Market Insights</div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 flex flex-col gap-2">
              <div className="font-bold text-emerald-400">DCA Opportunity</div>
              <div className="text-gray-300">Bitcoin is down 3.2% this week</div>
              <div className="text-gray-400 text-sm">Perfect time to increase your DCA amount for better averaging price.</div>
              <button className="bg-emerald-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-emerald-600 transition-all w-40 mt-2">Adjust DCA</button>
            </div>
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 flex flex-col gap-2">
              <div className="font-bold text-cyan-400">Portfolio Health</div>
              <div className="text-gray-300">All strategies performing well</div>
              <div className="text-gray-400 text-sm">Your automated strategies are on track to meet yearly targets.</div>
              <button className="bg-cyan-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-cyan-600 transition-all w-40 mt-2">View Details</button>
            </div>
          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#181e29] rounded-3xl p-8 shadow-2xl border border-cyan-400/20 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Deposit Funds</h2>
              <button 
                onClick={() => setShowDepositModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Amount</label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-2">Currency</label>
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="USDC">USDC</option>
                  <option value="USDT">USDT</option>
                  <option value="ETH">ETH</option>
                  <option value="BTC">BTC</option>
                </select>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDepositModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeposit}
                  disabled={!depositAmount}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-gray-900 font-bold px-4 py-3 rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm Deposit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}