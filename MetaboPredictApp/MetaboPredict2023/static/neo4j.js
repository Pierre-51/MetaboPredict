function myFunction() {
    alert("Hello from a static file!");
  }

// var viz = null;
var viz

function Molecule(newmol) {
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
                tooltipDelay: 200,
                hideEdgesOnDrag: true,
            },
            physics: {
                stabilization: false,
                },
            nodes: {
                font: {
                    color: '#343434',
                    strokeWidth: 0,
                    face: 'arial'
                },
                shape: 'dot'
            },
            edges: {
                smooth: {
                    forceDirection: "none",
                  },
                font: {
                    face: 'arial',
                    strokeWidth: 10, // px
                    vadjust: 0,
                },
                scaling:{
                    max: 2
                },
                arrows: {
                    to: {enabled: true,
                        scaleFactor: 1}
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
            initialCypher: "match(m:Molecule) WHERE m.name contains '"+ newmol+ "' Match(r:Reaction) <-[a]-> (m) Match(e) <-[c]-> (r) return *" +
                            "\n"+
                            "UNION\n" +
                            "\n" +
                            "match(r:Reaction) WHERE r.name contains '"+ newmol+ "' Match(r) <-[a]-> (m:Molecule) Match(e) <-[c]-> (r) return *"
    };

    viz = new NeoVis.default(config);

    viz.render()

    console.log(viz);

    viz.registerOnEvent("clickNode", function (params) {
          params.event = "[original event]";
          var json = JSON.stringify(params, null, 4);
          var json2 = JSON.parse(json);

          var table = document.getElementById('table2');
          var rows = table.getElementsByTagName('tr');

          for (var i = 0; i < rows.length; i++) {
            var cell = rows[i].querySelector('.highlight-cell');
            if (cell && cell.innerText === json2.node.raw.properties.name) {
              rows[i].style.backgroundColor = 'yellow';
              rows[i].scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
              rows[i].style.backgroundColor = ''; // Réinitialise la couleur des autres lignes
            }
          }
        });

}