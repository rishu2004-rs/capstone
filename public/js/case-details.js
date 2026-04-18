document.addEventListener('DOMContentLoaded', () => {
    fetchCaseDetails();
});

async function fetchCaseDetails() {
    const token = localStorage.getItem('token');
    // Ensure lucide renders any initially loaded icons
    lucide.createIcons();
    
    try {
        const headers = { 'Content-Type': 'application/json' };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const res = await fetch(`/api/cases/${CASE_ID}`, { headers });
        if (!res.ok) {
            if (res.status === 404) {
                showNotFound();
                return;
            }
            throw new Error('Failed to fetch case');
        }
        
        const data = await res.json();
        renderCase(data);
        setupPermissions();
    } catch (err) {
        console.error('Error fetching case:', err);
        showNotFound();
    }
}

function showNotFound() {
    document.getElementById('loadingIndicator').classList.add('hidden');
    document.getElementById('notFoundMsg').classList.remove('hidden');
}

let currentCase = null;
let chatInterval = null;

function renderCase(data) {
    currentCase = data;
    document.getElementById('loadingIndicator').classList.add('hidden');
    document.getElementById('mainContent').classList.remove('hidden');
    document.getElementById('sidebarArea').classList.remove('hidden');
    document.getElementById('sidebarArea').classList.add('block');

    document.getElementById('caseNumber').textContent = data.caseNumber;
    document.getElementById('chatCaseNum').textContent = data.caseNumber;
    document.getElementById('caseTitle').textContent = data.title;
    document.getElementById('caseDescription').textContent = data.description;
    document.getElementById('casePetitioner').textContent = data.petitioner;
    document.getElementById('caseRespondent').textContent = data.respondent;
    document.getElementById('caseCourtName').textContent = data.courtName;


    document.getElementById('caseHearingDate').textContent = data.hearingDate ? new Date(data.hearingDate).toLocaleDateString() : 'To be scheduled';

    // Status Badge
    const statusConfig = {
        'pending': { color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', label: 'Pending' },
        'in_progress': { color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', label: 'In Progress' },
        'closed': { color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', label: 'Closed' }
    };
    const sc = statusConfig[data.status.toLowerCase().replace(' ', '_')] || { color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', label: data.status };
    document.getElementById('statusBadgeContainer').innerHTML = `<span class="px-4 py-2 text-sm font-bold rounded-full border border-current ${sc.color}">${data.status}</span>`;

    // History Timeline
    const timeline = document.getElementById('historyTimeline');
    timeline.innerHTML = '';
    if (data.history && data.history.length > 0) {
        data.history.slice().reverse().forEach(entry => {
            const scEntry = statusConfig[entry.status?.toLowerCase().replace(' ', '_')] || { color: 'text-slate-500', label: entry.status };
            timeline.innerHTML += `
                <div class="relative pl-10">
                    <div class="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-white dark:bg-slate-900 border-4 border-[#1a73e8] dark:border-[#8ab4f8] z-10"></div>
                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <span class="px-2 py-1 text-xs font-bold rounded-lg border border-current ${scEntry.color}">${scEntry.label || entry.status}</span>
                        <span class="text-xs font-bold text-slate-400">${new Date(entry.updatedAt).toLocaleString()}</span>
                    </div>
                    <p class="mt-2 text-slate-600 dark:text-slate-400 font-medium">Updated by ${entry.updatedBy?.name || 'System'}</p>
                </div>
            `;
        });
    } else {
        timeline.innerHTML = `<p class="text-slate-400 font-medium pl-2">Created on ${new Date(data.createdAt).toLocaleDateString()}</p>`;
    }

    // Documents List
    const docsList = document.getElementById('documentsList');
    docsList.innerHTML = '';
    if (data.documents && data.documents.length > 0) {
        data.documents.forEach(doc => {
            docsList.innerHTML += `
                <a href="${doc.url}" target="_blank" rel="noreferrer" class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl group hover:bg-emerald-500 transition-all">
                    <div class="flex items-center gap-3">
                        <div class="p-2 bg-white dark:bg-slate-700 rounded-lg group-hover:bg-white/20">
                            <i data-lucide="file-text" width="16" height="16" class="text-slate-400 group-hover:text-white"></i>
                        </div>
                        <span class="font-bold text-sm text-slate-700 dark:text-slate-300 group-hover:text-white">${doc.name}</span>
                    </div>
                    <i data-lucide="external-link" width="16" height="16" class="text-slate-300 group-hover:text-white"></i>
                </a>
            `;
        });
    } else {
        docsList.innerHTML = `<p class="text-slate-400 font-medium text-center py-4 italic">No documents attached.</p>`;
    }

    // Set Update Form initial values
    document.getElementById('updateStatus').value = data.status;
    document.getElementById('updateHearingDate').value = data.hearingDate ? data.hearingDate.split('T')[0] : '';
    
    lucide.createIcons();
    fetchQRCode();
}

async function fetchQRCode() {
    try {
        const res = await fetch(`/api/cases/${CASE_ID}/qr`);
        if (res.ok) {
            const data = await res.json();
            document.getElementById('qrLoading').classList.add('hidden');
            const qrImg = document.getElementById('qrImage');
            qrImg.src = data.qrCode;
            qrImg.classList.remove('hidden');
        }
    } catch (err) {
        console.error('QR fetch error:', err);
    }
}


function setupPermissions() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        const user = JSON.parse(userStr);
        
        // Show chat button for all authenticated users
        const chatBtn = document.getElementById('chatTrigger');
        if (chatBtn) chatBtn.classList.remove('hidden');

        if (user.role === 'admin' || user.role === 'court_staff') {
            document.getElementById('managementCard').classList.remove('hidden');
            document.getElementById('uploadDocForm').classList.remove('hidden');
        }
    }
}


async function handleUpdateStatus(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const status = document.getElementById('updateStatus').value;
    const hearingDate = document.getElementById('updateHearingDate').value;
    const updateBtn = document.getElementById('updateBtn');

    updateBtn.disabled = true;
    updateBtn.textContent = 'Updating...';

    try {
        const res = await fetch(`/api/cases/update-status/${CASE_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status, hearingDate })
        });
        if (res.ok) {
            fetchCaseDetails();
        } else {
            alert('Update failed');
        }
    } catch (err) {
        alert('Network error during update');
    }

    updateBtn.disabled = false;
    updateBtn.textContent = 'Commit Changes';
}

async function handleUploadDoc(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const name = document.getElementById('docName').value;
    const url = document.getElementById('docUrl').value;

    try {
        const res = await fetch(`/api/cases/${CASE_ID}/documents`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name, url })
        });
        if (res.ok) {
            document.getElementById('docName').value = '';
            document.getElementById('docUrl').value = '';
            fetchCaseDetails();
        } else {
            alert('Upload failed');
        }
    } catch (err) {
        alert('Network error during upload');
    }
}

/** CHAT SYSTEM (SOCKET.IO) **/
let socket = null;

function initSocket() {
    if (socket) return;
    socket = io();
    
    socket.emit('join_case', CASE_ID);

    socket.on('new_message', (msg) => {
        // Only append if we don't already have it
        appendMessage(msg);
    });
}



async function fetchMessages() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const res = await fetch(`/api/chat/${CASE_ID}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const messages = await res.json();
            renderMessages(messages);
        }
    } catch (err) {
        console.error('Chat fetch error:', err);
    }
}

function renderMessages(messages) {
    const container = document.getElementById('chatMessages');
    if (messages.length === 0) {
        container.innerHTML = `<div class="text-center py-10 text-slate-400 font-medium">No messages yet. Start the conversation!</div>`;
        return;
    }
    container.innerHTML = '';
    messages.forEach(msg => appendMessage(msg));
}

function appendMessage(msg) {
    const container = document.getElementById('chatMessages');
    const user = JSON.parse(localStorage.getItem('user'));
    
    // Prevent duplicates
    const existing = document.getElementById(`msg-${msg._id}`);
    if (existing) return;

    const isMe = msg.sender._id === user._id;
    const msgHtml = `
        <div id="msg-${msg._id}" class="flex ${isMe ? 'justify-end' : 'justify-start'} animate-slide-in-up" style="opacity: 1">
            <div class="max-w-[80%] ${isMe ? 'bg-[#1a73e8] text-white rounded-t-[1.5rem] rounded-bl-[1.5rem]' : 'bg-slate-100 dark:bg-slate-800 dark:text-white rounded-t-[1.5rem] rounded-br-[1.5rem]'} p-4 shadow-sm">
                <p class="text-[10px] uppercase font-black ${isMe ? 'text-blue-100' : 'text-slate-400'} mb-1">${msg.sender.name} (${msg.sender.role})</p>
                <p class="font-medium">${msg.content}</p>
                <p class="text-[9px] mt-2 opacity-70 text-right">${new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            </div>
        </div>
    `;

    if (container.innerText.includes("No messages yet")) {
        container.innerHTML = '';
    }

    container.insertAdjacentHTML('beforeend', msgHtml);
    container.scrollTop = container.scrollHeight;
}

async function handleChatSubmit(e) {
    e.preventDefault();
    const input = document.getElementById('chatInput');
    const content = input.value.trim();
    const user = JSON.parse(localStorage.getItem('user'));

    if (!content || !socket) return;

    // Fast Emit via Socket instead of HTTP
    socket.emit('send_message', {
        caseId: CASE_ID,
        senderId: user.id || user._id,
        content: content
    });

    input.value = '';
}



