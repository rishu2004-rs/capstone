document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q') || '';
    
    document.getElementById('displayQuery').textContent = query;
    document.getElementById('searchInput').value = query;

    if (query) {
        fetchResults(query);
    } else {
        document.getElementById('noResultsMsg').classList.remove('hidden');
    }
});

function handleSearch(e) {
    e.preventDefault();
    const q = document.getElementById('searchInput').value.trim();
    if (q) {
        window.location.href = `/search?q=${encodeURIComponent(q)}`;
    }
}

async function fetchResults(query) {
    const loadingSkel = document.getElementById('loadingSkel');
    const resultsGrid = document.getElementById('resultsGrid');
    const noResultsMsg = document.getElementById('noResultsMsg');
    const errorMsg = document.getElementById('errorMsg');
    
    loadingSkel.classList.remove('hidden');
    resultsGrid.classList.add('hidden');
    noResultsMsg.classList.add('hidden');
    errorMsg.classList.add('hidden');

    try {
        const res = await fetch(`/api/cases/search/${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error('Search failed');
        
        const data = await res.json();
        
        // Auto-redirect if exactly 1 match and query is exact case number
        if (data.length === 1 && data[0].caseNumber.toLowerCase() === query.toLowerCase()) {
            window.location.href = `/case/${data[0]._id}`;
            return;
        }

        loadingSkel.classList.add('hidden');
        
        document.getElementById('resultCount').textContent = data.length;

        if (data.length > 0) {
            resultsGrid.classList.remove('hidden');
            renderResults(data);
        } else {
            noResultsMsg.classList.remove('hidden');
        }
    } catch (err) {
        loadingSkel.classList.add('hidden');
        errorMsg.classList.remove('hidden');
    }
}

function renderResults(data) {
    const grid = document.getElementById('resultsGrid');
    grid.innerHTML = '';
    
    const statusConfig = {
        'pending': { color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300', label: 'Pending' },
        'in_progress': { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300', label: 'In Progress' },
        'closed': { color: 'bg-[#C1EAD1] text-[#00684A] dark:bg-[#00684A]/30 dark:text-[#00ED64]', label: 'Closed' }
    };

    data.forEach((item, idx) => {
        const sc = statusConfig[item.status.toLowerCase().replace(' ', '_')] || { color: 'bg-slate-100 text-slate-700 dark:bg-[#023448] dark:text-slate-300', label: item.status };
        const badge = `<span class="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-md ${sc.color}">${sc.label}</span>`;
        const hearing = item.hearingDate ? new Date(item.hearingDate).toLocaleDateString() : 'TBA';

        const delay = idx * 0.05;

        grid.innerHTML += `
            <div class="animate-fade-in" style="animation-delay: ${delay}s">
                <a href="/case/${item._id}" class="block group bg-white dark:bg-[#001E2B] p-8 rounded-2xl border border-[#E8EDEB] dark:border-[#1C2D38] hover:border-[#00ED64]/50 hover:shadow-xl hover:shadow-[#00ED64]/5 transition-all h-full flex flex-col">
                    <div class="flex justify-between items-start mb-6">
                        <div class="flex items-center gap-2">
                            <div class="p-1.5 bg-[#00ED64]/10 rounded">
                                <i data-lucide="database" class="text-[#00ED64]" width="14" height="14"></i>
                            </div>
                            <span class="text-[10px] font-black text-[#889397] uppercase tracking-widest">${item.caseNumber}</span>
                        </div>
                        ${badge}
                    </div>
                    
                    <h3 class="text-xl font-black mb-6 dark:text-white group-hover:text-[#00ED64] transition-colors tracking-tight">${item.title}</h3>
                    
                    <div class="space-y-4 flex-1">
                        <div class="flex items-center gap-3 text-slate-500 dark:text-[#889397] text-xs font-bold uppercase tracking-widest">
                            <i data-lucide="map-pin" width="14" height="14" class="text-slate-400"></i>
                            ${item.courtName}
                        </div>
                        <div class="flex items-center gap-3 text-slate-500 dark:text-[#889397] text-xs font-bold uppercase tracking-widest">
                            <i data-lucide="calendar" width="14" height="14" class="text-[#00ED64]"></i>
                            Hearing: ${hearing}
                        </div>
                    </div>

                    <div class="mt-8 pt-6 border-t border-[#E8EDEB] dark:border-[#1C2D38] flex items-center justify-between">
                        <span class="text-[10px] font-black uppercase tracking-[0.2em] text-[#889397] group-hover:text-[#00ED64] transition-colors">Inspect Document</span>
                        <i data-lucide="arrow-right" width="16" height="16" class="text-slate-300 group-hover:text-[#00ED64] group-hover:translate-x-1 transition-all"></i>
                    </div>
                </a>
            </div>
        `;
    });

    lucide.createIcons();
}
