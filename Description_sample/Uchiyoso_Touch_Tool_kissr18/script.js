// これは販売パッケージ（大人向け）と同等の見た目・挙動を確認するためのサンプル用JSです

document.addEventListener('DOMContentLoaded', () => {
    // アコーディオンの制御
    const accordions = document.querySelectorAll('.accordion-header');

    accordions.forEach(acc => {
        acc.addEventListener('click', function() {
            this.classList.toggle('active');
            const panel = this.nextElementSibling;
            if (panel.style.maxHeight) {
                panel.style.maxHeight = null;
            } else {
                panel.style.maxHeight = panel.scrollHeight + "px";
            }
        });
    });

    // デフォルトは「全て閉じる」
    closeAllAccordions();

    // コピー機能の制御
    const descItems = document.querySelectorAll('.desc-item');

    descItems.forEach(item => {
        item.addEventListener('click', function() {
            const textToCopy = normalizeCopyText(this.innerText);

            copyToClipboard(textToCopy).then(() => {
                showToast(`コピーしました！\n"${textToCopy.substring(0, 30)}..."`);
            }).catch(err => {
                console.error('コピーに失敗しました', err);
                showToast('コピーに失敗しました');
            });
        });
    });

    // 絞り込み（固定タグ）
    const filterClear = document.getElementById('filterClear');
    const searchMeta = document.getElementById('searchMeta');
    const accordionExpandAll = document.getElementById('accordionExpandAll');
    const accordionCollapseAll = document.getElementById('accordionCollapseAll');
    const filterChips = Array.from(document.querySelectorAll('.chip[data-filter-group][data-filter-value]'));

    if (filterClear && filterChips.length > 0) {
        const allItems = Array.from(document.querySelectorAll('.desc-item'));
        const allAccordions = Array.from(document.querySelectorAll('.accordion'));

        // カテゴリ判定：アコーディオン見出しから固定タグへ
        const getCategoryTag = (headerText) => {
            const t = (headerText || '').replace(/\s+/g, '');
            if (t.includes('濃厚なキス')) return '濃厚';
            if (t.includes('呼吸が乱れるキス')) return '呼吸';
            if (t.includes('理性が飛ぶキス')) return '理性';
            if (t.includes('首筋') || t.includes('鎖骨')) return '首筋';
            if (t.includes('耳元')) return '耳';
            if (t.includes('服を脱がせ')) return '脱がす';
            if (t.includes('ベッド')) return 'ベッド';
            if (t.includes('全身')) return '全身';
            if (t.includes('抑えきれない欲望')) return '欲望';
            if (t.includes('先を促す')) return '促す';
            return null;
        };

        const getViewTag = (itemText) => {
            const t = (itemText || '');
            if (t.includes('【受】')) return '受';
            if (t.includes('【攻】')) return '攻';
            if (t.includes('【両】')) return '両';
            return null;
        };

        // 事前に各アイテムへタグ付け（data属性）
        allAccordions.forEach(acc => {
            const header = acc.querySelector('.accordion-header');
            const cat = getCategoryTag(header ? header.innerText : '');
            const items = Array.from(acc.querySelectorAll('.desc-item'));
            items.forEach(li => {
                const v = getViewTag(li.innerText);
                if (cat) li.dataset.cat = cat;
                if (v) li.dataset.view = v;
            });
        });

        const getSelected = (group) =>
            filterChips
                .filter(b => b.dataset.filterGroup === group && b.classList.contains('is-active'))
                .map(b => b.dataset.filterValue);

        const applyFilter = () => {
            const selectedView = getSelected('view'); // []なら全て
            const selectedCat = getSelected('cat');   // []なら全て
            const isFiltering = selectedView.length > 0 || selectedCat.length > 0;
            let matchCount = 0;

            allItems.forEach(li => {
                li.classList.remove('is-hidden', 'is-match');

                const v = li.dataset.view || '';
                const c = li.dataset.cat || '';

                const okView = selectedView.length === 0 ? true : selectedView.includes(v);
                const okCat = selectedCat.length === 0 ? true : selectedCat.includes(c);

                const ok = okView && okCat;
                if (ok) {
                    matchCount += 1;
                    if (isFiltering) li.classList.add('is-match');
                } else {
                    li.classList.add('is-hidden');
                }
            });

            // アコーディオンは表示/非表示。絞り込み中だけ「ヒットのあるものを自動で開く」
            allAccordions.forEach(acc => {
                const panel = acc.querySelector('.panel');
                const header = acc.querySelector('.accordion-header');
                const hasVisible = acc.querySelector('.desc-item:not(.is-hidden)');

                if (!hasVisible) {
                    acc.classList.add('is-hidden');
                    if (header) header.classList.remove('active');
                    if (panel) panel.style.maxHeight = null;
                    return;
                }

                acc.classList.remove('is-hidden');

                if (isFiltering) {
                    if (header) header.classList.add('active');
                    if (panel) panel.style.maxHeight = panel.scrollHeight + "px";
                } else {
                    // デフォルト（非絞り込み時）は閉じたまま
                    if (header) header.classList.remove('active');
                    if (panel) panel.style.maxHeight = null;
                }
            });

            const viewLabel = selectedView.length ? `視点:${selectedView.join('/')}` : '視点:全て';
            const catLabel = selectedCat.length ? `カテゴリ:${selectedCat.join('/')}` : 'カテゴリ:全て';
            if (searchMeta) searchMeta.textContent = `${viewLabel} / ${catLabel} / 表示:${matchCount}件`;
        };

        filterChips.forEach(btn => {
            btn.addEventListener('click', () => {
                btn.classList.toggle('is-active');
                applyFilter();
            });
        });

        filterClear.addEventListener('click', () => {
            filterChips.forEach(b => b.classList.remove('is-active'));
            applyFilter();
        });

        if (accordionExpandAll) {
            accordionExpandAll.addEventListener('click', () => {
                openAllVisibleAccordions();
            });
        }

        if (accordionCollapseAll) {
            accordionCollapseAll.addEventListener('click', () => {
                closeAllVisibleAccordions();
            });
        }

        applyFilter();
        return;
    }
});

function normalizeCopyText(text) {
    return (text || '')
        .replace(/^\d+\.\s*/, '')
        .replace(/^【(受|攻|両)】\s*/, '')
        .trim();
}

function closeAllAccordions() {
    const allAccordions = Array.from(document.querySelectorAll('.accordion'));
    allAccordions.forEach(acc => {
        const panel = acc.querySelector('.panel');
        const header = acc.querySelector('.accordion-header');
        if (header) header.classList.remove('active');
        if (panel) panel.style.maxHeight = null;
    });
}

function openAllVisibleAccordions() {
    const allAccordions = Array.from(document.querySelectorAll('.accordion:not(.is-hidden)'));
    allAccordions.forEach(acc => {
        const panel = acc.querySelector('.panel');
        const header = acc.querySelector('.accordion-header');
        if (header) header.classList.add('active');
        if (panel) panel.style.maxHeight = panel.scrollHeight + "px";
    });
}

function closeAllVisibleAccordions() {
    const allAccordions = Array.from(document.querySelectorAll('.accordion:not(.is-hidden)'));
    allAccordions.forEach(acc => {
        const panel = acc.querySelector('.panel');
        const header = acc.querySelector('.accordion-header');
        if (header) header.classList.remove('active');
        if (panel) panel.style.maxHeight = null;
    });
}

async function copyToClipboard(text) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        try {
            await navigator.clipboard.writeText(text);
            return;
        } catch (e) {
            // fallbackへ
        }
    }

    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    ta.style.left = '-1000px';
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, ta.value.length);

    const ok = document.execCommand && document.execCommand('copy');
    document.body.removeChild(ta);

    if (!ok) throw new Error('copy failed');
}

function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.innerText = message;
    toast.className = "show";

    setTimeout(function(){
        toast.className = toast.className.replace("show", "");
    }, 3000);
}


