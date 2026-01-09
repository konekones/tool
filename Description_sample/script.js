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

    // コピー機能の制御
    const descItems = document.querySelectorAll('.desc-item');

    descItems.forEach(item => {
        item.addEventListener('click', function() {
            // テキストを取得（番号などを除外したい場合はここで整形する）
            // ここではシンプルにクリックされた要素のテキスト全体をコピーする
            // もし「1. 」などの連番を除去したければ、regex等で加工する
            
            // 連番（数字 + ドット + スペース、または全角数字など）を除去する正規表現
            // 例: "1. テキスト" -> "テキスト"
            // 例: "10. テキスト" -> "テキスト"
            const textToCopy = this.innerText.replace(/^\d+\.\s*/, '');

            navigator.clipboard.writeText(textToCopy).then(() => {
                showToast(`コピーしました:\n"${textToCopy.substring(0, 20)}..."`);
            }).catch(err => {
                console.error('コピーに失敗しました', err);
                showToast('コピーに失敗しました');
            });
        });
    });
});

// トースト表示関数
function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    
    toast.innerText = message;
    toast.className = "show";
    
    // 3秒後にクラスを削除（CSSのアニメーションと連動）
    setTimeout(function(){ 
        toast.className = toast.className.replace("show", ""); 
    }, 3000);
}

