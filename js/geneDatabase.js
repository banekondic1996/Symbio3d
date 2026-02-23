/**
 * geneDatabase.js — Visual genetic trait database
 * GRCh38/hg38 · dbSNP 156
 */

const GENE_DB = {
  eyeColor: {
    label:'Eye Color', category:'facial', icon:'👁',
    variants: {
      blue:  { label:'Blue',   color:'#4a8fd6', genes:[{gene:'OCA2',snp:'rs12913832',chr:'15q13.1',allele:'A/A',effect:'OCA2 silenced → minimal iris melanin'},{gene:'HERC2',snp:'rs12913832',chr:'15q13.1',allele:'A/A',effect:'Regulatory element silences OCA2 enhancer'},{gene:'SLC24A4',snp:'rs12896399',chr:'14q32.12',allele:'G/G',effect:'Cation exchanger reducing stromal pigment'}], code:'rs12913832(A;A) | rs12896399(G;G) | rs2228479(A;A)', frequency:'8–10% global; 80% N. Europe', heritage:'Northern/Eastern European, Baltic' },
      gray:  { label:'Gray',   color:'#8a9bab', genes:[{gene:'OCA2',snp:'rs12913832',chr:'15q13.1',allele:'A/A',effect:'OCA2 silenced; Mie scatter via dense stroma'},{gene:'TPCN2',snp:'rs35264875',chr:'11q13.3',allele:'T/T',effect:'Reduced lysosomal melanin trafficking'},{gene:'LYST',snp:'rs16891982',chr:'1q42.3',allele:'C/C',effect:'Lysosomal regulator; stroma collagen density'}], code:'rs12913832(A;A) | rs35264875(T;T) | TPCN2 variant', frequency:'~3% global; Middle East, Caucasus', heritage:'E. European, Georgian, Middle Eastern', note:'Mie scattering (vs Rayleigh in blue) from denser stromal collagen.' },
      green: { label:'Green',  color:'#3a9a5c', genes:[{gene:'OCA2',snp:'rs1129038',chr:'15q13.1',allele:'A/G',effect:'Partial OCA2 suppression'},{gene:'HERC2',snp:'rs12913832',chr:'15q13.1',allele:'A/G',effect:'Heterozygous regulatory effect'},{gene:'SLC24A4',snp:'rs12896399',chr:'14q32.12',allele:'G/G',effect:'Melanin transport reduction'}], code:'rs12913832(A;G) | rs1129038(A;G) | rs12896399(G;G)', frequency:'2–3% global; 13–17% Iceland', heritage:'Celtic (Irish, Scottish), Germanic, Icelandic' },
      violet:{ label:'Violet', color:'#7050c0', genes:[{gene:'OCA2',snp:'rs1800407',chr:'15q13.1',allele:'C/T',effect:'Partial melanin with pheomelanin reddish stroma'},{gene:'TYRP1',snp:'rs1408799',chr:'9p23',allele:'T/C',effect:'Shifts brown-red melanin ratio'},{gene:'MC1R',snp:'rs1805007',chr:'16q24.3',allele:'C/T',effect:'Partial MC1R loss → pheomelanin + blue scattering = violet'}], code:'rs1800407(C;T) | rs1408799(T;C) | rs1805007(C;T)', frequency:'<0.1% — pheomelanin+blue scattering overlap', heritage:'N. African/European with hypopigmentation', note:'Pheomelanin (red) + Rayleigh scattering (blue) overlay produces violet. Alexandria\'s Genesis is fictional.' },
      hazel: { label:'Hazel',  color:'#8B6200', genes:[{gene:'OCA2',snp:'rs1129038',chr:'15q13.1',allele:'G/G',effect:'Moderate brown melanin'},{gene:'ASIP',snp:'rs4911414',chr:'20q11.22',allele:'G/T',effect:'Eumelanin/pheomelanin balance'},{gene:'SLC24A4',snp:'rs12896399',chr:'14q32.12',allele:'A/G',effect:'Intermediate transport'}], code:'rs1129038(G;G) | rs4911414(G;T) | rs12896399(A;G)', frequency:'5% global', heritage:'Mixed European; Brazil, Middle East' },
      amber: { label:'Amber',  color:'#d4880a', genes:[{gene:'ASIP',snp:'rs4911414',chr:'20q11.22',allele:'T/T',effect:'High pheomelanin → golden iris'},{gene:'TYRP1',snp:'rs1408799',chr:'9p23',allele:'T/T',effect:'Reduces brown eumelanin conversion'}], code:'rs4911414(T;T) | rs1408799(T;T) | rs16891982(C;G)', frequency:'5% global; Asia, S. America', heritage:'S. European, Asian, Latin American' },
      brown: { label:'Brown',  color:'#5C3010', genes:[{gene:'OCA2',snp:'rs1800407',chr:'15q13.1',allele:'G/G',effect:'Full OCA2 → max eumelanin'},{gene:'HERC2',snp:'rs12913832',chr:'15q13.1',allele:'G/G',effect:'OCA2 fully activated'},{gene:'MC1R',snp:'rs1805007',chr:'16q24.3',allele:'C/C',effect:'Wild-type eumelanin dominance'}], code:'rs12913832(G;G) | rs1800407(G;G) | rs1805007(C;C)', frequency:'~79% global', heritage:'Universal; dominant in Africa, Asia, S. Europe' },
    }
  },
  hairColor: {
    label:'Hair Color', category:'hair', icon:'💇',
    variants: {
      platinum:{ label:'Platinum', color:'#F0ECE0', genes:[{gene:'SLC45A2',snp:'rs16891982',chr:'5p13.2',allele:'C/C',effect:'Severely reduced melanin transport'},{gene:'OCA2',snp:'rs1800407',chr:'15q13.1',allele:'C/C',effect:'Near-zero hair melanin'},{gene:'KITLG',snp:'rs12821256',chr:'12q21.32',allele:'C/C',effect:'Minimal melanocyte stimulation'}], code:'rs16891982(C;C) | rs12821256(C;C) | rs1800407(C;C)', frequency:'<1% global; Scandinavia', heritage:'Nordic/Scandinavian' },
      blonde:  { label:'Blonde',   color:'#E8C97A', genes:[{gene:'KITLG',snp:'rs12821256',chr:'12q21.32',allele:'C/C',effect:'Reduced Kit Ligand → low melanocyte stimulation'},{gene:'OCA2',snp:'rs1800407',chr:'15q13.1',allele:'C/T',effect:'Partial melanin reduction'},{gene:'SLC45A2',snp:'rs16891982',chr:'5p13.2',allele:'C/C',effect:'Reduced melanin transport'}], code:'rs12821256(C;C) | rs1800407(C;T) | rs16891982(C;C)', frequency:'2% global; 10–15% N. European', heritage:'N. European, Scandinavian' },
      red:     { label:'Red',      color:'#C03020', genes:[{gene:'MC1R',snp:'rs1805007',chr:'16q24.3',allele:'T/T',effect:'MC1R LOF → full pheomelanin pathway'},{gene:'MC1R',snp:'rs1805008',chr:'16q24.3',allele:'T/T',effect:'R151C — classic red hair allele'},{gene:'IRF4',snp:'rs12203592',chr:'6p25.3',allele:'T/T',effect:'IRF4 enhances pheomelanin signaling'}], code:'rs1805007(T;T) | rs1805008(T;T) | MC1R(R151C/R160W)', frequency:'1–2% global; up to 13% Ireland', heritage:'Celtic: Irish, Scottish, Welsh' },
      auburn:  { label:'Auburn',   color:'#8B3820', genes:[{gene:'MC1R',snp:'rs1805007',chr:'16q24.3',allele:'C/T',effect:'Heterozygous MC1R — mixed eu/pheomelanin'},{gene:'TYRP1',snp:'rs1408799',chr:'9p23',allele:'C/T',effect:'Red-brown melanin mix'}], code:'rs1805007(C;T) | rs1408799(C;T) | rs12896399(A;G)', frequency:'~3% global', heritage:'British Isles, parts of Mediterranean' },
      brown:   { label:'Brown',    color:'#6B3520', genes:[{gene:'TYRP1',snp:'rs1408799',chr:'9p23',allele:'C/T',effect:'Moderate eumelanin'},{gene:'SLC24A4',snp:'rs12896399',chr:'14q32.12',allele:'A/G',effect:'Intermediate melanin transport'},{gene:'HERC2',snp:'rs1129038',chr:'15q13.1',allele:'A/G',effect:'Partial OCA2 upregulation'}], code:'rs1408799(C;T) | rs12896399(A;G) | rs1129038(A;G)', frequency:'11% global', heritage:'European, Middle Eastern, Latin American' },
      black:   { label:'Black',    color:'#181010', genes:[{gene:'EDAR',snp:'rs3827760',chr:'2q13',allele:'A/A',effect:'Round follicle — thick shaft'},{gene:'OCA2',snp:'rs1800407',chr:'15q13.1',allele:'G/G',effect:'Max eumelanin in follicles'},{gene:'MC1R',snp:'rs1805007',chr:'16q24.3',allele:'C/C',effect:'Full eumelanin, no pheomelanin'}], code:'rs1800407(G;G) | rs1805007(C;C) | rs3827760(A;A)', frequency:'>70% global', heritage:'African, Asian, Hispanic, S. European' },
      white:   { label:'White/Albino', color:'#F5F2F0', genes:[{gene:'TYR',snp:'rs1042602',chr:'11q14.3',allele:'A/A',effect:'Tyrosinase LOF — no melanin synthesis'},{gene:'OCA2',snp:'rs1800407',chr:'15q13.1',allele:'C/C',effect:'OCA2 null → OCA type II'}], code:'rs1042602(A;A) | OCA2 null | OCA1/OCA2', frequency:'<0.01% (albinism)', heritage:'Universal; sub-Saharan Africa highest OCA2 rate' },
    }
  },
  hairTexture: {
    label:'Hair Texture', category:'hair', icon:'〰',
    variants: {
      straight:{ label:'Straight',       genes:[{gene:'EDAR',snp:'rs3827760',chr:'2q13',allele:'A/A',effect:'Round follicle → straight hair'},{gene:'FGFR2',snp:'rs755573',chr:'10q26.13',allele:'C/C',effect:'Follicle morphology straightening'}], code:'rs3827760(A;A) | EDAR(370A derived) | rs755573(C;C)', frequency:'~45% global', heritage:'East Asian, Native American' },
      wavy:    { label:'Wavy',           genes:[{gene:'TCHH',snp:'rs11803731',chr:'1q21.3',allele:'A/A',effect:'Trichohyalin — intermediate follicle asymmetry'},{gene:'EDAR',snp:'rs3827760',chr:'2q13',allele:'A/G',effect:'Heterozygous — oval cross-section'}], code:'rs11803731(A;A) | rs3827760(A;G) | rs10177996(C;T)', frequency:'~40% global', heritage:'European, Middle Eastern' },
      curly:   { label:'Curly',          genes:[{gene:'TCHH',snp:'rs11803731',chr:'1q21.3',allele:'G/G',effect:'Asymmetric oval follicle'},{gene:'LPAR6',snp:'rs3745251',chr:'13q14.2',allele:'A/G',effect:'LPA receptor — hair shaft morphology'},{gene:'WNT10A',snp:'rs10177996',chr:'2q35',allele:'T/T',effect:'Wnt pathway follicle curvature'}], code:'rs11803731(G;G) | rs3745251(A;G) | rs10177996(T;T)', frequency:'~15% global', heritage:'African, African-American, some S. European' },
      coiled:  { label:'Tightly Coiled', genes:[{gene:'TCHH',snp:'rs11803731',chr:'1q21.3',allele:'G/G',effect:'Ribbon follicle — maximum coiling'},{gene:'LPAR6',snp:'rs3745251',chr:'13q14.2',allele:'A/A',effect:'LPA6 homozygous — strongest coiling'}], code:'rs11803731(G;G) | rs3745251(A;A) | TRPV4 variant', frequency:'>80% sub-Saharan Africa', heritage:'Sub-Saharan African' },
    }
  },
  skinTone: {
    label:'Skin Tone', category:'skin', icon:'🎨',
    variants: {
      type1:{ label:'Type I — Very Fair',   color:'#fde8ce', genes:[{gene:'MC1R',snp:'rs1805007',chr:'16q24.3',allele:'T/T',effect:'MC1R LOF → minimal eumelanin'},{gene:'SLC45A2',snp:'rs16891982',chr:'5p13.2',allele:'C/C',effect:'Greatly reduced melanin transport'},{gene:'TYR',snp:'rs1042602',chr:'11q14.3',allele:'A/A',effect:'Tyrosinase variant'}], code:'rs1805007(T;T) | rs16891982(C;C) | rs1042602(A;A) | Fitzpatrick I', frequency:'4% global; ~15% N. Europe', heritage:'Irish, Scottish, Scandinavian' },
      type2:{ label:'Type II — Fair',       color:'#f5c98a', genes:[{gene:'SLC24A5',snp:'rs1426654',chr:'15q21.1',allele:'A/A',effect:'Ala111Thr — major European depigmentation'},{gene:'SLC45A2',snp:'rs16891982',chr:'5p13.2',allele:'C/G',effect:'Heterozygous melanin transport'}], code:'rs1426654(A;A) | rs16891982(C;G) | Fitzpatrick II', frequency:'~15% global', heritage:'European, Central Asian' },
      type3:{ label:'Type III — Medium',    color:'#d4935a', genes:[{gene:'SLC24A5',snp:'rs1426654',chr:'15q21.1',allele:'A/G',effect:'Heterozygous depigmentation'},{gene:'OCA2',snp:'rs1800407',chr:'15q13.1',allele:'G/G',effect:'Full OCA2 function'},{gene:'ASIP',snp:'rs4911414',chr:'20q11.22',allele:'G/G',effect:'Balanced melanin type'}], code:'rs1426654(A;G) | rs4911414(G;G) | Fitzpatrick III', frequency:'~25% global', heritage:'Mediterranean, Middle Eastern, S. Asian, Latin American' },
      type4:{ label:'Type IV — Olive',      color:'#9b6232', genes:[{gene:'SLC24A5',snp:'rs1426654',chr:'15q21.1',allele:'G/G',effect:'Ancestral allele — high melanin'},{gene:'MC1R',snp:'rs1805007',chr:'16q24.3',allele:'C/C',effect:'Full eumelanin'}], code:'rs1426654(G;G) | rs1805007(C;C) | rs642742(A;G) | Fitzpatrick IV', frequency:'~20% global', heritage:'S. Asian, E. African, Arab' },
      type5:{ label:'Type V — Dark Brown',  color:'#5c3218', genes:[{gene:'SLC24A5',snp:'rs1426654',chr:'15q21.1',allele:'G/G',effect:'Ancestral'},{gene:'ASIP',snp:'rs4911414',chr:'20q11.22',allele:'T/T',effect:'Low ASIP → max eumelanin'},{gene:'KITLG',snp:'rs642742',chr:'12q21.32',allele:'A/A',effect:'High melanocyte density'},{gene:'DCT',snp:'rs2031526',chr:'13q31.1',allele:'G/G',effect:'Full dopachrome tautomerase'}], code:'rs1426654(G;G) | rs4911414(T;T) | rs642742(A;A) | Fitzpatrick V', frequency:'~20% global', heritage:'W. African, S. Asian' },
      type6:{ label:'Type VI — Very Dark',  color:'#321808', genes:[{gene:'SLC24A5',snp:'rs1426654',chr:'15q21.1',allele:'G/G',effect:'Max melanin'},{gene:'ASIP',snp:'rs4911414',chr:'20q11.22',allele:'T/T',effect:'No ASIP attenuation'},{gene:'DCT',snp:'rs2031526',chr:'13q31.1',allele:'G/G',effect:'Maximum dopachrome pathway'},{gene:'GRM5',snp:'rs2361723',chr:'11q14.2',allele:'A/A',effect:'mGluR5 variant — deep tone'}], code:'rs1426654(G;G) | rs4911414(T;T) | GRM5(A;A) | Fitzpatrick VI', frequency:'~30% global', heritage:'Sub-Saharan African' },
    }
  },
  noseShape: {
    label:'Nose Shape', category:'facial', icon:'👃',
    variants: {
      narrow:   { label:'Narrow',    genes:[{gene:'DCHS2',snp:'rs8070877',chr:'4q31.3',allele:'T/T',effect:'Dachsous cadherin 2 — nasal tip narrowing'},{gene:'RUNX2',snp:'rs1200425',chr:'6p21.1',allele:'G/G',effect:'RUNX2 — narrow nasal bone'}], code:'rs8070877(T;T) | rs1200425(G;G) | DCHS2 variant', frequency:'European, East Asian', heritage:'N. European, E. Asian' },
      medium:   { label:'Medium',    genes:[{gene:'DCHS2',snp:'rs8070877',chr:'4q31.3',allele:'T/C',effect:'Heterozygous — intermediate'}], code:'rs8070877(T;C) | rs4626244(A;G)', frequency:'Most common globally', heritage:'Universal' },
      broad:    { label:'Broad',     genes:[{gene:'DCHS2',snp:'rs8070877',chr:'4q31.3',allele:'C/C',effect:'Ancestral — wider cartilage'},{gene:'GLI3',snp:'rs2154340',chr:'7p13',allele:'G/G',effect:'GLI3 zinc finger — nasal width'}], code:'rs8070877(C;C) | GLI3(G;G) | PAX1 ancestral', frequency:'More common: African, S. Asian', heritage:'Sub-Saharan African, S. Asian' },
      upturned: { label:'Upturned',  genes:[{gene:'DCHS2',snp:'rs8070877',chr:'4q31.3',allele:'T/T',effect:'DCHS2 — cartilage tip rotation'},{gene:'TRAF3IP1',snp:'rs1868752',chr:'2q37.1',allele:'A/A',effect:'Cilia-related nasal morphogenesis'}], code:'rs8070877(T;T) | TRAF3IP1(A;A)', frequency:'~15% globally', heritage:'European, Slavic/Northern' },
    }
  },
  mouthShape: {
    label:'Mouth / Lips', category:'facial', icon:'👄',
    variants: {
      thin:   { label:'Thin Lips',    genes:[{gene:'PRSS35',snp:'rs1005743',chr:'6p12.1',allele:'A/A',effect:'Serine protease — reduced lip volume signaling'},{gene:'TP63',snp:'rs6791723',chr:'3q28',allele:'G/G',effect:'Tumor protein p63 — lip morphology'}], code:'rs1005743(A;A) | TP63(G;G) | Lip volume: low', frequency:'More common: European, E. Asian', heritage:'N. European, E. Asian' },
      medium: { label:'Medium Lips',  genes:[{gene:'PRSS35',snp:'rs1005743',chr:'6p12.1',allele:'A/G',effect:'Moderate lip volume'},{gene:'TMEM163',snp:'rs7026354',chr:'2q21.3',allele:'G/G',effect:'Transmembrane protein — intermediate'}], code:'rs1005743(A;G) | TMEM163(G;G)', frequency:'Most common globally', heritage:'Universal' },
      full:   { label:'Full Lips',    genes:[{gene:'PRSS35',snp:'rs1005743',chr:'6p12.1',allele:'G/G',effect:'Higher lip volume'},{gene:'BMP4',snp:'rs17563',chr:'14q22.2',allele:'C/C',effect:'BMP4 — larger lower lip'}], code:'rs1005743(G;G) | rs7026354(A;G) | BMP4(C;C)', frequency:'Common: African, African-American, S. European', heritage:'Sub-Saharan African, S. Asian' },
      cupid:  { label:"Cupid's Bow",  genes:[{gene:'TP63',snp:'rs6791723',chr:'3q28',allele:'G/A',effect:'p63 — upper lip philtrum/peak formation'},{gene:'PRDM1',snp:'rs6731528',chr:'6q21',allele:'G/G',effect:'PR/SET domain — upper lip arch'}], code:'TP63(G;A) | PRDM1(G;G) | Cupid-bow upper lip', frequency:'~20% European', heritage:'European; V-shaped upper lip' },
    }
  },
  freckles: {
    label:'Freckles', category:'skin', icon:'🔴',
    variants: {
      present: { label:'Freckled',    genes:[{gene:'MC1R',snp:'rs1805007',chr:'16q24.3',allele:'T/T',effect:'MC1R LOF → grouped melanocyte clusters under UV'},{gene:'MC1R',snp:'rs1805008',chr:'16q24.3',allele:'T/T',effect:'R151C — strongest freckle allele'},{gene:'IRF4',snp:'rs12203592',chr:'6p25.3',allele:'T/T',effect:'IRF4 T allele — freckle formation'}], code:'rs1805007(T;T) | rs1805008(T;T) | rs12203592(T;T)', frequency:'4–5% global; >40% redheads', heritage:'Northern European, Celtic' },
      absent:  { label:'No Freckles', genes:[{gene:'MC1R',snp:'rs1805007',chr:'16q24.3',allele:'C/C',effect:'Functional MC1R — even eumelanin'},{gene:'IRF4',snp:'rs12203592',chr:'6p25.3',allele:'C/C',effect:'No freckle-associated IRF4 variant'}], code:'rs1805007(C;C) | rs12203592(C;C) | MC1R wild-type', frequency:'~95% global', heritage:'Universal' },
    }
  },
  dimples: {
    label:'Cheek Dimples', category:'facial', icon:'😊',
    variants: {
      present: { label:'Dimples',    genes:[{gene:'PITX2',snp:'rs45547607',chr:'4q25',allele:'variant',effect:'Zygomaticus major muscle bifurcation'},{gene:'FGF3',snp:'rs4954820',chr:'11q13.3',allele:'G/G',effect:'FGF signaling — fascial attachment'}], code:'PITX2 facial muscle variant | rs4954820(G;G) | Autosomal dominant', frequency:'20–30% global', heritage:'Universal; variable penetrance' },
      absent:  { label:'No Dimples', genes:[{gene:'PITX2',snp:'rs45547607',chr:'4q25',allele:'wildtype',effect:'Standard zygomaticus attachment'}], code:'PITX2 wild-type | Standard muscle attachment', frequency:'70–80% global', heritage:'Universal' },
    }
  },
  height: {
    label:'Height', category:'body', icon:'📏',
    variants: {
      short:   { label:'Short (<165cm)',   genes:[{gene:'HMGA2',snp:'rs1042725',chr:'12q14.3',allele:'C/C',effect:'HMGA2 C allele — reduced IGF2BP2 pathway'},{gene:'GDF5',snp:'rs143384',chr:'20q11.22',allele:'A/A',effect:'GDF5 — reduced limb bone elongation'}], code:'rs1042725(C;C) | rs143384(A;A) | Polygenic score: −2SD', frequency:'~16% (below 5th percentile)', heritage:'Associated with SE Asian ancestry' },
      average: { label:'Average',          genes:[{gene:'HMGA2',snp:'rs1042725',chr:'12q14.3',allele:'C/T',effect:'Heterozygous — mean height'},{gene:'GDF5',snp:'rs143384',chr:'20q11.22',allele:'A/G',effect:'Intermediate GDF5'}], code:'rs1042725(C;T) | rs143384(A;G) | Polygenic score: 0SD', frequency:'~68% population', heritage:'Global average' },
      tall:    { label:'Tall (>180cm)',    genes:[{gene:'HMGA2',snp:'rs1042725',chr:'12q14.3',allele:'T/T',effect:'T allele — height-increasing via IGF2BP2'},{gene:'GDF5',snp:'rs143384',chr:'20q11.22',allele:'G/G',effect:'Enhanced limb elongation'},{gene:'IGF1R',snp:'rs2229765',chr:'15q26.3',allele:'A/A',effect:'Enhanced growth plate signaling'},{gene:'ZBTB38',snp:'rs924232',chr:'3q23',allele:'C/C',effect:'Growth plate regulation'}], code:'rs1042725(T;T) | rs143384(G;G) | rs924232(C;C) | Polygenic score: +2SD', frequency:'~16% (top quintile)', heritage:'Associated with N. European ancestry' },
    }
  },
  polydactyly: {
    label:'Finger Count', category:'limb', icon:'✋',
    variants: {
      five: { label:'5 Fingers',            genes:[{gene:'GLI3',snp:'rs2154340',chr:'7p14.1',allele:'G/G',effect:'Wild-type GLI3 — correct limb patterning'},{gene:'SHH',snp:'reference',chr:'7q36.3',allele:'WT',effect:'Sonic Hedgehog — normal polarizing activity'}], code:'GLI3 wild-type | SHH(ZRS) normal | 5 digits standard', frequency:'>99.7% population', heritage:'Universal' },
      six:  { label:'6 Fingers (Polydactyly)', isPolydactyly:true, genes:[{gene:'GLI3',snp:'c.2374C>T',chr:'7p14.1',allele:'p.Arg792Ter',effect:'GLI3 truncation — extra ulnar digit'},{gene:'IQCE',snp:'c.395-1G>A',chr:'7p22.1',allele:'splice site',effect:'IQCE splice variant — hedgehog dysregulation'},{gene:'ZNF141',snp:'rs variant',chr:'4p16.3',allele:'variant',effect:'Zinc finger 141 — ulnar extra digit'}], code:'GLI3(c.2374C>T; p.Arg792Ter) | IQCE(c.395-1G>A) | PAP type A1; OMIM #174200', frequency:'1–2 per 1000; PAP most common', heritage:'Autosomal dominant; higher in African-American (1:143)' },
    }
  },
  earLobe: {
    label:'Ear Lobe', category:'facial', icon:'👂',
    variants: {
      attached: { label:'Attached',       genes:[{gene:'EDAR',snp:'rs3827760',chr:'2q13',allele:'A/A',effect:'EDAR variant — reduced lobe protrusion'},{gene:'MYH9',snp:'rs4821480',chr:'22q12.3',allele:'C/C',effect:'Myosin heavy chain — reduced lobe separation'}], code:'rs3827760(A;A) | MYH9(C;C)', frequency:'~40% global', heritage:'East Asian, some European' },
      detached: { label:'Free/Detached',  genes:[{gene:'EDAR',snp:'rs3827760',chr:'2q13',allele:'A/G',effect:'Heterozygous EDAR — free-hanging lobe'},{gene:'MYH9',snp:'rs4821480',chr:'22q12.3',allele:'C/T',effect:'MYH9 heterozygous — lobe attachment variant'}], code:'rs3827760(A;G) | MYH9(C;T)', frequency:'~60% global', heritage:'Universal; dominant in European, African' },
    }
  },
  chinShape: {
    label:'Chin Shape', category:'facial', icon:'⬡',
    variants: {
      cleft:  { label:'Cleft Chin',  genes:[{gene:'MAFB',snp:'rs4919426',chr:'20q12',allele:'G/G',effect:'MAFB — reduced mandibular symphysis fusion'},{gene:'PAX1',snp:'rs4626244',chr:'20p11.22',allele:'A/A',effect:'PAX1 — chin midline cleft'}], code:'rs4919426(G;G) | PAX1(A;A) | Autosomal dominant', frequency:'~5% global; 25% some European', heritage:'European, especially German' },
      round:  { label:'Round Chin',  genes:[{gene:'MAFB',snp:'rs4919426',chr:'20q12',allele:'A/A',effect:'Full MAFB — symmetric rounded chin'}], code:'MAFB wild-type | Rounded chin', frequency:'~60% global', heritage:'Universal' },
      square: { label:'Square/Strong', genes:[{gene:'RUNX2',snp:'rs1200425',chr:'6p21.1',allele:'A/A',effect:'RUNX2 — broader mandibular angle'},{gene:'EDAR',snp:'rs3827760',chr:'2q13',allele:'A/A',effect:'EDAR derived allele — mandibular density'}], code:'RUNX2(A;A) | rs3827760(A;A)', frequency:'~20% global', heritage:'E. Asian, N. European' },
    }
  },
  baldness: {
    label:'Hair Density', category:'hair', icon:'👨‍🦲',
    variants: {
      full:     { label:'Full Hair',        genes:[{gene:'AR',snp:'rs2497938',chr:'Xq12',allele:'A/A',effect:'Low DHT sensitivity in follicles'},{gene:'HDAC4',snp:'rs6047844',chr:'2q37.3',allele:'G/G',effect:'Follicle resistance to androgens'}], code:'rs2497938(A;A) | HDAC4(G;G) | Low AGA risk', frequency:'~50% men at 50', heritage:'Universal' },
      thinning: { label:'Thinning',         genes:[{gene:'AR',snp:'rs2497938',chr:'Xq12',allele:'G/A',effect:'Partial androgen receptor sensitivity'}], code:'rs2497938(G;A) | Norwood II–III likelihood', frequency:'~30% men 30–50', heritage:'Universal' },
      bald:     { label:'Significant Loss', genes:[{gene:'AR',snp:'rs2497938',chr:'Xq12',allele:'G/G',effect:'High DHT sensitivity — follicle miniaturization'},{gene:'EDA2R',snp:'rs1385699',chr:'Xq12',allele:'A/G',effect:'X-linked AGA locus'},{gene:'HDAC4',snp:'rs6047844',chr:'2q37.3',allele:'A/A',effect:'Full androgenic vulnerability'}], code:'rs2497938(G;G) | rs1385699(A;G) | HDAC4(A;A) | AGA OMIM#109200', frequency:'~50% men by 50; 80% by 70', heritage:'Universal; higher: European, S. Asian' },
    }
  },
  beardDensity: {
    label:'Beard Density', category:'facial', icon:'🧔',
    variants: {
      sparse: { label:'Sparse / None', genes:[{gene:'AR',snp:'rs2497938',chr:'Xq12',allele:'A/A',effect:'Low androgen receptor in facial follicles'},{gene:'EDAR',snp:'rs3827760',chr:'2q13',allele:'A/A',effect:'East Asian EDAR — minimal facial hair'}], code:'rs2497938(A;A) | rs3827760(A;A)', frequency:'Most common: East Asian, Native American', heritage:'E. Asian, Native American' },
      medium: { label:'Medium',        genes:[{gene:'AR',snp:'rs2497938',chr:'Xq12',allele:'G/A',effect:'Intermediate AR activity'},{gene:'SRD5A2',snp:'rs523349',chr:'2p23.1',allele:'G/C',effect:'5-alpha reductase — moderate DHT'}], code:'rs2497938(G;A) | rs523349(G;C)', frequency:'Most common: European, Middle Eastern', heritage:'Universal' },
      thick:  { label:'Full / Thick',  genes:[{gene:'AR',snp:'rs2497938',chr:'Xq12',allele:'G/G',effect:'High androgen receptor sensitivity'},{gene:'SRD5A2',snp:'rs523349',chr:'2p23.1',allele:'C/C',effect:'High 5-alpha reductase → high DHT → dense beard'}], code:'rs2497938(G;G) | rs523349(C;C)', frequency:'Common: Middle Eastern, Mediterranean, S. Asian', heritage:'Middle Eastern, Mediterranean, S. Asian' },
    }
  },
};

const CUSTOM_TRAITS = {};
function getAllTraits() { return { ...GENE_DB, ...CUSTOM_TRAITS }; }
function addCustomTrait(id, obj) { CUSTOM_TRAITS[id] = obj; }
