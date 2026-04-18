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

    // Status Badge (Atlas Style)
    const statusConfig = {
        'pending': { color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300', label: 'Pending' },
        'in_progress': { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300', label: 'In Progress' },
        'closed': { color: 'bg-[#C1EAD1] text-[#00684A] dark:bg-[#00684A]/30 dark:text-[#00ED64]', label: 'Closed' }
    };
    const sc = statusConfig[data.status.toLowerCase().replace(' ', '_')] || { color: 'bg-slate-100 text-slate-700 dark:bg-[#023448] dark:text-slate-300', label: data.status };
    document.getElementById('statusBadgeContainer').innerHTML = `<span class="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-md ${sc.color}">${data.status}</span>`;

    // History Timeline
    const timeline = document.getElementById('historyTimeline');
    timeline.innerHTML = '';
    if (data.history && data.history.length > 0) {
        data.history.slice().reverse().forEach(entry => {
            const scEntry = statusConfig[entry.status?.toLowerCase().replace(' ', '_')] || { color: 'text-slate-400', label: entry.status };
            timeline.innerHTML += `
                <div class="relative pl-10">
                    <div class="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-white dark:bg-[#001E2B] border-4 border-[#E8EDEB] dark:border-[#1C2D38] z-10"></div>
                    <div class="flex flex-col gap-2">
                        <div class="flex items-center justify-between">
                            <span class="text-[9px] font-black uppercase tracking-widest ${scEntry.color}">${scEntry.label || entry.status}</span>
                            <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">${new Date(entry.updatedAt).toLocaleString()}</span>
                        </div>
                        <p class="text-xs text-slate-600 dark:text-[#889397] font-medium leading-relaxed">System state updated by ${entry.updatedBy?.name || 'System'}</p>
                    </div>
                </div>
            `;
        });
    } else {
        timeline.innerHTML = `<p class="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Initial Node Sync: ${new Date(data.createdAt).toLocaleDateString()}</p>`;
    }

    // Documents List
    const docsList = document.getElementById('documentsList');
    docsList.innerHTML = '';
    if (data.documents && data.documents.length > 0) {
        data.documents.forEach(doc => {
            docsList.innerHTML += `
                <a href="${doc.url}" target="_blank" rel="noreferrer" class="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#023448]/30 border border-[#E8EDEB] dark:border-[#1C2D38] rounded-xl group hover:border-[#00ED64] transition-all">
                    <div class="flex items-center gap-3">
                        <div class="p-2 bg-white dark:bg-[#001E2B] border border-[#E8EDEB] dark:border-[#1C2D38] rounded group-hover:bg-[#00ED64]/10 transition-colors">
                            <i data-lucide="file-text" width="14" height="14" class="text-slate-400 group-hover:text-[#00ED64]"></i>
                        </div>
                        <span class="font-bold text-xs text-slate-700 dark:text-slate-300 group-hover:text-[#00ED64] transition-colors">${doc.name}</span>
                    </div>
                    <i data-lucide="external-link" width="14" height="14" class="text-slate-300 group-hover:text-[#00ED64]"></i>
                </a>
            `;
        });
    } else {
        docsList.innerHTML = `<p class="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center py-4 italic">No Document Objects Found</p>`;
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
        <div id="msg-${msg._id}" class="flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in">
            <div class="max-w-[85%] ${isMe ? 'bg-[#00ED64]/10 border border-[#00ED64]/20 rounded-l-xl rounded-tr-xl' : 'bg-slate-50 dark:bg-[#023448]/50 border border-[#E8EDEB] dark:border-[#1C2D38] rounded-r-xl rounded-tl-xl'} p-4">
                <div class="flex items-center gap-2 mb-1.5">
                    <span class="text-[9px] font-black uppercase tracking-widest ${isMe ? 'text-[#00ED64]' : 'text-[#889397]'}">${msg.sender.name}</span>
                    <span class="text-[8px] font-bold text-slate-400 uppercase tracking-[0.1em]">${msg.sender.role}</span>
                </div>
                <p class="text-sm font-medium ${isMe ? 'dark:text-white' : 'dark:text-[#889397]'}">${msg.content}</p>
                <p class="text-[8px] mt-2 font-bold text-slate-400 uppercase text-right">${new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
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



