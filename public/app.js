/**
 * Anti-Gravity DevOps Platform - Frontend JavaScript
 * Handles real-time updates, load testing, and API interactions
 */

// Configuration
const API_BASE = window.location.origin;
let selectedDuration = 5;
let requestCount = 0;

// DOM Elements
const statusIndicator = document.getElementById('status-indicator');
const statusText = document.getElementById('status-text');
const uptimeEl = document.getElementById('uptime');
const memoryEl = document.getElementById('memory');
const memoryBar = document.getElementById('memory-bar');
const requestsEl = document.getElementById('requests');
const hostnameEl = document.getElementById('hostname');
const loadBtn = document.getElementById('load-btn');
const loadResult = document.getElementById('load-result');
const responseViewer = document.getElementById('response-viewer');
const responseContent = document.getElementById('response-content');
const responseTitle = document.getElementById('response-title');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initDurationButtons();
    initLoadButton();
    fetchHealth();
    // Update health every 5 seconds
    setInterval(fetchHealth, 5000);
});

// Duration Button Selection
function initDurationButtons() {
    const buttons = document.querySelectorAll('.duration-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedDuration = parseInt(btn.dataset.duration);
        });
    });
}

// Load Test Button
function initLoadButton() {
    loadBtn.addEventListener('click', runLoadTest);
}

// Fetch Health Status
async function fetchHealth() {
    try {
        const response = await fetch(`${API_BASE}/health`);
        const data = await response.json();
        
        // Update status indicator
        statusIndicator.classList.add('online');
        statusText.textContent = 'System Healthy';
        
        // Update uptime
        const uptime = formatUptime(data.uptime);
        uptimeEl.textContent = uptime;
        
        // Update memory
        const memUsed = data.memory.used;
        memoryEl.textContent = memUsed;
        
        // Calculate memory percentage (assume 256MB limit)
        const memValue = parseInt(memUsed);
        const memPercent = Math.min((memValue / 256) * 100, 100);
        memoryBar.style.width = `${memPercent}%`;
        
        // Update hostname
        hostnameEl.textContent = data.hostname || 'local';
        
        // Increment request count
        requestCount++;
        requestsEl.textContent = requestCount;
        
    } catch (error) {
        console.error('Health check failed:', error);
        statusIndicator.classList.remove('online');
        statusText.textContent = 'Connection Error';
    }
}

// Format uptime in human-readable format
function formatUptime(seconds) {
    if (seconds < 60) return `${Math.floor(seconds)}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`;
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
}

// Run Load Test
async function runLoadTest() {
    loadBtn.disabled = true;
    loadBtn.classList.add('loading');
    loadResult.classList.add('hidden');
    
    try {
        const response = await fetch(`${API_BASE}/load?duration=${selectedDuration}`);
        const data = await response.json();
        
        // Show results
        document.getElementById('result-duration').textContent = `${data.actualDuration}s`;
        document.getElementById('result-iterations').textContent = data.iterations.toLocaleString();
        document.getElementById('result-pod').textContent = data.hostname || 'local';
        
        loadResult.classList.remove('hidden');
        
        // Update request count
        requestCount++;
        requestsEl.textContent = requestCount;
        
    } catch (error) {
        console.error('Load test failed:', error);
        alert('Load test failed. Check console for details.');
    } finally {
        loadBtn.disabled = false;
        loadBtn.classList.remove('loading');
    }
}

// Test Endpoint
async function testEndpoint(path) {
    responseViewer.classList.remove('hidden');
    responseTitle.textContent = `GET ${path}`;
    responseContent.textContent = 'Loading...';
    
    try {
        const response = await fetch(`${API_BASE}${path}`);
        const contentType = response.headers.get('content-type');
        
        let content;
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            content = JSON.stringify(data, null, 2);
        } else {
            content = await response.text();
            // Truncate if too long (metrics endpoint)
            if (content.length > 5000) {
                content = content.substring(0, 5000) + '\n\n... (truncated)';
            }
        }
        
        responseContent.textContent = content;
        
        // Update request count
        requestCount++;
        requestsEl.textContent = requestCount;
        
    } catch (error) {
        responseContent.textContent = `Error: ${error.message}`;
    }
    
    // Scroll to response
    responseViewer.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Close Response Viewer
function closeResponse() {
    responseViewer.classList.add('hidden');
}

// Add smooth entrance animations
document.addEventListener('DOMContentLoaded', () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.stat-card, .feature-card, .endpoint-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });
});
