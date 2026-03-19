from neomodel import db



mols = db.cypher_query(
    '''
    Match(m:Molecule) WHERE m.name contains "GLUCOSAMINE"
    Match(r:Reaction) -[a:Produces|Takes]-> (m)
    Match(e:Enzyme) <-[b:Catalyses]- (r)
    Return m.name
    '''
    )[0]

TEST =  sorted([mol[0] for mol in mols])


all = db.cypher_query(
    '''
    Match(n)
    return n.name
    ORDER BY n.name
    '''
)[0]

ALL = sorted(al[0] for al in all)

bact = db.cypher_query(
    '''
    MATCH (n:Reaction)
    UNWIND n.organism AS x
    RETURN collect(distinct x)
    '''
)[0]

BACT = sorted(bac[0] for bac in bact)

Nodes = db.cypher_query(
    '''
    MATCH (a)
    RETURN distinct labels(a)[0]
    '''
    )[0]

NODES = sorted(Node[0] for Node in Nodes)

mols = db.cypher_query(
    '''
    MATCH (n:Molecule)
    UNWIND n.name AS x
    RETURN collect(distinct x)
    '''
)[0]

MOLS = sorted(mol[0] for mol in mols)