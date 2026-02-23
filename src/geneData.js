// Real human genetic trait database
// Sources: GWAS catalog, published SNP studies
const GENE_DATABASE = {
  
  // ========== EYE COLOR ==========
  eyeColor: {
    label: "Eye Color",
    category: "facial",
    variants: {
      blue: {
        label: "Blue Eyes",
        color: "#4a90d9",
        genes: [
          { gene: "OCA2", snp: "rs12913832", chromosome: "15q12-q13.1", allele: "A/A", effect: "Reduces OCA2 expression → low melanin in iris" },
          { gene: "HERC2", snp: "rs12913832", chromosome: "15q13.1", allele: "A/A", effect: "Regulatory region controlling OCA2 transcription" },
          { gene: "TYRP1", snp: "rs1408799", chromosome: "9p23", allele: "T/T", effect: "Tyrosinase-related protein 1 variant" }
        ],
        code: "rs12913832(A;A) | rs1408799(T;T) | rs2228479(A;A)",
        frequency: "8-10% global population",
        heritage: "Northern European ancestry common"
      },
      green: {
        label: "Green Eyes",
        color: "#4a9d5a",
        genes: [
          { gene: "OCA2", snp: "rs1129038", chromosome: "15q12-q13.1", allele: "A/G", effect: "Heterozygous OCA2 → moderate melanin" },
          { gene: "HERC2", snp: "rs12913832", chromosome: "15q13.1", allele: "A/G", effect: "Partial regulatory effect on OCA2" },
          { gene: "SLC24A4", snp: "rs12896399", chromosome: "14q32.12", allele: "G/G", effect: "Solute carrier affecting iris pigmentation" }
        ],
        code: "rs12913832(A;G) | rs1129038(A;G) | rs12896399(G;G)",
        frequency: "2-3% global population",
        heritage: "European, Central Asian ancestry"
      },
      hazel: {
        label: "Hazel Eyes",
        color: "#8B6914",
        genes: [
          { gene: "OCA2", snp: "rs1129038", chromosome: "15q12-q13.1", allele: "G/G", effect: "Near-normal OCA2 → moderate brown melanin" },
          { gene: "ASIP", snp: "rs4911414", chromosome: "20q11.22", allele: "G/T", effect: "Agouti signaling protein influencing melanin type" }
        ],
        code: "rs12913832(G;G) | rs1129038(G;G) | rs4911414(G;T)",
        frequency: "5% global population",
        heritage: "Mixed European descent"
      },
      brown: {
        label: "Brown Eyes",
        color: "#5C3317",
        genes: [
          { gene: "OCA2", snp: "rs1800407", chromosome: "15q12-q13.1", allele: "G/G", effect: "Full OCA2 function → high melanin production" },
          { gene: "HERC2", snp: "rs12913832", chromosome: "15q13.1", allele: "G/G", effect: "Full OCA2 transcription activation" },
          { gene: "MC1R", snp: "rs1805007", chromosome: "16q24.3", allele: "C/C", effect: "Eumelanin production dominance" }
        ],
        code: "rs12913832(G;G) | rs1800407(G;G) | rs1805007(C;C)",
        frequency: "79% global population",
        heritage: "Universal, dominant in African/Asian/S. European"
      }
    }
  },

  // ========== HAIR COLOR ==========
  hairColor: {
    label: "Hair Color",
    category: "hair",
    variants: {
      blonde: {
        label: "Blonde Hair",
        color: "#F5DEB3",
        darkColor: "#C8A060",
        genes: [
          { gene: "KITLG", snp: "rs12821256", chromosome: "12q21.32", allele: "C/C", effect: "Kit Ligand — reduced melanocyte stimulation" },
          { gene: "OCA2", snp: "rs1800407", chromosome: "15q12-q13.1", allele: "C/T", effect: "Partial melanin reduction in hair follicles" },
          { gene: "SLC45A2", snp: "rs16891982", chromosome: "5p13.2", allele: "C/C", effect: "Reduced melanin transport in hair shaft" }
        ],
        code: "rs12821256(C;C) | rs1800407(C;T) | rs16891982(C;C)",
        frequency: "2% global, 10-15% N. European",
        heritage: "Northern European, Scandinavian"
      },
      red: {
        label: "Red Hair",
        color: "#C0392B",
        darkColor: "#8B2500",
        genes: [
          { gene: "MC1R", snp: "rs1805007", chromosome: "16q24.3", allele: "T/T", effect: "Loss-of-function MC1R → phaeomelanin dominance" },
          { gene: "MC1R", snp: "rs1805008", chromosome: "16q24.3", allele: "T/T", effect: "R151C variant — classic red hair allele" },
          { gene: "MC1R", snp: "rs11547464", chromosome: "16q24.3", allele: "A/A", effect: "R160W variant associated with red phenotype" }
        ],
        code: "rs1805007(T;T) | rs1805008(T;T) | rs11547464(A;A) | MC1R(R151C/R160W)",
        frequency: "1-2% global, 13% Ireland/Scotland",
        heritage: "Celtic, Scottish, Irish, Welsh"
      },
      brown: {
        label: "Brown Hair",
        color: "#6B3A2A",
        darkColor: "#3D1F15",
        genes: [
          { gene: "TYRP1", snp: "rs1408799", chromosome: "9p23", allele: "C/T", effect: "Moderate eumelanin production" },
          { gene: "SLC24A4", snp: "rs12896399", chromosome: "14q32.12", allele: "A/G", effect: "Intermediate melanin transport" },
          { gene: "HERC2", snp: "rs1129038", chromosome: "15q13.1", allele: "A/G", effect: "Partial OCA2 upregulation" }
        ],
        code: "rs1408799(C;T) | rs12896399(A;G) | rs1129038(A;G)",
        frequency: "11% global",
        heritage: "European, Middle Eastern, Latin American"
      },
      black: {
        label: "Black Hair",
        color: "#1a1a1a",
        darkColor: "#0d0d0d",
        genes: [
          { gene: "EDAR", snp: "rs3827760", chromosome: "2q13", allele: "A/A", effect: "Ectodysplasin receptor — thicker, straighter hair" },
          { gene: "OCA2", snp: "rs1800407", chromosome: "15q12-q13.1", allele: "G/G", effect: "Maximum eumelanin in hair follicles" },
          { gene: "MC1R", snp: "rs1805007", chromosome: "16q24.3", allele: "C/C", effect: "Full eumelanin pathway, no pheomelanin" }
        ],
        code: "rs1800407(G;G) | rs1805007(C;C) | rs3827760(A;A)",
        frequency: "70%+ global population",
        heritage: "African, Asian, Hispanic, S. European"
      }
    }
  },

  // ========== HAIR TEXTURE ==========
  hairTexture: {
    label: "Hair Texture",
    category: "hair",
    variants: {
      straight: {
        label: "Straight Hair",
        genes: [
          { gene: "EDAR", snp: "rs3827760", chromosome: "2q13", allele: "A/A", effect: "Ectodysplasin-A receptor — round hair follicle cross section" },
          { gene: "FGFR2", snp: "rs755573", chromosome: "10q26.13", allele: "C/C", effect: "FGF receptor affecting follicle morphology" }
        ],
        code: "rs3827760(A;A) | EDAR(370A) derived allele",
        frequency: "~45% global population",
        heritage: "East Asian, Native American ancestry common"
      },
      wavy: {
        label: "Wavy Hair",
        genes: [
          { gene: "TCHH", snp: "rs11803731", chromosome: "1q21.3", allele: "A/A", effect: "Trichohyalin — intermediate follicle shaping" },
          { gene: "EDAR", snp: "rs3827760", chromosome: "2q13", allele: "A/G", effect: "Heterozygous follicle shape" }
        ],
        code: "rs11803731(A;A) | rs3827760(A;G)",
        frequency: "40% global population",
        heritage: "European, Middle Eastern"
      },
      curly: {
        label: "Curly Hair",
        genes: [
          { gene: "TCHH", snp: "rs11803731", chromosome: "1q21.3", allele: "G/G", effect: "Trichohyalin variant — oval/asymmetric follicle" },
          { gene: "WNT10A", snp: "rs10177996", chromosome: "2q35", allele: "T/T", effect: "Wnt signaling pathway affecting hair follicle angle" },
          { gene: "LPAR6", snp: "rs3745251", chromosome: "13q14.2", allele: "A/G", effect: "Lysophosphatidic acid receptor — hair shaft formation" }
        ],
        code: "rs11803731(G;G) | rs10177996(T;T) | LPAR6 variant",
        frequency: "~15% global population",
        heritage: "African, African-American, certain European populations"
      }
    }
  },

  // ========== SKIN TONE ==========
  skinTone: {
    label: "Skin Tone",
    category: "skin",
    variants: {
      very_light: {
        label: "Very Light (Type I)",
        color: "#FFDFC4",
        genes: [
          { gene: "MC1R", snp: "rs1805007", chromosome: "16q24.3", allele: "T/T", effect: "Loss-of-function MC1R → minimal eumelanin" },
          { gene: "SLC45A2", snp: "rs16891982", chromosome: "5p13.2", allele: "C/C", effect: "Reduced melanin transport — very pale skin" },
          { gene: "TYR", snp: "rs1042602", chromosome: "11q14.3", allele: "A/A", effect: "Tyrosinase variant reducing melanin synthesis" }
        ],
        code: "rs1805007(T;T) | rs16891982(C;C) | rs1042602(A;A) | Fitzpatrick Type I",
        frequency: "4% global, 15% in Northern Europe",
        heritage: "Irish, Scottish, Scandinavian"
      },
      light: {
        label: "Light (Type II-III)",
        color: "#F1C27D",
        genes: [
          { gene: "SLC24A5", snp: "rs1426654", chromosome: "15q21.1", allele: "A/A", effect: "Major European depigmentation variant — Ala111Thr" },
          { gene: "SLC45A2", snp: "rs16891982", chromosome: "5p13.2", allele: "C/G", effect: "Heterozygous melanin transport" },
          { gene: "OCA2", snp: "rs1800407", chromosome: "15q12-q13.1", allele: "C/G", effect: "Moderate melanin production" }
        ],
        code: "rs1426654(A;A) | rs16891982(C;G) | Fitzpatrick Type II-III",
        frequency: "~15% global",
        heritage: "European, Central Asian"
      },
      medium: {
        label: "Medium (Type III-IV)",
        color: "#C68642",
        genes: [
          { gene: "SLC24A5", snp: "rs1426654", chromosome: "15q21.1", allele: "A/G", effect: "Heterozygous — intermediate depigmentation" },
          { gene: "OCA2", snp: "rs1800407", chromosome: "15q12-q13.1", allele: "G/G", effect: "Full OCA2 function" },
          { gene: "ASIP", snp: "rs4911414", chromosome: "20q11.22", allele: "G/G", effect: "Agouti protein affecting melanin type balance" }
        ],
        code: "rs1426654(A;G) | rs4911414(G;G) | Fitzpatrick Type III-IV",
        frequency: "~25% global",
        heritage: "Mediterranean, Middle Eastern, S. Asian, Latin American"
      },
      dark: {
        label: "Dark (Type V)",
        color: "#8D5524",
        genes: [
          { gene: "SLC24A5", snp: "rs1426654", chromosome: "15q21.1", allele: "G/G", effect: "Ancestral allele — high melanin capacity" },
          { gene: "MC1R", snp: "rs1805007", chromosome: "16q24.3", allele: "C/C", effect: "Full eumelanin pathway activity" },
          { gene: "KITLG", snp: "rs642742", chromosome: "12q21.32", allele: "A/G", effect: "Kit Ligand variant affecting melanocyte survival" }
        ],
        code: "rs1426654(G;G) | rs1805007(C;C) | rs642742(A;G) | Fitzpatrick Type V",
        frequency: "~20% global",
        heritage: "South Asian, East African, Arab populations"
      },
      very_dark: {
        label: "Very Dark (Type VI)",
        color: "#4A2912",
        genes: [
          { gene: "SLC24A5", snp: "rs1426654", chromosome: "15q21.1", allele: "G/G", effect: "Ancestral allele — maximum melanin" },
          { gene: "ASIP", snp: "rs4911414", chromosome: "20q11.22", allele: "T/T", effect: "Low ASIP → maximum eumelanin" },
          { gene: "KITLG", snp: "rs642742", chromosome: "12q21.32", allele: "A/A", effect: "Ancestral allele — high melanocyte density" },
          { gene: "DCT", snp: "rs2031526", chromosome: "13q31.1", allele: "G/G", effect: "Dopachrome tautomerase — full eumelanin synthesis" }
        ],
        code: "rs1426654(G;G) | rs4911414(T;T) | rs642742(A;A) | Fitzpatrick Type VI",
        frequency: "~30% global",
        heritage: "Sub-Saharan African populations"
      }
    }
  },

  // ========== HEIGHT TENDENCY ==========
  height: {
    label: "Height Tendency",
    category: "body",
    variants: {
      short: {
        label: "Short Stature (<165cm)",
        genes: [
          { gene: "HMGA2", snp: "rs1042725", chromosome: "12q14.3", allele: "C/C", effect: "High Mobility Group AT-hook 2 — height reducing allele" },
          { gene: "GDF5", snp: "rs143384", chromosome: "20q11.22", allele: "A/A", effect: "Growth differentiation factor — reduced limb growth" },
          { gene: "EFEMP1", snp: "rs3791679", chromosome: "2p16.1", allele: "A/A", effect: "EGF-containing fibulin — bone growth reduction" }
        ],
        code: "rs1042725(C;C) | rs143384(A;A) | rs3791679(A;A) | Polygenic height score: -2 SD",
        frequency: "~16% population (bottom quintile)",
        heritage: "Associated with Southeast Asian ancestry"
      },
      average: {
        label: "Average Height (165-175cm)",
        genes: [
          { gene: "HMGA2", snp: "rs1042725", chromosome: "12q14.3", allele: "C/T", effect: "Heterozygous HMGA2 — average height contribution" },
          { gene: "GDF5", snp: "rs143384", chromosome: "20q11.22", allele: "A/G", effect: "Intermediate growth differentiation factor" }
        ],
        code: "rs1042725(C;T) | rs143384(A;G) | Polygenic height score: 0 SD",
        frequency: "~68% population (within 1 SD of mean)",
        heritage: "Global average"
      },
      tall: {
        label: "Tall (>180cm)",
        genes: [
          { gene: "HMGA2", snp: "rs1042725", chromosome: "12q14.3", allele: "T/T", effect: "Height-increasing T allele — IGF2BP2 pathway" },
          { gene: "GDF5", snp: "rs143384", chromosome: "20q11.22", allele: "G/G", effect: "Growth factor — enhanced limb elongation" },
          { gene: "ZBTB38", snp: "rs924232", chromosome: "3q23", allele: "C/C", effect: "Zinc finger protein — growth plate regulation" },
          { gene: "IGF1R", snp: "rs2229765", chromosome: "15q26.3", allele: "A/A", effect: "IGF-1 receptor — enhanced growth signaling" }
        ],
        code: "rs1042725(T;T) | rs143384(G;G) | rs924232(C;C) | Polygenic height score: +2 SD",
        frequency: "~16% population (top quintile)",
        heritage: "Associated with Northern European ancestry"
      }
    }
  },

  // ========== NOSE SHAPE ==========
  noseShape: {
    label: "Nose Shape",
    category: "facial",
    variants: {
      narrow: {
        label: "Narrow Bridge",
        genes: [
          { gene: "DCHS2", snp: "rs8070877", chromosome: "4q31.3", allele: "T/T", effect: "Dachsous cadherin 2 — nasal tip narrowing" },
          { gene: "RUNX2", snp: "rs1200425", chromosome: "6p21.1", allele: "G/G", effect: "Transcription factor — narrow nasal bone" },
          { gene: "PAX1", snp: "rs4626244", chromosome: "20p11.22", allele: "A/A", effect: "Paired box protein — reduced nasal width" }
        ],
        code: "rs8070877(T;T) | DCHS2 variant | rs1200425(G;G)",
        frequency: "More common in European, East Asian",
        heritage: "Northern European, East Asian"
      },
      broad: {
        label: "Broad/Wide Nose",
        genes: [
          { gene: "DCHS2", snp: "rs8070877", chromosome: "4q31.3", allele: "C/C", effect: "Dachsous cadherin 2 — wider nasal tip" },
          { gene: "RUNX2", snp: "rs1200425", chromosome: "6p21.1", allele: "A/A", effect: "Broader nasal bone structure" },
          { gene: "GLI3", snp: "rs2154340", chromosome: "7p13", allele: "G/G", effect: "GLI Family Zinc Finger 3 — nasal cartilage width" }
        ],
        code: "rs8070877(C;C) | DCHS2 variant | GLI3(G;G)",
        frequency: "More common in African, South/SE Asian",
        heritage: "Sub-Saharan African, South Asian"
      }
    }
  },

  // ========== FRECKLES ==========
  freckles: {
    label: "Freckles (Ephelides)",
    category: "skin",
    variants: {
      present: {
        label: "Freckles Present",
        genes: [
          { gene: "MC1R", snp: "rs1805007", chromosome: "16q24.3", allele: "T/T", effect: "MC1R loss-of-function → grouped melanocyte clusters" },
          { gene: "MC1R", snp: "rs1805008", chromosome: "16q24.3", allele: "T/T", effect: "R151C variant — strongest freckle association" },
          { gene: "IRF4", snp: "rs12203592", chromosome: "6p25.3", allele: "T/T", effect: "Interferon regulatory factor 4 — freckle formation" },
          { gene: "ASIP", snp: "rs4911414", chromosome: "20q11.22", allele: "T/T", effect: "Low ASIP — concentrated melanin in spots" }
        ],
        code: "rs1805007(T;T) | rs1805008(T;T) | rs12203592(T;T) | MC1R(R151C)",
        frequency: "~4-5% global, 40%+ in red-haired individuals",
        heritage: "Northern European, especially Celtic"
      },
      absent: {
        label: "No Freckles",
        genes: [
          { gene: "MC1R", snp: "rs1805007", chromosome: "16q24.3", allele: "C/C", effect: "Functional MC1R — even eumelanin distribution" },
          { gene: "IRF4", snp: "rs12203592", chromosome: "6p25.3", allele: "C/C", effect: "No freckle-associated IRF4 variant" }
        ],
        code: "rs1805007(C;C) | rs12203592(C;C) | MC1R wild-type",
        frequency: "~95% global population",
        heritage: "Universal"
      }
    }
  },

  // ========== DIMPLES ==========
  dimples: {
    label: "Cheek Dimples",
    category: "facial",
    variants: {
      present: {
        label: "Dimples Present",
        genes: [
          { gene: "PITX2", snp: "rs45547607", chromosome: "4q25", allele: "variant", effect: "Paired-like homeodomain 2 — facial muscle development" },
          { gene: "FGF3", snp: "rs4954820", chromosome: "11q13.3", allele: "G/G", effect: "Fibroblast growth factor — fascial bifurcation" }
        ],
        code: "PITX2 facial muscle variant | rs4954820(G;G) | Autosomal dominant",
        frequency: "~20-30% population",
        heritage: "Universal, variable penetrance"
      },
      absent: {
        label: "No Dimples",
        genes: [
          { gene: "PITX2", snp: "rs45547607", chromosome: "4q25", allele: "wildtype", effect: "Standard facial muscle attachment — no bifurcation" }
        ],
        code: "PITX2 wild-type | Standard zygomaticus major attachment",
        frequency: "~70-80% population",
        heritage: "Universal"
      }
    }
  }
};
