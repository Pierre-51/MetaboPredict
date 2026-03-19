from .models import Enzyme
from .models import Reaction
from .models import Molecule
from .models import Pathway

from neomodel import db

from MetaboPredict2023.constants import TEST, ALL, BACT, NODES, MOLS

MODEL_ENTITIES = {
    'Enzyme': Enzyme,
    'Reaction': Reaction,
    'Molecule': Molecule,
    'Pathway': Pathway
}


# def filter_nodes(node_type):
def fetch_nodes():
    return NODES


def fetch_all():
    return ALL


def fetch_test():
    return TEST


def fetch_PnotR(nom):
    results, meta = db.cypher_query(
        '''
        Match (m:Molecule) where m.name contains "''' + nom + '''"
        match (m) -[]-> (t)
        WHERE NOT EXISTS {(m) <-[]- (r) where "Akkermansia_muciniphila" in r.organism } and exists {(m) -[]-> (t) where "Akkermansia_muciniphila" in t.organism}
        match (m:Molecule) <-[]- (r)
        Return m.name as Molecule, collect(distinct r.organism) as De_organism,collect(distinct t.organism) as Vers_organism
        ''')
    results2, meta = db.cypher_query(
        '''
        Match (m:Molecule) where m.name contains "''' + nom + '''"
        match (m) -[]-> (t)
        WHERE NOT EXISTS {(m) <-[]- (r) where "Roseburia_intestinalis" in r.organism } and exists {(m) -[]-> (t) where "Roseburia_intestinalis" in t.organism}
        match (m:Molecule) <-[]- (r)
        Return m.name as Molecule, collect(distinct r.organism) as De_organism,collect(distinct t.organism) as Vers_organism
        ''')
    results3, meta = db.cypher_query(
        '''
        Match (m:Molecule) where m.name contains "''' + nom + '''"
        match (m) -[]-> (t)
        WHERE NOT EXISTS {(m) <-[]- (r) where "Salmonella_Heidelberg" in r.organism } and exists {(m) -[]-> (t) where "Salmonella_Heidelberg" in t.organism}
        match (m:Molecule) <-[]- (r)
        Return m.name as Molecule, collect(distinct r.organism) as De_organism,collect(distinct t.organism) as Vers_organism
            ''')
    results4, meta = db.cypher_query(
        '''
        Match (m:Molecule) where m.name contains "''' + nom + '''"
        match (m) -[]-> (t)
        WHERE NOT EXISTS {(m) <-[]- (r) where "Bacteroides_fragilis" in r.organism } and exists {(m) -[]-> (t) where "Bacteroides_fragilis" in t.organism}
        match (m:Molecule) <-[]- (r)
        Return m.name as Molecule, collect(distinct r.organism) as De_organism,collect(distinct t.organism) as Vers_organism
            ''')
    for row in results:
        for a in results2:
            if row[0] == a[0]:
                del results2[results2.index(a)]
    results += results2
    for row in results:
        for e in results3:
            if row[0] == e[0]:
                del results3[results3.index(e)]
    results += results3
    for row in results:
        for d in results4:
            if row[0] == d[0]:
                del results4[results4.index(d)]
    results += results4

    for row in results:
        b = set()
        c = set()
        {b.add(item) for sublist in row[1] for item in sublist}
        {c.add(item) for sublist in row[2] for item in sublist}
        row[1] = ', '.join(list(b))
        row[2] = ', '.join(list(c))

    return results


def fetch_rxn(nom):
    # state = fetch_label(nom)
    # if state == "Molecule":
    results, meta = db.cypher_query(
        '''
        Match (m:Molecule) where m.name contains "''' + nom + '''"
        Match(r:Reaction) <-[a]-> (m) 
        Match(e) <-[c]-> (r) 
        RETURN Distinct r.name as reaction, r.produit AS produits, r.reactif AS reactifs, r.organism AS organism
        
        Union 
        
        Match (r:Reaction) where r.name contains "''' + nom + '''"
        Match(r) <-[a]-> (m:Molecule) 
        Match(e) <-[c]-> (r) 
        RETURN Distinct r.name as reaction, r.produit AS produits, r.reactif AS reactifs, r.organism AS organism        
        ''')
    results2, meta2 = db.cypher_query(
        '''
        Match(m:Molecule) WHERE m.name contains "''' + nom + '''"
        Match(r:Reaction) <-[a]-> (m) 
        Match(e) <-[c]-> (r) 
        where e:Pathway
        return Distinct r.name,COLLECT(DISTINCT e.name) AS pathway   
             
        Union 
        
        Match (r:Reaction) where r.name contains "''' + nom + '''"
        Match(r) <-[a]-> (m:Molecule) 
        Match(e) <-[c]-> (r) 
        where e:Pathway
        return Distinct r.name,COLLECT(DISTINCT e.name) AS pathway   
        ''')
    i = 0
    for row in results:
        if not results2:
            row.append("null")
        else:
            if row[0] == results2[i][0]:
                row.append(results2[i][1])
                i += 1
            else:
                row.append("null")

    results3, meta3 = db.cypher_query(
        '''
            MATCH(m:Molecule) WHERE m.name CONTAINS "''' + nom + '''"
            MATCH(r: Reaction) < -[a]->(m)
            MATCH(e) < -[c]->(r)
            WHERE e: Enzyme
            RETURN Distinct r.name,COLLECT(DISTINCT e.name) AS enzyme 
                        
            Union 
            
            Match (r:Reaction) where r.name contains "''' + nom + '''"
            Match(r) <-[a]-> (m:Molecule) 
            MATCH(e) < -[c]->(r)
            WHERE e: Enzyme
            RETURN Distinct r.name,COLLECT(DISTINCT e.name) AS enzyme 
        ''')
    j = 0
    for row in results:
        if not results3:
            row.append("null")
        else:
            if j >= len(results3):
                row.append("null")
            elif row[0] == results3[j][0]:
                row.append(results3[j][1])
                j += 1
            else:
                row.append("null")

        row[1] = ', '.join(list(row[1]))
        row[2] = ', '.join(list(row[2]))
        row[3] = ', '.join(list(row[3]))
        row[4] = ', '.join(list(row[4]))
        row[5] = ', '.join(list(row[5]))

    return results


def fetch_label(nom):
    result = db.cypher_query(
        '''
    match (n)
    where toLower(n.name) CONTAINS toLower("''' + nom + '''")
    return labels(n)[0]''')
    if len({item for sublist in result[0] for item in sublist}) > 1:
        return "TwoOrMore"
    else:
        return result[0][0][0]


def fetch_path(mol1, mol2):
    result = db.cypher_query(
        '''
            MATCH
            path = (start:Molecule {name: "''' + mol1 + '''"}) - [*0..10]->(end:Molecule {name: "''' + mol2 + '''"})
            WHERE NONE(n IN nodes(path)
            WHERE n.name IN["PROTON", "WATER", "ATP", "ADP", "OXYGEN-MOLECULE", "NADPH", "NADP", "Pi", "NAD", "NADH", "CO-A", "PPI", "UDP", "AMP", "Donor-H2", "Acceptor", "GDP", "NAD-P-OR-NOP", "NADH-P-OR-NOP", "GTP", "3-5-ADP"])
            match(p: Pathway) < -[]->(r:Reaction)
            where r in nodes(path)
            match(e: Enzyme) < -[]->(r:Reaction)
            where r in nodes(path)
            RETURN Distinct r.name as reaction, r.produit AS produits, r.reactif AS reactifs, r.organism AS organism,Collect ( distinct p.name),collect(distinct e.name)        
            ''')
    for row in result[0]:
        row[1] = ', '.join(list(row[1]))
        row[2] = ', '.join(list(row[2]))
        row[3] = ', '.join(list(row[3]))
        row[4] = ', '.join(list(row[4]))
        row[5] = ', '.join(list(row[5]))

    return result[0]


def fetch_organism():
    return BACT


def fetch_molecule():
    return MOLS


def fetch_reaction():
    return Reaction.nodes


def fetch_pathway():
    return Pathway.nodes


def fetch_enzyme():
    return Enzyme.nodes
