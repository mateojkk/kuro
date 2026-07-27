import { useEffect, useRef, useState } from 'react';

const terminalLines = [
  '<span class="c-gray">$</span> onchainos payment quote https://kuro-virid.vercel.app/api/judge --method POST \\',
  '  --param code=<span class="c-orange">"function add(a, b) { return a + b; }"</span> \\',
  '  --param test=<span class="c-orange">"add(2, 3) === 5"</span>',
  '<br>',
  '<span class="c-gray">Initializing secure V8 isolation sandbox...</span>',
  '<span class="c-gray">Executing code deterministically with 5000ms timeout...</span>',
  '<br>',
  '<span class="c-blue">{</span>',
  '  <span class="c-blue">"service"</span>: <span class="c-green">"kuro-judge-oracle"</span>,',
  '  <span class="c-blue">"decision"</span>: <span class="c-orange">"RELEASE_FUNDS"</span>,',
  '  <span class="c-blue">"rationale"</span>: <span class="c-green">"Delivered code successfully compiled and passed deterministic sandbox verification."</span>,',
  '  <span class="c-blue">"cryptographicSeal"</span>: <span class="c-orange">"verified-by-kuro-vm-1785180653"</span>',
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
      } else {
        // Loop the animation! Wait 5 seconds, clear, and restart.
        currentTimer = setTimeout(() => {
          if (!isActive) return;
          container.innerHTML = '';
          lineIndex = 0;
          charIndex = 0;
          currentLine = '';
          typeWriter();
        }, 5000);
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
          <p className="hero-description">Kuro is a dual-service meta-agent for the OKX ecosystem. It orchestrates parallel swarms for massive tasks and verifies their code using a sandboxed V8 deterministic oracle.</p>
          
          <div className="hero-actions">
            <a href="#services" className="btn btn-white">Explore Services</a>
            <div className="terminal-snippet">
              <span className="prompt">x402</span>
              <span className="price">0.1 USDT / Request</span>
            </div>
          </div>
          
          <div className="api-section" id="api">
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
              <h3>Deterministic Judge Oracle</h3>
              <p className="endpoint">POST /api/judge</p>
              <p>Verifies output deterministically using a secure, isolated V8 execution sandbox. If code fails tests, funds are refunded. If it passes, they are released with a cryptographic seal.</p>
            </div>

            <div className="flat-card">
              <div className="card-icon">🏗️</div>
              <h3>Parallel Swarm Delegate</h3>
              <p className="endpoint">POST /api/delegate</p>
              <p>Orchestrates an entire swarm of agents using Llama-3.3-70b to break down massive tasks, generating deterministic JSON manifests for Llama-3.1-8b edge swarm execution.</p>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <p>© 2026 Kuro.</p>
      </footer>
    </>
  );
}

export default App;
