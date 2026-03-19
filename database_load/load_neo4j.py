"""
load_to_neo4j.py
────────────────
Loads the MetaboPredict dataset into Neo4j.

Usage
-----
1. Make sure Neo4j is running (bolt://localhost:7687)
2. Put all the .txt data files in the SAME folder as this script,
   OR edit DATA_DIR below to point to wherever they are.
3. Run:
       pip install neo4j
       python load_to_neo4j.py

Adjust NEO4J_URI / NEO4J_USER / NEO4J_PASSWORD if needed.
"""

import os
from neo4j import GraphDatabase

# ── Configuration ──────────────────────────────────────────────────────────────
NEO4J_URI      = "bolt://localhost:7687"
NEO4J_USER     = "neo4j"
NEO4J_PASSWORD = "12345678"

# Folder that contains all the .txt files (default: same folder as this script)
DATA_DIR = os.path.dirname(os.path.abspath(__file__))

# ── File lists (mirror db_path_1noeud.py) ─────────────────────────────────────
REF_MOL_FILES = [
    "Mol_bf.txt",
    "Mol_sh.txt",
    "Mol_hs.txt",
    "Mol_rp.txt",
    "Mol_ri.txt",
    "Mol_akk.txt",
]

BACTERIA_FILES = [
    "Bacteroides_fragilis.txt",
    "Salmonella_Heidelberg.txt",
    "Roseburia_intestinalis.txt",
    "Human.txt",
    "Akkermansia_muciniphila.txt",
    "Ralsonia_pickettii.txt",
]

REACTOME_FILES = [
    "macrophage.txt",
    "enterocyte.txt",
]


def p(filename):
    """Return full path for a data file."""
    return os.path.join(DATA_DIR, filename)


# ── Neo4j driver wrapper ───────────────────────────────────────────────────────
class Neo4jLoader:
    def __init__(self, uri, user, password):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))

    def close(self):
        self.driver.close()

    def _run(self, query, **params):
        with self.driver.session() as session:
            session.run(query, **params)

    # ── Schema / constraints ──────────────────────────────────────────────────
    def create_constraints(self):
        """Unique constraints speed up MERGE operations significantly."""
        constraints = [
            "CREATE CONSTRAINT IF NOT EXISTS FOR (m:Molecule)  REQUIRE m.name IS UNIQUE",
            "CREATE CONSTRAINT IF NOT EXISTS FOR (r:Reaction)  REQUIRE r.name IS UNIQUE",
            "CREATE CONSTRAINT IF NOT EXISTS FOR (e:Enzyme)    REQUIRE e.name IS UNIQUE",
            "CREATE CONSTRAINT IF NOT EXISTS FOR (p:Pathway)   REQUIRE p.name IS UNIQUE",
        ]
        for c in constraints:
            try:
                self._run(c)
            except Exception:
                pass  # Older Neo4j versions may use different syntax; ignore

    # ── Clear database ────────────────────────────────────────────────────────
    def clear_all(self):
        print("⚠  Clearing existing graph …")
        self._run("MATCH (n) DETACH DELETE n")

    # ── Nodes ─────────────────────────────────────────────────────────────────
    def merge_molecule(self, name, chebi_refs):
        self._run(
            "MERGE (m:Molecule {name: $name}) "
            "SET m.short_name = $short, m.chEBI = $chebi",
            name=name,
            short=name[:5],
            chebi=list(chebi_refs),
        )

    def merge_enzyme(self, ec):
        self._run("MERGE (:Enzyme {name: $ec})", ec=ec)

    def merge_pathway(self, name, organisms, db):
        self._run(
            "MERGE (p:Pathway {name: $name}) "
            "SET p.organism = $org, p.db = $db",
            name=name,
            org=list(organisms),
            db=list(db) if isinstance(db, set) else db,
        )

    def merge_reaction(self, name, organisms, reactants, products, dbs, cell_types):
        self._run(
            "MERGE (r:Reaction {name: $name}) "
            "SET r.organism   = $org, "
            "    r.reactif    = $reactif, "
            "    r.produit    = $produit, "
            "    r.db         = $db, "
            "    r.cell_type  = $cell_type",
            name=name,
            org=list(organisms),
            reactif=reactants,
            produit=products,
            db=list(dbs),
            cell_type=list(cell_types),
        )

    # ── Relationships ─────────────────────────────────────────────────────────
    def link_catalyses(self, ec, reaction):
        self._run(
            "MATCH (e:Enzyme  {name: $ec}) "
            "MATCH (r:Reaction{name: $rxn}) "
            "MERGE (e)-[:Catalyses]->(r)",
            ec=ec, rxn=reaction,
        )

    def link_substrates(self, mol, reaction):
        self._run(
            "MATCH (m:Molecule{name: $mol}) "
            "MATCH (r:Reaction{name: $rxn}) "
            "MERGE (m)-[:Substrates]->(r)",
            mol=mol, rxn=reaction,
        )

    def link_produces(self, mol, reaction):
        self._run(
            "MATCH (m:Molecule{name: $mol}) "
            "MATCH (r:Reaction{name: $rxn}) "
            "MERGE (r)-[:Produces]->(m)",
            mol=mol, rxn=reaction,
        )

    def link_reaction_of(self, pathway, reaction):
        self._run(
            "MATCH (p:Pathway {name: $path}) "
            "MATCH (r:Reaction{name: $rxn}) "
            "MERGE (r)-[:IsReactionOf]->(p)",
            path=pathway, rxn=reaction,
        )


# ── Parsing helpers ────────────────────────────────────────────────────────────
def split(s, sep="//"):
    return [x.strip() for x in s.split(sep)]


def parse_mol_files(files):
    """
    Mol_*.txt format:  name \\t chEBI_id \\t molecule_id
    Returns dict: molecule_id -> set of chEBI ids
    """
    dict_mol = {}
    for fname in files:
        fpath = p(fname)
        if not os.path.exists(fpath):
            print(f"  [WARN] {fname} not found, skipping.")
            continue
        with open(fpath, encoding="utf-8") as fh:
            for line in fh:
                line = line.replace(" ", "").strip()
                if not line:
                    continue
                parts = line.split("\t")
                if len(parts) < 3:
                    continue
                _name, ref, mol_id = parts[0], parts[1], parts[2]
                mol_ids = split(mol_id)
                refs    = split(ref)
                for i, mid in enumerate(mol_ids):
                    chebi = refs[i] if i < len(refs) else ""
                    if mid not in dict_mol:
                        dict_mol[mid] = set()
                    dict_mol[mid].add(chebi)
    return dict_mol


def parse_bacteria_files(files):
    """
    Bacteria .txt format:  reaction \\t pathway(s) \\t EC \\t reactants [\\t products]
    Returns (dico_reactions, dico_paths, ensemble_ec)
    """
    dico      = {}   # reaction_name -> {...}
    dico_path = {}   # pathway_name  -> {db, organism}
    ensemble_ec = set()

    for fname in files:
        fpath = p(fname)
        if not os.path.exists(fpath):
            print(f"  [WARN] {fname} not found, skipping.")
            continue
        organism = fname[:-4]  # strip .txt
        with open(fpath, encoding="utf-8") as fh:
            for line in fh:
                line = line.replace(" ", "").strip()
                if not line:
                    continue
                parts = line.split("\t")
                if len(parts) == 4:
                    reaction, pathway, ec, reactif = parts
                    produit = ""
                elif len(parts) >= 5:
                    reaction, pathway, ec, reactif, produit = parts[:5]
                else:
                    continue

                pathways = split(pathway)
                reactants = split(reactif)
                products  = split(produit) if produit else []
                ecs       = split(ec)

                if reaction not in dico:
                    dico[reaction] = {
                        "pathway":       set(pathways),
                        "db":            {"Biocyc"},
                        "produit":       products,
                        "reactif":       reactants,
                        "EC":            ecs,
                        "organism":      {organism},
                        "cellular_type": {""},
                    }
                else:
                    dico[reaction]["organism"].update({organism})
                    dico[reaction]["pathway"].update(pathways)

                for ec_entry in ecs:
                    ensemble_ec.add(ec_entry)

                for pw in pathways:
                    if pw not in dico_path:
                        dico_path[pw] = {"db": {"Biocyc"}, "organism": {organism}}
                    else:
                        dico_path[pw]["organism"].add(organism)

                ensemble_ec.update(ecs)

    return dico, dico_path, ensemble_ec


def parse_reactome_files(files, dict_mol, dico):
    """
    Reactome .txt format:
      reaction \\t pathway \\t EC \\t reactants \\t ref_reactants [\\t products \\t ref_products]
    Mutates dico and dict_mol in place.
    Returns updated (dico, dico_path, ensemble_ec)
    """
    dico_path   = {}
    ensemble_ec = set()

    for fname in files:
        fpath = p(fname)
        if not os.path.exists(fpath):
            print(f"  [WARN] {fname} not found, skipping.")
            continue
        cell_type = fname[:-4]
        with open(fpath, encoding="utf-8") as fh:
            for line in fh:
                line = line.replace(" ", "").strip()
                if not line:
                    continue
                parts = line.split("\t")
                if len(parts) == 7:
                    reaction, pathway, ec, reactif, ref_reac, produit, ref_produit = parts
                elif len(parts) == 6:
                    reaction, pathway, ec, reactif, ref_reac, produit = parts
                    ref_produit = ""
                elif len(parts) == 5:
                    reaction, pathway, ec, reactif, ref_reac = parts
                    produit = ""
                    ref_produit = ""
                else:
                    continue

                ref_reac_list    = split(ref_reac)
                ref_produit_list = split(ref_produit) if ref_produit else []
                reactants        = split(reactif)
                products         = split(produit) if produit else []

                # Replace ChEBI refs with molecule names from dict_mol
                for j, ref in enumerate(ref_reac_list):
                    if ref:
                        for mol, refs in dict_mol.items():
                            if ref in refs:
                                if j < len(reactants):
                                    reactants[j] = mol
                                break

                for k, ref in enumerate(ref_produit_list):
                    if ref:
                        for mol, refs in dict_mol.items():
                            if ref in refs:
                                if k < len(products):
                                    products[k] = mol
                                break

                # Try to match with an existing reaction (same reactants & products)
                matched = False
                for react_name, data in dico.items():
                    if data["produit"] == products and data["reactif"] == reactants:
                        data["db"].add("Reactome")
                        data["pathway"].add(pathway)
                        if data["cellular_type"] != {""}:
                            data["cellular_type"].add(cell_type)
                        else:
                            data["cellular_type"] = {cell_type}
                        matched = True
                        break

                if not matched:
                    dico[reaction] = {
                        "pathway":       {pathway},
                        "db":            {"Reactome"},
                        "produit":       products,
                        "reactif":       reactants,
                        "EC":            split(ec),
                        "organism":      {"Human"},
                        "cellular_type": {cell_type},
                    }

                ecs = split(ec)
                ensemble_ec.update(ecs)

                pw = pathway
                if pw not in dico_path:
                    dico_path[pw] = {"db": {"Reactome"}, "organism": {"Human"}}
                else:
                    dico_path[pw]["organism"].add("Human")

                # Update dict_mol with reactome molecules
                for i, mol in enumerate(reactants):
                    ref = ref_reac_list[i] if i < len(ref_reac_list) else ""
                    dict_mol[mol] = {ref}
                for i, mol in enumerate(products):
                    if mol:
                        ref = ref_produit_list[i] if i < len(ref_produit_list) else ""
                        dict_mol[mol] = {ref}

    return dico_path, ensemble_ec


# ── Main ───────────────────────────────────────────────────────────────────────
def main():
    print("Connecting to Neo4j …")
    db = Neo4jLoader(NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD)
    db.create_constraints()
    db.clear_all()

    # 1. Parse molecule reference files
    print("Parsing molecule reference files …")
    dict_mol = parse_mol_files(REF_MOL_FILES)
    print(f"  → {len(dict_mol)} unique molecules found")

    # 2. Parse bacteria / human pathway files
    print("Parsing bacteria/human pathway files …")
    dico, dico_path, ec_set = parse_bacteria_files(BACTERIA_FILES)
    print(f"  → {len(dico)} reactions, {len(dico_path)} pathways, {len(ec_set)} EC numbers")

    # 3. Parse Reactome cell-type files
    print("Parsing Reactome cell-type files …")
    reactome_paths, reactome_ecs = parse_reactome_files(REACTOME_FILES, dict_mol, dico)
    dico_path.update(reactome_paths)
    ec_set.update(reactome_ecs)
    print(f"  → After Reactome: {len(dico)} reactions, {len(dico_path)} pathways")

    # ── Write nodes ────────────────────────────────────────────────────────────
    print(f"Writing {len(dict_mol)} Molecule nodes …")
    for mol, refs in dict_mol.items():
        db.merge_molecule(mol, refs)

    print(f"Writing {len(ec_set)} Enzyme nodes …")
    for ec in ec_set:
        if ec:
            db.merge_enzyme(ec)

    print(f"Writing {len(dico_path)} Pathway nodes …")
    for path, meta in dico_path.items():
        db.merge_pathway(path, meta["organism"], meta["db"])

    print(f"Writing {len(dico)} Reaction nodes …")
    for name, data in dico.items():
        db.merge_reaction(
            name,
            data["organism"],
            data["reactif"],
            data["produit"],
            data["db"],
            data["cellular_type"],
        )

    # ── Write relationships ────────────────────────────────────────────────────
    print("Writing relationships …")
    rel_count = 0
    for name, data in dico.items():
        for pw in data["pathway"]:
            db.link_reaction_of(pw, name)
            rel_count += 1

        for ec in data["EC"]:
            if ec:
                db.link_catalyses(ec, name)
                rel_count += 1

        for mol in data["produit"]:
            if mol:
                db.link_produces(mol, name)
                rel_count += 1

        for mol in data["reactif"]:
            if mol:
                db.link_substrates(mol, name)
                rel_count += 1

    print(f"  → {rel_count} relationships created")

    db.close()
    print("\n✅ Done! Open http://localhost:7474 in your browser to explore the graph.")


if __name__ == "__main__":
    main()