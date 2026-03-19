$('#stabilize').click(function () {
    viz.stabilize();
    viz.style.display = "none";
});

function voiemetabo(mol1,mol2,mol3) {
    // Construction de la requête Cypher
    // mol1 = document.getElementById('NC1')
    // mol2 = document.getElementById('NC2')


    if(mol1 == "" || mol2 == "") {
        $('#errorMessage1').show();
        $('#errorMessage').hide();
        $('#table2').hide();
        $('#viz').hide();
    }
    else if(mol1 == mol2 ) {
        $('#errorMessage').show();
        $('#errorMessage1').hide();
        $('#table2').hide();
        $('#viz').hide();
    }
    else if(mol3 == ""){
        $('#errorMessage').hide();
        $('#errorMessage1').hide();
        $('#table2').show();
        let query = '';
        query +=
            "MATCH path = (start:Molecule {name: '" + mol1 + "'})-[*0..10]->(end:Molecule {name: '" + mol2 + "'})\n" +
            "WHERE NONE(n IN nodes(path) WHERE n.name IN " +
            "['PROTON', 'WATER', 'ATP', 'ADP', 'OXYGEN-MOLECULE', 'NADPH', 'NADP', 'Pi', 'NAD', 'NADH', 'CO-A', 'PPI'," +
            " 'UDP', 'AMP', 'Donor-H2', 'Acceptor', 'GDP', 'NAD-P-OR-NOP', 'NADH-P-OR-NOP', 'GTP', '3-5-ADP'])\n" +
            "RETURN path"
        ;
        var config = {
            containerId: "viz",
            neo4j: {
                serverUrl: "bolt://localhost:7687",
                serverUser: "neo4j",
                serverPassword: "12345678",
            },

            visConfig: {
                interaction: {
                    navigationButtons: true,
                    // tooltipDelay: 0,
                    // hideEdgesOnDrag: true,
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

    }
    else {
        $('#errorMessage').hide();
        $('#errorMessage1').hide();
        $('#table2').show();
        $('#VIA1').show();
        $('#MIN').show();
        $('#VIA').hide();
        let query = '';
        query +=
            "MATCH path = (start:Molecule {name: '" + mol1 + "'})-[*0..10]->(end:Molecule {name: '" + mol3 + "'})\n" +
            "WHERE NONE(n IN nodes(path) WHERE n.name IN " +
            "['PROTON', 'WATER', 'ATP', 'ADP', 'OXYGEN-MOLECULE', 'NADPH', 'NADP', 'Pi', 'NAD', 'NADH', 'CO-A', 'PPI'," +
            " 'UDP', 'AMP', 'Donor-H2', 'Acceptor', 'GDP', 'NAD-P-OR-NOP', 'NADH-P-OR-NOP', 'GTP', '3-5-ADP'])\n" +
            "RETURN path \n"+
            "UNION \n"+
            "MATCH path = (start:Molecule {name: '" + mol3 + "'})-[*0..10]->(end:Molecule {name: '" + mol2 + "'})\n" +
            "WHERE NONE(n IN nodes(path) WHERE n.name IN " +
            "['PROTON', 'WATER', 'ATP', 'ADP', 'OXYGEN-MOLECULE', 'NADPH', 'NADP', 'Pi', 'NAD', 'NADH', 'CO-A', 'PPI'," +
            " 'UDP', 'AMP', 'Donor-H2', 'Acceptor', 'GDP', 'NAD-P-OR-NOP', 'NADH-P-OR-NOP', 'GTP', '3-5-ADP'])\n" +
            "RETURN path"
        ;
        var config = {
            containerId: "viz",
            neo4j: {
                serverUrl: "bolt://localhost:7687",
                serverUser: "neo4j",
                serverPassword: "12345678",
            },

            visConfig: {
                interaction: {
                    navigationButtons: true,
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
    }
    viz = new NeoVis.default(config);

    viz.render()

    $('#viz').show();

    console.log(viz);
}

function exportTableToExcel(tableID, filename = ''){
    var downloadLink;
    var dataType = 'application/vnd.ms-excel';
    var tableSelect = document.getElementById(tableID);
    var tableHTML = tableSelect.outerHTML.replace(/ /g, '%20');

    // Specify file name
    filename = filename?filename+'.csv':'excel_data.csv';

    // Create download link element
    downloadLink = document.createElement("a");

    document.body.appendChild(downloadLink);

    if(navigator.msSaveOrOpenBlob){
        var blob = new Blob(['\ufeff', tableHTML], {
            type: dataType
        });
        navigator.msSaveOrOpenBlob( blob, filename);
    }else{
        // Create a link to the file
        downloadLink.href = 'data:' + dataType + ', ' + tableHTML;

        // Setting the file name
        downloadLink.download = filename;

        //triggering the function
        downloadLink.click();
    }
}
