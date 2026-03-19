(function($) {
  var CheckboxDropdown = function(el) {
    var _this = this;
    this.isOpen = false;
    this.areAllChecked = false;
    this.$el = $(el);
    this.$label = this.$el.find('.dropdown-label');
    this.$checkAll = this.$el.find('[data-toggle="check-all"]').first();
    this.$inputs = this.$el.find('[type="checkbox"]');

    this.onCheckBox();

    this.$label.on('click', function(e) {
      e.preventDefault();
      _this.toggleOpen();
    });

    this.$checkAll.on('click', function(e) {
      e.preventDefault();
      _this.onCheckAll();
    });

    this.$inputs.on('change', function(e) {
      _this.onCheckBox();
    });
  };

  CheckboxDropdown.prototype.onCheckBox = function() {
    this.updateStatus();
  };

  CheckboxDropdown.prototype.updateStatus = function() {
    var checked = this.$el.find(':checked');

    this.areAllChecked = false;
    this.$checkAll.html('Check All');

    if(checked.length <= 0) {
      this.$label.html('Select Options');
    }
    else if(checked.length === 1) {
      this.$label.html(checked.parent('label').text());
    }
    else if(checked.length === this.$inputs.length) {
      this.$label.html('All Selected');
      this.areAllChecked = true;
      this.$checkAll.html('Uncheck All');
    }
    else {
      this.$label.html(checked.length + ' Selected');
    }
  };

  CheckboxDropdown.prototype.onCheckAll = function(checkAll) {
    if(!this.areAllChecked || checkAll) {
      this.areAllChecked = true;
      this.$checkAll.html('Uncheck All');
      this.$inputs.prop('checked', true);
    }
    else {
      this.areAllChecked = false;
      this.$checkAll.html('Check All');
      this.$inputs.prop('checked', false);
    }

    this.updateStatus();
  };

  CheckboxDropdown.prototype.toggleOpen = function(forceOpen) {
    var _this = this;

    if(!this.isOpen || forceOpen) {
       this.isOpen = true;
       this.$el.addClass('on');
      $(document).on('click', function(e) {
        if(!$(e.target).closest('[data-control]').length) {
         _this.toggleOpen();
        }
      });
    }
    else {
      this.isOpen = false;
      this.$el.removeClass('on');
      $(document).off('click');
    }
  };

  var checkboxesDropdowns = document.querySelectorAll('[data-control="checkbox-dropdown"]');
  for(var i = 0, length = checkboxesDropdowns.length; i < length; i++) {
    new CheckboxDropdown(checkboxesDropdowns[i]);
  }
})(jQuery);

$('#stabilize').click(function () {
    viz.stabilize();
    viz.style.display = "none";
});

function newMol(newmol) {
    const dropdown = document.getElementById('organisme');
    const checkboxes = dropdown.querySelectorAll('input[type="checkbox"]');
    const checkedValues = [];
    checkboxes.forEach((checkbox) => {
          if (checkbox.checked) {
            checkedValues.push(checkbox.value);
          }
    });

    const filtre = document.getElementById('filtre1');
    const check = filtre.querySelectorAll('input[type="checkbox"]');
    const checkboxes2 = [];
    check.forEach((check) => {
      if (check.checked) {
        checkboxes2.push(check.value);
      }
    });
    let reaction = ""
    if (checkboxes2[checkboxes2.length-1] == "r"){
        reaction = checkboxes2[checkboxes2.length-1]
        checkboxes2.pop()
    }
    // if (checkboxes2.length < 5) {
    //   // Calculer le nombre d'éléments supplémentaires à ajouter
    //   let elementsRestants = 5 - checkboxes2.length;
    //
    //   // Ajouter les éléments supplémentaires à la liste
    //   for (let i = 0; i < elementsRestants; i++) {
    //     checkboxes2.push(i); // Remplacez null par la valeur souhaitée pour les éléments supplémentaires
    //   }
    // }
    const checkedValues2 = ajouterVirgules(checkboxes2);
    function ajouterVirgules(liste) {
        var resultat = "";
            for (var i = 0; i < liste.length; i++) {
                resultat += liste[i];
                if (i < liste.length - 1) {
                  resultat += " or ";
                }
        }
      return resultat;
    }
    if (checkedValues == ""){
        var cypher =
        "Match(m:Molecule) " +
        "where m.name contains '" + newmol + "' " +
        "Match(r:Reaction) <-[a]->(m) " +
        "Match(e) <-[c]-> (r) "
        if(checkedValues2[0] == "*" || checkedValues2 == "") {
            cypher +=
                "return *"
        }
        else {
            cypher +=
            "where " + checkedValues2 +
            " return a,c"
            if (checkedValues2 == [] && reaction){
                cypher +=
                ",r"
            }
            else if(checkedValues2 != [] && reaction) {
                cypher +=
                ",e,r"
            }
            else {
                cypher +=
                ",e"
                }
        }
        cypher +=
        " UNION " +
        "Match(r:Reaction) " +
        "where r.name contains '" + newmol + "' " +
        "Match(r) <-[a]->(m:Reaction) " +
        "Match(e) <-[c]-> (r) "
        if(checkedValues2[0] == "*" || checkedValues2 == "") {
            cypher +=
                "return *"
        }
        else {
            cypher +=
            "where " + checkedValues2 +
            " return a,c"
            if (checkedValues2 == [] && reaction){
                cypher +=
                ",r"
            }
            else if(checkedValues2 != [] && reaction) {
                cypher +=
                ",e,r"
            }
            else {
                cypher +=
                ",e"
                }
        }
    }
    else {
        var cypher =
        "Match(m:Molecule) " +
        "where m.name contains '" + newmol + "' " +
        "Match(r:Reaction) <-[a]->(m) " +
        "Where ALL(org IN [" + "'" + checkedValues.join("','") + "'" + "] WHERE org IN r.organism) " +
        "Match(e) <-[c]-> (r) "
        if(checkedValues2[0] == "*" || checkedValues2 == "") {
            cypher +=
                "return *"
        }
        else {
            cypher +=
            "where " + checkedValues2 +
            " return a,c"
            if (checkedValues2 == [] && reaction){
                cypher +=
                ",r"
            }
            else if(checkedValues2 != [] && reaction) {
                cypher +=
                ",e,r"
            }
            else {
                cypher +=
                ",e"
                }
        }
        cypher +=
        " UNION " +
        "Match(r:Reaction) " +
        "where r.name contains '" + newmol + "' " +
        "Match(r) <-[a]->(m:Molecule) " +
        "Where ALL(org IN [" + "'" + checkedValues.join("','") + "'" + "] WHERE org IN r.organism) " +
        "Match(e) <-[c]-> (r) "
        if(checkedValues2[0] == "*" || checkedValues2 == "") {
            cypher +=
                "return *"
        }
        else {
            cypher +=
            "where " + checkedValues2 +
            " return a,c"
            if (checkedValues2 == [] && reaction){
                cypher +=
                ",r"
            }
            else if(checkedValues2 != [] && reaction) {
                cypher +=
                ",e,r"
            }
            else {
                cypher +=
                ",e"
                }
        }
    }
    if (cypher.length > 3) {
        viz.renderWithCypher(cypher);
    } else {
        console.log('reload');
        viz.reload();
    }
    // document.getElementById("demo").innerHTML = cypher;
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
