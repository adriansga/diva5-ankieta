const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
let pyt = fs.readFileSync(path.join(ROOT, "pytania.js"), "utf8").replace(/\bconst\b/g, "var");
let app = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
const start = app.indexOf("function podsumuj");
let i = app.indexOf("{", start), depth = 0, end = -1;
for (; i < app.length; i++) {
  if (app[i] === "{") depth++;
  else if (app[i] === "}") { depth--; if (depth === 0) { end = i + 1; break; } }
}
eval(pyt + "\n" + app.slice(start, end));

const allTak = { kryteria: {}, krytB: "tak", krytCD: { doroslosc: "tak", dziecinstwo: "tak" } };
for (const x of [...PYTANIA_CZESC1, ...PYTANIA_CZESC2])
  allTak.kryteria[x.id] = { doroslosc: "tak", dziecinstwo: "tak" };

const cases = [
  ["wszystko tak", allTak, { a_d: 9, a_c: 9, hi_d: 9, hi_c: 9, krytA: true, krytB: true, krytCD_d: true, krytCD_c: true }],
  ["5A+5HI d, 4A+0HI c", {
    kryteria: (() => { const k = {};
      PYTANIA_CZESC1.forEach((x, n) => k[x.id] = { doroslosc: n < 5 ? "tak" : "nie", dziecinstwo: n < 4 ? "tak" : "nie" });
      PYTANIA_CZESC2.forEach((x, n) => k[x.id] = { doroslosc: n < 5 ? "tak" : "nie", dziecinstwo: "nie" });
      return k; })(),
    krytB: "nie", krytCD: { doroslosc: "tak", dziecinstwo: "nie" },
  }, { a_d: 5, a_c: 4, hi_d: 5, hi_c: 0, krytA: true, krytB: false, krytCD_d: true, krytCD_c: false }],
  ["4A doroslosc -> krytA false", {
    kryteria: (() => { const k = {};
      PYTANIA_CZESC1.forEach((x, n) => k[x.id] = { doroslosc: n < 4 ? "tak" : "nie", dziecinstwo: "tak" });
      PYTANIA_CZESC2.forEach((x, n) => k[x.id] = { doroslosc: n < 5 ? "tak" : "nie", dziecinstwo: "tak" });
      return k; })(),
    krytB: "tak", krytCD: { doroslosc: "tak", dziecinstwo: "tak" },
  }, { a_d: 4, krytA: false }],
  ["pusta odpowiedz nie wywala", null, { a_d: 0, a_c: 0, hi_d: 0, hi_c: 0, krytA: false, krytB: false, krytCD_d: false, krytCD_c: false }],
  ["realny wpis Adriana (z bazy 18:51)", {
    kryteria: (() => { const k = {};
      const tak1 = ["A1","A2","A3","A4","A7","A8","A9"]; // doroslosc tak
      const tak1c = ["A1","A4","A5","A8","A9"];          // dziecinstwo tak
      const tak2 = ["HI3","HI5","HI6","HI7","HI9"];      // doroslosc tak
      const tak2c = ["HI3","HI4","HI5","HI6","HI7","HI8","HI9"]; // dziecinstwo tak
      for (const x of PYTANIA_CZESC1) k[x.id] = { doroslosc: tak1.includes(x.id) ? "tak" : "nie", dziecinstwo: tak1c.includes(x.id) ? "tak" : "nie" };
      for (const x of PYTANIA_CZESC2) k[x.id] = { doroslosc: tak2.includes(x.id) ? "tak" : "nie", dziecinstwo: tak2c.includes(x.id) ? "tak" : "nie" };
      return k; })(),
    krytB: "tak", krytCD: { doroslosc: "tak", dziecinstwo: "tak" },
  }, { a_d: 7, a_c: 5, hi_d: 5, hi_c: 7, krytA: true, krytB: true, krytCD_d: true, krytCD_c: true }],
];

let fail = 0;
for (const [nazwa, wej, oczek] of cases) {
  const r = podsumuj(wej);
  const zle = Object.entries(oczek).filter(([k, v]) => r[k] !== v);
  if (zle.length) { fail++; console.log(`FAIL: ${nazwa} -> ${JSON.stringify(zle)}`); }
  else console.log(`PASS: ${nazwa}`);
}
console.log(fail ? "WYNIK: FAIL" : "WYNIK: " + cases.length + "/" + cases.length + " PASS");
process.exit(fail ? 1 : 0);
