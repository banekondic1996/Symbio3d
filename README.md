# <img width="64" height="64" alt="Symbio3D" src="https://github.com/banekondic1996/Symbio3d/blob/main/Symbio3D.png?raw=true" /> Symbio3d - Gene Modeler — 3D Human Trait Visualizer 
**Warning: This is just testing concept, and not for usage. It's badly made, don't try it!!!**<br>
Maybe in some distant future I work on it, but for now it's concept
<br>

A desktop NW.js application that lets you build a 3D human model by selecting real genetic traits, then outputs the actual SNP gene codes associated with each phenotype.

## Features

- **3D Human Model** built with Three.js — real-time updates as you select traits
- **Real SNP Gene Codes** — based on published GWAS studies and peer-reviewed research
- **Trait Categories:**
  - 👁 Eye Color (blue, green, hazel, brown — OCA2, HERC2, MC1R variants)
  - 💇 Hair Color (blonde, red, brown, black — MC1R, KITLG, SLC45A2)
  - 🌀 Hair Texture (straight, wavy, curly — TCHH, EDAR, WNT10A)
  - 🌍 Skin Tone (6 Fitzpatrick types — SLC24A5, MC1R, ASIP)
  - 📏 Height Tendency (short/average/tall — HMGA2, GDF5, IGF1R)
  - 👃 Nose Shape (narrow/broad — DCHS2, RUNX2)
  - 🔴 Freckles (MC1R R151C, IRF4)
  - 😊 Dimples (PITX2, FGF3)

- **Gene Code Output** panel shows:
  - Gene name and chromosome location
  - SNP ID (rs numbers)
  - Allele genotype
  - Biological mechanism
  - Population frequency
  - Heritage associations

## Running as a Web App (Alternative)

Just open `index.html` in Chrome/Firefox — it works as a standalone web app too, since NW.js uses Chromium under the hood.

## Gene Code References

The SNP codes are based on real published research:
- **OCA2/HERC2** rs12913832: Eiberg et al. (2008), *Human Genetics*
- **MC1R** variants: Valverde et al. (1995), *Nature Genetics*
- **SLC24A5** rs1426654: Lamason et al. (2005), *Science*
- **HMGA2** rs1042725: Weedon et al. (2007), *Nature Genetics*
- **TCHH** rs11803731: Medland et al. (2009), *American Journal of Human Genetics*
- **DCHS2** rs8070877: Cole et al. (2016), *Nature Genetics*


**This needs proper 3d rendering functions and models to work as I want it.**
<img width="1534" height="1024" alt="image" src="https://github.com/user-attachments/assets/9cd67448-78a3-4844-82d9-04b56a4f8786" />



---

*Note: This is an educational visualization tool. Genetic traits are polygenic and complex — this represents simplified, illustrative associations.*
