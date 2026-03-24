function CocultureInit(bact) {
    // Construction de la requête Cypher
    mol1 = document.getElementById('MOL')
    mol = mol1.value
    if (mol == ""){
        let query = '';
        // Création des clauses MATCH pour chaque bactérie
        for (let i = 0; i < bact.length; i++) {
          const currentBacterium = bact[i];
          const otherBacteria = bact.filter(b => b !== currentBacterium);

          // MATCH pour les relations sortantes
          query += `
            MATCH (m:Molecule)
            MATCH (m)-[a]->(t)
            WHERE NOT EXISTS { (m)<-[]-(r) WHERE "${currentBacterium}" IN r.organism }
              AND EXISTS { (m)-[]->(t) WHERE "${currentBacterium}" IN t.organism }
            MATCH (m:Molecule)<-[b]-(r)
            WHERE ${otherBacteria.map(b => `"${b}" IN r.organism`).join(' OR ')}
            RETURN *
          `;

          // Ajout d'une clause UNION sauf pour la dernière bactérie
          if (i < bact.length - 1) {
            query += 'UNION';
          }
        }

        // MATCH pour les réactions impliquant toutes les bactéries
        query += `
          UNION
          MATCH (r:Reaction)
          WHERE ${bact.map(b => `"${b}" IN r.organism`).join(' AND ')}
          MATCH (r)<-[a]->(m:Molecule)
          Where not m.name in ["PROTON", "WATER", "ATP", "ADP", "OXYGEN-MOLECULE", "NADPH",   "NADP", "Pi", "NAD", "NADH", "CO-A", "PPI", "UDP", "AMP",  "Donor-H2", "Acceptor", "GDP", "NAD-P-OR-NOP", "NADH-P-OR-NOP", "GTP", "3-5-ADP"]
          MATCH (r)<-[b]->(t)
          Where not t.name in ["PROTON", "WATER", "ATP", "ADP", "OXYGEN-MOLECULE", "NADPH",   "NADP", "Pi", "NAD", "NADH", "CO-A", "PPI", "UDP", "AMP",  "Donor-H2", "Acceptor", "GDP", "NAD-P-OR-NOP", "NADH-P-OR-NOP", "GTP", "3-5-ADP"]
          RETURN *
        `;
        console.log(query)
        console.log(NEO4J_CONFIG)
        var config = {
            containerId: "viz",
            neo4j: {
                serverUrl: NEO4J_CONFIG.serverUrl,
                serverUser: NEO4J_CONFIG.serverUser,
                serverPassword: NEO4J_CONFIG.serverPassword,
                driverConfig: {
                    encrypted: "ENCRYPTION_ON",
                    trust: "TRUST_SYSTEM_CA_SIGNED_CERTIFICATES",
                }
            },

            visConfig: {
                interaction: {
                    navigationButtons: true,
                    tooltipDelay: 0,
                    hideEdgesOnDrag: true,
                },
                nodes: {
                    font: {
                        color: '#343434',
                        strokeWidth: 0,
                        face: 'arial'
                    },
                    shape: 'dot'
                },
                physics: {
                    stabilization: false,
                    },
                edges: {
                    smooth: {
                        forceDirection: "none",
                        type: "continuous",
                      },
                    font: {
                        face: 'arial',
                        strokeWidth: 10, // px
                        vadjust: 0,
                    },
                    scaling: {
                        max: 2
                    },
                    arrows: {
                        to: {
                            enabled: true,
                            scaleFactor: 1
                        }
                    },
                    arrowStrikethrough: false,
                }
            },
            labels: {
                Molecule: {
                    label: "short_name",
                    [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
                        static: {
                            value: 3.0,
                            color: '#8CACD3'
                        },
                        function: {
                            title: NeoVis.objectToTitleString
                        },
                    }
                },
                Enzyme: {
                    // label: "name",
                    [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
                        static: {
                            value: 3.0,
                            color: '#F5DF4D'
                        },
                        function: {
                            title: NeoVis.objectToTitleHtml
                        },
                    }
                },
                Pathway: {
                    // label: "name",
                    [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
                        static: {
                            value: 3.0,
                            color: '#FF8A33'
                        },
                        function: {
                            title: NeoVis.objectToTitleHtml
                        },
                    }
                },
                Reaction: {
                    [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
                        static: {
                            value: 3.5,
                            color: '#F0A1BF'
                        },
                        function: {
                            title: NeoVis.objectToTitleString
                        },
                    }
                }
            },

            initialCypher: query

        };

        viz = new NeoVis.default(config);

        viz.render()

        console.log(viz);

        viz.registerOnEvent("clickNode", function (params) {
              params.event = "[original event]";
              var json = JSON.stringify(params, null, 4);
              var json2 = JSON.parse(json);
              $('#viz2').show();
              ReactZoom(json2.node.raw.properties.name)
            });
    }
    else {
        let query = '';
        // Création des clauses MATCH pour chaque bactérie
        for (let i = 0; i < bact.length; i++) {
          const currentBacterium = bact[i];
          const otherBacteria = bact.filter(b => b !== currentBacterium);

          // MATCH pour les relations sortantes
          query += `
            MATCH (m:Molecule)
            Where  m.name = "${mol}"
            MATCH (m)-[a]->(t)
            WHERE NOT EXISTS { (m)<-[]-(r) WHERE "${currentBacterium}" IN r.organism }
              AND EXISTS { (m)-[]->(t) WHERE "${currentBacterium}" IN t.organism }
            MATCH (m:Molecule)<-[b]-(r)
            WHERE ${otherBacteria.map(b => `"${b}" IN r.organism`).join(' OR ')}
            RETURN *
          `;

          // Ajout d'une clause UNION sauf pour la dernière bactérie
          if (i < bact.length - 1) {
            query += 'UNION';
          }
        }

        // MATCH pour les réactions impliquant toutes les bactéries
        query += `
          UNION
          MATCH (r:Reaction)
          WHERE ${bact.map(b => `"${b}" IN r.organism`).join(' AND ')}
          MATCH (r)<-[a]->(m:Molecule)
          Where  m.name = "${mol}"          
          MATCH (r)<-[b]->(t)
          Where  m.name = "${mol}"          
          RETURN *
        `;
        console.log(query)
        var config = {
            containerId: "viz",
            neo4j: {
                serverUrl: NEO4J_CONFIG.serverUrl,
                serverUser: NEO4J_CONFIG.serverUser,
                serverPassword: NEO4J_CONFIG.serverPassword,
                driverConfig: {
                    encrypted: "ENCRYPTION_ON",
                    trust: "TRUST_SYSTEM_CA_SIGNED_CERTIFICATES",
                }
            },

            visConfig: {
                interaction: {
                    navigationButtons: true,
                    tooltipDelay: 0,
                    hideEdgesOnDrag: true,
                },
                nodes: {
                    font: {
                        color: '#343434',
                        strokeWidth: 0,
                        face: 'arial'
                    },
                    shape: 'dot'
                },
                physics: {
                    stabilization: false,
                    },
                edges: {
                    smooth: {
                        forceDirection: "none",
                        type: "continuous",
                      },
                    font: {
                        face: 'arial',
                        strokeWidth: 10, // px
                        vadjust: 0,
                    },
                    scaling: {
                        max: 2
                    },
                    arrows: {
                        to: {
                            enabled: true,
                            scaleFactor: 1
                        }
                    },
                    arrowStrikethrough: false,
                }
            },
            labels: {
                Molecule: {
                    label: "short_name",
                    [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
                        static: {
                            value: 3.0,
                            color: '#8CACD3'
                        },
                        function: {
                            title: NeoVis.objectToTitleString
                        },
                    }
                },
                Enzyme: {
                    // label: "name",
                    [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
                        static: {
                            value: 3.0,
                            color: '#F5DF4D'
                        },
                        function: {
                            title: NeoVis.objectToTitleHtml
                        },
                    }
                },
                Pathway: {
                    // label: "name",
                    [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
                        static: {
                            value: 3.0,
                            color: '#FF8A33'
                        },
                        function: {
                            title: NeoVis.objectToTitleHtml
                        },
                    }
                },
                Reaction: {
                    [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
                        static: {
                            value: 3.5,
                            color: '#F0A1BF'
                        },
                        function: {
                            title: NeoVis.objectToTitleString
                        },
                    }
                }
            },

            initialCypher: query

        };

        viz = new NeoVis.default(config);

        viz.render()

        console.log(viz);

        viz.registerOnEvent("clickNode", function (params) {
              params.event = "[original event]";
              var json = JSON.stringify(params, null, 4);
              var json2 = JSON.parse(json);
              $('#viz2').show();
              ReactZoom(json2.node.raw.properties.name)
            });
    }

}

function ReactZoom(react){
    // Requête Cypher
    let cypher =
        "Match(r:Reaction) " +
        "Where r.name = '"+ react +"'" +
        "Match(r) <-[a]-> (m:Molecule) " +
        "Match(e) <-[c]-> (r) " +
        "return *"

    var config = {
        containerId: "viz2",
        neo4j: {
            serverUrl: NEO4J_CONFIG.serverUrl,
            serverUser: NEO4J_CONFIG.serverUser,
            serverPassword: NEO4J_CONFIG.serverPassword,
            driverConfig: {
                encrypted: "ENCRYPTION_ON",
                trust: "TRUST_SYSTEM_CA_SIGNED_CERTIFICATES",
            }
        },

        visConfig: {
            // interaction: {
            //     navigationButtons: true
            // },
            nodes: {
                font: {
                    color: '#343434',
                    strokeWidth: 0,
                    face: 'arial'
                },
                shape: 'dot'
            },
            edges: {
                font: {
                    face: 'arial',
                    strokeWidth: 10, // px
                    vadjust: 0,
                },
                scaling: {
                    max: 2
                },
                arrows: {
                    to: {
                        enabled: true,
                        scaleFactor: 1
                    }
                },
                arrowStrikethrough: false,
            }
        },
        labels: {
            Molecule: {
                label: "short_name",
                [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
                    static: {
                        value: 3.0,
                        color: '#8CACD3'
                    },
                    function: {
                        title: NeoVis.objectToTitleString
                    },
                }
            },
            Enzyme: {
                // label: "name",
                [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
                    static: {
                        value: 3.0,
                        color: '#F5DF4D'
                    },
                    function: {
                        title: NeoVis.objectToTitleHtml
                    },
                }
            },
            Pathway: {
                // label: "name",
                [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
                    static: {
                        value: 3.0,
                        color: '#FF8A33'
                    },
                    function: {
                        title: NeoVis.objectToTitleHtml
                    },
                }
            },
            Reaction: {
                [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
                    static: {
                        value: 3.5,
                        color: '#F0A1BF'
                    },
                    function: {
                        title: NeoVis.objectToTitleString
                    },
                }
            }
        },
        initialCypher: cypher
    };

    viz = new NeoVis.default(config);

    viz.render()

    document.getElementById("RXN").innerHTML = react;
}

function Exchanges(bact) {
    // Construction de la requête Cypher
    let query = '';
    // Création des clauses MATCH pour chaque bactérie
    for (let i = 0; i < bact.length; i++) {
      const currentBacterium = bact[i];
      const otherBacteria = bact.filter(b => b !== currentBacterium);

      // MATCH pour les relations sortantes
      query += `
        MATCH (m:Molecule)
        MATCH (m)-[a]->(t)
        WHERE NOT EXISTS { (m)<-[]-(r) WHERE "${currentBacterium}" IN r.organism }
          AND EXISTS { (m)-[]->(t) WHERE "${currentBacterium}" IN t.organism }
        MATCH (m:Molecule)<-[b]-(r)
        WHERE ${otherBacteria.map(b => `"${b}" IN r.organism`).join(' OR ')}
        RETURN *
      `;

      // Ajout d'une clause UNION sauf pour la dernière bactérie
      if (i < bact.length - 1) {
        query += 'UNION';
      }
    }

    // // MATCH pour les réactions impliquant toutes les bactéries
    // query += `
    //   UNION
    //   MATCH (r:Reaction)
    //   WHERE ${bact.map(b => `"${b}" IN r.organism`).join(' AND ')}
    //   MATCH (r)<-[a]->(m:Molecule)
    //   Where not m.name in ["PROTON", "WATER", "ATP", "ADP", "OXYGEN-MOLECULE", "NADPH",   "NADP", "Pi", "NAD", "NADH", "CO-A", "PPI", "UDP", "AMP",  "Donor-H2", "Acceptor", "GDP", "NAD-P-OR-NOP", "NADH-P-OR-NOP", "GTP", "3-5-ADP"]
    //   MATCH (r)<-[b]->(t)
    //   Where not t.name in ["PROTON", "WATER", "ATP", "ADP", "OXYGEN-MOLECULE", "NADPH",   "NADP", "Pi", "NAD", "NADH", "CO-A", "PPI", "UDP", "AMP",  "Donor-H2", "Acceptor", "GDP", "NAD-P-OR-NOP", "NADH-P-OR-NOP", "GTP", "3-5-ADP"]
    //   RETURN *
    // `;
    console.log(query)
    var config = {
        containerId: "viz",
    neo4j: {
        serverUrl: NEO4J_CONFIG.serverUrl,
        serverUser: NEO4J_CONFIG.serverUser,
        serverPassword: NEO4J_CONFIG.serverPassword,
        driverConfig: {
            encrypted: "ENCRYPTION_ON",
            trust: "TRUST_SYSTEM_CA_SIGNED_CERTIFICATES",
        }
    },

        visConfig: {
            interaction: {
                navigationButtons: true,
                tooltipDelay: 0,
                hideEdgesOnDrag: true,
            },
            nodes: {
                font: {
                    color: '#343434',
                    strokeWidth: 0,
                    face: 'arial'
                },
                shape: 'dot'
            },
            physics: {
                stabilization: false,
                },
            edges: {
                smooth: {
                    forceDirection: "none",
                    type: "continuous",
                  },
                font: {
                    face: 'arial',
                    strokeWidth: 10, // px
                    vadjust: 0,
                },
                scaling: {
                    max: 2
                },
                arrows: {
                    to: {
                        enabled: true,
                        scaleFactor: 1
                    }
                },
                arrowStrikethrough: false,
            }
        },
        labels: {
            Molecule: {
                label: "short_name",
                [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
                    static: {
                        value: 3.0,
                        color: '#8CACD3'
                    },
                    function: {
                        title: NeoVis.objectToTitleString
                    },
                }
            },
            Enzyme: {
                // label: "name",
                [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
                    static: {
                        value: 3.0,
                        color: '#F5DF4D'
                    },
                    function: {
                        title: NeoVis.objectToTitleHtml
                    },
                }
            },
            Pathway: {
                // label: "name",
                [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
                    static: {
                        value: 3.0,
                        color: '#FF8A33'
                    },
                    function: {
                        title: NeoVis.objectToTitleHtml
                    },
                }
            },
            Reaction: {
                [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
                    static: {
                        value: 3.5,
                        color: '#F0A1BF'
                    },
                    function: {
                        title: NeoVis.objectToTitleString
                    },
                }
            }
        },

        initialCypher: query

    };

    viz = new NeoVis.default(config);

    viz.render()

    console.log(viz);

    viz.registerOnEvent("clickNode", function (params) {
          params.event = "[original event]";
          var json = JSON.stringify(params, null, 4);
          var json2 = JSON.parse(json);
          $('#viz2').show();
          ReactZoom(json2.node.raw.properties.name)
        });
}