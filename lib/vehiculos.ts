/**
 * Marcas y modelos que circulan en Chile, para autocompletar el presupuesto.
 * No pretende ser la lista completa del mercado: son los que llegan a un
 * taller de desabolladura. Los campos siguen siendo libres, asi que si falta
 * uno se escribe igual.
 */

export type Sugerencia = { texto: string; detalle?: string };

export const MARCAS: Record<string, string[]> = {
  Chevrolet: ["Sail", "Spark", "Spark GT", "Onix", "Aveo", "Corsa", "Cruze", "Sonic", "Tracker", "Groove", "Captiva", "Equinox", "Blazer", "Trailblazer", "Traverse", "Tahoe", "Suburban", "Montana", "Colorado", "Silverado", "N300", "N400", "Orlando", "Camaro"],
  Hyundai: ["Accent", "Grand i10", "i10", "i20", "i30", "HB20", "Elantra", "Sonata", "Veloster", "Venue", "Creta", "Kona", "Tucson", "Santa Fe", "Palisade", "Staria", "H1", "H100", "Porter", "Bayon"],
  Kia: ["Morning", "Picanto", "Rio", "K2", "K3", "Cerato", "Soul", "Stonic", "Sonet", "Seltos", "Sportage", "Sorento", "Carnival", "Niro", "Frontier", "K2500"],
  Toyota: ["Yaris", "Yaris Cross", "Etios", "Corolla", "Corolla Cross", "Camry", "Prius", "C-HR", "Raize", "Rush", "RAV4", "Hilux", "Fortuner", "4Runner", "Land Cruiser", "Prado", "Avanza", "Hiace", "Tacoma"],
  Nissan: ["March", "Note", "Versa", "Tiida", "Sentra", "Almera", "Juke", "Kicks", "Qashqai", "X-Trail", "Murano", "Pathfinder", "Terrano", "Navara", "NP300", "Frontier", "Urvan", "V16"],
  Suzuki: ["Alto", "Alto 800", "Celerio", "S-Presso", "Swift", "Dzire", "Baleno", "Ignis", "Fronx", "Vitara", "Grand Vitara", "S-Cross", "Jimny", "Ertiga", "XL7", "APV", "Carry"],
  Mazda: ["Mazda 2", "Mazda 3", "Mazda 6", "CX-3", "CX-30", "CX-5", "CX-60", "CX-9", "BT-50", "MX-5"],
  Mitsubishi: ["Mirage", "ASX", "Xforce", "Xpander", "Eclipse Cross", "Outlander", "Montero", "Montero Sport", "L200"],
  Peugeot: ["207", "208", "2008", "301", "308", "3008", "408", "5008", "Partner", "Expert", "Boxer", "Landtrek"],
  Renault: ["Kwid", "Sandero", "Stepway", "Logan", "Symbol", "Megane", "Duster", "Oroch", "Captur", "Koleos", "Kangoo", "Trafic", "Master", "Alaskan"],
  Ford: ["Fiesta", "Focus", "Escort", "EcoSport", "Escape", "Kuga", "Territory", "Edge", "Explorer", "Bronco", "Ranger", "Maverick", "F-150", "Transit", "Mustang"],
  Volkswagen: ["Gol", "Polo", "Virtus", "Voyage", "Vento", "Jetta", "Golf", "Passat", "Saveiro", "T-Cross", "Nivus", "Taos", "Tiguan", "Touareg", "Amarok", "Crafter"],
  Chery: ["QQ", "Fulwin", "Arrizo 5", "Tiggo 2", "Tiggo 2 Pro", "Tiggo 3", "Tiggo 4", "Tiggo 5X", "Tiggo 7", "Tiggo 8"],
  MG: ["MG3", "MG5", "MG6", "ZS", "HS", "RX5", "RX8", "GT", "One", "Extender"],
  "Great Wall": ["Wingle 5", "Wingle 7", "Poer", "Steed", "Voleex", "Tank 300"],
  Haval: ["H1", "H2", "H6", "H9", "Jolion", "Dargo"],
  JAC: ["J2", "J3", "J4", "S2", "S3", "S4", "S7", "T6", "T8", "Frison", "Sunray", "X200"],
  Changan: ["Alsvin", "Eado", "CS15", "CS35", "CS55", "CS75", "Hunter", "UNI-T", "Star Truck"],
  "Citroën": ["C3", "C4", "C4 Cactus", "C5 Aircross", "C-Elysée", "Berlingo", "Jumpy", "Jumper"],
  Subaru: ["Impreza", "XV", "Crosstrek", "Forester", "Outback", "Legacy", "WRX", "Ascent", "BRZ"],
  Honda: ["Fit", "City", "Civic", "Accord", "HR-V", "WR-V", "BR-V", "ZR-V", "CR-V", "Pilot"],
  Jeep: ["Renegade", "Compass", "Commander", "Cherokee", "Grand Cherokee", "Wrangler", "Gladiator"],
  Fiat: ["Mobi", "Uno", "Palio", "Argo", "Cronos", "Pulse", "Fastback", "Strada", "Toro", "Fiorino", "Ducato"],
  "Mercedes-Benz": ["Clase A", "Clase B", "Clase C", "Clase E", "GLA", "GLB", "GLC", "GLE", "Vito", "Sprinter"],
  BMW: ["Serie 1", "Serie 2", "Serie 3", "Serie 4", "Serie 5", "X1", "X2", "X3", "X4", "X5", "X6", "X7"],
  Audi: ["A1", "A3", "A4", "A5", "A6", "Q2", "Q3", "Q5", "Q7", "Q8"],
  Volvo: ["S60", "S90", "V40", "XC40", "XC60", "XC90"],
  RAM: ["700", "1200", "1500", "2500", "Rampage"],
  Dodge: ["Attitude", "Journey", "Durango"],
  KGM: ["Tivoli", "Korando", "Torres", "Rexton", "Musso", "Actyon"],
  Isuzu: ["D-Max", "MU-X", "N-Series"],
  Maxus: ["T60", "T70", "G10", "Deliver 9"],
  DFSK: ["Glory 500", "Glory 580", "Fengon 5", "C31", "C35", "K01"],
  Foton: ["Tunland", "Aumark", "View", "Gratour"],
  BYD: ["F0", "Dolphin", "Yuan Plus", "Song Plus", "Seal", "Han", "Tang"],
  Geely: ["Coolray", "Emgrand", "Azkarra", "Okavango", "Starray", "GX3"],
  BAIC: ["X25", "X35", "X55", "X7", "D20", "Ruixiang"],
  Jetour: ["X70", "Dashing", "T2"],
  Mahindra: ["Pik Up", "Scorpio", "XUV300", "KUV100"],
  "Land Rover": ["Defender", "Discovery", "Discovery Sport", "Freelander", "Range Rover", "Range Rover Evoque", "Range Rover Sport", "Velar"],
  Mini: ["Cooper", "Clubman", "Countryman"],
  Lexus: ["ES", "IS", "NX", "RX", "UX", "LX"],
  Porsche: ["911", "Cayenne", "Macan", "Panamera", "Taycan"],
  Opel: ["Corsa", "Astra", "Mokka", "Crossland", "Grandland", "Combo"],
  Seat: ["Ibiza", "Leon", "Arona", "Ateca", "Tarraco"],
  Skoda: ["Fabia", "Rapid", "Octavia", "Kamiq", "Karoq", "Kodiaq"],
  Tesla: ["Model 3", "Model Y", "Model S", "Model X"],
  Iveco: ["Daily"],
};

/** Colores mas comunes en patente chilena, para no tipearlos. */
export const COLORES = [
  "Blanco", "Negro", "Gris", "Gris plata", "Plata", "Rojo", "Azul", "Azul marino",
  "Celeste", "Verde", "Amarillo", "Naranjo", "Café", "Beige", "Burdeo", "Dorado",
  "Perla", "Gris grafito", "Gris oscuro", "Blanco perlado",
];

const listaMarcas = Object.keys(MARCAS);

/** Sin tildes ni mayusculas: "Citroën" y "citroen" se buscan igual. */
function normalizar(texto: string): string {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

/**
 * Ordena por que tan al principio calza lo escrito: primero lo que empieza
 * igual, despues lo que tiene una palabra que empieza igual, al final lo que
 * solo lo contiene. Sin texto no sugiere nada: la lista aparece al escribir.
 */
function filtrar(opciones: Sugerencia[], texto: string, tope = 8): Sugerencia[] {
  const q = normalizar(texto);
  if (!q) return [];
  const puntaje = (s: Sugerencia) => {
    const n = normalizar(s.texto);
    if (n.startsWith(q)) return 0;
    if (n.split(/[\s-]+/).some((p) => p.startsWith(q))) return 1;
    if (n.includes(q)) return 2;
    return -1;
  };
  return opciones
    .map((s) => ({ s, p: puntaje(s) }))
    .filter((x) => x.p >= 0)
    .sort((a, b) => a.p - b.p || a.s.texto.localeCompare(b.s.texto))
    .slice(0, tope)
    .map((x) => x.s);
}

export function buscarMarcas(texto: string): Sugerencia[] {
  return filtrar(listaMarcas.map((m) => ({ texto: m })), texto);
}

/**
 * Modelos de la marca escrita. Si todavia no hay marca (o no se reconoce),
 * busca en todas y muestra a cual pertenece cada modelo: al elegirlo se
 * completan los dos campos.
 */
export function buscarModelos(marca: string, texto: string): Sugerencia[] {
  const exacta = listaMarcas.find((m) => normalizar(m) === normalizar(marca));
  if (exacta) return filtrar(MARCAS[exacta].map((mo) => ({ texto: mo })), texto);
  const todos = listaMarcas.flatMap((m) => MARCAS[m].map((mo) => ({ texto: mo, detalle: m })));
  return filtrar(todos, texto);
}

export function buscarColores(texto: string): Sugerencia[] {
  return filtrar(COLORES.map((c) => ({ texto: c })), texto, 6);
}
