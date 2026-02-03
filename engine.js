(function() {
    if (window.VTON_RUNNING) return;
    window.VTON_RUNNING = true;

    const CONFIG = {
        API_KEY: "fa-Mj3hUEuwwkgA-dCjX8q7kaLMqzRzhALJChUwS",
        PROXY: "https://cors-anywhere.herokuapp.com/",
        API_URL: "https://api.fashn.ai/v1/predictions",
        GUIDE_IMG: "https://github.com/nikhjoshi123/ai-fitting-labs-service/blob/main/AIFittingLabs-Assest.jpeg?raw=true"
    };

    const injectStyles = () => {
        const s = document.createElement("style");
        s.innerHTML = `
            .v-spin { width:14px; height:14px; border:2px solid #fff; border-top-color:transparent; border-radius:50%; display:inline-block; animation: v-rot 0.8s linear infinite; vertical-align: middle; margin-right:8px; }
            @keyframes v-rot { to {transform:rotate(360deg)} }
            .vton-ov { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:999999; display:flex; align-items:center; justify-content:center; padding:15px; backdrop-filter:blur(10px); font-family: sans-serif; }
            .vton-con { background:#fff; width:100%; max-width:800px; border-radius:30px; overflow:hidden; display:flex; box-shadow:0 30px 60px rgba(0,0,0,0.5); position:relative; }
            .vton-img { flex:1.2; background:#f7f7f7; height: 500px; }
            .vton-img img { width:100%; height:100%; object-fit:cover; }
            .vton-info { flex:1; padding:40px; display:flex; flex-direction:column; justify-content:center; }
            .vton-btn { background:#000; color:#fff; border:none; padding:18px; border-radius:15px; font-weight:bold; cursor:pointer; font-size:16px; margin-top:20px; }
            #vton-float { position:fixed; bottom:25px; right:25px; z-index:999998; background:#000; color:#fff; border:none; padding:15px 25px; border-radius:50px; font-weight:bold; cursor:pointer; box-shadow:0 10px 30px rgba(0,0,0,0.3); }
            @media (max-width:768px) { .vton-con { flex-direction:column; max-height:95vh; overflow-y:auto; } .vton-img { height:300px; flex:none; } }
        `;
        document.head.appendChild(s);
    };

    const createButton = () => {
        if (document.getElementById("vton-float")) return;
        const b = document.createElement("button");
        b.id = "vton-float";
        b.innerHTML = "✨ See It On You";
        b.onclick = showGuide;
        document.body.appendChild(b);
    };

    function showGuide() {
        const ov = document.createElement("div");
        ov.className = "vton-ov";
        ov.id = "vton-modal";
        ov.innerHTML = `
            <div class="vton-con">
                <div class="vton-img"><img src="${CONFIG.GUIDE_IMG}"></div>
                <div class="vton-info">
                    <h2 style="font-size:28px; font-weight:800; margin:0 0 15px 0;">Fitting Guide</h2>
                    <ul style="font-size:14px; color:#555; line-height:1.8; padding-left:20px; margin-bottom:10px;">
                        <li>Straight pose, facing camera</li>
                        <li>Hands visible, hair behind shoulders</li>
                        <li>Wear tight-fitting clothes</li>
                    </ul>
                    <button class="vton-btn" id="vton-proc">PERSONALIZE MY LOOK</button>
                    <p style="text-align:center; color:#999; font-size:12px; margin-top:15px; cursor:pointer;" onclick="document.getElementById('vton-modal').remove()">Cancel</p>
                </div>
            </div>
        `;
        document.body.appendChild(ov);
        document.getElementById("vton-proc").onclick = () => {
            ov.remove();
            startAi();
        };
    }

    async function startAi() {
        const input = document.createElement("input");
        input.type = "file"; input.accept = "image/*";
        input.onchange = (e) => {
            const file = e.target.files[0];
            const btn = document.getElementById("vton-float");
            const prodImg = Array.from(document.getElementsByTagName("img")).find(i => i.width > 200 && !i.src.includes("github"));
            
            if (!file || !prodImg) return alert("Error: Select a product first.");

            btn.disabled = true;
            btn.innerHTML = '<span class="v-spin"></span> ANALYZING...';

            const reader = new FileReader();
            reader.onload = async (re) => {
                try {
                    const res = await fetch(CONFIG.PROXY + CONFIG.API_URL, {
                        method: "POST",
                        headers: { 
                            "Authorization": "Bearer " + CONFIG.API_KEY, 
                            "Content-Type": "application/json",
                            "x-requested-with": "XMLHttpRequest" 
                        },
                        body: JSON.stringify({ model_image: re.target.result, garment_image: prodImg.src, category: "tops" })
                    });
                    const data = await res.json();
                    if (data.id) poll(data.id);
                    else alert("CORS Error: Please visit https://cors-anywhere.herokuapp.com/corsdemo and click the button.");
                } catch (err) {
                    btn.disabled = false; btn.innerHTML = "✨ See It On You";
                }
            };
            reader.readAsDataURL(file);
        };
        input.click();
    }

    function poll(id) {
        const btn = document.getElementById("vton-float");
        fetch(CONFIG.PROXY + CONFIG.API_URL + "/" + id, {
            headers: { "Authorization": "Bearer " + CONFIG.API_KEY, "x-requested-with": "XMLHttpRequest" }
        })
        .then(r => r.json())
        .then(d => {
            if (d.status === "completed") {
                btn.disabled = false; btn.innerHTML = "✨ See It On You";
                showFinal(d.output[0]);
            } else if (d.status === "failed") {
                btn.disabled = false; btn.innerHTML = "✨ See It On You";
                alert("AI generation failed.");
            } else {
                btn.innerHTML = '<span class="v-spin"></span> ' + d.status.toUpperCase();
                setTimeout(() => poll(id), 4000);
            }
        });
    }

    function showFinal(url) {
        const ov = document.createElement("div");
        ov.className = "vton-ov";
        ov.innerHTML = `
            <div class="vton-con">
                <div class="vton-img"><img src="${url}"></div>
                <div class="vton-info">
                    <h2 style="font-size:32px; font-weight:800; margin-bottom:10px;">It Looks Great!</h2>
                    <p style="color:#666; font-size:14px; margin-bottom:20px;">Your 4K AI personalized render is ready.</p>
                    <button class="vton-btn" onclick="this.closest('.vton-ov').remove()">BACK TO SHOP</button>
                    <a href="${url}" target="_blank" style="display:block; margin-top:20px; text-decoration:none; color:#000; font-weight:bold; text-align:center;">📥 DOWNLOAD HD</a>
                </div>
            </div>
        `;
        document.body.appendChild(ov);
    }

    injectStyles();
    setInterval(createButton, 2000);
})();
