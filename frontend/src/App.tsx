import React, { useState, useEffect } from 'react';
import { WalletConnection } from './components/WalletConnection';
import axios from 'axios';
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
  Calendar,
  RefreshCw,
  Check,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAccount, useConfig, useFeeData, useEstimateGas } from 'wagmi';
import { writeContract, estimateGas } from '@wagmi/core';
import { parseUnits } from 'viem';
// import { formatUnits } from 'ethers';

// Shared Header Component
function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';
  const isDashboard = location.pathname === '/dashboard';
  const isStrategies = location.pathname === '/strategies';
  const isSwap = location.pathname === '/swap';

  return (
    <header className="fixed top-0 w-full bg-white/95 dark:bg-[#181e29]/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">H</span>
              </div>
              <span className="text-2xl font-bold text-[#0D1B2A] dark:text-gray-100 tracking-tight">Hypervest</span>
            </button>
          </div>
          
          {isHomePage && (
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-700 dark:text-gray-200 hover:text-[#0D1B2A] dark:hover:text-white transition-colors font-medium">Features</a>
              <a href="#how-it-works" className="text-gray-700 dark:text-gray-200 hover:text-[#0D1B2A] dark:hover:text-white transition-colors font-medium">How It Works</a>
              <a href="#about" className="text-gray-700 dark:text-gray-200 hover:text-[#0D1B2A] dark:hover:text-white transition-colors font-medium">About</a>
              <a href="#contact" className="text-gray-700 dark:text-gray-200 hover:text-[#0D1B2A] dark:hover:text-white transition-colors font-medium">Contact</a>
            </nav>
          )}

          {isStrategies && (
            <nav className="hidden md:flex space-x-8">
              <button 
                onClick={() => navigate('/dashboard')}
                className="text-gray-700 dark:text-gray-200 hover:text-[#0D1B2A] dark:hover:text-white transition-colors font-medium"
              >
                Dashboard
              </button>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Strategies</span>
              <button 
                onClick={() => navigate('/swap')}
                className="text-gray-700 dark:text-gray-200 hover:text-[#0D1B2A] dark:hover:text-white transition-colors font-medium"
              >
                Swap
              </button>
            </nav>
          )}
          {isDashboard && (
            <nav className="hidden md:flex space-x-8">
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Dashboard</span>
              <button 
                onClick={() => navigate('/strategies')}
                className="text-gray-700 dark:text-gray-200 hover:text-[#0D1B2A] dark:hover:text-white transition-colors font-medium"
              >
                Strategies
              </button>
              <button 
                onClick={() => navigate('/swap')}
                className="text-gray-700 dark:text-gray-200 hover:text-[#0D1B2A] dark:hover:text-white transition-colors font-medium"
              >
                Swap
              </button>
            </nav>
          )}
          {isSwap && (
            <nav className="hidden md:flex space-x-8">
              <button 
                onClick={() => navigate('/dashboard')}
                className="text-gray-700 dark:text-gray-200 hover:text-[#0D1B2A] dark:hover:text-white transition-colors font-medium"
              >
                Dashboard
              </button>
              <button 
                onClick={() => navigate('/strategies')}
                className="text-gray-700 dark:text-gray-200 hover:text-[#0D1B2A] dark:hover:text-white transition-colors font-medium"
              >
                Strategies
              </button>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Swap</span>
            </nav>
          )}

          <div className="flex items-center space-x-4">
            <WalletConnection />
          </div>
        </div>
      </div>
    </header>
  );
}

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
      {/* Hero Section */}
      <section className="pt-40 pb-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50/50 to-white dark:from-[#181e29]/80 dark:to-[#10141c]">
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
                <button 
                  className="border-2 border-[#0D1B2A] dark:border-gray-700 text-[#0D1B2A] dark:text-gray-100 px-8 py-4 rounded-xl hover:bg-[#0D1B2A] dark:hover:bg-gray-800 hover:text-white dark:hover:text-emerald-400 transition-all flex items-center justify-center space-x-2 font-semibold"
                  onClick={() => navigate('/strategies')}
                >
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
  const { address } = useAccount();
  const config = useConfig();
  const navigate = useNavigate();
  const { data: feeData } = useFeeData({
    chainId: 42161, // Arbitrum One
    formatUnits: 'gwei', // Format the units
    query: {
      refetchInterval: 2000, // Refetch every 2 seconds
      staleTime: 2000, // Time after which data is considered stale
    }
  });
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositAddress, setDepositAddress] = useState('');
  const [depositTxHash, setDepositTxHash] = useState('');
  const [depositStatus, setDepositStatus] = useState<'idle' | 'getting-address' | 'waiting-transfer' | 'sending' | 'confirming' | 'success' | 'error'>('idle');
  const [currentBalance, setCurrentBalance] = useState('0');
  const [tokenBalances, setTokenBalances] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // DCA Strategy Data
  const [dcaData, setDcaData] = useState({
    initialInvestment: 100,
    currentValue: 200,
    timePeriod: '6 months',
    token: 'ETH',
    percentageGain: 100
  });

  // Fetch DCA performance data
  const fetchDcaPerformance = async () => {
    try {
      // Simulate API call - in real app, this would fetch from your backend
      const mockData = {
        initialInvestment: 100,
        currentValue: Math.floor(Math.random() * 150) + 150, // Random value between 150-300
        timePeriod: '6 months',
        token: 'ETH',
        percentageGain: Math.floor(Math.random() * 80) + 50 // Random gain between 50-130%
      };
      
      setDcaData(mockData);
    } catch (error) {
      console.error('Failed to fetch DCA performance:', error);
    }
  };

  // USDC contract address on Arbitrum One
  const USDC_CONTRACT_ADDRESS = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831';

  // USDC transfer ABI
  const transferAbi = [{
    name: 'transfer',
    type: 'function',
    inputs: [
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ type: 'bool' }],
    stateMutability: 'nonpayable'
  }] as const;

  // Initiate USDC transfer automatically
  const initiateUSDCTransfer = async (toAddress: string) => {
    try {
      setDepositStatus('sending');
      
      if (!address) {
        throw new Error('Wallet not connected');
      }

      if (!depositAmount || isNaN(Number(depositAmount))) {
        throw new Error('Invalid deposit amount');
      }

      console.log('💰 Auto-opening wallet for USDC transfer...');
      console.log('📤 To:', toAddress);
      console.log('💵 Amount:', depositAmount, 'USDC');
      
      // Prepare transaction data
      const transactionData = {
        address: USDC_CONTRACT_ADDRESS as `0x${string}`,
        abi: transferAbi,
        functionName: 'transfer',
        args: [
          toAddress as `0x${string}`,
          parseUnits(depositAmount, 6)
        ]
      } as const;

      // Execute the transfer with proper gas estimation
      console.log('⛽ Using proper gas estimation for USDC transfer...');
      
      const txOptions: any = { ...transactionData };
      
      // Set conservative gas limit
      txOptions.gas = BigInt(65000);
      
      // Use fee data if available
      if (feeData) {
        console.log('⛽ Fee data available:', {
          gasPrice: feeData.gasPrice,
          maxFeePerGas: feeData.maxFeePerGas, 
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
          formatted: feeData.formatted
        });
        
        // For EIP-1559 transactions (Arbitrum One supports this)
        if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
          // Option 1: Use max fees for reliability (current approach)
          // txOptions.maxFeePerGas = feeData.maxFeePerGas;
          // txOptions.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
          
          // Option 2: Use reduced fees for cost optimization (your suggestion)
          // Reduce fees by 20% to save on gas costs (but slower confirmation)
          const reducedMaxFee = (feeData.maxFeePerGas * BigInt(80)) / BigInt(100);
          const reducedPriorityFee = (feeData.maxPriorityFeePerGas * BigInt(80)) / BigInt(100);
          
          txOptions.maxFeePerGas = reducedMaxFee;
          txOptions.maxPriorityFeePerGas = reducedPriorityFee;
          console.log('⛽ Using reduced EIP-1559 fees (80% of max) for cost optimization');
        } else if (feeData.gasPrice) {
          // Reduce legacy gas price by 20% for cost savings
          const reducedGasPrice = (feeData.gasPrice * BigInt(80)) / BigInt(100);
          txOptions.gasPrice = reducedGasPrice;
          console.log('⛽ Using reduced legacy gas price (80% of recommended)');
        }
      } else {
        console.log('⛽ No fee data available, letting wallet estimate');
      }
      
      const hash = await writeContract(config, txOptions);

      setDepositTxHash(hash);
      setDepositStatus('waiting-transfer');
      console.log('✅ USDC transfer initiated with hash:', hash);
      
    } catch (error) {
      console.error('Failed to initiate USDC transfer:', error);
      setDepositStatus('error');
    }
  };

  // Get deposit address from backend
  const getDepositAddress = async () => {
    try {
      setDepositStatus('getting-address');
      
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('No auth token found');
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.10:3000'}/api/wallet/deposit-address`, {
        method: 'GET',
        headers: {
          'Authorization': `Wallet ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get deposit address');
      }

      const data = await response.json();
      setDepositAddress(data.address);
      console.log('🏦 Master wallet:', data.address);
      console.log('🔒 Security:', data.minimumConfirmations, 'confirmations required');
      
      // Automatically initiate USDC transfer
      await initiateUSDCTransfer(data.address);
      
    } catch (error) {
      console.error('Failed to get deposit address:', error);
      setDepositStatus('error');
    }
  };

  // Confirm deposit with real transaction hash
  const confirmDeposit = async () => {
    try {
      setDepositStatus('confirming');
      
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('No auth token found');
      }

      if (!depositTxHash) {
        throw new Error('Transaction hash is required');
      }

      console.log('💳 Submitting deposit with tx hash:', depositTxHash);
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.10:3000'}/api/wallet/deposits`, {
        method: 'POST',
        headers: {
          'Authorization': `Wallet ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ txHash: depositTxHash })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Deposit submitted successfully:', data);
        setDepositStatus('success');
      } else {
        const errorData = await response.text();
        console.error('❌ Deposit failed:', errorData);
        setDepositStatus('error');
      }
      
    } catch (error) {
      console.error('Failed to confirm deposit:', error);
      setDepositStatus('error');
    }
  };

  const handleDeposit = () => {
    if (depositStatus === 'idle') {
      getDepositAddress();
    } else if (depositStatus === 'waiting-transfer') {
      confirmDeposit();
    } else if (depositStatus === 'success') {
      // Reset modal
    setShowDepositModal(false);
    setDepositAmount('');
      setDepositAddress('');
      setDepositTxHash('');
      setDepositStatus('idle');
    } else if (depositStatus === 'error') {
      // Retry: Reset to waiting-transfer state if we have deposit address, otherwise start over
      if (depositAddress) {
        setDepositTxHash(''); // Clear the failed tx hash
        setDepositStatus('waiting-transfer');
      } else {
        // Start completely over
        setDepositAddress('');
        setDepositTxHash('');
        setDepositStatus('idle');
      }
    }
  };

  // function for getting user's current balance
  const getBalance = async () => {
    try {
      if (!address) {return;}
      // if no auth token, return
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        console.warn('No auth token found, cannot fetch balance');
        return;
      }
      // calling the /api/wallet/balances endpoint
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/wallet/balances`, {
        method: 'GET',
        headers: {
          'Authorization': `Wallet ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch balance');
      }
      const data = await response.json();

      let balances = data.balances;
      console.log('USDC balances:', balances);
      let usdcAmount = 0;
      for (let balance of balances) {
          usdcAmount += Number(balance.amount);
      }
      setCurrentBalance(usdcAmount.toFixed(5));
      console.log('Current balance data:', usdcAmount);

    }
    catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  }

  // function for getting 1inch token balances

  
  const get1inchBalances = async () => {
    try {
      if (!address) return;
  
      console.log('🔍 Fetching 1inch token balances for:', address);
  
      const url = `${import.meta.env.VITE_API_BASE_URL}/api/balances`;
  
      const body = {
        tokens: [
          "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // USDC
          "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", // WETH
          "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", // USDC.e
          "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f", // WBTC
          "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", // DAI
          "0x6314c31a7a1652ce482cffe247e9cb7c3f4bb9af", // 1INCH
          "0x912CE59144191C1204E64559FE8253a0e49E6548", // ARB
          "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // ETH
        ],
        walletAddress: address,
      };
  
      const response = await axios.post(url, body);
      console.log('📊 1inch balance data:', response.data);
  
      const nonZeroBalances = parseNonZeroBalances(response.data); 
      console.log('💰 Non-zero token balances:', nonZeroBalances);
  
      setTokenBalances(nonZeroBalances);
    } catch (error) {
      console.error('❌ Failed to fetch 1inch balances:', error);
      setTokenBalances([]);
    }
  };
  
  // ✨ Helper to format and filter balances
  const parseNonZeroBalances = (balanceData: any): Array<{
    token: string;
    symbol: string;
    formattedBalance: number;
    // usdValue?: number;
  }> => {
    const nonZeroBalances = [];
  
    /*
      {
        "addy1": ...#0D1B2A
        "addy2": "100000000000000000        
      }

      -> [
      {address, name, balance}
      ]
    */
    const tokenAddressToTokenNameMap: Record<string, string> = {
      "0xaf88d065e77c8cc2239327c5edb3a432268e5831": "USDC",
      "0x6314c31a7a1652ce482cffe247e9cb7c3f4bb9af": "1INCH",
      "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1": "WETH",
      "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8": "USDC.e",
      "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f": "WBTC",
      "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1": "DAI",
      "0x912CE59144191C1204E64559FE8253a0e49E6548": "ARB",
      "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee": "ETH",
    };

    const tokenAddressToDecimalsMap: Record<string, number> = {
      "0xaf88d065e77c8cc2239327c5edb3a432268e5831": 6, // USDC
      "0x6314c31a7a1652ce482cffe247e9cb7c3f4bb9af": 18, // 1INCH
      "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1": 18, // WETH
      "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8": 6, // USDC.e
      "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f": 8, // WBTC
      "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1": 18, // DAI
      "0x912CE59144191C1204E64559FE8253a0e49E6548": 18, // ARB
      "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee": 18, // ETH
    };

    if (balanceData) {
      for (const [tokenAddress, tokenAmount] of Object.entries(balanceData)) {
        const data = tokenAmount as any;
        console.log(`🔍 Processing token: ${tokenAddress}`, data);
        let tokenValue = parseFloat(data ?? '0');
        if (isNaN(tokenValue) || tokenValue <= 0) {
          console.warn(`⚠️ Skipping zero or invalid balance for token: ${tokenAddress}`);
          continue; // Skip zero or invalid balances
        }
        nonZeroBalances.push({
          token: tokenAddress,
          symbol: tokenAddressToTokenNameMap[tokenAddress] || 'Unknown',
          formattedBalance: tokenValue / Math.pow(10, tokenAddressToDecimalsMap[tokenAddress] || 18), // Convert to human-readable format
          // usdValue: data.usdValue ?? 0,
        });
      }
    }
  
    return nonZeroBalances;
  };
  
  // Unified refresh function with loading state
  const handleRefresh = async () => {
    if (isRefreshing || !address) return;
    
    try {
      setIsRefreshing(true);
      console.log('🔄 Refreshing all balances...');
      
      await Promise.all([
        getBalance(),
        get1inchBalances()
      ]);
      
      console.log('✅ Refresh complete');
    } catch (error) {
      console.error('❌ Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  }

  // Fetch current balance on mount
  useEffect(() => {
    if (address) {
      getBalance();
      get1inchBalances();
      // Set up interval to fetch balance every 30 seconds (reduced frequency for 1inch API)
      const interval = setInterval(() => {
        getBalance();
        get1inchBalances();
      }, 30000); 
      return () => clearInterval(interval); // Cleanup on unmount
    }
    return () => {}; // Return empty cleanup function when no address
  }, [address]);

  return (
    <div className="min-h-screen bg-[#10141c] text-gray-100">
      <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16 pt-32 pb-20">
        {/* Top Row: Protocol Balance and Your Arbitrum Portfolio Side by Side */}
        <div className="grid lg:grid-cols-2 gap-10 mb-16">
          {/* Protocol Balance - Left Side */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-10 shadow-xl border border-white/10">
            <div className="mb-6">
              <div className="text-gray-400 text-sm font-medium mb-3">PROTOCOL BALANCE</div>
              <div className="text-4xl font-bold text-white mb-4"> {
                currentBalance ? `$${parseFloat(currentBalance).toLocaleString()}` : 'Loading...'
                }</div>
            </div>
            <button 
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:from-emerald-600 hover:to-cyan-600 transition-all w-full"
              onClick={() => setShowDepositModal(true)}
            >
              Deposit
            </button>
          </div>

          {/* Your Arbitrum Portfolio - Right Side */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-10 shadow-xl border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Your Arbitrum Portfolio:</h2>
                <p className="text-gray-400 text-sm">1inch Portfolio API</p>
              </div>
              <button 
                onClick={handleRefresh}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-cyan-500 text-cyan-400 font-medium hover:bg-cyan-900/20 transition-all text-sm disabled:opacity-50"
                disabled={!address || isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
            
            {tokenBalances.length > 0 ? (
              <div className="space-y-3 max-h-72 overflow-y-auto">
                {tokenBalances.map((token, index) => (
                  <div
                    key={index}
                    className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-emerald-400/20 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {/* <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-xs">
                            {token.symbol.toUpperCase()}
                          </span>
                        </div> */}
                        <div>
                          <div className="font-semibold text-white text-sm">{token.symbol}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-medium text-sm">{token.formattedBalance}</div>
                        {/* {token.usdValue > 0 && (
                          <div className="text-emerald-400 text-xs">${token.usdValue.toFixed(2)}</div>
                        )} */}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">No Tokens Found</h3>
                <p className="text-gray-400 text-sm mb-4">
                  {address ? 'No tokens with non-zero balances' : 'Connect wallet to view tokens'}
                </p>
                {address && (
                  <button 
                    onClick={handleRefresh}
                    className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold px-4 py-2 rounded-lg hover:from-emerald-600 hover:to-cyan-600 transition-all text-sm disabled:opacity-50"
                    disabled={isRefreshing}
                  >
                    {isRefreshing ? 'Refreshing...' : 'Refresh Balances'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>



        {/* Stats Row */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="bg-white/5 rounded-xl p-8 border border-white/10">
            <div className="text-gray-400 text-xs font-medium mb-3">Active Strategies</div>
            <div className="text-2xl font-bold text-white mb-2">3</div>
            <div className="text-emerald-400 text-xs">+1 this week</div>
          </div>
          <div className="bg-white/5 rounded-xl p-8 border border-white/10">
            <div className="text-gray-400 text-xs font-medium mb-3">Monthly Return</div>
            <div className="text-2xl font-bold text-white mb-2">12.4%</div>
            <div className="text-emerald-400 text-xs">+2.1% vs last month</div>
          </div>
          <div className="bg-white/5 rounded-xl p-8 border border-white/10">
            <div className="text-gray-400 text-xs font-medium mb-3">Next DCA</div>
            <div className="text-2xl font-bold text-white mb-2">2 days</div>
            <div className="text-gray-400 text-xs">$500 scheduled</div>
          </div>
          <div className="bg-white/5 rounded-xl p-8 border border-white/10">
            <div className="text-gray-400 text-xs font-medium mb-3">Portfolio Target</div>
            <div className="text-2xl font-bold text-white mb-2">68%</div>
            <div className="text-gray-400 text-xs">32% to goal</div>
          </div>
        </div>

        {/* Trending Strategies Block */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-10 shadow-xl border border-white/10 mb-16">
          <div className="flex items-center justify-center mb-8">
            <h2 className="text-2xl font-bold text-white">Trending Strategies</h2>
          </div>
          
                     <div className="flex flex-col items-center space-y-6">
             {/* DCA Section */}
             <div className="flex-1 w-full">
               {/* Chart centered */}
               <div className="flex justify-center mb-6">
                 <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                   {/* Simple SVG Chart */}
                   <svg width="600" height="300" viewBox="0 0 200 50" className="w-100 h-50">
                     <defs>
                       <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                         <stop offset="0%" stopColor="#10b981" stopOpacity="0.3"/>
                         <stop offset="100%" stopColor="#10b981" stopOpacity="0.1"/>
                       </linearGradient>
                     </defs>
                     {/* Chart area fill */}
                     <path 
                       d="M0 80 L20 70 L40 60 L60 50 L80 40 L100 30 L120 25 L140 20 L160 15 L180 10 L200 5 L200 100 L0 100 Z" 
                       fill="url(#chartGradient)"
                     />
                     {/* Chart line */}
                     <path 
                       d="M0 80 L20 70 L40 60 L60 50 L80 40 L100 30 L120 25 L140 20 L160 15 L180 10 L200 5" 
                       stroke="#10b981" 
                       strokeWidth="3" 
                       fill="none"
                       strokeLinecap="round"
                       strokeLinejoin="round"
                     />
                   </svg>
                 </div>
               </div>
               
               {/* DCA text below chart */}
               <div className="flex justify-center mb-6">
                 <div className="text-6xl font-bold text-emerald-400">DCA</div>
               </div>
              
              <p className=" text-center text-gray-300 text-lg leading-relaxed">
                If you invested <span className="text-emerald-400 font-semibold">${dcaData.initialInvestment} DCA</span> over past{' '}
                <span className="text-emerald-400 font-semibold">{dcaData.timePeriod}</span> for{' '}
                <span className="text-emerald-400 font-semibold">{dcaData.token}</span> then you would have had{' '}
                <span className="text-emerald-400 font-semibold">${dcaData.currentValue}</span> right now
              </p>
            </div>
          </div>
          
          {/* Bottom Section with CTA and Next Strategy */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
            <button 
              onClick={() => navigate('/strategies')}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:from-emerald-600 hover:to-cyan-600 transition-all flex items-center space-x-2"
            >
              <span>View Strategies</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors cursor-pointer">
              <span className="text-sm font-medium">Next Strategy</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#181e29] rounded-2xl p-8 shadow-2xl border border-cyan-400/20 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">
                {depositStatus === 'success' ? 'Deposit Successful' : 'Deposit USDC'}
              </h2>
              <button 
                onClick={() => {
                  setShowDepositModal(false);
                  setDepositAmount('');
                  setDepositAddress('');
                  setDepositTxHash('');
                  setDepositStatus('idle');
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              {depositStatus === 'idle' && (
                <>
                  <div>
                    <label className="block text-gray-400 text-sm mb-3">Amount</label>
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 text-sm mb-3">Currency</label>
                    <div className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-3 text-white flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">U</span>
                        </div>
                        <span className="font-medium">USDC</span>
                      </div>
                      <span className="text-gray-400 text-sm">USD Coin</span>
                    </div>
                  </div>
                </>
              )}

              {depositStatus === 'getting-address' && (
                <div className="text-center py-8">
                  <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-4" />
                  <p className="text-gray-300">Getting deposit address...</p>
                </div>
              )}

              {depositStatus === 'sending' && (
                <div className="text-center py-8">
                  <Wallet className="w-8 h-8 text-emerald-400 animate-pulse mx-auto mb-4" />
                  <p className="text-gray-300">Opening wallet to send USDC...</p>
                  <p className="text-gray-400 text-sm mt-2">Please confirm the transaction in your wallet</p>
                </div>
              )}

              {depositStatus === 'waiting-transfer' && depositAddress && depositTxHash && (
                <>
                  <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-4">
                    <p className="text-emerald-400 text-sm font-medium mb-2">✅ USDC Transfer Completed</p>
                    <div className="space-y-2">
                      <div>
                        <p className="text-gray-400 text-xs">To Address:</p>
                        <div className="bg-black/30 rounded-lg p-2 break-all text-xs font-mono text-gray-200">
                          {depositAddress}
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Amount: {depositAmount} USDC</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Transaction Hash:</p>
                        <div className="bg-black/30 rounded-lg p-2 break-all text-xs font-mono text-gray-200">
                          {depositTxHash}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                    <p className="text-blue-400 text-xs">📋 Transaction completed! Click "Confirm Deposit" to notify our system.</p>
                  </div>
                </>
              )}

              {depositStatus === 'confirming' && (
                <div className="text-center py-8">
                  <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-4" />
                  <p className="text-gray-300">Confirming deposit...</p>
                  {depositTxHash && (
                    <p className="text-xs text-gray-400 mt-2 break-all">Tx: {depositTxHash}</p>
                  )}
                </div>
              )}

              {depositStatus === 'success' && (
                <div className="text-center py-8">
                  <Check className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                  <p className="text-emerald-400 font-medium mb-2">✅ Deposit confirmed!</p>
                  <p className="text-gray-300 text-sm">Amount: {depositAmount} USDC</p>
                  {depositTxHash && (
                    <p className="text-xs text-gray-400 mt-2 break-all">Tx: {depositTxHash}</p>
                  )}
                </div>
              )}

              {depositStatus === 'error' && (
                <div className="text-center py-8">
                  <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                  <p className="text-red-400 font-medium">❌ Deposit failed</p>
                  <p className="text-gray-400 text-sm">Please try again</p>
                </div>
              )}
              
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => {
                    setShowDepositModal(false);
                    setDepositAmount('');
                    setDepositAddress('');
                    setDepositTxHash('');
                    setDepositStatus('idle');
                  }}
                  className="flex-1 px-6 py-4 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 transition-all"
                >
                  {depositStatus === 'success' ? 'Close' : 'Cancel'}
                </button>
                <button
                  onClick={handleDeposit}
                  disabled={
                    (depositStatus === 'idle' && !depositAmount) || 
                    (depositStatus === 'waiting-transfer' && !depositTxHash) ||
                    depositStatus === 'getting-address' || 
                    depositStatus === 'sending' ||
                    depositStatus === 'confirming'
                  }
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold px-6 py-4 rounded-lg hover:from-emerald-600 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {depositStatus === 'idle' && 'Get Deposit Address'}
                  {depositStatus === 'getting-address' && 'Getting Address...'}
                  {depositStatus === 'sending' && 'Confirm in Wallet'}
                  {depositStatus === 'waiting-transfer' && 'Confirm Deposit'}
                  {depositStatus === 'confirming' && 'Confirming...'}
                  {depositStatus === 'success' && 'Done'}
                  {depositStatus === 'error' && 'Retry'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Strategies() {
  const { address } = useAccount();
  const [showDCAModal, setShowDCAModal] = useState(false);
  const [strategies, setStrategies] = useState<any[]>([]);
  const [allExecutions, setAllExecutions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Notification state for DCA operations
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  }>({ show: false, type: 'success', title: '', message: '' });
  
  // Transaction details modal state
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState<{
    execution: any;
    transactions: any[];
  } | null>(null);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  
  const [dcaForm, setDcaForm] = useState({
    name: '',
    fromToken: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // USDC
    toToken: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', // WETH
    amountPerExecution: '',
    totalAmount: '',
    frequency: '0 0 */7 * *', // Weekly by default
    slippage: 1
  });

  // Available tokens for DCA
  const tokens = {
    '0xaf88d065e77c8cC2239327C5EDb3A432268e5831': { symbol: 'USDC', name: 'USD Coin', decimals: 6, icon: '💵' },
    // 1inch token
    '0x6314c31a7a1652ce482cffe247e9cb7c3f4bb9af': { symbol: '1INCH', name: '1inch', decimals: 18, icon: '🔥' },
    '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1': { symbol: 'WETH', name: 'Wrapped Ethereum', decimals: 18, icon: '⚡' },
    '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee': { symbol: 'ETH', name: 'Ethereum', decimals: 18, icon: '💎' },
    '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f': { symbol: 'WBTC', name: 'Wrapped Bitcoin', decimals: 8, icon: '₿' },
    '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1': { symbol: 'DAI', name: 'Dai Stablecoin', decimals: 18, icon: '🟡' },
    '0x912CE59144191C1204E64559FE8253a0e49E6548': { symbol: 'ARB', name: 'Arbitrum', decimals: 18, icon: '🚀' }
  };

  // Frequency options
  const frequencyOptions = [
    { value: '*/5 * * * *', label: 'Every 5 Minutes', description: 'Every 5 minutes' },
    { value: '0 0 * * *', label: 'Daily', description: 'Every day at midnight' },
    { value: '0 0 */3 * *', label: 'Every 3 Days', description: 'Every 3 days' },
    { value: '0 0 */7 * *', label: 'Weekly', description: 'Every week' },
    { value: '0 0 1,15 * *', label: 'Bi-Weekly', description: '1st and 15th of each month' },
    { value: '0 0 1 * *', label: 'Monthly', description: 'First day of each month' }
  ];

  // Fetch user strategies
  const fetchStrategies = async () => {
    try {
      if (!address) return;
      
      const authToken = localStorage.getItem('authToken');
      if (!authToken) return;

      console.log('📊 Fetching strategies...');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/strategies`, {
        headers: {
          'Authorization': `Wallet ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Strategies fetched:', data);
        setStrategies(data.strategies || []);
        
        // Extract all executions from all strategies
        const executions = (data.strategies || []).flatMap((strategy: any) => 
          (strategy.executions || []).map((execution: any) => ({
            ...execution,
            strategyName: strategy.name,
            strategyType: strategy.type,
            strategyId: strategy.id
          }))
        );
        setAllExecutions(executions);
        console.log('📊 All executions:', executions);
      } else {
        console.error('❌ Failed to fetch strategies:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ Failed to fetch strategies:', error);
    }
  };

  // Create DCA strategy
  const createDCAStrategy = async () => {
    try {
      setIsLoading(true);
      
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('No auth token found');
      }

      if (!dcaForm.name || !dcaForm.amountPerExecution || !dcaForm.totalAmount) {
        throw new Error('Please fill in all required fields');
      }

      console.log('🚀 Creating DCA strategy:', dcaForm);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/strategies/dca`, {
        method: 'POST',
        headers: {
          'Authorization': `Wallet ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dcaForm)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ DCA strategy created:', data);
        
        // Show success notification
        showNotification(
          'success',
          'Strategy Created! 🎉',
          `Successfully created "${dcaForm.name}" strategy. It will execute automatically based on your schedule.`
        );
        
        // Reset form and close modal
        setDcaForm({
          name: '',
          fromToken: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // USDC
          toToken: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
          amountPerExecution: '',
          totalAmount: '',
          frequency: '0 0 */7 * *',
          slippage: 1
        });
        setShowDCAModal(false);
        
        // Refresh strategies list
        await fetchStrategies();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create strategy');
      }
    } catch (error) {
      console.error('❌ Failed to create DCA strategy:', error);
      showNotification(
        'error',
        'Strategy Creation Failed ❌',
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Manage strategy (pause/resume/stop)
  const manageStrategy = async (strategyId: string, action: 'pause' | 'resume' | 'stop' | 'execute') => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) return;

      const endpoint = action === 'execute' 
        ? `${import.meta.env.VITE_API_BASE_URL}/api/strategies/${strategyId}/execute`
        : `${import.meta.env.VITE_API_BASE_URL}/api/strategies/${strategyId}/${action}`;

      console.log(`🔄 ${action}ing strategy:`, strategyId);

      const response = await fetch(endpoint, {
        method: action === 'execute' ? 'POST' : 'PUT',
        headers: {
          'Authorization': `Wallet ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Strategy ${action}d successfully:`, result);
        
        // Show success notification
        showNotification(
          'success',
          `Strategy ${action.charAt(0).toUpperCase() + action.slice(1)}d! ✅`,
          `Strategy has been ${action}d successfully.`
        );
        
        await fetchStrategies(); // Refresh the list
      } else {
        const errorData = await response.json();
        console.error(`❌ Failed to ${action} strategy:`, errorData);
        throw new Error(errorData.error || `Failed to ${action} strategy`);
      }
    } catch (error) {
      console.error(`❌ Failed to ${action} strategy:`, error);
      showNotification(
        'error',
        `Failed to ${action.charAt(0).toUpperCase() + action.slice(1)} Strategy ❌`,
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
    }
  };

  // Calculate estimated executions
  const calculateExecutions = () => {
    const amount = parseFloat(dcaForm.amountPerExecution);
    const total = parseFloat(dcaForm.totalAmount);
    if (amount && total && amount > 0) {
      return Math.floor(total / amount);
    }
    return 0;
  };

  // Format token symbol for display
  const getTokenInfo = (address: string) => {
    return tokens[address as keyof typeof tokens] || { symbol: 'Unknown', icon: '❓' };
  };

  // Format execution status for display
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED': return 'text-emerald-400';
      case 'FAILED': return 'text-red-400';
      case 'EXECUTING': return 'text-blue-400';
      case 'PENDING': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  // Load strategies on mount
  useEffect(() => {
    if (address) {
      fetchStrategies();
    }
  }, [address]);

  // Show notification
  const showNotification = (type: 'success' | 'error', title: string, message: string) => {
    setNotification({ show: true, type, title, message });
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  // Fetch transaction details for an execution
  const fetchTransactionDetails = async (executionId: string) => {
    try {
      setLoadingTransactions(true);
      const authToken = localStorage.getItem('authToken');
      if (!authToken) return;

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/strategies/executions/${executionId}/transactions`,
        {
          headers: {
            'Authorization': `Wallet ${authToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTransactionDetails(data);
        setShowTransactionModal(true);
      } else {
        throw new Error('Failed to fetch transaction details');
      }
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      showNotification('error', 'Error', 'Failed to fetch transaction details');
    } finally {
      setLoadingTransactions(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#10141c] text-gray-100">
      <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16 pt-32 pb-20">
        {/* Active Strategies Section */}
        {strategies.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-10">
              <div>
                <div className="text-2xl font-bold text-white mb-2">Your Active Strategies</div>
                <div className="text-gray-400">Manage and monitor your automated strategies</div>
              </div>
              <button
                onClick={() => fetchStrategies()}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-cyan-500 text-cyan-400 font-medium hover:bg-cyan-900/20 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>

            <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
              {strategies.map((strategy) => {
                const params = strategy.parameters;
                const fromToken = getTokenInfo(params?.fromToken);
                const toToken = getTokenInfo(params?.toToken);
                
                return (
                  <div key={strategy.id} className="bg-gradient-to-br from-emerald-900/20 to-cyan-900/20 rounded-xl p-6 border border-emerald-400/10 shadow-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="font-bold text-white text-lg mb-1">{strategy.name}</div>
                        <div className="text-gray-400 text-sm">{strategy.type} Strategy</div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            strategy.status === 'ACTIVE' ? 'bg-emerald-900/60 text-emerald-300' :
                            strategy.status === 'PAUSED' ? 'bg-yellow-900/60 text-yellow-300' :
                            'bg-red-900/60 text-red-300'
                          }`}>
                            {strategy.status.toLowerCase()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-400">Progress</div>
                        <div className="text-emerald-400 font-semibold">
                          ${parseFloat(strategy.totalInvested || '0').toFixed(2)} / ${parseFloat(params?.totalAmount || '0').toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-lg p-3 mb-4">
                      <div className="text-xs text-gray-400 mb-2">Strategy Details</div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">
                          {fromToken.icon} {fromToken.symbol} → {toToken.icon} {toToken.symbol}
                        </span>
                        <span className="text-white">${parseFloat(params?.amountPerExecution || '0').toFixed(2)} per execution</span>
                      </div>
                    </div>

                    {/* Recent Executions */}
                    {strategy.executions && strategy.executions.length > 0 ? (
                      <div className="mb-4">
                        <div className="text-xs text-gray-400 mb-2">Recent Executions ({strategy.executions.length})</div>
                        <div className="space-y-1 max-h-24 overflow-y-auto">
                          {strategy.executions.slice(0, 3).map((execution: any) => (
                            <div key={execution.id} className="flex items-center justify-between bg-white/5 rounded p-2 text-xs">
                              <div className="flex items-center space-x-2">
                                <div className={`font-medium ${getStatusColor(execution.status)}`}>
                                  {execution.status}
                                </div>
                                {execution.status === 'COMPLETED' && (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                )}
                              </div>
                              <div className="text-gray-400">
                                {execution.executedAt ? new Date(execution.executedAt).toLocaleDateString() : 'Pending'}
                              </div>
                              {execution.fromAmount && (
                                <div className="text-white">${parseFloat(execution.fromAmount).toFixed(2)}</div>
                              )}
                              {execution.txHash && (
                                <div className="flex items-center space-x-1">
                                  <a
                                    href={`https://arbiscan.io/tx/${execution.txHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-cyan-400 hover:text-cyan-300 transition-colors font-mono text-xs flex items-center space-x-1"
                                    title={`View transaction: ${execution.txHash}`}
                                  >
                                    <span>{execution.txHash.slice(0, 4)}...{execution.txHash.slice(-2)}</span>
                                    <ExternalLink className="w-2 h-2" />
                                  </a>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="mb-4 bg-gray-800/30 rounded-lg p-3">
                        <div className="text-xs text-gray-400 mb-1">No Executions Yet</div>
                        <div className="text-xs text-gray-500">Click "Execute Now" to test your strategy</div>
                      </div>
                    )}

                    {/* Strategy Controls */}
                    <div className="flex gap-2">
                      {strategy.status === 'ACTIVE' && (
                        <>
                          <button
                            onClick={() => manageStrategy(strategy.id, 'pause')}
                            className="flex-1 bg-yellow-600/20 text-yellow-300 font-medium px-3 py-2 rounded-lg hover:bg-yellow-600/30 transition-all text-sm"
                          >
                            Pause
                          </button>
                          <button
                            onClick={() => manageStrategy(strategy.id, 'execute')}
                            className="flex-1 bg-emerald-600/20 text-emerald-300 font-medium px-3 py-2 rounded-lg hover:bg-emerald-600/30 transition-all text-sm"
                          >
                            Execute Now
                          </button>
                        </>
                      )}
                      {strategy.status === 'PAUSED' && (
                        <button
                          onClick={() => manageStrategy(strategy.id, 'resume')}
                          className="flex-1 bg-emerald-600/20 text-emerald-300 font-medium px-3 py-2 rounded-lg hover:bg-emerald-600/30 transition-all text-sm"
                        >
                          Resume
                        </button>
                      )}
                      {(strategy.status === 'ACTIVE' || strategy.status === 'PAUSED') && (
                        <button
                          onClick={() => manageStrategy(strategy.id, 'stop')}
                          className="bg-red-600/20 text-red-300 font-medium px-3 py-2 rounded-lg hover:bg-red-600/30 transition-all text-sm"
                        >
                          Stop
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* All Executions History Section */}
        {allExecutions.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="text-2xl font-bold text-white mb-2">Execution History</div>
                <div className="text-gray-400">Complete history of all strategy executions</div>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-400/30 rounded-lg px-4 py-2">
                <span className="text-emerald-400 font-semibold">{allExecutions.length} Total Executions</span>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="text-left px-6 py-4 text-gray-400 font-medium text-sm">Strategy</th>
                      <th className="text-left px-6 py-4 text-gray-400 font-medium text-sm">Pair</th>
                      <th className="text-left px-6 py-4 text-gray-400 font-medium text-sm">Amount</th>
                      <th className="text-left px-6 py-4 text-gray-400 font-medium text-sm">Status</th>
                      <th className="text-left px-6 py-4 text-gray-400 font-medium text-sm">Date</th>
                      <th className="text-left px-6 py-4 text-gray-400 font-medium text-sm">Tx Hash</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allExecutions.map((execution, index) => {
                      const strategy = strategies.find(s => s.id === execution.strategyId);
                      const params = strategy?.parameters;
                      const fromToken = getTokenInfo(params?.fromToken);
                      const toToken = getTokenInfo(params?.toToken);
                      
                      return (
                        <tr key={execution.id} className={`border-t border-white/10 hover:bg-white/5 transition-colors ${index % 2 === 0 ? 'bg-white/2' : ''} ${execution.strategyType === 'DCA' && execution.status === 'COMPLETED' ? 'cursor-pointer' : ''}`}>
                          <td className="px-6 py-4">
                            <div className="text-white font-medium">{execution.strategyName}</div>
                            <div className="text-gray-400 text-xs">{execution.strategyType}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2 text-sm">
                              <span>{fromToken.icon} {fromToken.symbol}</span>
                              <ArrowRight className="w-3 h-3 text-gray-500" />
                              <span>{toToken.icon} {toToken.symbol}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-white font-medium">
                              ${execution.fromAmount ? parseFloat(execution.fromAmount).toFixed(2) : 'N/A'}
                            </div>
                            {execution.toAmount && (
                              <div className="text-gray-400 text-xs">
                                → {parseFloat(execution.toAmount).toFixed(6)} {toToken.symbol}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              execution.status === 'COMPLETED' ? 'bg-emerald-900/60 text-emerald-300' :
                              execution.status === 'FAILED' ? 'bg-red-900/60 text-red-300' :
                              execution.status === 'EXECUTING' ? 'bg-blue-900/60 text-blue-300' :
                              'bg-yellow-900/60 text-yellow-300'
                            }`}>
                              {execution.status}
                            </span>
                            {execution.error && (
                              <div className="text-red-400 text-xs mt-1 max-w-32 truncate" title={execution.error}>
                                {execution.error}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-gray-300 text-sm">
                            {execution.executedAt ? (
                              <>
                                <div>{new Date(execution.executedAt).toLocaleDateString()}</div>
                                <div className="text-xs text-gray-500">{new Date(execution.executedAt).toLocaleTimeString()}</div>
                              </>
                            ) : (
                              'Pending'
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {execution.txHash ? (
                              <div className="flex flex-col space-y-1">
                                {/* Main transaction (swap) */}
                                <a
                                  href={`https://arbiscan.io/tx/${execution.txHash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-cyan-400 hover:text-cyan-300 transition-colors font-mono text-sm flex items-center space-x-1"
                                  title={`Swap Transaction: ${execution.txHash}`}
                                >
                                  <span>{execution.txHash.slice(0, 6)}...{execution.txHash.slice(-4)}</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                                
                                {/* DCA Strategy executions have additional transactions */}
                                {execution.strategyType === 'DCA' && execution.status === 'COMPLETED' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      fetchTransactionDetails(execution.id);
                                    }}
                                    disabled={loadingTransactions}
                                    className="text-xs bg-blue-500/10 text-blue-300 px-2 py-1 rounded-full hover:bg-blue-500/20 transition-colors flex items-center space-x-1"
                                  >
                                    <span>View All Transactions</span>
                                    {loadingTransactions ? (
                                      <RefreshCw className="w-2 h-2 animate-spin" />
                                    ) : (
                                      <ExternalLink className="w-2 h-2" />
                                    )}
                                  </button>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-500 text-sm">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Investment Strategies */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="text-2xl font-bold text-white mb-2">Explore Investment Strategies</div>
              <div className="text-gray-400">Automate your crypto investments with proven strategies</div>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {/* DCA Card */}
            <div className="bg-gradient-to-br from-emerald-900/20 to-cyan-900/20 rounded-xl p-8 border border-emerald-400/10 shadow-lg">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Calendar className="w-7 h-7 text-emerald-400" />
                <div>
                    <div className="font-semibold text-white text-lg">Dollar Cost Averaging</div>
                    <div className="flex gap-2 mt-2">
                      <span className="bg-emerald-900/60 text-emerald-300 text-xs px-3 py-1 rounded-full font-medium">low risk</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">Performance</div>
                  <div className="text-emerald-400 font-semibold">+8.2%</div>
                </div>
              </div>
              <div className="text-gray-300 text-sm mb-6">Invest a fixed amount regularly to reduce volatility impact. Perfect for long-term wealth building.</div>
              <button 
                onClick={() => setShowDCAModal(true)}
                className="bg-emerald-500 text-white font-medium px-6 py-3 rounded-lg hover:bg-emerald-600 transition-all"
              >
                Configure DCA
              </button>
            </div>
            
            {/* TWAP Card */}
            <div className="bg-gradient-to-br from-cyan-900/20 to-emerald-900/20 rounded-xl p-8 border border-cyan-400/10 shadow-lg">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <BarChart3 className="w-7 h-7 text-cyan-400" />
                <div>
                    <div className="font-semibold text-white text-lg">TWAP Strategy</div>
                    <div className="flex gap-2 mt-2">
                      <span className="bg-yellow-900/60 text-yellow-300 text-xs px-3 py-1 rounded-full font-medium">medium risk</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">Performance</div>
                  <div className="text-cyan-400 font-semibold">+12.7%</div>
                </div>
              </div>
              <div className="text-gray-300 text-sm mb-6">Time-Weighted Average Price execution for large orders. Minimize market impact with smart timing.</div>
              <button
              onClick={() => setShowDCAModal(true)}
                className="bg-emerald-500 text-white font-medium px-6 py-3 rounded-lg hover:bg-emerald-600 transition-all"
              >
                Configure TWAP
              </button>
            </div>
            
            {/* Buy the Dip Card */}
            <div className="bg-gradient-to-br from-gray-900/20 to-emerald-900/10 rounded-xl p-8 border border-gray-400/10 shadow-lg">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <TrendingUp className="w-7 h-7 text-emerald-400" />
                <div>
                    <div className="font-semibold text-white text-lg">Buy the Dip</div>
                    <div className="flex gap-2 mt-2">
                      <span className="bg-gray-700/80 text-gray-300 text-xs px-3 py-1 rounded-full font-medium">inactive</span>
                      <span className="bg-yellow-900/60 text-yellow-300 text-xs px-3 py-1 rounded-full font-medium">coming soon</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">Performance</div>
                  <div className="text-emerald-400 font-semibold">+8.2%</div>
                </div>
              </div>
              <div className="text-gray-300 text-sm mb-6">Automatically purchase when prices drop below key support levels. Smart dip detection using technical indicators.</div>
              <button className="bg-white/10 text-gray-300 font-medium px-6 py-3 rounded-lg hover:bg-gray-700/30 transition-all cursor-not-allowed">
                Coming Soon
              </button>
            </div>
            
            {/* Mean Reversion Card */}
            <div className="bg-gradient-to-br from-cyan-900/20 to-gray-900/20 rounded-xl p-8 border border-cyan-400/10 shadow-lg">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Cpu className="w-7 h-7 text-cyan-400" />
                <div>
                    <div className="font-semibold text-white text-lg">Mean Reversion</div>
                    <div className="flex gap-2 mt-2">
                      <span className="bg-cyan-500/80 text-white text-xs px-3 py-1 rounded-full font-medium">new</span>
                      <span className="bg-red-900/60 text-red-300 text-xs px-3 py-1 rounded-full font-medium">coming soon</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">Performance</div>
                  <div className="text-cyan-400 font-semibold">+12.7%</div>
                </div>
              </div>
              <div className="text-gray-300 text-sm mb-6">Profit from price corrections by buying oversold and selling overbought conditions.</div>
              <button className="bg-white/10 text-cyan-300 font-medium px-6 py-3 rounded-lg hover:bg-cyan-900/30 transition-all cursor-not-allowed">
                Coming Soon
              </button>
            </div>
          </div>
        </div>

        {/* DCA Configuration Modal */}
        {showDCAModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#181e29] rounded-2xl p-8 shadow-2xl border border-cyan-400/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white">Configure DCA Strategy</h2>
                <button 
                  onClick={() => setShowDCAModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Strategy Name */}
                <div>
                  <label className="block text-gray-400 text-sm mb-3 font-medium">Strategy Name</label>
                  <input
                    type="text"
                    value={dcaForm.name}
                    onChange={(e) => setDcaForm({...dcaForm, name: e.target.value})}
                    placeholder="e.g., Weekly ETH DCA"
                    className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                {/* Token Selection */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-400 text-sm mb-3 font-medium">From Token (Sell)</label>
                    <select
                      value={dcaForm.fromToken}
                      onChange={(e) => setDcaForm({...dcaForm, fromToken: e.target.value})}
                      className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {Object.entries(tokens).map(([address, token]) => (
                        <option key={address} value={address} className="bg-[#181e29]">
                          {token.icon} {token.symbol} - {token.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 text-sm mb-3 font-medium">To Token (Buy)</label>
                    <select
                      value={dcaForm.toToken}
                      onChange={(e) => setDcaForm({...dcaForm, toToken: e.target.value})}
                      className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {Object.entries(tokens).filter(([address]) => address !== dcaForm.fromToken).map(([address, token]) => (
                        <option key={address} value={address} className="bg-[#181e29]">
                          {token.icon} {token.symbol} - {token.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Amount Configuration */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-400 text-sm mb-3 font-medium">Amount Per Execution</label>
                    <input
                      type="number"
                      value={dcaForm.amountPerExecution}
                      onChange={(e) => setDcaForm({...dcaForm, amountPerExecution: e.target.value})}
                      placeholder="100"
                      step="0.01"
                      min="0"
                      className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 text-sm mb-3 font-medium">Total Amount</label>
                    <input
                      type="number"
                      value={dcaForm.totalAmount}
                      onChange={(e) => setDcaForm({...dcaForm, totalAmount: e.target.value})}
                      placeholder="1000"
                      step="0.01"
                      min="0"
                      className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Frequency Selection */}
                <div>
                  <label className="block text-gray-400 text-sm mb-3 font-medium">Execution Frequency</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {frequencyOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setDcaForm({...dcaForm, frequency: option.value})}
                        className={`p-4 rounded-lg border text-left transition-all ${
                          dcaForm.frequency === option.value
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                            : 'bg-white/5 border-gray-700 text-gray-300 hover:border-gray-600'
                        }`}
                      >
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-gray-400 mt-1">{option.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Slippage Setting */}
                <div>
                  <label className="block text-gray-400 text-sm mb-3 font-medium">Slippage Tolerance (%)</label>
                  <div className="flex gap-3">
                    {[0.5, 1, 2, 3].map((value) => (
                      <button
                        key={value}
                        onClick={() => setDcaForm({...dcaForm, slippage: value})}
                        className={`flex-1 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                          dcaForm.slippage === value
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                      >
                        {value}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                {dcaForm.amountPerExecution && dcaForm.totalAmount && (
                  <div className="bg-emerald-500/10 border border-emerald-400/30 rounded-lg p-4">
                    <div className="text-emerald-400 font-semibold mb-2">Strategy Summary</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Estimated Executions:</span>
                        <span className="text-white font-medium">{calculateExecutions()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Investment:</span>
                        <span className="text-white font-medium">${parseFloat(dcaForm.totalAmount || '0').toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Per Execution:</span>
                        <span className="text-white font-medium">${parseFloat(dcaForm.amountPerExecution || '0').toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-4 pt-6 mt-6 border-t border-gray-700">
                <button
                  onClick={() => setShowDCAModal(false)}
                  className="flex-1 px-6 py-4 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={createDCAStrategy}
                  disabled={isLoading || !dcaForm.name || !dcaForm.amountPerExecution || !dcaForm.totalAmount}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold px-6 py-4 rounded-lg hover:from-emerald-600 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating...' : 'Create DCA Strategy'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notification Toast */}
        {notification.show && (
          <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
            <div className={`rounded-lg p-4 shadow-2xl border backdrop-blur-sm ${
              notification.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-300' 
                : 'bg-red-500/10 border-red-400/30 text-red-300'
            }`}>
              <div className="flex items-start space-x-3">
                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                  notification.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
                }`}>
                  {notification.type === 'success' ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white text-sm mb-1">
                    {notification.title}
                  </div>
                  <div className="text-sm opacity-90">
                    {notification.message}
                  </div>
                </div>
                <button
                  onClick={() => setNotification(prev => ({ ...prev, show: false }))}
                  className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
                >
                  <span className="sr-only">Close</span>
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Transaction Details Modal */}
        {showTransactionModal && transactionDetails && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#181e29] rounded-2xl p-8 shadow-2xl border border-cyan-400/20 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Transaction Details</h2>
                  <p className="text-gray-300 text-sm">
                    {transactionDetails.execution.strategyName} • {transactionDetails.execution.strategyType}
                  </p>
                </div>
                <button
                  onClick={() => setShowTransactionModal(false)}
                  className="text-gray-400 hover:text-white transition-colors p-2"
                >
                  ✕
                </button>
              </div>

              {/* Execution Info */}
              <div className="bg-gray-800/30 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">Status</div>
                    <div className={`font-medium ${getStatusColor(transactionDetails.execution.status)}`}>
                      {transactionDetails.execution.status}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">Executed At</div>
                    <div className="text-white">
                      {new Date(transactionDetails.execution.executedAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Transactions List */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Related Transactions ({transactionDetails.transactions.length})
                </h3>
                
                {transactionDetails.transactions.map((tx, index) => (
                  <div key={tx.id || index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                          tx.type === 'SWAP' ? 'bg-purple-500' : 'bg-blue-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-white font-medium">{tx.type}</div>
                          <div className="text-gray-400 text-xs">
                            {new Date(tx.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      <a
                        href={tx.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-lg hover:bg-cyan-500/30 transition-colors flex items-center space-x-2 text-sm"
                      >
                        <span>View on Arbiscan</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    {/* Transaction Hash */}
                    <div className="mb-3">
                      <div className="text-xs text-gray-400 mb-1">Transaction Hash</div>
                      <div className="bg-black/30 rounded-lg p-3 font-mono text-xs text-gray-200 break-all">
                        {tx.txHash}
                      </div>
                    </div>

                    {/* Token Info */}
                    {tx.fromToken && (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-xs text-gray-400 mb-1">From</div>
                          <div className="text-white">
                            {tx.fromAmount ? parseFloat(tx.fromAmount).toFixed(6) : 'N/A'}
                          </div>
                          <div className="text-gray-400 text-xs break-all">{tx.fromToken}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400 mb-1">To</div>
                          <div className="text-white">
                            {tx.toAmount ? parseFloat(tx.toAmount).toFixed(6) : 'N/A'}
                          </div>
                          <div className="text-gray-400 text-xs break-all">{tx.toToken}</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Close Button */}
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowTransactionModal(false)}
                  className="px-6 py-3 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 transition-all font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function Swap() {
  const { address } = useAccount();
  const config = useConfig();
  const [fromToken, setFromToken] = useState('USDC');
  const [toToken, setToToken] = useState('1INCH');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapQuote, setSwapQuote] = useState<any>(null);
  const [slippage, setSlippage] = useState(1); // 1% default slippage
  
  // Transaction result modal state
  const [showResultModal, setShowResultModal] = useState(false);
  const [transactionResult, setTransactionResult] = useState<{
    success: boolean;
    title: string;
    message: string;
    txHash?: string;
    txUrl?: string;
    details?: any;
  } | null>(null);
  
  // Token list with contract addresses on Arbitrum
  const tokens = {
    'USDC': {
      symbol: 'USDC',
      name: 'USD Coin',
      address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      decimals: 6,
      icon: '💵',
      color: 'from-blue-500 to-blue-600'
    },
    '1INCH': {
      symbol: '1INCH',
      name: '1inch Token',
      address: '0x6314c31a7a1652ce482cffe247e9cb7c3f4bb9af',
      decimals: 18,
      icon: '🔄',
      color: 'from-purple-500 to-purple-600'
    },
    'ETH': {
      symbol: 'ETH',
      name: 'Ethereum',
      address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
      decimals: 18,
      icon: '⚡',
      color: 'from-gray-600 to-gray-700'
    },
    'ARB': {
      symbol: 'ARB',
      name: 'Arbitrum',
      address: '0x912CE59144191C1204E64559FE8253a0e49E6548',
      decimals: 18,
      icon: '🚀',
      color: 'from-orange-500 to-orange-600'
    }
  };

  // Only show these tokens in "To" dropdown (ordered with 1INCH first)
  const toTokenOrder = ['ETH', '1INCH', 'ARB'];

  // Show transaction result modal
  const showTransactionResult = (result: {
    success: boolean;
    title: string;
    message: string;
    txHash?: string;
    txUrl?: string;
    details?: any;
  }) => {
    setTransactionResult(result);
    setShowResultModal(true);
  };

  // Get swap quote from backend (via 1inch)
  const getSwapQuote = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      setToAmount('');
      setSwapQuote(null);
      return;
    }
    
    try {
      const fromTokenData = tokens[fromToken as keyof typeof tokens];
      const toTokenData = tokens[toToken as keyof typeof tokens];
      
      const amount = Math.floor(parseFloat(fromAmount) * Math.pow(10, fromTokenData.decimals));
      
      console.log('🔍 Getting quote for:', {
        from: fromTokenData.symbol,
        to: toTokenData.symbol,
        amount: fromAmount,
        amountWei: amount.toString(),
        fromAddress: fromTokenData.address,
        toAddress: toTokenData.address
      });
      
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        console.warn('No auth token found');
        return;
      }

      const url = `${import.meta.env.VITE_API_BASE_URL}/api/market/quote?src=${fromTokenData.address}&dst=${toTokenData.address}&amount=${amount}&slippage=${slippage}`;
      
      console.log('🌐 API URL:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Wallet ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Quote request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('📊 Quote Response:', data);
      
      const quote = data.quote;
      const formattedToAmount = (parseFloat(quote.dstAmount) / Math.pow(10, toTokenData.decimals)).toFixed(6);
      
      console.log('💰 Formatted amount:', formattedToAmount);
      
      setToAmount(formattedToAmount);
      setSwapQuote(quote);
      
    } catch (error) {
      console.error('❌ Failed to get swap quote:', error);
      setToAmount('');
      setSwapQuote(null);
    }
  };

  // Execute swap via backend
  const executeSwap = async () => {
    if (!address) return;
    
    try {
      setIsSwapping(true);
      
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('No auth token found. Please connect your wallet.');
      }

      // Get quote first if we don't have one
      if (!swapQuote && fromAmount && parseFloat(fromAmount) > 0) {
        console.log('📊 Getting quote before swap...');
        await getSwapQuote();
        // Wait a moment for quote to be processed
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const fromTokenData = tokens[fromToken as keyof typeof tokens];
      const toTokenData = tokens[toToken as keyof typeof tokens];
      
      console.log('🔄 Executing swap via backend:', {
        fromToken: fromTokenData.address,
        toToken: toTokenData.address,
        amount: fromAmount,
        slippage
      });

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/wallet/swap`, {
        method: 'POST',
        headers: {
          'Authorization': `Wallet ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fromToken: fromTokenData.address,
          toToken: toTokenData.address,
          amount: fromAmount,
          slippage: slippage
        })
      });

      const result = await response.json();

      if (response.ok) {
        console.log('✅ Swap successful!', result);
        
        // Show success modal instead of alert
        showTransactionResult({
          success: true,
          title: 'Swap Successful! 🎉',
          message: `Successfully swapped ${fromAmount} ${fromTokenData.symbol} for ${toAmount || 'estimated'} ${toTokenData.symbol}`,
          txHash: result.transaction.txHash,
          txUrl: result.transaction.txUrl,
          details: result.transaction
        });
        
        // Reset form
        setFromAmount('');
        setToAmount('');
        setSwapQuote(null);
        
      } else {
        throw new Error(result.error || result.details || 'Swap failed');
      }
      
    } catch (error) {
      console.error('❌ Swap failed:', error);
      
      // Show error modal instead of alert
      showTransactionResult({
        success: false,
        title: 'Swap Failed ❌',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error
      });
    } finally {
      setIsSwapping(false);
    }
  };

  // Handle amount change and get quote
  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    // Clear previous quote when amount changes
    setToAmount('');
    setSwapQuote(null);
    
    if (value && parseFloat(value) > 0) {
      // Debounce the quote request
      const timeoutId = setTimeout(() => getSwapQuote(), 800);
      // Note: In a real app, you'd want to store and clear this timeout properly
    }
  };

  // Auto-fetch quote when dependencies change
  useEffect(() => {
    if (fromAmount && parseFloat(fromAmount) > 0) {
      const timeoutId = setTimeout(() => {
        getSwapQuote();
      }, 800);
      return () => clearTimeout(timeoutId);
    } else {
      setToAmount('');
      setSwapQuote(null);
    }
  }, [fromToken, toToken, slippage]); // Re-fetch when these change

  // Reset amounts (since we can't swap USDC position)
  const resetAmounts = () => {
    setFromAmount('');
    setToAmount('');
    setSwapQuote(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#10141c] to-[#1a1f2e] text-gray-100">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl mb-4 shadow-lg">
            <RefreshCw className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-3">Token Swap</h1>
          <p className="text-gray-400 text-lg">Swap tokens seamlessly with 1inch Protocol</p>
        </div>

        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-white/20 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 rounded-3xl"></div>
          <div className="relative z-10">
          {/* From Token - USDC Only */}
          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-semibold mb-4 tracking-wide">From</label>
            <div className="bg-gradient-to-br from-blue-500/15 via-blue-600/10 to-indigo-600/15 rounded-2xl p-6 border border-blue-400/30 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                    <span className="text-white font-bold text-lg">💵</span>
                  </div>
                  <div>
                    <div className="text-white text-xl font-bold">USDC</div>
                    <div className="text-blue-300 text-sm font-medium">USD Coin</div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-500/30 to-indigo-500/30 px-4 py-2 rounded-xl border border-blue-400/40">
                  <span className="text-blue-200 text-xs font-semibold tracking-wide">PRIMARY</span>
                </div>
              </div>
              <input
                type="number"
                value={fromAmount}
                onChange={(e) => handleFromAmountChange(e.target.value)}
                placeholder="0.0"
                className="w-full bg-transparent text-3xl font-bold text-white outline-none placeholder-blue-300/40 focus:placeholder-blue-300/60 transition-colors"
              />
            </div>
          </div>

          {/* Reset Button */}
          <div className="flex justify-center my-8">
            <button
              onClick={resetAmounts}
              className="group relative p-4 bg-gradient-to-r from-gray-600/20 to-gray-700/20 hover:from-emerald-500/20 hover:to-cyan-500/20 rounded-2xl transition-all duration-300 border border-white/20 hover:border-emerald-400/40 shadow-lg hover:shadow-xl transform hover:scale-105"
              title="Clear amounts"
            >
              <RefreshCw className="w-6 h-6 text-gray-300 group-hover:text-emerald-400 group-hover:rotate-180 transition-all duration-500" />
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 group-hover:text-emerald-400 transition-colors opacity-0 group-hover:opacity-100">
                Clear
              </span>
            </button>
          </div>

          {/* To Token */}
          <div className="mb-8">
            <label className="block text-gray-300 text-sm font-semibold mb-4 tracking-wide">To</label>
            <div className="bg-gradient-to-br from-white/8 via-white/5 to-white/3 rounded-2xl p-6 border border-white/20 hover:border-emerald-400/40 transition-all duration-300 shadow-lg hover:shadow-xl group">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${tokens[toToken as keyof typeof tokens].color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                    <span className="text-white font-bold text-lg">{tokens[toToken as keyof typeof tokens].icon}</span>
                  </div>
                  <div>
                    <select
                      value={toToken}
                      onChange={(e) => {
                        setToToken(e.target.value);
                        // Clear amounts when token changes
                        setToAmount('');
                        setSwapQuote(null);
                      }}
                      className="bg-transparent text-white text-xl font-bold outline-none cursor-pointer hover:text-emerald-400 transition-colors pr-2"
                    >
                      {toTokenOrder.map((key) => {
                        const token = tokens[key as keyof typeof tokens];
                        return (
                          <option key={key} value={key} className="bg-[#181e29] text-white">
                            {token.icon} {token.symbol}
                          </option>
                        );
                      })}
                    </select>
                    <div className="text-gray-400 text-sm font-medium">{tokens[toToken as keyof typeof tokens].name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 mb-2 font-medium tracking-wide">YOU GET</div>
                  <div className="text-3xl font-bold text-white">
                    {toAmount || '0.0'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Slippage Settings */}
          <div className="mb-8">
            <label className="block text-gray-300 text-sm font-semibold mb-4 tracking-wide">Slippage Tolerance</label>
            <div className="flex gap-3">
              {[0.5, 1, 2, 3].map((value) => (
                <button
                  key={value}
                  onClick={() => setSlippage(value)}
                  className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 border ${
                    slippage === value
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-500/25 transform scale-105'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20 border-white/20 hover:border-white/30 hover:text-white'
                  } hover:transform hover:scale-105`}
                >
                  {value}%
                </button>
              ))}
            </div>
          </div>

          {/* Swap Quote Info */}
          {swapQuote && (
            <div className="mb-8 p-6 bg-gradient-to-br from-emerald-500/10 via-cyan-500/5 to-blue-500/10 rounded-2xl border border-emerald-400/30 backdrop-blur-sm shadow-lg">
              <div className="text-sm text-emerald-300 mb-4 font-semibold tracking-wide">SWAP DETAILS</div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 font-medium">Exchange Rate</span>
                  <span className="text-white font-semibold">1 {fromToken} = {(parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(6)} {toToken}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 font-medium">Estimated Gas</span>
                  <span className="text-white font-semibold">{swapQuote.estimatedGas || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 font-medium">Price Impact</span>
                  <span className="text-emerald-400 font-semibold">{'< 0.1%'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Swap Button */}
          <button
            onClick={executeSwap}
            disabled={!address || !fromAmount || parseFloat(fromAmount) <= 0 || isSwapping}
            className="group relative w-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-cyan-500 text-white font-bold py-5 px-8 rounded-2xl hover:from-emerald-600 hover:via-emerald-700 hover:to-cyan-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl hover:shadow-emerald-500/25 transform hover:scale-[1.02] active:scale-[0.98] border border-emerald-400/50"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative z-10 text-lg tracking-wide">
              {!address 
                ? '🔗 Connect Wallet' 
                : isSwapping 
                  ? '⏳ Swapping...' 
                  : !fromAmount || parseFloat(fromAmount) <= 0
                    ? '💡 Enter Amount' 
                    : `🔄 Swap ${tokens[fromToken as keyof typeof tokens].symbol} → ${tokens[toToken as keyof typeof tokens].symbol}`
              }
            </span>
          </button>

          {/* Powered by 1inch */}
          <div className="text-center mt-8">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-400/20">
              <div className="text-xs text-gray-400 font-medium">Powered by</div>
              <div className="text-sm font-bold text-cyan-400">1inch Protocol</div>
              <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          </div>
        </div>

        {/* Transaction Result Modal */}
        {showResultModal && transactionResult && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#181e29] rounded-2xl p-8 shadow-2xl border border-cyan-400/20 max-w-md w-full mx-4">
              <div className="text-center mb-6">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  transactionResult.success 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {transactionResult.success ? (
                    <Check className="w-8 h-8" />
                  ) : (
                    <AlertCircle className="w-8 h-8" />
                  )}
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {transactionResult.title}
                </h2>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {transactionResult.message}
                </p>
              </div>

              {/* Transaction Details */}
              {transactionResult.success && transactionResult.txHash && (
                <div className="bg-emerald-500/10 border border-emerald-400/30 rounded-lg p-4 mb-6">
                  <div className="text-emerald-400 font-semibold mb-3 text-sm">Transaction Details</div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Transaction Hash</div>
                      <div className="bg-black/30 rounded-lg p-3 break-all font-mono text-xs text-gray-200">
                        {transactionResult.txHash}
                      </div>
                    </div>
                    {transactionResult.details && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">From:</span>
                          <span className="text-white font-medium">{transactionResult.details.fromSymbol}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">To:</span>
                          <span className="text-white font-medium">{transactionResult.details.toSymbol}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Amount:</span>
                          <span className="text-white font-medium">{transactionResult.details.fromAmount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Status:</span>
                          <span className="text-emerald-400 font-semibold">{transactionResult.details.status}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Error Details */}
              {!transactionResult.success && (
                <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-4 mb-6">
                  <div className="text-red-400 font-semibold mb-2 text-sm">Error Details</div>
                  <div className="text-gray-300 text-sm">
                    Please try again or contact support if the problem persists.
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResultModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 transition-all font-medium"
                >
                  Close
                </button>
                
                {transactionResult.success && transactionResult.txUrl && (
                  <button
                    onClick={() => window.open(transactionResult.txUrl, '_blank')}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold px-6 py-3 rounded-lg hover:from-emerald-600 hover:to-cyan-600 transition-all flex items-center justify-center space-x-2"
                  >
                    <Globe className="w-4 h-4" />
                    <span>View on Arbiscan</span>
                  </button>
                )}

                {!transactionResult.success && (
                  <button
                    onClick={() => {
                      setShowResultModal(false);
                      // Retry the swap
                      executeSwap();
                    }}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold px-6 py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all"
                  >
                    Retry
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Main App Layout
function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white dark:bg-[#10141c] font-sans text-[#0D1B2A] dark:text-gray-100">
      <Header />
      {children}
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout><Home /></AppLayout>} />
      <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
      <Route path="/strategies" element={<AppLayout><Strategies /></AppLayout>} />
      <Route path="/swap" element={<AppLayout><Swap /></AppLayout>} />
    </Routes>
  );
}