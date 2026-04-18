let allCases = [];

document.addEventListener('DOMContentLoaded', () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        window.location.href = '/login';
        return;
    }

    const user = JSON.parse(userStr);
    if (user.role === 'admin') {
        document.getElementById('addCaseBtn').classList.remove('hidden');
    }

    fetchDashboardData();
});

async function fetchDashboardData() {
    const token = localStorage.getItem('token');
    
    try {
        const [statsRes, casesRes] = await Promise.all([
            fetch('/api/dashboard', { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch('/api/cases', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (!statsRes.ok || !casesRes.ok) throw new Error('Failed to fetch data');

        const stats = await statsRes.json();
        const cases = await casesRes.json();
        
        allCases = cases;

        document.getElementById('statTotal').textContent = stats.totalCases || 0;
        document.getElementById('statPending').textContent = stats.pendingCases || 0;
        document.getElementById('statActive').textContent = stats.inProgressCases || 0;
        document.getElementById('statClosed').textContent = stats.closedCases || 0;

        renderCases(cases);

    } catch (err) {
        console.error('Error fetching dashboard data:', err);
    }
}

function renderCases(casesToRender) {
    const tbody = document.getElementById('casesTableBody');
    const noCasesMsg = document.getElementById('noCasesMsg');
    
    tbody.innerHTML = '';
    
    if (casesToRender.length === 0) {
        noCasesMsg.classList.remove('hidden');
    } else {
        noCasesMsg.classList.add('hidden');
        
        casesToRender.forEach(c => {
            const tr = document.createElement('tr');
            tr.className = "group hover:bg-[#00ED64]/5 dark:hover:bg-[#00ED64]/5 transition-colors border-b border-[#E8EDEB] dark:border-[#1C2D38]";
            
            // Generate status badge logic (Atlas Style)
            const statusConfig = {
                'pending': { color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300', label: 'Pending' },
                'in_progress': { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300', label: 'In Progress' },
                'closed': { color: 'bg-[#C1EAD1] text-[#00684A] dark:bg-[#00684A]/30 dark:text-[#00ED64]', label: 'Closed' }
            };
            const sc = statusConfig[c.status] || statusConfig['pending'];
            const roundedBadge = `<span class="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md ${sc.color}">${sc.label}</span>`;

            tr.innerHTML = `
                <td class="px-6 py-5">
                    <div class="flex items-center gap-3">
                        <div class="w-2 h-2 rounded-full ${c.status === 'closed' ? 'bg-[#00ED64]' : 'bg-amber-400'}"></div>
                        <span class="font-mono text-xs font-bold text-slate-500 dark:text-[#889397]">${c.caseNumber}</span>
                    </div>
                </td>
                <td class="px-6 py-5">
                    <div class="flex flex-col">
                        <span class="font-bold text-slate-900 dark:text-white leading-tight">${c.title}</span>
                        <div class="flex items-center gap-2 mt-1">
                            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">${c.courtName}</span>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-5">
                    ${roundedBadge}
                </td>
                <td class="px-6 py-5">
                    <div class="flex flex-col gap-1">
                        <div class="flex items-center gap-2">
                            <span class="text-[10px] font-black text-slate-400 uppercase w-8">PET</span>
                            <span class="text-xs font-bold text-slate-700 dark:text-slate-300">${c.petitioner}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="text-[10px] font-black text-slate-400 uppercase w-8">RES</span>
                            <span class="text-xs font-bold text-slate-700 dark:text-slate-300">${c.respondent}</span>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-5 text-right">
                    <a href="/case/${c._id}" class="inline-flex items-center justify-center px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#001E2B] dark:text-white bg-slate-100 dark:bg-[#023448] border border-[#E8EDEB] dark:border-[#1C2D38] rounded hover:border-[#00ED64] transition-all">
                        Inspect
                    </a>
                </td>
            `;
            tbody.appendChild(tr);
        });
        
        lucide.createIcons();
    }
}


function filterCases() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    const filtered = allCases.filter(c => 
        c.caseNumber.toLowerCase().includes(term) ||
        c.title.toLowerCase().includes(term)
    );
    renderCases(filtered);
}

function openAddModal() {
    document.getElementById('addModal').classList.remove('hidden');
}

function closeAddModal() {
    document.getElementById('addModal').classList.add('hidden');
}

async function handleAddCase(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    const formData = {
        caseNumber: document.getElementById('caseNumber').value,
        title: document.getElementById('caseTitle').value,
        petitioner: document.getElementById('petitioner').value,
        respondent: document.getElementById('respondent').value,
        courtName: document.getElementById('courtName').value,
        hearingDate: document.getElementById('hearingDate').value,
        description: document.getElementById('description').value
    };

    try {
        const res = await fetch('/api/cases', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        if (res.ok) {
            closeAddModal();
            // Reset form
            e.target.reset();
            fetchDashboardData();
        } else {
            const err = await res.json();
            alert(err.message || 'Failed to create case');
        }
    } catch(err) {
        alert('Network error while creating case');
    }
}
