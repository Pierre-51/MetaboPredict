from neomodel import (
    StringProperty,
    StructuredNode,
    RelationshipFrom,
    RelationshipTo
)


class Molecule(StructuredNode):
    name                            = StringProperty()
    short_name                      = StringProperty()
    chEBI                           = StringProperty()
    reaction                        = RelationshipFrom('.reaction.Reaction', 'Produces')
    reaction                        = RelationshipTo('.reaction.Reaction', 'Substrates')
