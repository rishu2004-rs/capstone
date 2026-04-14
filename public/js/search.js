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
        'pending': { color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', label: 'Pending' },
        'in_progress': { color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', label: 'In Progress' },
        'closed': { color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', label: 'Closed' }
    };

    data.forEach((item, idx) => {
        const sc = statusConfig[item.status.toLowerCase().replace(' ', '_')] || { color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', label: item.status };
        const badge = `<span class="px-3 py-1 text-xs font-bold rounded-full border border-current ${sc.color}">${sc.label}</span>`;
        const hearing = item.hearingDate ? new Date(item.hearingDate).toLocaleDateString() : 'TBA';

        const delay = idx * 0.1;

        grid.innerHTML += `
            <div class="animate-slide-up-fade" style="animation-delay: ${delay}s">
                <a href="/case/${item._id}" class="block group bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-[#1a73e8]/50 hover:shadow-xl hover:shadow-[#1a73e8]/5 transition-all h-full flex flex-col">
                    <div class="flex justify-between items-start mb-4">
                        <div class="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-bold uppercase tracking-wider">
                            ${item.caseNumber}
                        </div>
                        ${badge}
                    </div>
                    
                    <h3 class="text-xl font-bold mb-4 dark:text-white group-hover:text-[#1a73e8] transition-colors">${item.title}</h3>
                    
                    <div class="space-y-3 flex-1">
                        <div class="flex items-center gap-2 text-slate-500 text-sm font-medium">
                            <i data-lucide="map-pin" width="16" height="16" class="text-slate-400"></i>
                            ${item.courtName}
                        </div>
                        <div class="flex items-center gap-2 text-slate-500 text-sm font-medium">
                            <i data-lucide="calendar" width="16" height="16" class="text-slate-400"></i>
                            Next Hearing: ${hearing}
                        </div>
                        <div class="flex items-center gap-2 text-slate-500 text-sm font-medium">
                            <i data-lucide="user" width="16" height="16" class="text-slate-400"></i>
                            P: ${item.petitioner} vs R: ${item.respondent}
                        </div>
                    </div>

                    <div class="mt-6 pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between group-hover:bg-blue-50/50 dark:group-hover:bg-blue-900/10 rounded-b-3xl -mx-6 -mb-6 px-6 py-4 transition-colors">
                        <span class="text-[#1a73e8] font-bold text-sm">View Details</span>
                        <i data-lucide="chevron-right" width="20" height="20" class="text-[#1a73e8] group-hover:translate-x-1 transition-transform"></i>
                    </div>
                </a>
            </div>
        `;
    });

    lucide.createIcons();
}
