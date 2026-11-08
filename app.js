// DIVA-5 ankieta — logika
const SUPABASE_URL = "https://wadiharahtmfvqjtjsjp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhZGloYXJhaHRtZnZxanRqc2pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQxNDM5MDUsImV4cCI6MjEwOTcxOTkwNX0.MANZcv1tU9QMawz0T9d5984mAyhegvSw9DBserCaoac";
const TABLE = "diva_odpowiedzi";

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const $ = (id) => document.getElementById(id);

const bezId = (t) => t.replace(/^(A\d+|H\/I\s*\d+)\s*-\s*/, "");

const widocznyId = (id) => (id.startsWith("HI") ? "H/I " + id.slice(2) : id);

function budujKryterium(container, item) {
  const div = document.createElement("div");
  div.className = "kryterium";
  div.innerHTML = `
    <div class="kryterium-naglowek">
      <strong>${widocznyId(item.id)}</strong>
      <span>${bezId(item.tytul)}</span>
    </div>
    <p class="pytanie">${item.pytanie}</p>
    <details class="przyklady">
      <summary>Przykłady trudności u osób dorosłych</summary>
      <ul>${item.przykladyDoroslosc.map((p) => `<li>${p}</li>`).join("")}</ul>
    </details>
    <details class="przyklady">
      <summary>Przykłady z dzieciństwa</summary>
      <ul>${item.przykladyDziecinstwo.map((p) => `<li>${p}</li>`).join("")}</ul>
    </details>
    <div class="odp">
      <div class="odp-grupa">
        <span class="odp-etykieta">Wiek dorosły — objawy obecne?</span>
        <label class="radio"><input type="radio" name="${item.id}_d" value="tak"/> Tak</label>
        <label class="radio"><input type="radio" name="${item.id}_d" value="nie"/> Nie</label>
      </div>
      <div class="odp-grupa">
        <span class="odp-etykieta">Dzieciństwo — objawy obecne?</span>
        <label class="radio"><input type="radio" name="${item.id}_c" value="tak"/> Tak</label>
        <label class="radio"><input type="radio" name="${item.id}_c" value="nie"/> Nie</label>
      </div>
    </div>`;
  container.appendChild(div);
}

function budujCzesc3() {
  const c3 = $("czesc3");
  c3.innerHTML = `
    <div class="kryterium">
      <div class="kryterium-naglowek"><strong>Kryterium B</strong></div>
      <p class="pytanie">Czy doświadczał/a Pani/Pan wyżej wymienionych objawów zaburzeń koncentracji uwagi oraz nadpobudliwości psychoruchowej i nadmiernej impulsywności przez całe życie?</p>
      <div class="odp">
        <div class="odp-grupa">
          <span class="odp-etykieta">Odpowiedź</span>
          <label class="radio"><input type="radio" name="krytB" value="tak"/> Tak (a kilka z nich występowało jeszcze przed ukończeniem 12 lat)</label>
          <label class="radio"><input type="radio" name="krytB" value="nie"/> Nie</label>
        </div>
      </div>
      <div class="odp-grupa wiek-start" hidden>
        <span class="odp-etykieta">Jeżeli nie — objawy pojawiły się w wieku:</span>
        <input id="krytB-wiek" type="number" min="0" max="99" placeholder="lat"/>
      </div>
    </div>
    <div class="kryterium">
      <div class="kryterium-naglowek"><strong>Kryterium C</strong></div>
      <p class="pytanie">W jakich obszarach życiowych ujawniają się problemy związane z objawami ADHD? (zaznacz wszystkie pasujące)</p>
      <div id="obszary"></div>
    </div>
    <div class="kryterium">
      <div class="kryterium-naglowek"><strong>Kryteria C i D — podsumowanie</strong></div>
      <div class="odp">
        <div class="odp-grupa">
          <span class="odp-etykieta">Wiek dorosły: Czy doświadczane objawy są źródłem istotnych problemów w co najmniej 2 obszarach życiowych?</span>
          <label class="radio"><input type="radio" name="krytCD_d" value="tak"/> Tak</label>
          <label class="radio"><input type="radio" name="krytCD_d" value="nie"/> Nie</label>
        </div>
        <div class="odp-grupa">
          <span class="odp-etykieta">Dzieciństwo: Czy doświadczane objawy były źródłem istotnych problemów w co najmniej 2 obszarach życiowych?</span>
          <label class="radio"><input type="radio" name="krytCD_c" value="tak"/> Tak</label>
          <label class="radio"><input type="radio" name="krytCD_c" value="nie"/> Nie</label>
        </div>
      </div>
      <div class="odp-grupa">
        <span class="odp-etykieta">Ewentualne uwagi szczegółowe</span>
        <textarea id="uwagi" rows="3" placeholder="Uwagi..."></textarea>
      </div>
    </div>`;

  const obszary = $("obszary");
  for (const obszar of OBSZARY_CZESC3) {
    const blok = document.createElement("div");
    blok.className = "obszar";
    blok.innerHTML = `<div class="obszar-tytul">${obszar.tytul}</div>
      ${obszar.pozycje
        .map(
          (p, i) => `<label class="check"><input type="checkbox" name="ob_${obszar.id}" value="${i}"/> ${p}</label>`
        )
        .join("")}`;
    obszary.appendChild(blok);
  }

  document.querySelectorAll('input[name="krytB"]').forEach((r) =>
    r.addEventListener("change", () => {
      $("krytB-wiek").parentElement.hidden = r.value !== "nie";
    })
  );
}

function zbierzOdpowiedzi() {
  const wynik = { kryteria: {}, obszary: {}, krytB: null, krytB_wiek: null, krytCD: {}, uwagi: "" };
  const wszystkie = [...PYTANIA_CZESC1, ...PYTANIA_CZESC2];
  for (const item of wszystkie) {
    wynik.kryteria[item.id] = {
      doroslosc: document.querySelector(`input[name="${item.id}_d"]:checked`)?.value || null,
      dziecinstwo: document.querySelector(`input[name="${item.id}_c"]:checked`)?.value || null,
    };
  }
  for (const obszar of OBSZARY_CZESC3) {
    wynik.obszary[obszar.id] = [...document.querySelectorAll(`input[name="ob_${obszar.id}"]:checked`)].map(
      (i) => Number(i.value)
    );
  }
  wynik.krytB = document.querySelector('input[name="krytB"]:checked')?.value || null;
  wynik.krytB_wiek = $("krytB-wiek").value || null;
  wynik.krytCD = {
    doroslosc: document.querySelector('input[name="krytCD_d"]:checked')?.value || null,
    dziecinstwo: document.querySelector('input[name="krytCD_c"]:checked')?.value || null,
  };
  wynik.uwagi = $("uwagi").value.trim();
  return wynik;
}

function pokazKomunikat(id, tekst, ok) {
  const el = $(id);
  el.hidden = false;
  el.textContent = tekst;
  el.className = "msg " + (ok ? "ok" : "err");
}

async function wyslijAnkiete() {
  const imie = $("imie").value.trim();
  const nazwisko = $("nazwisko").value.trim();
  if (!imie || !nazwisko) {
    pokazKomunikat("msg-wysylka", "Imię i nazwisko są obowiązkowe.", false);
    return;
  }
  const payload = {
    imie,
    nazwisko,
    data_urodzenia: $("data_urodzenia").value || null,
    plec: $("plec").value || null,
    kod: $("kod").value.trim() || null,
    odpowiedzi: zbierzOdpowiedzi(),
  };
  const btn = $("btn-wyslij");
  btn.disabled = true;
  const { error } = await sb.from(TABLE).insert(payload);
  btn.disabled = false;
  if (error) {
    pokazKomunikat("msg-wysylka", "Błąd wysyłki: " + error.message, false);
    return;
  }
  pokazKomunikat("msg-wysylka", "Dziękujemy! Ankieta została wysłana.", true);
}

// ---------- ADMIN ----------
function podsumuj(o) {
  const kryteria = o?.kryteria || {};
  const suma = (lista, okres) => lista.filter((item) => kryteria[item.id]?.[okres] === "tak").length;
  const a_d = suma(PYTANIA_CZESC1, "doroslosc");
  const a_c = suma(PYTANIA_CZESC1, "dziecinstwo");
  const hi_d = suma(PYTANIA_CZESC2, "doroslosc");
  const hi_c = suma(PYTANIA_CZESC2, "dziecinstwo");
  const krytA = a_d >= 5 && hi_d >= 5 && (a_c + hi_c) >= 3;
  const krytB = o?.krytB === "tak";
  const krytCD_d = o?.krytCD?.doroslosc === "tak";
  const krytCD_c = o?.krytCD?.dziecinstwo === "tak";
  return { a_d, a_c, hi_d, hi_c, krytA, krytB, krytCD_d, krytCD_c };
}

async function zaloguj() {
  const email = $("login-email").value.trim();
  const password = $("login-password").value;
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) {
    pokazKomunikat("login-msg", "Błędne dane logowania.", false);
    return;
  }
  $("modal-login").hidden = true;
  $("login-password").value = "";
  pokazWyniki();
}

async function pokazWyniki() {
  const { data, error } = await sb.from(TABLE).select("*").order("created_at", { ascending: false });
  if (error) {
    pokazKomunikat("admin-info", "Błąd odczytu: " + error.message, false);
    return;
  }
  window._wyniki = data;
  const tbody = $("tabela-wynikow").querySelector("tbody");
  tbody.innerHTML = "";
  for (const row of data) {
    const tr = document.createElement("tr");
    const dataStr = row.created_at ? new Date(row.created_at).toLocaleString("pl-PL") : "—";
    const p = podsumuj(row.odpowiedzi);
    const tN = (v) => (v ? "Tak" : "Nie");
    tr.innerHTML = `<td>${dataStr}</td><td>${row.imie}</td><td>${row.nazwisko}</td><td>${row.plec || "—"}</td><td>${row.kod || "—"}</td>
      <td>${p.a_d}/9</td><td>${p.a_c}/9</td><td>${p.hi_d}/9</td><td>${p.hi_c}/9</td>
      <td class="kryt-cell">A: ${tN(p.krytA)} · B: ${tN(p.krytB)} · C/D: ${tN(p.krytCD_d)}/${tN(p.krytCD_c)}</td>
      <td><button class="btn-ghost" data-id="${row.id}" type="button">Podgląd</button></td>`;
    tbody.appendChild(tr);
  }
  $("view-ankieta").hidden = true;
  $("view-admin").hidden = false;
  $("btn-admin").hidden = true;
}

function pokazSzczegoly(id) {
  const row = window._wyniki.find((r) => r.id === id);
  if (!row) return;
  $("szczegoly-tytul").textContent = `${row.imie} ${row.nazwisko} (${row.kod || "bez kodu"})`;
  const o = row.odpowiedzi;
  const p = podsumuj(o);
  const tN = (v) => (v ? "Tak" : "Nie");
  const wszystkie = [...PYTANIA_CZESC1, ...PYTANIA_CZESC2];
  let html = "<div class='szczegoly'>";
  html += "<h4>Podsumowanie (liczone automatycznie)</h4>";
  html += `<ul class='podsumowanie'>
    <li>Objawy zaburzeń koncentracji uwagi (A): <strong>${p.a_d}/9</strong> (wiek dorosły), <strong>${p.a_c}/9</strong> (dzieciństwo)</li>
    <li>Objawy nadpobudliwości i impulsywności (H/I): <strong>${p.hi_d}/9</strong> (wiek dorosły), <strong>${p.hi_c}/9</strong> (dzieciństwo)</li>
    <li>Kryterium A wg DSM-5 (dorosły: A ≥ 5 i H/I ≥ 5; dziecko: ≥ 3 objawy z A lub H/I): <strong>${tN(p.krytA)}</strong></li>
    <li>Kryterium B wg DSM-5 (objawy przez całe życie, pierwsze przed 12. r.ż.): <strong>${tN(p.krytB)}</strong></li>
    <li>Kryteria C i D wg DSM-5 (istotne problemy w ≥ 2 obszarach życiowych): dorosłość <strong>${tN(p.krytCD_d)}</strong>, dzieciństwo <strong>${tN(p.krytCD_c)}</strong></li>
  </ul>`;
  html += "<h4>Część 1 i 2 — kryteria</h4><table class='mini'><tr><th>Kryterium</th><th>Dorosłość</th><th>Dzieciństwo</th></tr>";
  for (const item of wszystkie) {
    const k = o.kryteria?.[item.id] || {};
    html += `<tr><td><strong>${widocznyId(item.id)}</strong> ${bezId(item.tytul)}</td><td>${k.doroslosc || "—"}</td><td>${k.dziecinstwo || "—"}</td></tr>`;
  }
  html += "</table>";
  html += "<h4>Część 3</h4>";
  html += `<p>Kryterium B: <strong>${o.krytB || "—"}</strong>${o.krytB_wiek ? ` (wiek: ${o.krytB_wiek})` : ""}</p>`;
  for (const obszar of OBSZARY_CZESC3) {
    const zaznaczone = (o.obszary?.[obszar.id] || []).map((i) => obszar.pozycje[i]);
    if (zaznaczone.length) {
      html += `<p><strong>${obszar.tytul}:</strong></p><ul>${zaznaczone.map((p) => `<li>${p}</li>`).join("")}</ul>`;
    }
  }
  html += `<p>Kryteria C/D — dorosłość: <strong>${o.krytCD?.doroslosc || "—"}</strong>, dzieciństwo: <strong>${o.krytCD?.dziecinstwo || "—"}</strong></p>`;
  if (o.uwagi) html += `<p><strong>Uwagi:</strong> ${o.uwagi}</p>`;
  html += "</div>";
  $("szczegoly-tresc").innerHTML = html;
  $("modal-szczegoly").hidden = false;
}

function eksportCSV() {
  const wiersze = [["Data", "Imię", "Nazwisko", "Płeć", "Data urodzenia", "Kod", "Suma A dorosłość", "Suma A dzieciństwo", "Suma H/I dorosłość", "Suma H/I dzieciństwo", "Kryt. A", "Kryt. B", "Kryt. C/D dorosłość", "Kryt. C/D dzieciństwo", "Odpowiedzi (JSON)"]];
  for (const row of window._wyniki || []) {
    const p = podsumuj(row.odpowiedzi);
    wiersze.push([
      row.created_at || "",
      row.imie,
      row.nazwisko,
      row.plec || "",
      row.data_urodzenia || "",
      row.kod || "",
      `${p.a_d}/9`,
      `${p.a_c}/9`,
      `${p.hi_d}/9`,
      `${p.hi_c}/9`,
      p.krytA ? "Tak" : "Nie",
      p.krytB ? "Tak" : "Nie",
      p.krytCD_d ? "Tak" : "Nie",
      p.krytCD_c ? "Tak" : "Nie",
      JSON.stringify(row.odpowiedzi),
    ]);
  }
  const csv = wiersze.map((w) => w.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(";")).join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "diva5_wyniki.csv";
  a.click();
}

function buduj() {
  const c1 = $("czesc1");
  const c2 = $("czesc2");
  for (const item of PYTANIA_CZESC1) budujKryterium(c1, item);
  for (const item of PYTANIA_CZESC2) budujKryterium(c2, item);
  budujCzesc3();
  $("btn-wyslij").addEventListener("click", wyslijAnkiete);
  $("btn-admin").addEventListener("click", () => ($("modal-login").hidden = false));
  $("btn-login-anuluj").addEventListener("click", () => ($("modal-login").hidden = true));
  $("btn-login-ok").addEventListener("click", zaloguj);
  $("btn-logout").addEventListener("click", async () => {
    await sb.auth.signOut();
    $("view-admin").hidden = true;
    $("view-ankieta").hidden = false;
    $("btn-admin").hidden = false;
  });
  $("btn-csv").addEventListener("click", eksportCSV);
  $("btn-szczegoly-zamknij").addEventListener("click", () => ($("modal-szczegoly").hidden = true));
  $("tabela-wynikow").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-id]");
    if (btn) pokazSzczegoly(btn.dataset.id);
  });
}

buduj();
