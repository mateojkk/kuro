import { useEffect, useRef, useState } from 'react';

const terminalLines = [
  '<span class="c-gray">$</span> curl -X POST https://kuro.okx.ai/api/judge \\',
  '  -H <span class="c-green">"x-402-payment: <signed_tx>"</span> \\',
  '  -d <span class="c-orange">\'{"taskDescription": "Audit ERC20", "deliveredPayload": "..."}\'</span>',
  '<br>',
  '<span class="c-gray">Analyzing cryptographic constraints...</span>',
  '<span class="c-gray">Simulating logic paths via Groq LPU...</span>',
  '<br>',
  '<span class="c-blue">{</span>',
  '  <span class="c-blue">"service"</span>: <span class="c-green">"judge"</span>,',
  '  <span class="c-blue">"decision"</span>: <span class="c-orange">"REFUND_USER"</span>,',
  '  <span class="c-blue">"rationale"</span>: <span class="c-green">"Critical reentrancy vulnerability detected on line 42. ASP failed to satisfy security constraints."</span>',
  '<span class="c-blue">}</span>'
];

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (hasStarted || !containerRef.current) return;
    setHasStarted(true);

    const container = containerRef.current;
    let lineIndex = 0;
    let charIndex = 0;
    let isTag = false;
    let currentLine = '';

    function getRenderedContent() {
      const brs = container.innerHTML.split('<br>');
      brs.pop(); 
      return brs.length > 0 ? brs.join('<br>') + '<br>' : '';
    }

    function typeWriter() {
      if (lineIndex < terminalLines.length) {
        const line = terminalLines[lineIndex];
        
        if (line === '<br>') {
          container.innerHTML += '<br>';
          lineIndex++;
          setTimeout(typeWriter, 500);
          return;
        }

        if (charIndex < line.length) {
          const char = line.charAt(charIndex);
          if (char === '<') isTag = true;
          
          currentLine += char;
          charIndex++;
          
          if (char === '>') isTag = false;
          
          if (isTag) {
            typeWriter();
          } else {
            container.innerHTML = container.innerHTML.substring(0, container.innerHTML.length - 1) || '';
            container.innerHTML = getRenderedContent() + currentLine + '<span class="cursor" style="animation: blink 1s step-end infinite;">█</span>';
            setTimeout(typeWriter, Math.random() * 30 + 10);
          }
        } else {
          container.innerHTML = getRenderedContent() + currentLine + '<br>';
          lineIndex++;
          charIndex = 0;
          currentLine = '';
          setTimeout(typeWriter, Math.random() * 500 + 200);
        }
      }
    }

    const timer = setTimeout(typeWriter, 1000);
    return () => clearTimeout(timer);
  }, [hasStarted]);

  return (
    <>
      <div className="glow-orb"></div>
      <div className="glow-orb secondary"></div>

      <header>
        <div className="logo">KURO<span className="dot">.</span></div>
        <nav>
          <a href="#services">Services</a>
          <a href="#api">API Specs</a>
          <a href="https://web3.okx.com/onchainos" className="cta-button" target="_blank" rel="noreferrer">OKX AI Marketplace</a>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="badge">Decentralized Justice & Orchestration</div>
          <h1>The Ultimate<br /><span className="gradient-text">Omni-Agent</span></h1>
          <p>Kuro is a dual-service meta-agent for the OKX ecosystem. Powered by Groq's high-speed inference, Kuro acts as both an Autonomous Arbitrator and a Meta-Contractor.</p>
          <div className="hero-buttons">
            <a href="#services" className="primary-btn">Explore Services</a>
            <div className="terminal-snippet">
              <span className="prompt">x402</span><span className="price">0.01 USDT / Request</span>
            </div>
          </div>
        </section>

        <section id="services" className="services-section">
          <h2>Dual Core Architecture</h2>
          <div className="cards-grid">
            <div className="glass-card">
              <div className="card-icon">⚖️</div>
              <h3>The Autonomous Arbitrator</h3>
              <p className="endpoint">POST /api/judge</p>
              <p>Resolves marketplace disputes on-chain. Send Kuro a task description and a delivered payload, and it will cryptographically evaluate it to output a strict RELEASE_FUNDS or REFUND_USER decision.</p>
            </div>

            <div className="glass-card">
              <div className="card-icon">🏗️</div>
              <h3>The Meta-Contractor</h3>
              <p className="endpoint">POST /api/delegate</p>
              <p>Managing a massive project? Send your prompt and budget to Kuro. It breaks it down into sub-tasks and generates the exact specifications needed to autonomously hire other ASPs.</p>
            </div>
          </div>
        </section>

        <section id="api" className="api-section">
          <h2>Live Terminal</h2>
          <div className="terminal-window">
            <div className="terminal-header">
              <span className="circle red"></span>
              <span className="circle yellow"></span>
              <span className="circle green"></span>
              <span className="title">kuro-agent ~ bash</span>
            </div>
            <div className="terminal-body" id="typewriter" ref={containerRef}>
              {/* Typed by JS */}
            </div>
          </div>
        </section>
      </main>

      <footer>
        <p>Built for the OKX AI Genesis Hackathon | Fully x402 Compliant</p>
      </footer>
    </>
  );
}

export default App;
