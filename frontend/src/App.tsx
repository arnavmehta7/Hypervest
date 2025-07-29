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
  AlertCircle
} from 'lucide-react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAccount, useConfig, useFeeData, useEstimateGas } from 'wagmi';
import { writeContract, estimateGas } from '@wagmi/core';
import { parseUnits } from 'viem';

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
      if (!address) {return;}
      
      console.log('🔍 Fetching 1inch token balances for:', address);
      
      const url = `https://api.1inch.dev/balance/v1.2/42161/balances/${address}`;
      
      const config = {
        headers: {
          Authorization: "Bearer PG0QPjOuHKZ7R22Z5aPUclbNqL2Q7w6P",
        },
      };
      
      // Common Arbitrum tokens to check
      const body = {
        tokens: [
          "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // USDC
          "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", // USDT
          "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", // WETH
          "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", // USDC.e
          "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f", // WBTC
          "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", // DAI
        ],
      };

      const response = await axios.post(url, body, config);
      console.log('📊 1inch balance data:', response.data);
      
      // Parse and filter non-zero balances
      const nonZeroBalances = parseNonZeroBalances(response.data);
      console.log('💰 Non-zero token balances:', nonZeroBalances);
      
      setTokenBalances(nonZeroBalances);
    } catch (error) {
      console.error('Failed to fetch 1inch balances:', error);
      // Set empty array on error to prevent showing stale data
      setTokenBalances([]);
    }
  }

  // Parse and filter non-zero balances
  const parseNonZeroBalances = (balanceData: any): Array<{
    token: string;
    symbol: string;
    name: string;
    balance: string;
    formattedBalance: string;
    decimals: number;
    usdValue?: number;
  }> => {
    const nonZeroBalances = [];
    
    if (balanceData && balanceData.balances) {
      for (const [tokenAddress, tokenData] of Object.entries(balanceData.balances)) {
        const data = tokenData as any;
        
        // Check if balance is greater than 0
        if (data.balance && BigInt(data.balance) > 0n) {
          const decimals = data.decimals || 18;
          const balance = data.balance;
          const formattedBalance = (parseFloat(balance) / Math.pow(10, decimals)).toFixed(6);
          
          nonZeroBalances.push({
            token: tokenAddress,
            symbol: data.symbol || 'Unknown',
            name: data.name || 'Unknown Token',
            balance: balance,
            formattedBalance: formattedBalance,
            decimals: decimals,
            usdValue: data.usdValue || 0,
          });
        }
      }
    }
    
    return nonZeroBalances;
  }

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
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-xs">
                            {token.symbol.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-white text-sm">{token.symbol}</div>
                          <div className="text-xs text-gray-400">{token.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-medium text-sm">{token.formattedBalance}</div>
                        {token.usdValue > 0 && (
                          <div className="text-emerald-400 text-xs">${token.usdValue.toFixed(2)}</div>
                        )}
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
  return (
    <div className="min-h-screen bg-[#10141c] text-gray-100">
      <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16 pt-32 pb-20">
        {/* Investment Strategies */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="text-2xl font-bold text-white mb-2">Investment Strategies</div>
              <div className="text-gray-400">Automate your crypto investments with proven strategies</div>
            </div>
            <button className="px-6 py-3 rounded-lg border border-cyan-500 text-cyan-400 font-semibold hover:bg-cyan-900/20 transition-all">
              View All
            </button>
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
                      <span className="bg-emerald-500/80 text-white text-xs px-3 py-1 rounded-full font-medium">active</span>
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
              <button className="bg-white/10 text-emerald-300 font-medium px-6 py-3 rounded-lg hover:bg-emerald-900/30 transition-all">
                Configure
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
                      <span className="bg-emerald-500/80 text-white text-xs px-3 py-1 rounded-full font-medium">active</span>
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
              <button className="bg-white/10 text-cyan-300 font-medium px-6 py-3 rounded-lg hover:bg-cyan-900/30 transition-all">
                Configure
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
                      <span className="bg-yellow-900/60 text-yellow-300 text-xs px-3 py-1 rounded-full font-medium">medium risk</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">Performance</div>
                  <div className="text-emerald-400 font-semibold">+8.2%</div>
                </div>
              </div>
              <div className="text-gray-300 text-sm mb-6">Automatically purchase when prices drop below key support levels. Smart dip detection using technical indicators.</div>
              <button className="bg-emerald-500 text-white font-medium px-6 py-3 rounded-lg hover:bg-emerald-600 transition-all">
                Activate Strategy
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
                      <span className="bg-red-900/60 text-red-300 text-xs px-3 py-1 rounded-full font-medium">high risk</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">Performance</div>
                  <div className="text-cyan-400 font-semibold">+12.7%</div>
                </div>
              </div>
              <div className="text-gray-300 text-sm mb-6">Profit from price corrections by buying oversold and selling overbought conditions.</div>
              <button className="bg-emerald-500 text-white font-medium px-6 py-3 rounded-lg hover:bg-emerald-600 transition-all">
                Activate Strategy
              </button>
            </div>
          </div>
        </div>

        {/* Market Insights */}
        <div>
          <div className="text-2xl font-bold text-white mb-8">Market Insights</div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/5 rounded-xl p-8 border border-white/10">
              <div className="font-semibold text-emerald-400 mb-3">DCA Opportunity</div>
              <div className="text-gray-300 mb-3">Bitcoin is down 3.2% this week</div>
              <div className="text-gray-400 text-sm mb-6">Perfect time to increase your DCA amount for better averaging price.</div>
              <button className="bg-emerald-500 text-white font-medium px-6 py-3 rounded-lg hover:bg-emerald-600 transition-all">
                Adjust DCA
              </button>
            </div>
            <div className="bg-white/5 rounded-xl p-8 border border-white/10">
              <div className="font-semibold text-cyan-400 mb-3">Portfolio Health</div>
              <div className="text-gray-300 mb-3">All strategies performing well</div>
              <div className="text-gray-400 text-sm mb-6">Your automated strategies are on track to meet yearly targets.</div>
              <button className="bg-cyan-500 text-white font-medium px-6 py-3 rounded-lg hover:bg-cyan-600 transition-all">
                View Details
              </button>
            </div>
          </div>
        </div>
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
      address: '0x111111111117dC0aa78b770fA6A738034120C302',
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
  const toTokenOrder = ['1INCH', 'ETH', 'ARB'];

  // Get swap quote from 1inch
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
      
      const url = `https://api.1inch.dev/swap/v5.2/42161/quote?src=${fromTokenData.address}&dst=${toTokenData.address}&amount=${amount}`;
      
      console.log('🌐 API URL:', url);
      
      const response = await axios.get(url, {
        headers: {
          Authorization: "Bearer PG0QPjOuHKZ7R22Z5aPUclbNqL2Q7w6P",
        },
      });
      
      console.log('📊 API Response:', response.data);
      
      const quote = response.data as any;
      const formattedToAmount = (parseFloat(quote.toAmount) / Math.pow(10, toTokenData.decimals)).toFixed(6);
      
      console.log('💰 Formatted amount:', formattedToAmount);
      
      setToAmount(formattedToAmount);
      setSwapQuote(quote);
      
    } catch (error) {
      console.error('❌ Failed to get swap quote:', error);
      if ((error as any)?.response) {
        console.error('API Error Response:', (error as any).response.data);
        console.error('API Error Status:', (error as any).response.status);
      }
      setToAmount('');
      setSwapQuote(null);
    }
  };

  // Execute swap
  const executeSwap = async () => {
    if (!swapQuote || !address) return;
    
    try {
      setIsSwapping(true);
      
      const fromTokenData = tokens[fromToken as keyof typeof tokens];
      const toTokenData = tokens[toToken as keyof typeof tokens];
      const amount = parseFloat(fromAmount) * Math.pow(10, fromTokenData.decimals);
      
      const swapUrl = `https://api.1inch.dev/swap/v5.2/42161/swap?src=${fromTokenData.address}&dst=${toTokenData.address}&amount=${amount}&from=${address}&slippage=${slippage}&disableEstimate=true`;
      
      const response = await axios.get(swapUrl, {
        headers: {
          Authorization: "Bearer PG0QPjOuHKZ7R22Z5aPUclbNqL2Q7w6P",
        },
      });
      
      const swapData = response.data as any;
      
      // Execute the swap transaction
      const txHash = await writeContract(config, {
        address: (swapData as any).tx.to as `0x${string}`,
        abi: [], // 1inch provides the calldata
        functionName: 'swap', // This will be overridden by the calldata
        args: [],
        value: BigInt((swapData as any).tx.value || 0),
        gas: BigInt((swapData as any).tx.gas || 300000),
        gasPrice: BigInt((swapData as any).tx.gasPrice || 0),
        account: address,
        data: (swapData as any).tx.data as `0x${string}`,
      } as any);
      
      console.log('✅ Swap successful! Transaction hash:', txHash);
      
      // Reset form
      setFromAmount('');
      setToAmount('');
      setSwapQuote(null);
      
    } catch (error) {
      console.error('❌ Swap failed:', error);
    } finally {
      setIsSwapping(false);
    }
  };

  // Handle amount change and get quote
  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    if (value && parseFloat(value) > 0) {
      // Debounce the quote request
      setTimeout(() => getSwapQuote(), 500);
    } else {
      setToAmount('');
      setSwapQuote(null);
    }
  };

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
                      onChange={(e) => setToToken(e.target.value)}
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
            disabled={!address || !fromAmount || !toAmount || isSwapping}
            className="group relative w-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-cyan-500 text-white font-bold py-5 px-8 rounded-2xl hover:from-emerald-600 hover:via-emerald-700 hover:to-cyan-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl hover:shadow-emerald-500/25 transform hover:scale-[1.02] active:scale-[0.98] border border-emerald-400/50"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative z-10 text-lg tracking-wide">
              {!address 
                ? '🔗 Connect Wallet' 
                : isSwapping 
                  ? '⏳ Swapping...' 
                  : !fromAmount || !toAmount 
                    ? '💡 Enter Amount' 
                    : `🔄 Swap ${fromToken} → ${toToken}`
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