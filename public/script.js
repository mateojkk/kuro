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

const container = document.getElementById('typewriter');
let lineIndex = 0;
let charIndex = 0;
let isTag = false;
let currentLine = '';

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
                
                // Add the char and a blinking cursor
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

function getRenderedContent() {
    const brs = container.innerHTML.split('<br>');
    brs.pop(); // remove last active line part
    return brs.length > 0 ? brs.join('<br>') + '<br>' : '';
}

// Add cursor CSS dynamically
const style = document.createElement('style');
style.innerHTML = `
@keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
}
`;
document.head.appendChild(style);

// Start typing after a short delay
setTimeout(typeWriter, 1000);
