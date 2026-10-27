/* Exam 3 flashcards; appended after the legacy deck loads. */
(function () {
  var sequence = { "9": 0, "10": 0, "11B": 0 };
  var cards = [];

  function add(chapter, topic, front, back) {
    sequence[chapter]++;
    cards.push({
      id: "exam3-fc-ch" + chapter.toLowerCase() + "-" + String(sequence[chapter]).padStart(3, "0"),
      chapter: "exam3-" + chapter,
      topic: topic,
      front: front,
      back: back
    });
  }

  // Chapter 9: Nutrition and growth
  add("9", "Nutrients", "What elements make up CHNOPS?", "Carbon, hydrogen, nitrogen, oxygen, phosphorus, and sulfur; these are major elements in cell macromolecules.");
  add("9", "Nutrients", "Macronutrient vs. micronutrient: what is the distinction?", "Macronutrients are needed in larger amounts; micronutrients are required in trace amounts. Examples include CHNOPS vs. trace elements such as iron, cobalt, copper, manganese, and zinc.");
  add("9", "Nutrients", "What is a microbial growth factor?", "An organic compound, often a vitamin, that a microbe needs in small amounts; examples in the slides include folic acid and vitamin B12.");
  add("9", "Carbon sources", "What carbon source does a heterotroph use?", "Organic carbon, such as carbohydrates, lipids, or proteins.");
  add("9", "Carbon sources", "What carbon source does an autotroph use?", "Inorganic carbon, commonly carbon dioxide.");
  add("9", "Nutritional types", "What does photo- indicate in a nutritional type?", "Light is the energy source.");
  add("9", "Nutritional types", "What does chemoorgano- indicate?", "Organic chemicals are the energy source.");
  add("9", "Nutritional types", "What does chemolitho- indicate?", "Inorganic chemicals are the energy source.");
  add("9", "Nutritional types", "A microbe uses light for energy and CO2 for carbon. What type is it?", "Photoautotroph.");
  add("9", "Nutritional types", "A microbe uses glucose for both energy and carbon. What type is it?", "Chemoorganoheterotroph.");
  add("9", "Nutrients", "What does nitrogen fixation do?", "Converts atmospheric N2 into ammonium that can be used in biological molecules.");
  add("9", "Nutrients", "Why do cells need sulfur?", "To make sulfur-containing amino acids such as cysteine and methionine and vitamins such as biotin and thiamine.");
  add("9", "Nutrients", "Name three phosphorus-containing cellular materials.", "DNA/RNA, phospholipids, and ATP.");
  add("9", "Oxygen and ROS", "Why can reactive oxygen species harm a cell?", "They are unstable oxidizers that can damage DNA and other cell structures.");
  add("9", "Oxygen and ROS", "What does superoxide dismutase do?", "Converts superoxide into hydrogen peroxide and oxygen.");
  add("9", "Oxygen and ROS", "What does catalase do?", "Breaks hydrogen peroxide down into water and oxygen.");
  add("9", "Oxygen and ROS", "What does peroxidase do?", "Reduces hydrogen peroxide to water using an electron donor.");
  add("9", "Oxygen use", "What is an obligate aerobe?", "An organism that requires oxygen for aerobic respiration.");
  add("9", "Oxygen use", "What is a facultative anaerobe?", "An organism that can grow with or without oxygen, typically growing better when oxygen is available.");
  add("9", "Oxygen use", "What is an aerotolerant anaerobe?", "An organism that does not use oxygen for ATP production but tolerates its presence.");
  add("9", "Oxygen use", "What is a microaerophile?", "An organism that requires oxygen at a concentration lower than that in air.");
  add("9", "Anaerobic culture", "How does thioglycollate medium support anaerobes?", "Its reducing ingredients deplete oxygen; the red region indicates oxygenated medium.");
  add("9", "Anaerobic culture", "What atmosphere does a candle jar create?", "It raises carbon dioxide and lowers oxygen, supporting capnophiles.");
  add("9", "Membrane transport", "What is simple diffusion?", "Passive movement of a solute from high to low concentration directly through the membrane.");
  add("9", "Membrane transport", "What is facilitated diffusion?", "Passive movement down a concentration gradient through a transport protein; it does not directly require ATP.");
  add("9", "Membrane transport", "What is osmosis?", "Net passive movement of water across a selectively permeable membrane.");
  add("9", "Membrane transport", "How does active transport move a solute?", "Against its concentration gradient using energy and a transport protein.");
  add("9", "Membrane transport", "What happens during endocytosis?", "The plasma membrane surrounds material and brings it into the cell in a vesicle.");
  add("9", "Osmosis", "What happens to an unwalled cell in a hypotonic solution?", "Water enters; the cell swells and may lyse.");
  add("9", "Osmosis", "What happens to a cell in a hypertonic solution?", "Water leaves the cell; a walled cell may undergo plasmolysis.");
  add("9", "Temperature", "What are cardinal temperatures?", "An organism's minimum, optimum, and maximum growth temperatures.");
  add("9", "Temperature", "Why is psychrotolerance medically relevant for Listeria monocytogenes?", "It can grow at refrigerator temperatures, so refrigeration does not necessarily prevent its growth.");
  add("9", "pH", "What pH range is optimal for most bacteria in the slides?", "Approximately pH 6.5-7.5.");
  add("9", "pH", "What is an acidophile?", "A microbe adapted to acidic conditions.");
  add("9", "Osmolarity", "Halotolerant vs. halophile: what is the difference?", "A halotolerant organism tolerates salt; a halophile grows best when salt is present.");
  add("9", "Bacterial growth", "What is generation time?", "The time required for a population to double in cell number.");
  add("9", "Bacterial growth", "What happens during lag phase?", "Cells adjust and prepare for growth; population size does not yet increase.");
  add("9", "Bacterial growth", "What happens during log phase?", "The population increases exponentially.");
  add("9", "Bacterial growth", "What defines stationary phase?", "Cell production and cell death occur at approximately equal rates.");
  add("9", "Bacterial growth", "What defines death phase?", "The viable population decreases, typically at a logarithmic rate.");
  add("9", "Bacterial reproduction", "What are the basic steps of binary fission?", "Chromosome replication, cell elongation, septum formation, and separation of daughter cells.");
  add("9", "Culture", "What is a batch culture?", "A closed culture with a fixed starting supply of nutrients and accumulating waste.");

  // Chapter 10: Metabolism
  add("10", "Metabolism", "What is anabolism?", "Biosynthesis that builds molecules and requires energy.");
  add("10", "Metabolism", "What is catabolism?", "Degradation that breaks molecules down and releases energy.");
  add("10", "ATP", "What are the components of ATP?", "Adenine, ribose, and three phosphate groups; ATP is a ribonucleotide.");
  add("10", "ATP", "What happens when ATP is hydrolyzed?", "Its terminal phosphate is removed, forming ADP and inorganic phosphate and releasing usable energy.");
  add("10", "ATP", "Does ATP synthesis from ADP and phosphate require energy?", "Yes. ATP synthesis is an energy-requiring process.");
  add("10", "Enzymes", "What is an enzyme?", "Usually a protein that catalyzes a reaction by lowering activation energy without being permanently changed.");
  add("10", "Enzymes", "What is a substrate?", "The molecule acted on by an enzyme.");
  add("10", "Enzymes", "What is the active site?", "The region of an enzyme that interacts with its substrate.");
  add("10", "Enzymes", "What is induced fit?", "Substrate binding causes the enzyme's active site to adjust to the substrate.");
  add("10", "Enzymes", "What is protein denaturation?", "Loss of the protein's functional structure; heat, pH, alcohol, metals, or UV can cause it.");
  add("10", "Enzymes", "What is a conjugated enzyme?", "An enzyme with a protein portion associated with a nonprotein cofactor.");
  add("10", "Enzyme cofactors", "What is an ion cofactor example and role?", "Mg2+, Fe2+, Zn2+, or Ca2+; an ion can help bridge enzyme and substrate.");
  add("10", "Enzyme cofactors", "What is a coenzyme?", "An organic cofactor that can carry electrons, hydrogen, or chemical groups between molecules.");
  add("10", "Enzyme cofactors", "Name coenzymes in the slides.", "NAD+, NADP+, FAD, and coenzyme A.");
  add("10", "Enzymes", "How does enzyme activity change as substrate concentration rises?", "It rises until enzyme active sites are saturated, then levels off.");
  add("10", "Enzymes", "How can high temperature affect an enzyme?", "Activity rises toward an optimum, then may fall as the enzyme denatures.");
  add("10", "Enzymes", "How can non-optimal pH affect an enzyme?", "It can disrupt interactions that maintain enzyme structure and lower activity.");
  add("10", "Enzyme inhibitors", "How does a competitive inhibitor work?", "It competes with the substrate for the enzyme's active site.");
  add("10", "Enzyme inhibitors", "What is an allosteric (noncompetitive) inhibitor?", "An inhibitor that binds at a regulatory site and changes enzyme activity rather than competing for the active site.");
  add("10", "Redox", "What does OIL RIG mean?", "Oxidation Is Loss of electrons; Reduction Is Gain of electrons.");
  add("10", "Redox", "Why are oxidation and reduction coupled?", "Electrons lost by one molecule must be gained by another molecule.");
  add("10", "Redox", "What is the relationship between H and H+?", "A neutral H atom has one proton and one electron; H+ has lost its electron and is essentially a proton.");
  add("10", "Redox", "What are NAD+ and NADH?", "NAD+ is the oxidized form; NADH is the reduced, electron-carrying form.");
  add("10", "Redox", "What are FAD and FADH2?", "FAD is the oxidized form; FADH2 is the reduced, electron-carrying form.");
  add("10", "Respiration", "What is the terminal electron acceptor in aerobic respiration?", "Oxygen, which is reduced to water.");
  add("10", "Respiration", "What makes respiration anaerobic?", "The terminal electron acceptor is a molecule other than oxygen.");
  add("10", "Glycolysis", "Where does glycolysis occur, and does it require oxygen?", "In the cytoplasm; glycolysis does not require oxygen.");
  add("10", "Glycolysis", "What is the big-picture result of glycolysis?", "One six-carbon glucose is split into two three-carbon molecules, with ATP and NADH produced.");
  add("10", "Krebs cycle", "Where does the Krebs cycle occur in prokaryotes?", "In the cytoplasm.");
  add("10", "Krebs cycle", "Where does the Krebs cycle occur in eukaryotes?", "In the mitochondrial matrix.");
  add("10", "Krebs cycle", "What do NAD+ and FAD do during central metabolism?", "They accept electrons and become NADH and FADH2, which carry electrons to the ETC.");
  add("10", "ETC", "Where is the ETC located in bacteria and eukaryotes?", "In the bacterial plasma membrane and the eukaryotic inner mitochondrial membrane.");
  add("10", "ETC", "What is the proton motive force?", "Potential energy stored in an H+ gradient across a membrane.");
  add("10", "Chemiosmosis", "What powers ATP synthase during chemiosmosis?", "H+ moving down its gradient through ATP synthase.");
  add("10", "Respiration", "What ATP yield does the lecture estimate for aerobic glucose respiration?", "About 38 ATP per glucose in prokaryotes and 36 in eukaryotes, using the course slide estimate.");
  add("10", "Fermentation", "How does fermentation differ from respiration?", "Fermentation has no ETC or external terminal electron acceptor; electrons are transferred to pyruvate or a derivative.");
  add("10", "Fermentation", "How much ATP per glucose does fermentation yield in the slides?", "About 2 ATP, made directly during glycolysis.");
  add("10", "Fermentation", "Can fermentation occur when oxygen is present?", "Yes. Fermentation does not use oxygen, but it can occur in its presence.");
  add("10", "Fermentation", "What are common fermentation waste products?", "Often organic acids and sometimes gases; the exact products depend on the organism and pathway.");
  add("10", "Fermentation", "Which organisms are associated with lactic acid fermentation in the slides?", "Streptococcus, Lactobacillus, and fungi are listed.");
  add("10", "Fermentation", "Which group is primarily associated with ethanol fermentation?", "Yeasts.");

  // Chapter 11B: Chemical control
  add("11B", "Effectiveness levels", "What does high-level chemical control mean?", "It can kill endospores and may be used as a sterilant when appropriately applied.");
  add("11B", "Effectiveness levels", "What does intermediate-level control target?", "Fungal spores, resistant pathogens such as Mycobacterium, and viruses, as described in the slides.");
  add("11B", "Effectiveness levels", "What does low-level control target?", "Vegetative cells and some viruses.");
  add("11B", "Terminology", "What does -cide mean?", "Kills the named kind of microorganism, as in bactericide or fungicide.");
  add("11B", "Terminology", "What does -static mean?", "Inhibits growth without necessarily killing; growth may resume after the agent is removed.");
  add("11B", "Phenolics", "How do phenolics affect microbes?", "They disrupt membranes and denature proteins; the slides describe them as low- to intermediate-level disinfectants, not sporicides.");
  add("11B", "Phenolics", "Name a phenolic product from the slides.", "Lysol.");
  add("11B", "Phenolics", "Why was triclosan restricted in some products?", "The study guide notes concerns about selecting for resistance and endocrine disruption.");
  add("11B", "Halogens", "How do halogens such as iodine and chlorine act?", "They denature proteins and interfere with disulfide bonds.");
  add("11B", "Halogens", "What is Betadine?", "An iodine iodophor used as a skin or wound antiseptic.");
  add("11B", "Halogens", "How does sodium hypochlorite work in water?", "It generates hypochlorous acid, a strong oxidizing agent that denatures enzymes.");
  add("11B", "Alcohols", "How do alcohols control microbes?", "At useful concentrations they disrupt membranes and denature proteins; they evaporate quickly and are used for degerming.");
  add("11B", "Alcohols", "Do alcohols reliably kill endospores?", "No. The slides also note that some non-enveloped viruses resist alcohol.");
  add("11B", "Peroxygens", "How do peroxygens work?", "They oxidize cellular components; hydrogen peroxide is an example.");
  add("11B", "Peroxygens", "What can decompose hydrogen peroxide?", "Light, metals, or catalase.");
  add("11B", "Surfactants", "How do soaps help remove microbes?", "They lower surface tension and emulsify material, helping mechanically remove microbes; soap is a poor antiseptic.");
  add("11B", "Surfactants", "What are quats and how do they act?", "Quaternary ammonium compounds are cationic detergents that disrupt membranes; the slides classify them as low-level antiseptics.");
  add("11B", "Heavy metals", "How do heavy metals control microbes?", "They inactivate proteins, even at low concentrations.");
  add("11B", "Heavy metals", "Which silver use is mentioned in the slides?", "Silver compounds are used in burn creams, dressings, catheters, and athletic wear.");
  add("11B", "Gaseous sterilants", "What is ethylene oxide used for?", "Sterilizing heat-sensitive medical devices in a closed chamber; it penetrates materials but needs exposure time.");
  add("11B", "Gaseous sterilants", "What are important ethylene oxide hazards?", "It is explosive and carcinogenic.");
  add("11B", "Aldehydes", "How do aldehydes control microbes?", "They inactivate proteins and DNA by cross-linking; they are alkylating agents.");
  add("11B", "Aldehydes", "What are glutaraldehyde uses listed in the slides?", "Sterilizing hospital instruments and preserving tissue specimens.");
  add("11B", "Aldehydes", "What are formaldehyde uses listed in the slides?", "Preserving tissue, embalming, and killing microbes in vaccines; toxicity limits its use.");
  add("11B", "Use scenarios", "A heat-sensitive instrument needs sterilization. Which listed agent may be appropriate?", "Ethylene oxide in a closed chamber, following validated handling and exposure requirements.");
  add("11B", "Use scenarios", "Why is an antiseptic used on living tissue rather than an ordinary disinfectant?", "Antiseptics are intended for living tissue; disinfectants are used on inanimate surfaces.");

  Array.prototype.push.apply(FLASHCARDS, cards);
})();