from neomodel import (
    StringProperty,
    StructuredNode,
    RelationshipTo,
    RelationshipFrom
)


class Reaction(StructuredNode):
    name                            = StringProperty()
    organism                            = StringProperty()
    produit                         = StringProperty()
    reactif                         = StringProperty()
    db                              = StringProperty()
    cell_type                       = StringProperty()
    molecule                        = RelationshipTo('.molecule.Molecule', 'Produces')
    molecule                        = RelationshipFrom('.molecule.Molecule', 'Substrates')
    enzyme                          = RelationshipFrom('.enzyme.Enzyme', 'Catalyses')
    pathway                         = RelationshipTo('.pathway.Pathway', 'IsReactionOf')
