$('#stabilize').click(function () {
    viz.stabilize();
    viz.style.display = "none";
});

function voiemetabo(mol1, mol2, mol3) {
    if (mol1 == "" || mol2 == "") {
        $('#errorMessage1').show();
        $('#errorMessage').hide();
        $('#table2').hide();
        $('#viz').hide();
        return;
    }
    if (mol1 == mol2) {
        $('#errorMessage').show();
        $('#errorMessage1').hide();
        $('#table2').hide();
        $('#viz').hide();
        return;
    }

    $('#errorMessage').hide();
    $('#errorMessage1').hide();
    $('#table2').show();

    var query = '';

    if (mol3 == "") {
        query =
            "MATCH path = (start:Molecule {name: '" + mol1 + "'})-[*0..10]->(end:Molecule {name: '" + mol2 + "'})\n" +
            "WHERE NONE(n IN nodes(path) WHERE n.name IN " +
            "['PROTON', 'WATER', 'ATP', 'ADP', 'OXYGEN-MOLECULE', 'NADPH', 'NADP', 'Pi', 'NAD', 'NADH', 'CO-A', 'PPI'," +
            " 'UDP', 'AMP', 'Donor-H2', 'Acceptor', 'GDP', 'NAD-P-OR-NOP', 'NADH-P-OR-NOP', 'GTP', '3-5-ADP'])\n" +
            "RETURN path";
    } else {
        $('#VIA1').show();
        $('#MIN').show();
        $('#VIA').hide();
        query =
            "MATCH path = (start:Molecule {name: '" + mol1 + "'})-[*0..10]->(end:Molecule {name: '" + mol3 + "'})\n" +
            "WHERE NONE(n IN nodes(path) WHERE n.name IN " +
            "['PROTON', 'WATER', 'ATP', 'ADP', 'OXYGEN-MOLECULE', 'NADPH', 'NADP', 'Pi', 'NAD', 'NADH', 'CO-A', 'PPI'," +
            " 'UDP', 'AMP', 'Donor-H2', 'Acceptor', 'GDP', 'NAD-P-OR-NOP', 'NADH-P-OR-NOP', 'GTP', '3-5-ADP'])\n" +
            "RETURN path\n" +
            "UNION\n" +
            "MATCH path = (start:Molecule {name: '" + mol3 + "'})-[*0..10]->(end:Molecule {name: '" + mol2 + "'})\n" +
            "WHERE NONE(n IN nodes(path) WHERE n.name IN " +
            "['PROTON', 'WATER', 'ATP', 'ADP', 'OXYGEN-MOLECULE', 'NADPH', 'NADP', 'Pi', 'NAD', 'NADH', 'CO-A', 'PPI'," +
            " 'UDP', 'AMP', 'Donor-H2', 'Acceptor', 'GDP', 'NAD-P-OR-NOP', 'NADH-P-OR-NOP', 'GTP', '3-5-ADP'])\n" +
            "RETURN path";
    }

    var config = {
        containerId: "viz",
        neo4j: {
            serverUrl: NEO4J_CONFIG.serverUrl,
            serverUser: NEO4J_CONFIG.serverUser,
            serverPassword: NEO4J_CONFIG.serverPassword,
        },
        visConfig: {
            interaction: {navigationButtons: true},
            nodes: {
                font: {color: '#343434', strokeWidth: 0, face: 'arial'},
                shape: 'dot'
            },
            edges: {
                font: {face: 'arial', strokeWidth: 10, vadjust: 0},
                scaling: {max: 2},
                arrows: {to: {enabled: true, scaleFactor: 1}},
                arrowStrikethrough: false,
            }
        },
        labels: {
            Molecule: {
                label: "short_name",
                [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
                    static: {value: 3.0, color: '#8CACD3'},
                    function: {title: NeoVis.objectToTitleString},
                }
            },
            Enzyme: {
                [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
                    static: {value: 3.0, color: '#F5DF4D'},
                    function: {title: NeoVis.objectToTitleHtml},
                }
            },
            Pathway: {
                [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
                    static: {value: 3.0, color: '#FF8A33'},
                    function: {title: NeoVis.objectToTitleHtml},
                }
            },
            Reaction: {
                [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
                    static: {value: 3.5, color: '#F0A1BF'},
                    function: {title: NeoVis.objectToTitleString},
                }
            }
        },
        initialCypher: query
    };

    viz = new NeoVis.default(config);
    viz.render();
    $('#viz').show();
    console.log(viz);
}

function exportTableToExcel(tableID, filename = '') {
    var downloadLink;
    var dataType = 'application/vnd.ms-excel';
    var tableSelect = document.getElementById(tableID);
    var tableHTML = tableSelect.outerHTML.replace(/ /g, '%20');

    filename = filename ? filename + '.csv' : 'excel_data.csv';

    downloadLink = document.createElement("a");
    document.body.appendChild(downloadLink);

    if (navigator.msSaveOrOpenBlob) {
        var blob = new Blob(['\ufeff', tableHTML], {type: dataType});
        navigator.msSaveOrOpenBlob(blob, filename);
    } else {
        downloadLink.href = 'data:' + dataType + ', ' + tableHTML;
        downloadLink.download = filename;
        downloadLink.click();
    }
}