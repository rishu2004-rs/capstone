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
            tr.className = "group hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors";
            
            // Generate status badge logic
            const statusConfig = {
                'pending': { color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', label: 'Pending' },
                'in_progress': { color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', label: 'In Progress' },
                'closed': { color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', label: 'Closed' }
            };
            const sc = statusConfig[c.status] || statusConfig['pending'];
            const roundedBadge = `<span class="px-3 py-1 text-xs font-bold rounded-full border border-current ${sc.color}">${sc.label}</span>`;

            tr.innerHTML = `
                <td class="px-8 py-6">
                    <span class="font-bold text-slate-900 dark:text-white">${c.caseNumber}</span>
                </td>
                <td class="px-8 py-6">
                    <div class="flex flex-col">
                        <span class="font-bold text-slate-900 dark:text-white">${c.title}</span>
                        <span class="text-xs text-slate-500">${c.courtName}</span>
                    </div>
                </td>
                <td class="px-8 py-6">
                    ${roundedBadge}
                </td>
                <td class="px-8 py-6">
                    <div class="flex items-center gap-2">
                        <span class="text-sm font-medium text-slate-700 dark:text-slate-300">${c.petitioner}</span>
                        <span class="text-slate-400 text-xs font-bold">VS</span>
                        <span class="text-sm font-medium text-slate-700 dark:text-slate-300">${c.respondent}</span>
                    </div>
                </td>
                <td class="px-8 py-6 text-right">
                    <a href="/case/${c._id}" class="inline-flex items-center justify-center p-2 text-slate-400 hover:text-[#1a73e8] rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-all">
                        <i data-lucide="chevron-right" width="20" height="20"></i>
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
