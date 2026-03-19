from neomodel import (
    StringProperty,
    StructuredNode,
    RelationshipFrom
)

class Pathway(StructuredNode):
    name                            = StringProperty()
    pathway                         = StringProperty()
    organism                            = StringProperty()
    db                              = StringProperty()
    reaction                        = RelationshipFrom('.reaction.Reaction', 'IsReactionOf')
