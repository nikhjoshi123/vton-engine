(function() {
    const CONFIG = {
        API_KEY: "fa-Mj3hUEuwwkgA-dCjX8q7kaLMqzRzhALJChUwS",
        API_URL: "https://api.fashn.ai/v1/predictions",
        GUIDE: "https://raw.githubusercontent.com/nikhjoshi123/vton-engine/main/AIFittingLabs-Assest.jpeg"
    };

    const injectStyles = () => {
        const s = document.createElement("style");
        s.innerHTML = `
            #vton-btn { position:fixed; bottom:30px; right:30px; z-index:2147483647; background:#000; color:#fff; border:none; padding:15px 25px; border-radius:50px; font-weight:bold; cursor:pointer; box-shadow:0 10px 30px rgba(0,0,0,0.4); font-family:sans-serif; }
            .vton-ov { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:2147483647; display:flex; align-items:center; justify-content:center; padding:20px; backdrop-filter:blur(10px); font-family:sans-serif; }
            .vton-con { background:#fff; width:100%; max-width:800px; border-radius:30px; overflow:hidden; display:flex; box-shadow:0 20px 50px rgba(0,0,0,0.5); color:#000; }
            .vton-img { flex:1.2; background:#f4f4f4; height:500px; }
            .vton-img img { width:100%; height:100%; object-fit:cover; }
            .vton-txt { flex:1; padding:40px; display:flex; flex-direction:column; justify-content:center; }
            .vton-main-btn { background:#000; color:#fff; border:none; padding:18px; border-radius:15px; font-weight:bold; cursor:pointer; margin-top:20px; font-size:16px; }
            @media (max-width:768px) { .vton-con { flex-direction:column; max-height:90vh; overflow-y:auto; } .vton-img { height:250px; flex:none; } }
        `;
        document.head.appendChild(s);
    };

    const init = () => {
        if (document.getElementById("vton-btn")) return;
        injectStyles();
        const b = document.createElement("button");
        b.id = "vton-btn";
        b.innerHTML = "✨ SEE IT ON YOU";
        b.onclick = showModal;
        document.body.appendChild(b);
    };

    function showModal() {
        const ov = document.createElement("div");
        ov.className = "vton-ov";
        ov.innerHTML = `
            <div class="vton-con">
                <div class="vton-img"><img src="${CONFIG.GUIDE}"></div>
                <div class="vton-txt">
                    <h2 style="font-size:28px; font-weight:800; margin-bottom:15px;">Fitting Guide</h2>
                    <p style="font-size:14px; color:#666; margin-bottom:20px;">Upload a clear photo following the guide to see the garment on you.</p>
                    <button class="vton-main-btn" id="vton-start">UPLOAD PHOTO</button>
                    <button style="background:none; border:none; color:#999; margin-top:15px; cursor:pointer;" onclick="this.closest('.vton-ov').remove()">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(ov);
        document.getElementById("vton-start").onclick = () => { ov.remove(); triggerUpload(); };
    }

    async function triggerUpload() {
        const input = document.createElement("input");
        input.type = "file"; input.accept = "image/*";
        input.onchange = (e) => {
            const file = e.target.files[0];
            const pImg = Array.from(document.getElementsByTagName("img")).find(i => i.width > 200 && !i.src.includes("github"));
            if (!file || !pImg) return alert("Select product first");

            const b = document.getElementById("vton-btn");
            b.innerHTML = "🌀 ANALYZING...";
            b.disabled = true;

            const reader = new FileReader();
            reader.onload = async (re) => {
                const res = await fetch(CONFIG.API_URL, {
                    method: "POST",
                    headers: { "Authorization": "Bearer " + CONFIG.API_KEY, "Content-Type": "application/json" },
                    body: JSON.stringify({ model_image: re.target.result, garment_image: pImg.src, category: "tops" })
                });
                const data = await res.json();
                if (data.id) poll(data.id);
            };
            reader.readAsDataURL(file);
        };
        input.click();
    }

    async function poll(id) {
        const b = document.getElementById("vton-btn");
        const res = await fetch(CONFIG.API_URL + "/" + id, {
            headers: { "Authorization": "Bearer " + CONFIG.API_KEY }
        });
        const d = await res.json();
        if (d.status === "completed") {
            b.innerHTML = "✨ SEE IT ON YOU"; b.disabled = false;
            showResult(d.output[0]);
        } else {
            b.innerHTML = "🌀 " + d.status.toUpperCase();
            setTimeout(() => poll(id), 4000);
        }
    }

    function showResult(url) {
        const ov = document.createElement("div");
        ov.className = "vton-ov";
        ov.innerHTML = `
            <div class="vton-con">
                <div class="vton-img"><img src="${url}"></div>
                <div class="vton-txt">
                    <h2 style="font-size:32px; font-weight:800;">Perfect Fit!</h2>
                    <button class="vton-main-btn" onclick="this.closest('.vton-ov').remove()">BACK TO SHOP</button>
                    <a href="${url}" target="_blank" style="text-align:center; display:block; margin-top:15px; color:#000; font-weight:bold;">DOWNLOAD</a>
                </div>
            </div>
        `;
        document.body.appendChild(ov);
    }

    setInterval(init, 2000);
})();
