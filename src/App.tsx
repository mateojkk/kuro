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
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    container.innerHTML = ''; // Reset on mount
    
    let isActive = true;
    let currentTimer: ReturnType<typeof setTimeout>;
    
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
      if (!isActive) return;
      
      if (lineIndex < terminalLines.length) {
        const line = terminalLines[lineIndex];
        
        if (line === '<br>') {
          container.innerHTML += '<br>';
          lineIndex++;
          currentTimer = setTimeout(typeWriter, 500);
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
            currentTimer = setTimeout(typeWriter, Math.random() * 30 + 10);
          }
        } else {
          container.innerHTML = getRenderedContent() + currentLine + '<br>';
          lineIndex++;
          charIndex = 0;
          currentLine = '';
          currentTimer = setTimeout(typeWriter, Math.random() * 500 + 200);
        }
      }
    }

    currentTimer = setTimeout(typeWriter, 1000);
    
    return () => {
      isActive = false;
      clearTimeout(currentTimer);
    };
  }, []);

  return (
    <>
      <header>
        <div className="logo">KURO.</div>
        <nav>
          <a href="#services">Architecture</a>
          <a href="#api">API Reference</a>
        </nav>
        <div className="header-actions">
          <a href="https://github.com/mateojkk/kuro" className="btn btn-dark" target="_blank" rel="noreferrer">GitHub</a>
          <a href="#api" className="btn btn-white">Try Kuro</a>
        </div>
      </header>

      <main>
        <section className="hero">
          <h1>The Ultimate <span className="gradient-text">Omni-Agent</span></h1>
          <p className="hero-description">Kuro is a dual-service meta-agent for the OKX ecosystem. Powered by Groq's high-speed inference, Kuro acts as both an Autonomous Arbitrator and a Meta-Contractor.</p>
          
          <div className="hero-actions">
            <a href="#services" className="btn btn-white">Try Kuro API</a>
            <div className="terminal-snippet">
              <span className="prompt">x402</span>
              <span className="price">0.01 USDT / Request</span>
            </div>
          </div>
          
          <div className="api-section">
            <div className="terminal-window">
              <div className="terminal-header">
                <span className="circle"></span>
                <span className="circle"></span>
                <span className="circle"></span>
                <span className="title">kuro-agent ~ bash</span>
              </div>
              <div className="terminal-body" id="typewriter" ref={containerRef}>
                {/* Typed by JS */}
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="services-section">
          <div className="cards-grid">
            <div className="flat-card">
              <div className="card-icon">⚖️</div>
              <h3>The Autonomous Arbitrator</h3>
              <p className="endpoint">POST /api/judge</p>
              <p>Resolves marketplace disputes on-chain. Send Kuro a task description and a delivered payload, and it will cryptographically evaluate it to output a strict RELEASE_FUNDS or REFUND_USER decision.</p>
            </div>

            <div className="flat-card">
              <div className="card-icon">🏗️</div>
              <h3>The Meta-Contractor</h3>
              <p className="endpoint">POST /api/delegate</p>
              <p>Managing a massive project? Send your prompt and budget to Kuro. It breaks it down into sub-tasks and generates the exact specifications needed to autonomously hire other ASPs.</p>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <p>© 2026 Kuro Intelligence. Built for the OKX AI Genesis Hackathon.</p>
      </footer>
    </>
  );
}

export default App;
