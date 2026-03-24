import os
from django.shortcuts import render
from .utils import (
    fetch_molecule,
    fetch_label,
    fetch_organism,
    fetch_all,
    fetch_rxn,
    fetch_nodes,
    fetch_PnotR,
    fetch_path)


def get_neo4j_config():
    return {
        'url': os.environ.get('NEO4J_URL', 'neo4j+s://352d3bfc.databases.neo4j.io'),
        'user': os.environ.get('NEO4J_USER', '352d3bfc'),
        'password': os.environ.get('NEO4J_PASSWORD', 'r9VUcKIPcgC5NxzQ2FnEOn0HoOvDZSekkrj9Eb0AryI'),
    }


def coculture(request):
    molecule = fetch_molecule()
    organism = fetch_organism()
    
    return render(request, 'coculture.html', {
        'var1': molecule[0],
        'var5': organism[0],
        'neo4j_config': get_neo4j_config()
    })


def ways(request):
    molecule = fetch_molecule()
    neo4j_config = get_neo4j_config()
    if request.method == "POST":
        nc1 = request.POST["NC1"]
        nc2 = request.POST["NC2"]
        nc3 = request.POST["NC3"]
        path = fetch_path(nc1, nc2)
        if path != []:
            return render(request, 'ways.html',
                          {'var1': molecule[0], 'var2': nc1, 'var3': nc2, 'var4': path, 'var5': nc3,
                           'neo4j_config': neo4j_config})
        else:
            return render(request, 'ways.html', {'var1': molecule[0], 'var4': "null",
                                                  'neo4j_config': neo4j_config})
    if request.method == "GET":
        return render(request, 'ways.html', {'var1': molecule[0], 'neo4j_config': neo4j_config})


def result(request):

    elements_names = fetch_all()
    organism = fetch_organism()
    neo4j_config = get_neo4j_config()
    if request.method == "POST":
        mc = request.POST["NC"]
        if mc == "":
            return render(request, 'accueil.html', {'all': elements_names})
        label = fetch_label(mc)
        rxn = fetch_rxn(mc)
        if not rxn:
            return render(request, 'accueil.html', {'all': elements_names, 'error': mc})
        PnotR = fetch_PnotR(mc)
        nodes = fetch_nodes()
        return render(request, 'motcle.html',
                      {'all': elements_names, 'var1': "Molecule", 'var2': mc, 'var3': rxn, 'var4': PnotR,
                       'var5': organism[0], 'var6': nodes, 'neo4j_config': neo4j_config})
    if request.method == "GET":
        return render(request, 'accueil.html', {'all': elements_names})


def acceuil(request):
    all = fetch_all()
    return render(request, 'accueil.html', {'all': all})