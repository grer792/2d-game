import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from 'https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js';
import { getDatabase, ref, get, set, remove } from 'https://www.gstatic.com/firebasejs/12.13.0/firebase-database.js';

const app = getApps().length ? getApps()[0] : initializeApp({
  apiKey:'AIzaSyBQjDeFUKpleEsc2Fl3yZdnNje0cyAGaKU',
  authDomain:'d-game-b50ef.firebaseapp.com',
  projectId:'d-game-b50ef',
  appId:'1:80712714092:web:4b15f70196f05942905549',
  databaseURL:'https://d-game-b50ef-default-rtdb.firebaseio.com'
});
const db = getDatabase(app);
const auth = getAuth(app);

// ── Inject CSS (only if not already present) ──
function ensureCSS(){
  if(document.getElementById('_bg_auth_css')) return;
  const s=document.createElement('style');
  s.id='_bg_auth_css';
  s.textContent=`
:root{--header-h:64px;--bg:#13131f;--bg2:#1c1c2e;--bg3:#252538;--bg4:#2e2e45;--accent:#7c5cfc;--accent-h:#6a4de0;--text:#ffffff;--text2:#9898b8;--border:rgba(255,255,255,0.07);--red:#ff4d6d;}
.user-badge{display:flex;align-items:center;gap:8px;padding:6px 10px 6px 6px;border-radius:10px;cursor:pointer;position:relative;transition:background .15s;user-select:none;}
.user-badge:hover{background:var(--bg3);}
.u-avatar{width:32px;height:32px;border-radius:50%;background:var(--accent);color:#fff;display:flex;align-items:center;justify-content:center;font-size:.85rem;font-weight:700;flex-shrink:0;overflow:hidden;}
.u-avatar img{width:100%;height:100%;object-fit:cover;border-radius:50%;}
.u-name{font-size:.85rem;font-weight:600;max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
#fav-overlay,#profile-overlay,#auth-overlay{display:none;position:fixed;top:var(--header-h);left:0;right:0;bottom:0;background:rgba(0,0,0,0.55);z-index:298;backdrop-filter:blur(3px);}
#fav-overlay.open,#profile-overlay.open,#auth-overlay.open{display:block;}
#fav-panel,#profile-panel,#auth-panel{position:fixed;top:var(--header-h);right:0;bottom:0;background:var(--bg2);border-left:1px solid var(--border);z-index:299;transform:translateX(100%);transition:transform 0.28s cubic-bezier(0.4,0,0.2,1);display:flex;flex-direction:column;}
#fav-panel.open,#profile-panel.open,#auth-panel.open{transform:translateX(0);}
#fav-panel{width:340px;max-width:100vw;}
#profile-panel{width:340px;max-width:100vw;overflow-y:auto;}
#auth-panel{width:390px;max-width:100vw;overflow-y:auto;}
.fav-panel-head{display:grid;grid-template-columns:32px 1fr 32px;align-items:center;padding:18px 16px 0;flex-shrink:0;}
.fav-panel-title{font-size:1rem;font-weight:800;text-align:center;font-family:'Inter',sans-serif;}
.fav-panel-close{background:transparent;border:none;color:var(--text2);cursor:pointer;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.1rem;transition:background .15s,color .15s;justify-self:end;}
.fav-panel-close:hover{background:var(--bg3);color:var(--text);}
.fav-tabs{display:flex;border-bottom:1px solid var(--border);margin:14px 0 0;flex-shrink:0;}
.fav-tab{flex:1;background:transparent;border:none;color:var(--text2);font-family:'Inter',sans-serif;font-size:0.85rem;font-weight:600;padding:10px 0 12px;cursor:pointer;position:relative;transition:color .15s;}
.fav-tab:hover{color:var(--text);}
.fav-tab.active{color:var(--text);}
.fav-tab.active::after{content:'';position:absolute;bottom:-1px;left:16%;right:16%;height:2px;background:var(--accent);border-radius:2px;}
.fav-scroll{flex:1;overflow-y:auto;}
.fav-thumb-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px;padding:10px 10px 16px;}
.fav-thumb-item{position:relative;aspect-ratio:4/3;border-radius:8px;overflow:hidden;cursor:pointer;background:var(--bg3);}
.fav-thumb-item img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .2s;}
.fav-thumb-item:hover img{transform:scale(1.05);}
.fav-thumb-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.75) 0%,transparent 55%);opacity:0;transition:opacity .2s;display:flex;flex-direction:column;justify-content:flex-end;padding:8px;}
.fav-thumb-item:hover .fav-thumb-overlay{opacity:1;}
.fav-thumb-name{color:#fff;font-size:0.72rem;font-weight:700;font-family:'Inter',sans-serif;}
.fav-thumb-rm{position:absolute;top:5px;right:5px;width:24px;height:24px;border-radius:50%;background:var(--red);border:none;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .15s;}
.fav-thumb-rm svg{width:12px;height:12px;fill:currentColor;}
.fav-thumb-item:hover .fav-thumb-rm{opacity:1;}
.fav-empty{padding:48px 24px;text-align:center;color:var(--text2);font-size:0.85rem;font-family:'Inter',sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;}
.fav-empty svg{width:38px;height:38px;fill:var(--bg4);}
.prof-close{position:absolute;top:14px;right:14px;background:transparent;border:none;color:var(--text2);cursor:pointer;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.1rem;transition:background .15s,color .15s;}
.prof-close:hover{background:var(--bg3);color:var(--text);}
.prof-inner{padding:32px 24px 24px;flex:1;display:flex;flex-direction:column;align-items:center;}
.prof-avatar{width:84px;height:84px;border-radius:50%;background:var(--accent);color:#fff;display:flex;align-items:center;justify-content:center;font-size:2rem;font-weight:800;overflow:hidden;border:3px solid var(--bg3);margin-bottom:14px;flex-shrink:0;}
.prof-avatar img{width:100%;height:100%;object-fit:cover;border-radius:50%;}
.prof-username-row{display:flex;align-items:center;gap:8px;margin-bottom:4px;}
.prof-uname{font-size:1.1rem;font-weight:800;color:var(--text);font-family:'Inter',sans-serif;}
.prof-edit-btn{background:transparent;border:none;color:var(--text2);cursor:pointer;padding:5px;border-radius:7px;display:flex;align-items:center;transition:background .15s,color .15s;}
.prof-edit-btn:hover{background:var(--bg3);color:var(--text);}
.prof-edit-btn svg{width:15px;height:15px;fill:currentColor;}
.prof-email-lbl{color:var(--text2);font-size:0.82rem;margin-bottom:20px;font-family:'Inter',sans-serif;}
.prof-edit-wrap{width:100%;margin-bottom:16px;}
.prof-input{width:100%;background:var(--bg3);border:1.5px solid var(--border);color:var(--text);padding:11px 14px;border-radius:10px;font-family:'Inter',sans-serif;font-size:0.9rem;outline:none;transition:border-color .2s;box-sizing:border-box;}
.prof-input:focus{border-color:var(--accent);}
.prof-edit-actions{display:flex;gap:8px;margin-top:8px;}
.prof-save{flex:1;padding:10px;border-radius:10px;border:none;background:var(--accent);color:#fff;font-family:'Inter',sans-serif;font-size:0.85rem;font-weight:700;cursor:pointer;transition:background .2s;}
.prof-save:hover{background:var(--accent-h);}
.prof-cancel{padding:10px 14px;border-radius:10px;border:1px solid var(--border);background:transparent;color:var(--text2);font-family:'Inter',sans-serif;font-size:0.85rem;cursor:pointer;}
.prof-uname-err{color:#ff4d6d;font-size:0.78rem;margin-top:6px;min-height:16px;width:100%;font-family:'Inter',sans-serif;}
.prof-divider{width:100%;height:1px;background:var(--border);margin:16px 0;}
.prof-signout{width:100%;background:transparent;border:none;color:var(--text2);padding:12px 14px;border-radius:10px;text-align:left;font-family:'Inter',sans-serif;font-size:0.9rem;cursor:pointer;display:flex;align-items:center;gap:10px;transition:background .15s,color .15s;}
.prof-signout:hover{background:var(--bg3);color:var(--text);}
.prof-signout svg{width:18px;height:18px;fill:currentColor;flex-shrink:0;}
.prof-footer{padding:20px 24px 24px;border-top:1px solid var(--border);}
.prof-av-sec-title{font-size:0.75rem;font-weight:600;color:var(--text2);text-transform:uppercase;letter-spacing:.05em;margin-bottom:10px;width:100%;font-family:'Inter',sans-serif;}
.avatar-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;width:100%;margin-bottom:8px;}
.avatar-opt{aspect-ratio:1;border-radius:12px;overflow:hidden;cursor:pointer;border:2.5px solid transparent;transition:border-color .15s,transform .12s;background:var(--bg3);}
.avatar-opt:hover{transform:scale(1.06);}
.avatar-opt.selected{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent);}
.avatar-opt img{width:100%;height:100%;object-fit:cover;display:block;}
.auth-close{position:absolute;top:14px;right:14px;background:transparent;border:none;color:var(--text2);font-size:1.1rem;cursor:pointer;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;transition:background .15s,color .15s;}
.auth-close:hover{background:var(--bg3);color:var(--text);}
.auth-footer{margin-top:auto;padding:20px 28px 24px;border-top:1px solid var(--border);}
.auth-footer-lang{display:inline-flex;align-items:center;gap:8px;background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:8px 16px;border-radius:20px;font-size:.85rem;font-weight:600;cursor:pointer;margin-bottom:16px;font-family:'Inter',sans-serif;}
.auth-footer-links{display:flex;flex-wrap:wrap;gap:8px 16px;margin-bottom:16px;}
.auth-footer-links a{color:var(--text2);font-size:.78rem;text-decoration:none;font-family:'Inter',sans-serif;}
.auth-inner{padding:20px 28px 24px;flex:1;}
.auth-title{font-size:1.35rem;font-weight:800;color:var(--text);margin-bottom:22px;font-family:'Inter',sans-serif;}
.auth-btn{width:100%;display:flex;align-items:center;gap:12px;padding:12px 16px;border-radius:12px;font-family:'Inter',sans-serif;font-size:0.9rem;font-weight:600;cursor:pointer;border:none;margin-bottom:10px;transition:opacity .15s;}
.auth-btn:hover{opacity:.9;}
.auth-btn-google{background:#fff;color:#1a1a1a;}
.auth-btn .btn-icon{width:22px;height:22px;flex-shrink:0;display:flex;align-items:center;justify-content:center;}
.auth-btn .btn-text{flex:1;text-align:left;}
.auth-or{display:flex;align-items:center;gap:12px;margin:16px 0;}
.auth-or hr{flex:1;border:none;border-top:1px solid var(--border);}
.auth-or span{color:var(--text2);font-size:0.78rem;font-weight:600;letter-spacing:.5px;font-family:'Inter',sans-serif;}
.auth-input{width:100%;background:var(--bg3);border:1.5px solid var(--border);color:var(--text);padding:12px 16px;border-radius:12px;font-family:'Inter',sans-serif;font-size:0.9rem;outline:none;transition:border-color .2s;margin-bottom:10px;display:block;box-sizing:border-box;}
.auth-input:focus{border-color:var(--accent);}
.auth-input::placeholder{color:var(--text2);}
.auth-continue{width:100%;padding:13px;border-radius:12px;border:none;font-family:'Inter',sans-serif;font-size:0.9rem;font-weight:700;cursor:pointer;background:var(--accent);color:#fff;margin-top:2px;}
.auth-continue:disabled{opacity:.35;cursor:not-allowed;}
.auth-back{background:transparent;border:none;color:var(--text2);font-family:'Inter',sans-serif;font-size:0.85rem;cursor:pointer;margin-bottom:14px;padding:0;display:flex;align-items:center;gap:6px;}
.auth-back:hover{color:var(--text);}
.auth-tabs{display:flex;gap:4px;background:var(--bg3);border-radius:10px;padding:4px;margin-bottom:14px;}
.auth-tab{flex:1;padding:9px;border:none;border-radius:7px;background:transparent;color:var(--text2);font-family:'Inter',sans-serif;font-size:0.85rem;font-weight:600;cursor:pointer;transition:all .15s;}
.auth-tab.active{background:var(--bg2);color:var(--text);}
.auth-email-shown{font-size:0.82rem;color:var(--text2);margin-bottom:14px;word-break:break-all;font-family:'Inter',sans-serif;}
.auth-err{color:#ff4d6d;font-size:0.8rem;margin-top:10px;min-height:18px;font-family:'Inter',sans-serif;}
.bar-btn.liked{color:#ff4d6d!important;background:rgba(255,77,109,0.1)!important;}
.bar-btn.faved{color:#ff4d6d!important;background:rgba(255,77,109,0.1)!important;}
`;
  document.head.appendChild(s);
}

// ── Inject panel HTML (only if not already present) ──
function ensurePanels(){
  if(document.getElementById('auth-panel')) return;
  const d=document.createElement('div');
  d.innerHTML=`
<div id="fav-overlay" onclick="window._closeFavPanel&&window._closeFavPanel()"></div>
<div id="fav-panel">
  <div class="fav-panel-head">
    <span></span>
    <span class="fav-panel-title">My games</span>
    <button class="fav-panel-close" onclick="window._closeFavPanel&&window._closeFavPanel()">✕</button>
  </div>
  <div class="fav-tabs">
    <button class="fav-tab active" id="fav-tab-recent" onclick="window._setFavTab&&window._setFavTab('recent')">Recent</button>
    <button class="fav-tab" id="fav-tab-favorites" onclick="window._setFavTab&&window._setFavTab('favorites')">Favorites</button>
    <button class="fav-tab" id="fav-tab-liked" onclick="window._setFavTab&&window._setFavTab('liked')">Liked</button>
  </div>
  <div class="fav-scroll">
    <div class="fav-thumb-grid" id="fav-thumb-grid"></div>
    <div class="fav-empty" id="fav-empty" style="display:none"></div>
  </div>
</div>
<div id="profile-overlay" onclick="window._closeProfilePanel&&window._closeProfilePanel()"></div>
<div id="profile-panel">
  <button class="prof-close" onclick="window._closeProfilePanel&&window._closeProfilePanel()">✕</button>
  <div class="prof-inner">
    <div class="prof-avatar" id="prof-avatar"></div>
    <div class="prof-username-row">
      <span class="prof-uname" id="prof-uname">@Loading...</span>
      <button class="prof-edit-btn" id="prof-edit-btn" onclick="window._editUsername&&window._editUsername()" title="Edit username">
        <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
      </button>
    </div>
    <div class="prof-edit-wrap" id="prof-edit-wrap" style="display:none">
      <input type="text" class="prof-input" id="prof-uname-input" maxlength="20" placeholder="Enter username">
      <div class="prof-edit-actions">
        <button class="prof-save" onclick="window._saveUsername&&window._saveUsername()">Save</button>
        <button class="prof-cancel" onclick="window._cancelUsernameEdit&&window._cancelUsernameEdit()">Cancel</button>
      </div>
      <div class="prof-uname-err" id="prof-uname-err"></div>
    </div>
    <div class="prof-email-lbl" id="prof-email-lbl"></div>
    <div class="prof-av-sec-title">Profile photo</div>
    <div class="avatar-grid" id="avatar-grid">
      <div class="avatar-opt" id="av-opt-1" onclick="window._selectAvatar&&window._selectAvatar(1)"><img src="/assets/avatars/avatar1.png" alt="Raccoon"></div>
      <div class="avatar-opt" id="av-opt-2" onclick="window._selectAvatar&&window._selectAvatar(2)"><img src="/assets/avatars/avatar2.png" alt="Fox"></div>
      <div class="avatar-opt" id="av-opt-3" onclick="window._selectAvatar&&window._selectAvatar(3)"><img src="/assets/avatars/avatar3.png" alt="Frog"></div>
      <div class="avatar-opt" id="av-opt-4" onclick="window._selectAvatar&&window._selectAvatar(4)"><img src="/assets/avatars/avatar4.png" alt="Gorilla"></div>
      <div class="avatar-opt" id="av-opt-5" onclick="window._selectAvatar&&window._selectAvatar(5)"><img src="/assets/avatars/avatar5.png" alt="Shark"></div>
      <div class="avatar-opt" id="av-opt-6" onclick="window._selectAvatar&&window._selectAvatar(6)"><img src="/assets/avatars/avatar6.png" alt="Owl"></div>
      <div class="avatar-opt" id="av-opt-7" onclick="window._selectAvatar&&window._selectAvatar(7)"><img src="/assets/avatars/avatar7.png" alt="Axolotl"></div>
      <div class="avatar-opt" id="av-opt-8" onclick="window._selectAvatar&&window._selectAvatar(8)"><img src="/assets/avatars/avatar8.png" alt="Meteor"></div>
    </div>
    <div class="prof-divider"></div>
    <button class="prof-signout" onclick="window._doSignOut&&window._doSignOut()">
      <svg viewBox="0 0 24 24"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>
      Sign out
    </button>
  </div>
  <div class="prof-footer">
    <div class="auth-footer-links">
      <a href="#">About</a><a href="/terms-and-conditions">Terms</a><a href="/terms-and-conditions">Privacy</a>
    </div>
  </div>
</div>
<div id="auth-overlay" onclick="window._closeAuthPanel&&window._closeAuthPanel()"></div>
<div id="auth-panel">
  <button class="auth-close" onclick="window._closeAuthPanel&&window._closeAuthPanel()">✕</button>
  <div class="auth-inner">
    <div class="auth-title">Log in or sign up</div>
    <div id="auth-step-1">
      <button class="auth-btn auth-btn-google" onclick="window._authGoogle&&window._authGoogle()">
        <span class="btn-icon"><svg viewBox="0 0 24 24" width="20" height="20"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg></span>
        <span class="btn-text">Sign in with Google</span>
      </button>
      <div class="auth-or"><hr><span>OR</span><hr></div>
      <input type="email" class="auth-input" id="auth-email-input" placeholder="Enter your email" oninput="window._authEmailInput&&window._authEmailInput()">
      <button class="auth-continue" id="auth-email-continue" onclick="window._authEmailNext&&window._authEmailNext()" disabled>Continue</button>
    </div>
    <div id="auth-step-2" style="display:none">
      <button class="auth-back" onclick="window._authBack&&window._authBack()">← Back</button>
      <div class="auth-email-shown" id="auth-step2-email"></div>
      <div class="auth-tabs">
        <button class="auth-tab active" id="tab-signin" onclick="window._authSetTab&&window._authSetTab('signin')">Sign in</button>
        <button class="auth-tab" id="tab-create" onclick="window._authSetTab&&window._authSetTab('create')">Create account</button>
      </div>
      <div id="auth-name-row" style="display:none">
        <input type="text" class="auth-input" id="auth-name-input" placeholder="Display name (optional)">
      </div>
      <input type="password" class="auth-input" id="auth-pw-input" placeholder="Password" oninput="window._authPwInput&&window._authPwInput()">
      <button class="auth-continue" id="auth-pw-btn" onclick="window._authSubmit&&window._authSubmit()" disabled>Sign in</button>
    </div>
    <div class="auth-err" id="auth-err"></div>
  </div>
  <div class="auth-footer">
    <div class="auth-footer-links">
      <a href="#">About</a><a href="/terms-and-conditions">Terms &amp; conditions</a>
      <a href="/terms-and-conditions">Privacy</a><a href="#">Contact</a>
    </div>
  </div>
</div>`;
  document.body.appendChild(d);
}

ensureCSS();
ensurePanels();

// ── Panel open/close ──
function openAuthPanel(){
  document.getElementById('auth-overlay').classList.add('open');
  document.getElementById('auth-panel').classList.add('open');
  document.body.style.overflow='hidden';
}
function closeAuthPanel(){
  document.getElementById('auth-overlay').classList.remove('open');
  document.getElementById('auth-panel').classList.remove('open');
  document.body.style.overflow='';
}
function openProfilePanel(){
  document.getElementById('profile-overlay').classList.add('open');
  document.getElementById('profile-panel').classList.add('open');
  document.body.style.overflow='hidden';
}
function closeProfilePanel(){
  document.getElementById('profile-overlay').classList.remove('open');
  document.getElementById('profile-panel').classList.remove('open');
  document.body.style.overflow='';
  cancelUsernameEdit();
}
function openFavPanel(){
  document.getElementById('fav-overlay').classList.add('open');
  document.getElementById('fav-panel').classList.add('open');
  document.body.style.overflow='hidden';
  renderFavPanel();
}
function closeFavPanel(){
  document.getElementById('fav-overlay').classList.remove('open');
  document.getElementById('fav-panel').classList.remove('open');
  document.body.style.overflow='';
}
window._openAuthPanel=openAuthPanel;
window._closeAuthPanel=closeAuthPanel;
window._openProfilePanel=openProfilePanel;
window._closeProfilePanel=closeProfilePanel;
window._openFavPanel=openFavPanel;
window._closeFavPanel=closeFavPanel;

// ── Auth ──
let _authTab='signin';
window._authGoogle=async()=>{
  document.getElementById('auth-err').textContent='';
  try{ await signInWithPopup(auth,new GoogleAuthProvider()); }
  catch(e){ if(e.code!=='auth/popup-closed-by-user'&&e.code!=='auth/cancelled-popup-request') document.getElementById('auth-err').textContent=e.message; }
};
window._authEmailInput=()=>{
  const v=document.getElementById('auth-email-input').value.trim();
  document.getElementById('auth-email-continue').disabled=!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
};
window._authEmailNext=()=>{
  document.getElementById('auth-step2-email').textContent=document.getElementById('auth-email-input').value.trim();
  document.getElementById('auth-step-1').style.display='none';
  document.getElementById('auth-step-2').style.display='';
  document.getElementById('auth-pw-input').value='';
  document.getElementById('auth-pw-btn').disabled=true;
  document.getElementById('auth-err').textContent='';
  setAuthTab('signin');
};
window._authBack=()=>{
  document.getElementById('auth-step-1').style.display='';
  document.getElementById('auth-step-2').style.display='none';
  document.getElementById('auth-err').textContent='';
};
function setAuthTab(t){
  _authTab=t;
  document.getElementById('tab-signin').classList.toggle('active',t==='signin');
  document.getElementById('tab-create').classList.toggle('active',t==='create');
  document.getElementById('auth-name-row').style.display=t==='create'?'':'none';
  document.getElementById('auth-pw-btn').textContent=t==='signin'?'Sign in':'Create account';
  document.getElementById('auth-err').textContent='';
}
window._authSetTab=setAuthTab;
window._authPwInput=()=>{ document.getElementById('auth-pw-btn').disabled=document.getElementById('auth-pw-input').value.length<6; };
const ERR={'auth/wrong-password':'Incorrect password.','auth/invalid-credential':'Incorrect email or password.','auth/user-not-found':'No account found.','auth/email-already-in-use':'Email already in use.','auth/weak-password':'Password must be at least 6 characters.','auth/invalid-email':'Invalid email address.','auth/too-many-requests':'Too many attempts. Try again later.'};
window._authSubmit=async()=>{
  const email=document.getElementById('auth-step2-email').textContent;
  const pw=document.getElementById('auth-pw-input').value;
  const errEl=document.getElementById('auth-err');
  errEl.textContent='';
  try{
    if(_authTab==='signin') await signInWithEmailAndPassword(auth,email,pw);
    else{ const cred=await createUserWithEmailAndPassword(auth,email,pw); const name=document.getElementById('auth-name-input').value.trim(); if(name) await updateProfile(cred.user,{displayName:name}); }
  }catch(e){ errEl.textContent=ERR[e.code]||'An error occurred.'; }
};
window._doSignOut=async()=>{ await signOut(auth); closeProfilePanel(); };

// ── Profile ──
const ADJS=['Shadow','Neon','Ghost','Cyber','Storm','Dark','Blaze','Frost','Steel','Thunder','Savage','Swift','Toxic','Hyper','Alpha','Stealth','Rogue','Venom'];
const NOUNS=['Wolf','Bonker','Hunter','Raider','Knight','Blade','Fox','Hawk','Viper','Tiger','Ranger','Ninja','Sniper','Reaper','Phantom'];
function genUsername(){ const a=ADJS[Math.floor(Math.random()*ADJS.length)]; const n=NOUNS[Math.floor(Math.random()*NOUNS.length)]; const s=Math.random().toString(36).slice(2,6).toUpperCase(); return `${a}${n}.${s}`; }
let _currentUsername='';
let _currentAvatar=0;

async function loadOrInitUsername(uid){
  const cacheKey=`bg_profile_${uid}`;
  const cached=JSON.parse(localStorage.getItem(cacheKey)||'null');
  if(cached){ _currentUsername=cached.username||''; _currentAvatar=cached.avatar||0; updateProfileUI(auth.currentUser); }
  try{
    const [snapU,snapA]=await Promise.all([get(ref(db,`profiles/${uid}/username`)),get(ref(db,`profiles/${uid}/avatar`))]);
    if(snapU.exists()) _currentUsername=snapU.val();
    else{ let name,tries=0; do{ name=genUsername(); tries++; }while(tries<10&&(await get(ref(db,`usernames/${name}`))).exists()); await set(ref(db,`profiles/${uid}/username`),name); await set(ref(db,`usernames/${name}`),uid); _currentUsername=name; }
    if(snapA.exists()) _currentAvatar=snapA.val();
    else{ _currentAvatar=Math.floor(Math.random()*8)+1; await set(ref(db,`profiles/${uid}/avatar`),_currentAvatar); }
    localStorage.setItem(cacheKey,JSON.stringify({username:_currentUsername,avatar:_currentAvatar}));
    updateProfileUI(auth.currentUser);
  }catch(e){ if(!_currentUsername){ _currentUsername=cached?.username||genUsername(); _currentAvatar=cached?.avatar||_currentAvatar||0; } updateProfileUI(auth.currentUser); }
}

function updateProfileUI(user){
  if(!user)return;
  const imgSrc=_currentAvatar?`/assets/avatars/avatar${_currentAvatar}.png`:null;
  const initials=(_currentUsername[0]||'?').toUpperCase();
  const imgTag=imgSrc?`<img src="${imgSrc}" alt="">`:initials;
  const pa=document.getElementById('prof-avatar'); if(pa) pa.innerHTML=imgTag;
  for(let i=1;i<=8;i++){ const el=document.getElementById(`av-opt-${i}`); if(el) el.classList.toggle('selected',i===_currentAvatar); }
  const pu=document.getElementById('prof-uname'); if(pu) pu.textContent='@'+_currentUsername;
  const pe=document.getElementById('prof-email-lbl'); if(pe) pe.textContent=user.email||'';
  const ua=document.getElementById('u-avatar'); if(ua) ua.innerHTML=imgTag;
  const un=document.getElementById('u-name'); if(un) un.textContent='@'+_currentUsername;
  updateBarBtns();
}

window._selectAvatar=async(idx)=>{
  const uid=auth.currentUser?.uid; if(!uid)return;
  _currentAvatar=idx; updateProfileUI(auth.currentUser);
  try{ await set(ref(db,`profiles/${uid}/avatar`),idx); localStorage.setItem(`bg_profile_${uid}`,JSON.stringify({username:_currentUsername,avatar:_currentAvatar})); }catch(e){}
};
window._editUsername=()=>{
  document.getElementById('prof-edit-wrap').style.display='';
  document.getElementById('prof-edit-btn').style.display='none';
  const input=document.getElementById('prof-uname-input'); input.value=_currentUsername; input.focus();
  document.getElementById('prof-uname-err').textContent='';
};
function cancelUsernameEdit(){ document.getElementById('prof-edit-wrap').style.display='none'; document.getElementById('prof-edit-btn').style.display=''; }
window._cancelUsernameEdit=cancelUsernameEdit;
window._saveUsername=async()=>{
  const newName=document.getElementById('prof-uname-input').value.trim();
  const errEl=document.getElementById('prof-uname-err'); errEl.textContent='';
  if(!newName||newName.length<3){errEl.textContent='At least 3 characters.';return;}
  if(!/^[a-zA-Z0-9_.]+$/.test(newName)){errEl.textContent='Letters, numbers, _ and . only.';return;}
  if(newName===_currentUsername){cancelUsernameEdit();return;}
  const uid=auth.currentUser?.uid; if(!uid)return;
  try{
    const snap=await get(ref(db,`usernames/${newName}`));
    if(snap.exists()){errEl.textContent='Username already taken.';return;}
    await remove(ref(db,`usernames/${_currentUsername}`));
    await set(ref(db,`usernames/${newName}`),uid);
    await set(ref(db,`profiles/${uid}/username`),newName);
    _currentUsername=newName;
    localStorage.setItem(`bg_profile_${uid}`,JSON.stringify({username:_currentUsername,avatar:_currentAvatar}));
    updateProfileUI(auth.currentUser); cancelUsernameEdit();
  }catch(e){ errEl.textContent='Error saving. Try again.'; }
};

// ── Favorites ──
const GAMES_MAP={
  'bonker-survival':{id:'bonker-survival',name:'Bonker Survival',url:'/game/bonker-survival',thumb:'/games/bonker-survival/thumb.png'},
  'bonker-chess':{id:'bonker-chess',name:'Bonker Chess',url:'/game/bonker-chess',thumb:'/games/bonker-chess/thumb.svg'},
};
let _favs=new Set();
let _liked=new Set();
let _favTab='recent';

window._setFavTab=function(tab){
  _favTab=tab;
  ['recent','favorites','liked'].forEach(t=>{ const el=document.getElementById(`fav-tab-${t}`); if(el) el.classList.toggle('active',t===tab); });
  renderFavPanel();
};
window._trackRecent=function(id){
  try{ const r=JSON.parse(localStorage.getItem('bg_recent')||'[]').filter(x=>x!==id); r.unshift(id); localStorage.setItem('bg_recent',JSON.stringify(r.slice(0,10))); }catch(e){}
};
const X_ICO='<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';
function renderFavPanel(){
  const user=auth.currentUser;
  const gridEl=document.getElementById('fav-thumb-grid');
  const emptyEl=document.getElementById('fav-empty');
  if(!gridEl)return;
  let ids=[],removeFn=null,emptyMsg='Nothing here yet.';
  if(_favTab==='recent'){ try{ids=JSON.parse(localStorage.getItem('bg_recent')||'[]');}catch(e){} emptyMsg='No games played yet.'; }
  else if(_favTab==='favorites'){ ids=user?[..._favs]:[]; removeFn=user?id=>`window._toggleFav('${id}')`:null; emptyMsg=user?'Heart a game to save it here.':'Sign in to save favorites.'; }
  else if(_favTab==='liked'){ ids=user?[..._liked]:[]; removeFn=user?id=>`window._toggleLiked('${id}')`:null; emptyMsg=user?'No liked games yet.':'Sign in to like games.'; }
  const games=ids.map(id=>GAMES_MAP[id]).filter(Boolean);
  if(!games.length){
    gridEl.innerHTML='';
    emptyEl.style.display='';
    emptyEl.innerHTML=`<svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg><span>${emptyMsg}</span>`;
    return;
  }
  emptyEl.style.display='none';
  gridEl.innerHTML=games.map(g=>`<div class="fav-thumb-item" onclick="window._trackRecent&&window._trackRecent('${g.id}');window.location.href='${g.url}'"><img src="${g.thumb}" alt="${g.name}"><div class="fav-thumb-overlay"><span class="fav-thumb-name">${g.name}</span></div>${removeFn?`<button class="fav-thumb-rm" onclick="event.stopPropagation();${removeFn(g.id)}" title="Remove">${X_ICO}</button>`:''}</div>`).join('');
}
async function loadFavs(uid){
  try{
    const [snapF,snapL]=await Promise.all([get(ref(db,`favorites/${uid}`)),get(ref(db,`liked/${uid}`))]);
    _favs=new Set(snapF.exists()?Object.keys(snapF.val()):[]);
    _liked=new Set(snapL.exists()?Object.keys(snapL.val()):[]);
  }catch(e){ _favs=new Set(); _liked=new Set(); }
  updateFavBtns(); updateBarBtns();
}
function updateFavBtns(){
  document.querySelectorAll('[data-fav-game]').forEach(btn=>btn.classList.toggle('liked',_favs.has(btn.dataset.favGame)));
}
function updateBarBtns(){
  const gameId=window.CURRENT_GAME_ID;
  if(!gameId)return;
  const fb=document.getElementById('favBtn'); if(fb) fb.classList.toggle('faved',_favs.has(gameId));
  const lb=document.getElementById('likeBtn'); if(lb) lb.classList.toggle('liked',_liked.has(gameId));
}
window._toggleFav=async(id)=>{
  const uid=auth.currentUser?.uid; if(!uid){openAuthPanel();return;}
  if(_favs.has(id)){_favs.delete(id);try{await remove(ref(db,`favorites/${uid}/${id}`));}catch(e){}}
  else{_favs.add(id);try{await set(ref(db,`favorites/${uid}/${id}`),true);}catch(e){}}
  updateFavBtns(); updateBarBtns();
  const fp=document.getElementById('fav-panel'); if(fp&&fp.classList.contains('open')) renderFavPanel();
};
window._toggleLiked=async(id)=>{
  const uid=auth.currentUser?.uid; if(!uid){openAuthPanel();return;}
  if(_liked.has(id)){_liked.delete(id);try{await remove(ref(db,`liked/${uid}/${id}`));}catch(e){}}
  else{_liked.add(id);try{await set(ref(db,`liked/${uid}/${id}`),true);}catch(e){}}
  updateBarBtns();
  const fp=document.getElementById('fav-panel'); if(fp&&fp.classList.contains('open')) renderFavPanel();
};

// ── Auth state ──
onAuthStateChanged(auth, user=>{
  const loginBtn=document.getElementById('btn-header-login');
  const badge=document.getElementById('user-badge');
  if(user){
    if(loginBtn) loginBtn.style.display='none';
    if(badge) badge.style.display='flex';
    closeAuthPanel();
    loadOrInitUsername(user.uid);
    loadFavs(user.uid);
  } else {
    if(loginBtn) loginBtn.style.display='';
    if(badge) badge.style.display='none';
    _currentUsername=''; _favs=new Set(); _liked=new Set();
    updateFavBtns(); updateBarBtns();
  }
});
