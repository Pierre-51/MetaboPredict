from neomodel import (
    StringProperty,
    StructuredNode,
    RelationshipTo
)


class Enzyme(StructuredNode):
    name                            = StringProperty()
    reaction                         = RelationshipTo('.reaction.Reaction', 'Catalyses')
